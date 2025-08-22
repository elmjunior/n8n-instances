export interface N8NInstance {
  id: string;
  clientName: string;
  status: InstanceStatus;
  port: number;
  subdomain: string;
  createdAt: string;
  metrics?: InstanceMetrics;
  health?: InstanceHealth;
}

export interface InstanceMetrics {
  cpuUsage?: number;
  memoryUsage?: number;
  memoryUsageMB?: number;
  uptime?: number; // in seconds
  uptimeFormatted?: string;
  lastActivity?: string;
  containerId?: string;
  image?: string;
  createdAt?: string;
  startedAt?: string;
}

export interface InstanceHealth {
  isHealthy: boolean;
  lastCheck: string;
  responseTime?: number;
  errorCount: number;
  lastError?: string;
  autoRestartCount: number;
  lastRestart?: string;
}

export interface InstanceLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  containerId?: string;
  source?: string;
}

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL",
}

export enum InstanceStatus {
  CREATED = "CREATED",
  STARTING = "STARTING",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
  STOPPED = "STOPPED",
  ERROR = "ERROR",
  DELETING = "DELETING",
  CRASHED = "CRASHED",
  RESTARTING = "RESTARTING",
}

export interface CreateInstanceInput {
  clientName: string;
  subdomain: string;
  username?: string;
  password?: string;
}

export interface DockerContainerInfo {
  Id: string;
  Names: string[];
  State: string;
  Status: string;
  Ports: Array<{
    IP?: string;
    PrivatePort: number;
    PublicPort: number;
    Type: string;
  }>;
}

export interface LogFilter {
  level?: LogLevel;
  startTime?: string;
  endTime?: string;
  search?: string;
  limit?: number;
}

export interface HealthCheckConfig {
  interval: number; // seconds
  timeout: number; // seconds
  retries: number;
  autoRestart: boolean;
  alertThreshold: number; // consecutive failures
}

export interface MonitoringConfig {
  healthCheck: HealthCheckConfig;
  logBufferSize: number;
  metricsInterval: number; // seconds
  retentionDays: number;
}
