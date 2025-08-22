import Docker from "dockerode";
import fs from "fs-extra";
import path from "path";

export class PortManager {
  private docker: Docker;
  private portRange = { min: 5600, max: 5699 };

  constructor() {
    this.docker = new Docker();
  }

  /**
   * Get next available port in the range
   */
  async getNextAvailablePort(): Promise<number> {
    const usedPorts = await this.getUsedPorts();

    for (let port = this.portRange.min; port <= this.portRange.max; port++) {
      if (!usedPorts.has(port)) {
        return port;
      }
    }

    throw new Error(
      `No available ports in range ${this.portRange.min}-${this.portRange.max}`
    );
  }

  /**
   * Get all ports currently in use
   */
  async getUsedPorts(): Promise<Set<number>> {
    const usedPorts = new Set<number>();

    try {
      // Get ports from Docker containers
      const containers = await this.docker.listContainers();
      for (const container of containers) {
        if (container.Ports) {
          for (const port of container.Ports) {
            if (port.PublicPort && this.isInRange(port.PublicPort)) {
              usedPorts.add(port.PublicPort);
            }
          }
        }
      }

      // Get ports from existing instance metadata
      await this.addInstanceMetadataPorts(usedPorts);
    } catch (error) {
      console.warn("Error getting used ports:", error);
    }

    return usedPorts;
  }

  /**
   * Check if port is in the allowed range
   */
  private isInRange(port: number): boolean {
    return port >= this.portRange.min && port <= this.portRange.max;
  }

  /**
   * Add ports from existing instance metadata and docker-compose files
   */
  private async addInstanceMetadataPorts(
    usedPorts: Set<number>
  ): Promise<void> {
    try {
      const instancesDir = path.join(
        process.cwd(),
        "..",
        "..",
        "docker",
        "instances"
      );

      if (!(await fs.pathExists(instancesDir))) {
        return;
      }

      const instanceDirs = await fs.readdir(instancesDir);

      for (const instanceId of instanceDirs) {
        // Check metadata.json first
        const metadataPath = path.join(
          instancesDir,
          instanceId,
          "metadata.json"
        );

        if (await fs.pathExists(metadataPath)) {
          try {
            const metadata = await fs.readJson(metadataPath);
            if (metadata.port && this.isInRange(metadata.port)) {
              usedPorts.add(metadata.port);
            }
          } catch (error) {
            console.warn(`Error reading metadata for ${instanceId}:`, error);
          }
        }

        // Also check docker-compose.yml for port information
        const composePath = path.join(
          instancesDir,
          instanceId,
          "docker-compose.yml"
        );

        if (await fs.pathExists(composePath)) {
          try {
            const composeContent = await fs.readFile(composePath, "utf-8");
            const portMatch = composeContent.match(/ports:\s*-\s*"(\d+):5678"/);
            if (portMatch && this.isInRange(parseInt(portMatch[1]))) {
              usedPorts.add(parseInt(portMatch[1]));
            }
          } catch (error) {
            console.warn(
              `Error reading docker-compose for ${instanceId}:`,
              error
            );
          }
        }
      }
    } catch (error) {
      console.warn("Error reading instance metadata:", error);
    }
  }

  /**
   * Check if a specific port is available
   */
  async isPortAvailable(port: number): Promise<boolean> {
    if (!this.isInRange(port)) {
      return false;
    }

    const usedPorts = await this.getUsedPorts();
    return !usedPorts.has(port);
  }

  /**
   * Reserve a port (mark as used)
   */
  async reservePort(port: number): Promise<boolean> {
    if (!this.isInRange(port)) {
      throw new Error(
        `Port ${port} is not in allowed range ${this.portRange.min}-${this.portRange.max}`
      );
    }

    if (!(await this.isPortAvailable(port))) {
      return false;
    }

    // In a real implementation, you might want to create a lock file
    // or use a database to track reserved ports
    return true;
  }

  /**
   * Release a port (mark as available)
   */
  async releasePort(port: number): Promise<void> {
    if (!this.isInRange(port)) {
      throw new Error(
        `Port ${port} is not in allowed range ${this.portRange.min}-${this.portRange.max}`
      );
    }

    // In a real implementation, you might want to remove lock files
    // or update database records
    console.log(`Port ${port} released`);
  }

  /**
   * Get port range configuration
   */
  getPortRange(): { min: number; max: number } {
    return { ...this.portRange };
  }

  /**
   * Set port range configuration
   */
  setPortRange(min: number, max: number): void {
    if (min > max) {
      throw new Error("Min port must be less than max port");
    }

    if (min < 1024 || max > 65535) {
      throw new Error("Port range must be between 1024 and 65535");
    }

    this.portRange = { min, max };
  }

  /**
   * Get port usage statistics
   */
  async getPortUsageStats(): Promise<{
    total: number;
    used: number;
    available: number;
    usedPorts: number[];
  }> {
    const usedPorts = await this.getUsedPorts();
    const total = this.portRange.max - this.portRange.min + 1;
    const used = usedPorts.size;
    const available = total - used;

    return {
      total,
      used,
      available,
      usedPorts: Array.from(usedPorts).sort((a, b) => a - b),
    };
  }

  /**
   * Test port connectivity
   */
  async testPortConnectivity(port: number): Promise<boolean> {
    try {
      const net = await import("net");

      return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 5000; // 5 seconds timeout

        socket.setTimeout(timeout);

        socket.on("connect", () => {
          socket.destroy();
          resolve(true);
        });

        socket.on("timeout", () => {
          socket.destroy();
          resolve(false);
        });

        socket.on("error", () => {
          socket.destroy();
          resolve(false);
        });

        socket.connect(port, "localhost");
      });
    } catch (error) {
      console.warn("Port connectivity test failed:", error);
      return false;
    }
  }

  /**
   * Get detailed port information
   */
  async getPortInfo(port: number): Promise<{
    port: number;
    inRange: boolean;
    available: boolean;
    connected: boolean;
    containerInfo?: any;
  }> {
    const inRange = this.isInRange(port);
    const available = inRange ? await this.isPortAvailable(port) : false;
    const connected = inRange ? await this.testPortConnectivity(port) : false;

    let containerInfo = null;
    if (inRange && !available) {
      try {
        const containers = await this.docker.listContainers();
        for (const container of containers) {
          if (container.Ports) {
            for (const portInfo of container.Ports) {
              if (portInfo.PublicPort === port) {
                containerInfo = {
                  id: container.Id,
                  name: container.Names?.[0],
                  image: container.Image,
                  status: container.Status,
                };
                break;
              }
            }
          }
        }
      } catch (error) {
        console.warn("Error getting container info:", error);
      }
    }

    return {
      port,
      inRange,
      available,
      connected,
      containerInfo,
    };
  }
}
