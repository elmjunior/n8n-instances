import Docker from "dockerode";
import { EventEmitter } from "events";
import fs from "fs-extra";
import path from "path";
import {
  InstanceMetrics,
  InstanceHealth,
  InstanceLog,
  LogLevel,
  LogFilter,
  HealthCheckConfig,
  MonitoringConfig,
  InstanceStatus,
} from "../types";

export class MonitoringService extends EventEmitter {
  private docker: Docker;
  private logBuffers: Map<string, InstanceLog[]> = new Map();
  private healthChecks: Map<string, NodeJS.Timeout> = new Map();
  private metricsCollectors: Map<string, NodeJS.Timeout> = new Map();
  private config: MonitoringConfig;
  private configPath: string;

  constructor() {
    super();
    this.docker = new Docker();
    this.configPath = path.join(process.cwd(), "config", "monitoring.json");
    this.config = this.getDefaultConfig();
    this.loadConfig();
  }

  private getDefaultConfig(): MonitoringConfig {
    return {
      healthCheck: {
        interval: 30, // 30 seconds
        timeout: 10, // 10 seconds
        retries: 3,
        autoRestart: true,
        alertThreshold: 3,
      },
      logBufferSize: 1000,
      metricsInterval: 60, // 60 seconds
      retentionDays: 30,
    };
  }

  private async loadConfig(): Promise<void> {
    try {
      if (await fs.pathExists(this.configPath)) {
        this.config = {
          ...this.config,
          ...(await fs.readJson(this.configPath)),
        };
      } else {
        await this.saveConfig();
      }
    } catch (error) {
      console.error("Error loading monitoring config:", error);
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(this.configPath));
      await fs.writeJson(this.configPath, this.config, { spaces: 2 });
    } catch (error) {
      console.error("Error saving monitoring config:", error);
    }
  }

  async getConfig(): Promise<MonitoringConfig> {
    return this.config;
  }

  async updateConfig(
    updates: Partial<MonitoringConfig>
  ): Promise<MonitoringConfig> {
    this.config = { ...this.config, ...updates };
    await this.saveConfig();
    return this.config;
  }

  // Metrics Collection
  async startMetricsCollection(instanceId: string): Promise<void> {
    if (this.metricsCollectors.has(instanceId)) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const metrics = await this.collectInstanceMetrics(instanceId);
        this.emit("metrics", { instanceId, metrics });
      } catch (error) {
        console.error(`Error collecting metrics for ${instanceId}:`, error);
      }
    }, this.config.metricsInterval * 1000);

    this.metricsCollectors.set(instanceId, interval);
  }

  async stopMetricsCollection(instanceId: string): Promise<void> {
    const interval = this.metricsCollectors.get(instanceId);
    if (interval) {
      clearInterval(interval);
      this.metricsCollectors.delete(instanceId);
    }
  }

  async collectInstanceMetrics(instanceId: string): Promise<InstanceMetrics> {
    try {
      const container = this.docker.getContainer(`n8n-${instanceId}`);
      const stats = await container.stats({ stream: false });
      const info = await container.inspect();

      const cpuDelta =
        stats.cpu_stats.cpu_usage.total_usage -
        stats.precpu_stats.cpu_usage.total_usage;
      const systemDelta =
        stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
      const cpuUsage =
        (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100;

      const memoryUsage = stats.memory_stats.usage || 0;
      const memoryLimit = stats.memory_stats.limit || 1;
      const memoryUsagePercent = (memoryUsage / memoryLimit) * 100;

      const uptime = Math.floor(
        (Date.now() - new Date(info.State.StartedAt).getTime()) / 1000
      );

      return {
        cpuUsage: Math.round(cpuUsage * 100) / 100,
        memoryUsage: Math.round(memoryUsagePercent * 100) / 100,
        memoryUsageMB: Math.round((memoryUsage / 1024 / 1024) * 100) / 100,
        uptime,
        uptimeFormatted: this.formatUptime(uptime),
        lastActivity: new Date().toISOString(),
        containerId: info.Id,
        image: info.Config.Image,
        createdAt: info.Created,
        startedAt: info.State.StartedAt,
      };
    } catch (error) {
      console.error(`Error collecting metrics for ${instanceId}:`, error);
      throw error;
    }
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  // Health Checks
  async startHealthCheck(instanceId: string): Promise<void> {
    if (this.healthChecks.has(instanceId)) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const health = await this.performHealthCheck(instanceId);
        this.emit("healthChanged", { instanceId, health });
      } catch (error) {
        console.error(
          `Error performing health check for ${instanceId}:`,
          error
        );
      }
    }, this.config.healthCheck.interval * 1000);

    this.healthChecks.set(instanceId, interval);
  }

  async stopHealthCheck(instanceId: string): Promise<void> {
    const interval = this.healthChecks.get(instanceId);
    if (interval) {
      clearInterval(interval);
      this.healthChecks.delete(instanceId);
    }
  }

  async performHealthCheck(instanceId: string): Promise<InstanceHealth> {
    const startTime = Date.now();
    let isHealthy = false;
    let responseTime: number | undefined;
    let lastError: string | undefined;

    try {
      const container = this.docker.getContainer(`n8n-${instanceId}`);
      const info = await container.inspect();

      if (info.State.Status === "running") {
        // Try to ping the n8n instance
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.healthCheck.timeout * 1000);
        
        const response = await fetch(
          `http://localhost:${this.getInstancePort(instanceId)}/healthz`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );
        
        clearTimeout(timeoutId);

        isHealthy = response.ok;
        responseTime = Date.now() - startTime;
      } else {
        isHealthy = false;
        lastError = `Container status: ${info.State.Status}`;
      }
    } catch (error) {
      isHealthy = false;
      lastError = error instanceof Error ? error.message : "Unknown error";
    }

    const health: InstanceHealth = {
      isHealthy,
      lastCheck: new Date().toISOString(),
      responseTime,
      errorCount: isHealthy ? 0 : 1,
      lastError,
      autoRestartCount: 0,
      lastRestart: undefined,
    };

    // Handle auto-restart if configured
    if (!isHealthy && this.config.healthCheck.autoRestart) {
      await this.handleUnhealthyInstance(instanceId, health);
    }

    return health;
  }

  private async handleUnhealthyInstance(
    instanceId: string,
    health: InstanceHealth
  ): Promise<void> {
    try {
      const container = this.docker.getContainer(`n8n-${instanceId}`);
      await container.restart();

      health.autoRestartCount++;
      health.lastRestart = new Date().toISOString();

      this.emit("alert", {
        instanceId,
        level: "WARNING",
        message: `Auto-restarted unhealthy instance ${instanceId}`,
        timestamp: new Date().toISOString(),
        type: "AUTO_RESTART",
      });
    } catch (error) {
      console.error(`Failed to auto-restart instance ${instanceId}:`, error);

      this.emit("alert", {
        instanceId,
        level: "ERROR",
        message: `Failed to auto-restart instance ${instanceId}: ${error}`,
        timestamp: new Date().toISOString(),
        type: "HEALTH_CHECK_FAILED",
      });
    }
  }

  private getInstancePort(instanceId: string): number {
    // This should be retrieved from the instance metadata
    // For now, using a default port calculation
    return 5600 + parseInt(instanceId.split("-")[2] || "0");
  }

  // Log Management
  async startLogCollection(instanceId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(`n8n-${instanceId}`);
      const logStream = await container.logs({
        follow: true,
        stdout: true,
        stderr: true,
        timestamps: true,
      });

      logStream.on("data", (chunk: Buffer) => {
        const logs = this.parseDockerLogs(chunk.toString(), instanceId);
        logs.forEach((log) => this.addLogToBuffer(instanceId, log));
      });

      logStream.on("error", (error: Error) => {
        console.error(`Log stream error for ${instanceId}:`, error);
      });
    } catch (error) {
      console.error(`Error starting log collection for ${instanceId}:`, error);
    }
  }

  private parseDockerLogs(logs: string, instanceId: string): InstanceLog[] {
    const lines = logs.split("\n").filter((line) => line.trim());

    return lines.map((line) => {
      // Docker logs format: 2024-01-01T12:00:00.000000000Z message
      const timestampMatch = line.match(
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s+(.+)$/
      );

      if (timestampMatch) {
        const message = timestampMatch[2];
        const level = this.detectLogLevel(message);

        return {
          timestamp: timestampMatch[1],
          level,
          message,
          containerId: `n8n-${instanceId}`,
          source: "docker",
        };
      }

      return {
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        message: line,
        containerId: `n8n-${instanceId}`,
        source: "docker",
      };
    });
  }

  private detectLogLevel(message: string): LogLevel {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("error") || lowerMessage.includes("fatal")) {
      return LogLevel.ERROR;
    } else if (lowerMessage.includes("warn")) {
      return LogLevel.WARN;
    } else if (lowerMessage.includes("debug")) {
      return LogLevel.DEBUG;
    } else {
      return LogLevel.INFO;
    }
  }

  private addLogToBuffer(instanceId: string, log: InstanceLog): void {
    if (!this.logBuffers.has(instanceId)) {
      this.logBuffers.set(instanceId, []);
    }

    const buffer = this.logBuffers.get(instanceId)!;
    buffer.push(log);

    // Maintain buffer size limit
    if (buffer.length > this.config.logBufferSize) {
      buffer.splice(0, buffer.length - this.config.logBufferSize);
    }

    // Emit log event for real-time subscriptions
    this.emit("log", { instanceId, log });

    // Check for error logs and emit alerts
    if (log.level === LogLevel.ERROR) {
      this.emit("alert", {
        instanceId,
        level: "ERROR",
        message: `Error log detected: ${log.message}`,
        timestamp: log.timestamp,
        type: "LOG_ERROR",
      });
    }
  }

  async getInstanceLogs(
    instanceId: string,
    filter?: LogFilter
  ): Promise<InstanceLog[]> {
    const buffer = this.logBuffers.get(instanceId) || [];
    let filteredLogs = [...buffer];

    if (filter) {
      if (filter.level) {
        filteredLogs = filteredLogs.filter((log) => log.level === filter.level);
      }

      if (filter.startTime) {
        filteredLogs = filteredLogs.filter(
          (log) => log.timestamp >= filter.startTime!
        );
      }

      if (filter.endTime) {
        filteredLogs = filteredLogs.filter(
          (log) => log.timestamp <= filter.endTime!
        );
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredLogs = filteredLogs.filter((log) =>
          log.message.toLowerCase().includes(searchLower)
        );
      }

      if (filter.limit) {
        filteredLogs = filteredLogs.slice(-filter.limit);
      }
    }

    return filteredLogs;
  }

  async exportLogs(instanceId: string, filter?: LogFilter): Promise<string> {
    const logs = await this.getInstanceLogs(instanceId, filter);
    const exportPath = path.join(
      process.cwd(),
      "exports",
      `logs-${instanceId}-${Date.now()}.json`
    );

    await fs.ensureDir(path.dirname(exportPath));
    await fs.writeJson(exportPath, logs, { spaces: 2 });

    return exportPath;
  }

  // Cleanup
  async stopMonitoring(instanceId: string): Promise<void> {
    await this.stopMetricsCollection(instanceId);
    await this.stopHealthCheck(instanceId);
    this.logBuffers.delete(instanceId);
  }

  async cleanup(): Promise<void> {
    // Stop all monitoring
    for (const instanceId of this.healthChecks.keys()) {
      await this.stopMonitoring(instanceId);
    }

    // Clean up old log files
    await this.cleanupOldLogs();
  }

  private async cleanupOldLogs(): Promise<void> {
    try {
      const exportsDir = path.join(process.cwd(), "exports");
      if (await fs.pathExists(exportsDir)) {
        const files = await fs.readdir(exportsDir);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

        for (const file of files) {
          const filePath = path.join(exportsDir, file);
          const stats = await fs.stat(filePath);

          if (stats.mtime < cutoffDate) {
            await fs.remove(filePath);
          }
        }
      }
    } catch (error) {
      console.error("Error cleaning up old logs:", error);
    }
  }
}
