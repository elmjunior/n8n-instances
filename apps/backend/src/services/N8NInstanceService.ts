import fs from "fs-extra";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import {
  N8NInstance,
  InstanceStatus,
  CreateInstanceInput,
  InstanceLog,
  LogFilter,
  InstanceMetrics,
  InstanceHealth,
  LogLevel,
} from "../types";
import { TemplateService } from "./TemplateService";
import { PortManager } from "./PortManager";
import { DockerService } from "./DockerService";
import { MonitoringService } from "./MonitoringService";

const execAsync = promisify(exec);

export class N8NInstanceService {
  private templateService: TemplateService;
  private portManager: PortManager;
  private dockerService: DockerService;
  private monitoringService: MonitoringService;
  private instancesDir: string;

  constructor() {
    this.templateService = new TemplateService();
    this.portManager = new PortManager();
    this.dockerService = new DockerService();
    this.monitoringService = new MonitoringService();
    this.instancesDir = path.join(
      process.cwd(),
      "..",
      "..",
      "docker",
      "instances"
    );
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    await fs.ensureDir(this.instancesDir);
  }

  async createInstance(input: CreateInstanceInput): Promise<N8NInstance> {
    const instanceId = this.generateInstanceId();
    const port = await this.portManager.getNextAvailablePort();

    // Create instance files using template service
    await this.templateService.createInstanceFiles(
      instanceId,
      port,
      input.clientName,
      input.username,
      input.password
    );

    // Create instance metadata
    const instance: N8NInstance = {
      id: instanceId,
      clientName: input.clientName,
      status: InstanceStatus.CREATED,
      port,
      subdomain: input.subdomain,
      createdAt: new Date().toISOString(),
    };

    // Save instance metadata
    await this.saveInstanceMetadata(instance);

    return instance;
  }

  async listInstances(): Promise<N8NInstance[]> {
    const instances: N8NInstance[] = [];
    const instanceDirs = await fs.readdir(this.instancesDir);

    for (const instanceId of instanceDirs) {
      const instancePath = path.join(this.instancesDir, instanceId);
      const stats = await fs.stat(instancePath);

      if (stats.isDirectory()) {
        try {
          const instance = await this.loadInstanceMetadata(instanceId);
          if (instance) {
            // Update status from Docker
            instance.status = await this.getInstanceStatus(instanceId);
            instances.push(instance);
          }
        } catch (error) {
          console.error(`Error loading instance ${instanceId}:`, error);
        }
      }
    }

    return instances;
  }

  async getInstance(id: string): Promise<N8NInstance | null> {
    try {
      const instance = await this.loadInstanceMetadata(id);
      if (instance) {
        instance.status = await this.getInstanceStatus(id);
      }
      return instance;
    } catch (error) {
      console.error(`Error getting instance ${id}:`, error);
      return null;
    }
  }

  async startInstance(id: string): Promise<N8NInstance> {
    const instance = await this.getInstance(id);
    if (!instance) {
      throw new Error(`Instance ${id} not found`);
    }

    const instanceDir = this.templateService.getInstanceDir(id);

    try {
      // Update status to STARTING
      instance.status = InstanceStatus.STARTING;
      await this.saveInstanceMetadata(instance);

      // Start containers using docker-compose
      await execAsync("docker-compose up -d", { cwd: instanceDir });

      // Wait a bit and check status
      await new Promise((resolve) => setTimeout(resolve, 2000));
      instance.status = await this.getInstanceStatus(id);
      await this.saveInstanceMetadata(instance);

      // Start monitoring if instance is running
      if (instance.status === InstanceStatus.RUNNING) {
        await this.startMonitoring(id);
      }

      return instance;
    } catch (error) {
      instance.status = InstanceStatus.ERROR;
      await this.saveInstanceMetadata(instance);
      throw error;
    }
  }

  async stopInstance(id: string): Promise<N8NInstance> {
    const instance = await this.getInstance(id);
    if (!instance) {
      throw new Error(`Instance ${id} not found`);
    }

    const instanceDir = this.templateService.getInstanceDir(id);

    try {
      // Stop monitoring first
      await this.stopMonitoring(id);

      await execAsync("docker-compose down", { cwd: instanceDir });

      instance.status = InstanceStatus.STOPPED;
      await this.saveInstanceMetadata(instance);

      return instance;
    } catch (error) {
      throw error;
    }
  }

  async pauseInstance(id: string): Promise<N8NInstance> {
    const instance = await this.getInstance(id);
    if (!instance) {
      throw new Error(`Instance ${id} not found`);
    }

    try {
      const container = await this.dockerService.getContainerInfo(`n8n-${id}`);
      if (container) {
        await this.dockerService.pauseContainer(container.id);
      }

      instance.status = InstanceStatus.PAUSED;
      await this.saveInstanceMetadata(instance);

      return instance;
    } catch (error) {
      throw error;
    }
  }

  async restartInstance(id: string): Promise<N8NInstance> {
    const instance = await this.getInstance(id);
    if (!instance) {
      throw new Error(`Instance ${id} not found`);
    }

    try {
      await this.stopInstance(id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return await this.startInstance(id);
    } catch (error) {
      throw error;
    }
  }

  async deleteInstance(id: string): Promise<boolean> {
    const instance = await this.getInstance(id);
    if (!instance) {
      throw new Error(`Instance ${id} not found`);
    }

    try {
      // Stop and remove container if running
      if (instance.status !== InstanceStatus.STOPPED) {
        await this.stopInstance(id);
      }

      // Remove instance directory
      const instanceDir = path.join(this.instancesDir, id);
      await fs.remove(instanceDir);

      return true;
    } catch (error) {
      throw error;
    }
  }

  async getInstanceLogs(
    id: string,
    filter?: LogFilter
  ): Promise<InstanceLog[]> {
    return await this.monitoringService.getInstanceLogs(id, filter);
  }

  async getInstanceMetrics(id: string): Promise<InstanceMetrics | null> {
    try {
      return await this.monitoringService.collectInstanceMetrics(id);
    } catch (error) {
      console.error(`Error getting metrics for instance ${id}:`, error);
      return null;
    }
  }

  async getInstanceHealth(id: string): Promise<InstanceHealth | null> {
    try {
      return await this.monitoringService.performHealthCheck(id);
    } catch (error) {
      console.error(`Error getting health for instance ${id}:`, error);
      return null;
    }
  }

  async exportLogs(id: string, filter?: LogFilter): Promise<string> {
    return await this.monitoringService.exportLogs(id, filter);
  }

  async getMonitoringConfig() {
    return await this.monitoringService.getConfig();
  }

  async updateMonitoringConfig(updates: any) {
    return await this.monitoringService.updateConfig(updates);
  }

  async triggerHealthCheck(id: string): Promise<InstanceHealth> {
    return await this.monitoringService.performHealthCheck(id);
  }

  // Start monitoring for an instance
  async startMonitoring(id: string): Promise<void> {
    await this.monitoringService.startMetricsCollection(id);
    await this.monitoringService.startHealthCheck(id);
    await this.monitoringService.startLogCollection(id);
  }

  // Stop monitoring for an instance
  async stopMonitoring(id: string): Promise<void> {
    await this.monitoringService.stopMonitoring(id);
  }

  private generateInstanceId(): string {
    return `n8n-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getNextAvailablePort(): Promise<number> {
    const usedPorts = new Set<number>();

    // Get ports from existing instances
    const instances = await this.listInstances();
    instances.forEach((instance) => usedPorts.add(instance.port));

    // Get ports from running Docker containers
    try {
      const containers = await this.dockerService.listN8NContainers();
      containers.forEach((container) => {
        container.ports.forEach((port) => {
          if (port.publicPort) {
            usedPorts.add(port.publicPort);
          }
        });
      });
    } catch (error) {
      console.warn("Could not get Docker container ports:", error);
    }

    // Find next available port (5600-5699)
    for (let port = 5600; port <= 5699; port++) {
      if (!usedPorts.has(port)) {
        return port;
      }
    }

    throw new Error("No available ports in range 5600-5699");
  }

  private generateDockerCompose(
    instanceId: string,
    port: number,
    clientName: string
  ): string {
    return `version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-${instanceId}
    restart: unless-stopped
    ports:
      - "${port}:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=admin123
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - N8N_USER_MANAGEMENT_DISABLED=false
      - N8N_DIAGNOSTICS_ENABLED=false
      - N8N_METRICS=true
      - N8N_LOG_LEVEL=info
      - N8N_LOG_OUTPUT=console
      - WEBHOOK_URL=http://localhost:${port}
      - GENERIC_TIMEZONE=UTC
    volumes:
      - n8n_data_${instanceId}:/home/node/.n8n
    labels:
      - "n8n.instance.id=${instanceId}"
      - "n8n.client.name=${clientName}"
    networks:
      - n8n_network_${instanceId}

volumes:
  n8n_data_${instanceId}:
    driver: local

networks:
  n8n_network_${instanceId}:
    driver: bridge
`;
  }

  private async getInstanceStatus(instanceId: string): Promise<InstanceStatus> {
    try {
      const container = await this.dockerService.getContainerInfo(
        `n8n-${instanceId}`
      );

      if (!container) {
        return InstanceStatus.STOPPED;
      }

      switch (container.state) {
        case "running":
          return InstanceStatus.RUNNING;
        case "paused":
          return InstanceStatus.PAUSED;
        case "exited":
          return InstanceStatus.STOPPED;
        case "created":
          return InstanceStatus.CREATED;
        default:
          return InstanceStatus.ERROR;
      }
    } catch (error) {
      return InstanceStatus.STOPPED;
    }
  }

  private async saveInstanceMetadata(instance: N8NInstance): Promise<void> {
    const instanceDir = path.join(this.instancesDir, instance.id);
    await fs.writeJson(path.join(instanceDir, "metadata.json"), instance, {
      spaces: 2,
    });
  }

  private async loadInstanceMetadata(
    instanceId: string
  ): Promise<N8NInstance | null> {
    try {
      const instanceDir = path.join(this.instancesDir, instanceId);
      const metadataPath = path.join(instanceDir, "metadata.json");

      if (await fs.pathExists(metadataPath)) {
        return await fs.readJson(metadataPath);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private parseDockerLogs(logs: string): InstanceLog[] {
    const lines = logs.split("\n").filter((line) => line.trim());

    return lines.map((line) => {
      // Docker logs format: 2024-01-01T12:00:00.000000000Z message
      const timestampMatch = line.match(
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s+(.+)$/
      );

      if (timestampMatch) {
        return {
          timestamp: timestampMatch[1],
          level: LogLevel.INFO,
          message: timestampMatch[2],
        };
      }

      return {
        timestamp: new Date().toISOString(),
        level: LogLevel.INFO,
        message: line,
      };
    });
  }
}
