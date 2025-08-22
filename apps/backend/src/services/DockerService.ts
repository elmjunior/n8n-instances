import Docker from "dockerode";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

export interface ContainerMetrics {
  cpuUsage: number;
  memoryUsage: number;
  memoryLimit: number;
  networkRx: number;
  networkTx: number;
  uptime: string;
  lastActivity: string;
}

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  state: string;
  ports: Array<{
    privatePort: number;
    publicPort: number;
    type: string;
  }>;
  labels: Record<string, string>;
  createdAt: string;
  metrics?: ContainerMetrics;
}

export class DockerService {
  private docker: Docker;

  constructor() {
    this.docker = new Docker();
  }

  /**
   * List all containers with N8N labels
   */
  async listN8NContainers(): Promise<ContainerInfo[]> {
    try {
      const containers = await this.docker.listContainers({ all: true });
      const n8nContainers: ContainerInfo[] = [];

      for (const container of containers) {
        const labels = container.Labels || {};

        // Check if this is an N8N container
        if (labels["n8n.instance.id"]) {
          const containerInfo = await this.getContainerInfo(container.Id);
          if (containerInfo) {
            n8nContainers.push(containerInfo);
          }
        }
      }

      return n8nContainers;
    } catch (error) {
      console.error("Error listing N8N containers:", error);
      return [];
    }
  }

  /**
   * Get detailed container information
   */
  async getContainerInfo(containerId: string): Promise<ContainerInfo | null> {
    try {
      const container = this.docker.getContainer(containerId);
      const inspect = await container.inspect();
      const stats = await container.stats({ stream: false });

      const ports = inspect.NetworkSettings.Ports
        ? Object.entries(inspect.NetworkSettings.Ports)
            .map(([port, bindings]) => {
              const [privatePort] = port.split("/");
              const publicPort = bindings?.[0]?.HostPort;
              const type = port.split("/")[1] || "tcp";

              return {
                privatePort: parseInt(privatePort),
                publicPort: publicPort ? parseInt(publicPort) : 0,
                type,
              };
            })
            .filter((p) => p.publicPort > 0)
        : [];

      const metrics = await this.calculateContainerMetrics(stats);

      return {
        id: inspect.Id,
        name: inspect.Name.replace("/", ""),
        image: inspect.Config.Image,
        status: inspect.State.Status,
        state: inspect.State.Status,
        ports,
        labels: inspect.Config.Labels || {},
        createdAt: inspect.Created,
        metrics,
      };
    } catch (error) {
      console.error(`Error getting container info for ${containerId}:`, error);
      return null;
    }
  }

  /**
   * Start a container
   */
  async startContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.start();
    } catch (error) {
      console.error(`Error starting container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Stop a container
   */
  async stopContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.stop();
    } catch (error) {
      console.error(`Error stopping container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Pause a container
   */
  async pauseContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.pause();
    } catch (error) {
      console.error(`Error pausing container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Unpause a container
   */
  async unpauseContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.unpause();
    } catch (error) {
      console.error(`Error unpausing container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Restart a container
   */
  async restartContainer(containerId: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.restart();
    } catch (error) {
      console.error(`Error restarting container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Remove a container
   */
  async removeContainer(
    containerId: string,
    force: boolean = false
  ): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      await container.remove({ force });
    } catch (error) {
      console.error(`Error removing container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Get container logs
   */
  async getContainerLogs(
    containerId: string,
    options: {
      tail?: number;
      since?: string;
      until?: string;
      timestamps?: boolean;
    } = {}
  ): Promise<string> {
    try {
      const container = this.docker.getContainer(containerId);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        ...options,
      });

      return logs.toString();
    } catch (error) {
      console.error(`Error getting logs for container ${containerId}:`, error);
      throw error;
    }
  }

  /**
   * Stream container logs
   */
  async streamContainerLogs(
    containerId: string,
    callback: (log: string) => void,
    options: {
      tail?: number;
      since?: string;
      timestamps?: boolean;
    } = {}
  ): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      const stream = await container.logs({
        stdout: true,
        stderr: true,
        follow: true,
        ...options,
      });

      stream.on("data", (chunk) => {
        callback(chunk.toString());
      });

      stream.on("error", (error) => {
        console.error(
          `Error streaming logs for container ${containerId}:`,
          error
        );
      });
    } catch (error) {
      console.error(
        `Error streaming logs for container ${containerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Calculate container metrics from stats
   */
  private async calculateContainerMetrics(
    stats: any
  ): Promise<ContainerMetrics> {
    try {
      const cpuDelta =
        stats.cpu_stats.cpu_usage.total_usage -
        stats.precpu_stats.cpu_usage.total_usage;
      const systemDelta =
        stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
      const cpuUsage = systemDelta > 0 ? (cpuDelta / systemDelta) * 100 : 0;

      const memoryUsage = stats.memory_stats.usage || 0;
      const memoryLimit = stats.memory_stats.limit || 0;
      const memoryUsagePercent =
        memoryLimit > 0 ? (memoryUsage / memoryLimit) * 100 : 0;

      const networkStats = stats.networks?.eth0 || {};
      const networkRx = networkStats.rx_bytes || 0;
      const networkTx = networkStats.tx_bytes || 0;

      const uptime = this.formatUptime(stats.read);
      const lastActivity = new Date(stats.read).toISOString();

      return {
        cpuUsage: Math.round(cpuUsage * 100) / 100,
        memoryUsage: Math.round(memoryUsagePercent * 100) / 100,
        memoryLimit,
        networkRx,
        networkTx,
        uptime,
        lastActivity,
      };
    } catch (error) {
      console.error("Error calculating container metrics:", error);
      return {
        cpuUsage: 0,
        memoryUsage: 0,
        memoryLimit: 0,
        networkRx: 0,
        networkTx: 0,
        uptime: "0s",
        lastActivity: new Date().toISOString(),
      };
    }
  }

  /**
   * Format uptime from timestamp
   */
  private formatUptime(timestamp: string): string {
    const now = Date.now();
    const created = new Date(timestamp).getTime();
    const diff = now - created;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Execute command in container
   */
  async execCommand(
    containerId: string,
    command: string[]
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    try {
      const container = this.docker.getContainer(containerId);
      const exec = await container.exec({
        Cmd: command,
        AttachStdout: true,
        AttachStderr: true,
      });

      const stream = await exec.start({});

      return new Promise((resolve, reject) => {
        let stdout = "";
        let stderr = "";

        stream.on("data", (chunk: Buffer) => {
          const output = chunk.toString();
          if (output.startsWith("1:")) {
            stdout += output.substring(2);
          } else if (output.startsWith("2:")) {
            stderr += output.substring(2);
          }
        });

        stream.on("end", async () => {
          const inspect = await exec.inspect();
          resolve({
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: inspect.ExitCode || 0,
          });
        });

        stream.on("error", reject);
      });
    } catch (error) {
      console.error(
        `Error executing command in container ${containerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get container health status
   */
  async getContainerHealth(containerId: string): Promise<string> {
    try {
      const container = this.docker.getContainer(containerId);
      const inspect = await container.inspect();

      if (inspect.State.Health) {
        return inspect.State.Health.Status;
      }

      return inspect.State.Status;
    } catch (error) {
      console.error(
        `Error getting health for container ${containerId}:`,
        error
      );
      return "unknown";
    }
  }

  /**
   * Get system-wide Docker statistics
   */
  async getSystemStats(): Promise<{
    containers: number;
    running: number;
    paused: number;
    stopped: number;
    images: number;
    volumes: number;
    networks: number;
  }> {
    try {
      const containers = await this.docker.listContainers({ all: true });
      const images = await this.docker.listImages();
      const volumes = await this.docker.listVolumes();
      const networks = await this.docker.listNetworks();

      const running = containers.filter((c) => c.State === "running").length;
      const paused = containers.filter((c) => c.State === "paused").length;
      const stopped = containers.filter((c) => c.State === "exited").length;

      return {
        containers: containers.length,
        running,
        paused,
        stopped,
        images: images.length,
        volumes: volumes.Volumes?.length || 0,
        networks: networks.length,
      };
    } catch (error) {
      console.error("Error getting system stats:", error);
      return {
        containers: 0,
        running: 0,
        paused: 0,
        stopped: 0,
        images: 0,
        volumes: 0,
        networks: 0,
      };
    }
  }

  /**
   * Check if Docker daemon is accessible
   */
  async isDockerAvailable(): Promise<boolean> {
    try {
      await this.docker.ping();
      return true;
    } catch (error) {
      console.error("Docker daemon not accessible:", error);
      return false;
    }
  }

  /**
   * Get Docker version information
   */
  async getDockerVersion(): Promise<{
    version: string;
    apiVersion: string;
    os: string;
    arch: string;
  }> {
    try {
      const version = await this.docker.version();
      return {
        version: version.Version,
        apiVersion: version.ApiVersion,
        os: version.Os,
        arch: version.Arch,
      };
    } catch (error) {
      console.error("Error getting Docker version:", error);
      throw error;
    }
  }
}
