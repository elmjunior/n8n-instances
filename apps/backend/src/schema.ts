import { gql } from "graphql-tag";

export const typeDefs = gql`
  type N8NInstance {
    id: ID!
    clientName: String!
    status: InstanceStatus!
    port: Int!
    subdomain: String!
    createdAt: String!
    metrics: InstanceMetrics
    health: InstanceHealth
  }

  type InstanceMetrics {
    cpuUsage: Float
    memoryUsage: Float
    memoryUsageMB: Float
    uptime: Int
    uptimeFormatted: String
    lastActivity: String
    containerId: String
    image: String
    createdAt: String
    startedAt: String
  }

  type InstanceHealth {
    isHealthy: Boolean!
    lastCheck: String!
    responseTime: Float
    errorCount: Int!
    lastError: String
    autoRestartCount: Int!
    lastRestart: String
  }

  type InstanceLog {
    timestamp: String!
    level: LogLevel!
    message: String!
    containerId: String
    source: String
  }

  enum LogLevel {
    DEBUG
    INFO
    WARN
    ERROR
    FATAL
  }

  enum InstanceStatus {
    CREATED
    STARTING
    RUNNING
    PAUSED
    STOPPED
    ERROR
    DELETING
    CRASHED
    RESTARTING
  }

  input LogFilter {
    level: LogLevel
    startTime: String
    endTime: String
    search: String
    limit: Int
  }

  type HealthCheckConfig {
    interval: Int!
    timeout: Int!
    retries: Int!
    autoRestart: Boolean!
    alertThreshold: Int!
  }

  input HealthCheckConfigInput {
    interval: Int!
    timeout: Int!
    retries: Int!
    autoRestart: Boolean!
    alertThreshold: Int!
  }

  type Query {
    instances: [N8NInstance!]!
    instance(id: ID!): N8NInstance
    instanceLogs(id: ID!, filter: LogFilter): [InstanceLog!]!
    instanceMetrics(id: ID!): InstanceMetrics
    instanceHealth(id: ID!): InstanceHealth
    exportLogs(id: ID!, filter: LogFilter): String!
    monitoringConfig: MonitoringConfig!
  }

  type Mutation {
    createInstance(input: CreateInstanceInput!): N8NInstance!
    startInstance(id: ID!): N8NInstance!
    stopInstance(id: ID!): N8NInstance!
    pauseInstance(id: ID!): N8NInstance!
    restartInstance(id: ID!): N8NInstance!
    deleteInstance(id: ID!): Boolean!
    updateMonitoringConfig(config: MonitoringConfigInput!): MonitoringConfig!
    triggerHealthCheck(id: ID!): InstanceHealth!
    cleanupOrphanedInstances: [String!]!
    checkDockerHealth: Boolean!
    validateDockerCompose(id: ID!): DockerComposeValidation!
  }

  type Subscription {
    instanceStatusChanged: N8NInstance!
    instanceLogs(id: ID!): InstanceLog!
    instanceMetrics(id: ID!): InstanceMetrics!
    instanceHealthChanged(id: ID!): InstanceHealth!
    instanceAlert(level: AlertLevel!): InstanceAlert!
  }

  type InstanceAlert {
    instanceId: ID!
    level: AlertLevel!
    message: String!
    timestamp: String!
    type: AlertType!
  }

  enum AlertLevel {
    INFO
    WARNING
    ERROR
    CRITICAL
  }

  enum AlertType {
    HEALTH_CHECK_FAILED
    AUTO_RESTART
    HIGH_CPU_USAGE
    HIGH_MEMORY_USAGE
    INSTANCE_CRASHED
    LOG_ERROR
  }

  type MonitoringConfig {
    healthCheck: HealthCheckConfig!
    logBufferSize: Int!
    metricsInterval: Int!
    retentionDays: Int!
  }

  input MonitoringConfigInput {
    healthCheck: HealthCheckConfigInput
    logBufferSize: Int
    metricsInterval: Int
    retentionDays: Int
  }

  type DockerComposeValidation {
    valid: Boolean!
    errors: [String!]!
  }

  input CreateInstanceInput {
    clientName: String!
    subdomain: String!
    username: String
    password: String
  }
`;
