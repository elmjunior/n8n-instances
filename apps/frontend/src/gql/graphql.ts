/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export enum AlertLevel {
  Critical = 'CRITICAL',
  Error = 'ERROR',
  Info = 'INFO',
  Warning = 'WARNING'
}

export enum AlertType {
  AutoRestart = 'AUTO_RESTART',
  HealthCheckFailed = 'HEALTH_CHECK_FAILED',
  HighCpuUsage = 'HIGH_CPU_USAGE',
  HighMemoryUsage = 'HIGH_MEMORY_USAGE',
  InstanceCrashed = 'INSTANCE_CRASHED',
  LogError = 'LOG_ERROR'
}

export type CreateInstanceInput = {
  clientName: Scalars['String']['input'];
  password?: InputMaybe<Scalars['String']['input']>;
  subdomain: Scalars['String']['input'];
  username?: InputMaybe<Scalars['String']['input']>;
};

export type HealthCheckConfig = {
  __typename?: 'HealthCheckConfig';
  alertThreshold: Scalars['Int']['output'];
  autoRestart: Scalars['Boolean']['output'];
  interval: Scalars['Int']['output'];
  retries: Scalars['Int']['output'];
  timeout: Scalars['Int']['output'];
};

export type HealthCheckConfigInput = {
  alertThreshold: Scalars['Int']['input'];
  autoRestart: Scalars['Boolean']['input'];
  interval: Scalars['Int']['input'];
  retries: Scalars['Int']['input'];
  timeout: Scalars['Int']['input'];
};

export type InstanceAlert = {
  __typename?: 'InstanceAlert';
  instanceId: Scalars['ID']['output'];
  level: AlertLevel;
  message: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
  type: AlertType;
};

export type InstanceHealth = {
  __typename?: 'InstanceHealth';
  autoRestartCount: Scalars['Int']['output'];
  errorCount: Scalars['Int']['output'];
  isHealthy: Scalars['Boolean']['output'];
  lastCheck: Scalars['String']['output'];
  lastError?: Maybe<Scalars['String']['output']>;
  lastRestart?: Maybe<Scalars['String']['output']>;
  responseTime?: Maybe<Scalars['Float']['output']>;
};

export type InstanceLog = {
  __typename?: 'InstanceLog';
  containerId?: Maybe<Scalars['String']['output']>;
  level: LogLevel;
  message: Scalars['String']['output'];
  source?: Maybe<Scalars['String']['output']>;
  timestamp: Scalars['String']['output'];
};

export type InstanceMetrics = {
  __typename?: 'InstanceMetrics';
  containerId?: Maybe<Scalars['String']['output']>;
  cpuUsage?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  lastActivity?: Maybe<Scalars['String']['output']>;
  memoryUsage?: Maybe<Scalars['Float']['output']>;
  memoryUsageMB?: Maybe<Scalars['Float']['output']>;
  startedAt?: Maybe<Scalars['String']['output']>;
  uptime?: Maybe<Scalars['Int']['output']>;
  uptimeFormatted?: Maybe<Scalars['String']['output']>;
};

export enum InstanceStatus {
  Crashed = 'CRASHED',
  Created = 'CREATED',
  Deleting = 'DELETING',
  Error = 'ERROR',
  Paused = 'PAUSED',
  Restarting = 'RESTARTING',
  Running = 'RUNNING',
  Starting = 'STARTING',
  Stopped = 'STOPPED'
}

export type LogFilter = {
  endTime?: InputMaybe<Scalars['String']['input']>;
  level?: InputMaybe<LogLevel>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
};

export enum LogLevel {
  Debug = 'DEBUG',
  Error = 'ERROR',
  Fatal = 'FATAL',
  Info = 'INFO',
  Warn = 'WARN'
}

export type MonitoringConfig = {
  __typename?: 'MonitoringConfig';
  healthCheck: HealthCheckConfig;
  logBufferSize: Scalars['Int']['output'];
  metricsInterval: Scalars['Int']['output'];
  retentionDays: Scalars['Int']['output'];
};

export type MonitoringConfigInput = {
  healthCheck?: InputMaybe<HealthCheckConfigInput>;
  logBufferSize?: InputMaybe<Scalars['Int']['input']>;
  metricsInterval?: InputMaybe<Scalars['Int']['input']>;
  retentionDays?: InputMaybe<Scalars['Int']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createInstance: N8NInstance;
  deleteInstance: Scalars['Boolean']['output'];
  pauseInstance: N8NInstance;
  restartInstance: N8NInstance;
  startInstance: N8NInstance;
  stopInstance: N8NInstance;
  triggerHealthCheck: InstanceHealth;
  updateMonitoringConfig: MonitoringConfig;
};


export type MutationCreateInstanceArgs = {
  input: CreateInstanceInput;
};


export type MutationDeleteInstanceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPauseInstanceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRestartInstanceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationStartInstanceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationStopInstanceArgs = {
  id: Scalars['ID']['input'];
};


export type MutationTriggerHealthCheckArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateMonitoringConfigArgs = {
  config: MonitoringConfigInput;
};

export type N8NInstance = {
  __typename?: 'N8NInstance';
  clientName: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  health?: Maybe<InstanceHealth>;
  id: Scalars['ID']['output'];
  metrics?: Maybe<InstanceMetrics>;
  port: Scalars['Int']['output'];
  status: InstanceStatus;
  subdomain: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  exportLogs: Scalars['String']['output'];
  instance?: Maybe<N8NInstance>;
  instanceHealth?: Maybe<InstanceHealth>;
  instanceLogs: Array<InstanceLog>;
  instanceMetrics?: Maybe<InstanceMetrics>;
  instances: Array<N8NInstance>;
  monitoringConfig: MonitoringConfig;
};


export type QueryExportLogsArgs = {
  filter?: InputMaybe<LogFilter>;
  id: Scalars['ID']['input'];
};


export type QueryInstanceArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInstanceHealthArgs = {
  id: Scalars['ID']['input'];
};


export type QueryInstanceLogsArgs = {
  filter?: InputMaybe<LogFilter>;
  id: Scalars['ID']['input'];
};


export type QueryInstanceMetricsArgs = {
  id: Scalars['ID']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  instanceAlert: InstanceAlert;
  instanceHealthChanged: InstanceHealth;
  instanceLogs: InstanceLog;
  instanceMetrics: InstanceMetrics;
  instanceStatusChanged: N8NInstance;
};


export type SubscriptionInstanceAlertArgs = {
  level: AlertLevel;
};


export type SubscriptionInstanceHealthChangedArgs = {
  id: Scalars['ID']['input'];
};


export type SubscriptionInstanceLogsArgs = {
  id: Scalars['ID']['input'];
};


export type SubscriptionInstanceMetricsArgs = {
  id: Scalars['ID']['input'];
};

export type CreateInstanceMutationVariables = Exact<{
  input: CreateInstanceInput;
}>;


export type CreateInstanceMutation = { __typename?: 'Mutation', createInstance: { __typename?: 'N8NInstance', id: string, clientName: string, status: InstanceStatus, port: number, subdomain: string, createdAt: string } };

export type GetInstancesForDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type GetInstancesForDashboardQuery = { __typename?: 'Query', instances: Array<{ __typename?: 'N8NInstance', id: string, clientName: string, status: InstanceStatus, port: number, subdomain: string, createdAt: string, metrics?: { __typename?: 'InstanceMetrics', cpuUsage?: number | null, memoryUsage?: number | null, uptime?: number | null, lastActivity?: string | null } | null }> };

export type SubscribeInstanceStatusSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type SubscribeInstanceStatusSubscription = { __typename?: 'Subscription', instanceStatusChanged: { __typename?: 'N8NInstance', id: string, status: InstanceStatus, metrics?: { __typename?: 'InstanceMetrics', cpuUsage?: number | null, memoryUsage?: number | null, uptime?: number | null, lastActivity?: string | null } | null } };

export type GetInstanceLogsForViewerQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetInstanceLogsForViewerQuery = { __typename?: 'Query', instanceLogs: Array<{ __typename?: 'InstanceLog', timestamp: string, level: LogLevel, message: string }> };

export type SubscribeInstanceLogsSubscriptionVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SubscribeInstanceLogsSubscription = { __typename?: 'Subscription', instanceLogs: { __typename?: 'InstanceLog', timestamp: string, level: LogLevel, message: string } };

export type StartInstanceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type StartInstanceMutation = { __typename?: 'Mutation', startInstance: { __typename?: 'N8NInstance', id: string, status: InstanceStatus } };

export type StopInstanceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type StopInstanceMutation = { __typename?: 'Mutation', stopInstance: { __typename?: 'N8NInstance', id: string, status: InstanceStatus } };

export type PauseInstanceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type PauseInstanceMutation = { __typename?: 'Mutation', pauseInstance: { __typename?: 'N8NInstance', id: string, status: InstanceStatus } };

export type RestartInstanceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RestartInstanceMutation = { __typename?: 'Mutation', restartInstance: { __typename?: 'N8NInstance', id: string, status: InstanceStatus } };

export type DeleteInstanceMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteInstanceMutation = { __typename?: 'Mutation', deleteInstance: boolean };

export type GetInstancesForMonitoringQueryVariables = Exact<{ [key: string]: never; }>;


export type GetInstancesForMonitoringQuery = { __typename?: 'Query', instances: Array<{ __typename?: 'N8NInstance', id: string, clientName: string, status: InstanceStatus, port: number, subdomain: string, createdAt: string, metrics?: { __typename?: 'InstanceMetrics', cpuUsage?: number | null, memoryUsage?: number | null, memoryUsageMB?: number | null, uptime?: number | null, uptimeFormatted?: string | null, lastActivity?: string | null } | null, health?: { __typename?: 'InstanceHealth', isHealthy: boolean, lastCheck: string, responseTime?: number | null, errorCount: number, lastError?: string | null, autoRestartCount: number, lastRestart?: string | null } | null }> };

export type GetInstanceMetricsSubscriptionVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetInstanceMetricsSubscription = { __typename?: 'Subscription', instanceMetrics: { __typename?: 'InstanceMetrics', cpuUsage?: number | null, memoryUsage?: number | null, memoryUsageMB?: number | null, uptime?: number | null, uptimeFormatted?: string | null, lastActivity?: string | null } };

export type GetInstanceHealthSubscriptionVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetInstanceHealthSubscription = { __typename?: 'Subscription', instanceHealthChanged: { __typename?: 'InstanceHealth', isHealthy: boolean, lastCheck: string, responseTime?: number | null, errorCount: number, lastError?: string | null, autoRestartCount: number, lastRestart?: string | null } };

export type GetInstanceLogsForMonitoringSubscriptionVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetInstanceLogsForMonitoringSubscription = { __typename?: 'Subscription', instanceLogs: { __typename?: 'InstanceLog', timestamp: string, level: LogLevel, message: string, containerId?: string | null, source?: string | null } };

export type GetAlertsSubscriptionVariables = Exact<{
  level: AlertLevel;
}>;


export type GetAlertsSubscription = { __typename?: 'Subscription', instanceAlert: { __typename?: 'InstanceAlert', instanceId: string, level: AlertLevel, message: string, timestamp: string, type: AlertType } };


export const CreateInstanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateInstance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateInstanceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createInstance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"clientName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"port"}},{"kind":"Field","name":{"kind":"Name","value":"subdomain"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateInstanceMutation, CreateInstanceMutationVariables>;
export const GetInstancesForDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetInstancesForDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instances"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"clientName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"port"}},{"kind":"Field","name":{"kind":"Name","value":"subdomain"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cpuUsage"}},{"kind":"Field","name":{"kind":"Name","value":"memoryUsage"}},{"kind":"Field","name":{"kind":"Name","value":"uptime"}},{"kind":"Field","name":{"kind":"Name","value":"lastActivity"}}]}}]}}]}}]} as unknown as DocumentNode<GetInstancesForDashboardQuery, GetInstancesForDashboardQueryVariables>;
export const SubscribeInstanceStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"SubscribeInstanceStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instanceStatusChanged"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cpuUsage"}},{"kind":"Field","name":{"kind":"Name","value":"memoryUsage"}},{"kind":"Field","name":{"kind":"Name","value":"uptime"}},{"kind":"Field","name":{"kind":"Name","value":"lastActivity"}}]}}]}}]}}]} as unknown as DocumentNode<SubscribeInstanceStatusSubscription, SubscribeInstanceStatusSubscriptionVariables>;
export const GetInstanceLogsForViewerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetInstanceLogsForViewer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instanceLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<GetInstanceLogsForViewerQuery, GetInstanceLogsForViewerQueryVariables>;
export const SubscribeInstanceLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"SubscribeInstanceLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instanceLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<SubscribeInstanceLogsSubscription, SubscribeInstanceLogsSubscriptionVariables>;
export const StartInstanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartInstance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startInstance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<StartInstanceMutation, StartInstanceMutationVariables>;
export const StopInstanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StopInstance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopInstance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<StopInstanceMutation, StopInstanceMutationVariables>;
export const PauseInstanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PauseInstance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pauseInstance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<PauseInstanceMutation, PauseInstanceMutationVariables>;
export const RestartInstanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RestartInstance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"restartInstance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<RestartInstanceMutation, RestartInstanceMutationVariables>;
export const DeleteInstanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteInstance"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteInstance"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteInstanceMutation, DeleteInstanceMutationVariables>;
export const GetInstancesForMonitoringDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetInstancesForMonitoring"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instances"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"clientName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"port"}},{"kind":"Field","name":{"kind":"Name","value":"subdomain"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cpuUsage"}},{"kind":"Field","name":{"kind":"Name","value":"memoryUsage"}},{"kind":"Field","name":{"kind":"Name","value":"memoryUsageMB"}},{"kind":"Field","name":{"kind":"Name","value":"uptime"}},{"kind":"Field","name":{"kind":"Name","value":"uptimeFormatted"}},{"kind":"Field","name":{"kind":"Name","value":"lastActivity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isHealthy"}},{"kind":"Field","name":{"kind":"Name","value":"lastCheck"}},{"kind":"Field","name":{"kind":"Name","value":"responseTime"}},{"kind":"Field","name":{"kind":"Name","value":"errorCount"}},{"kind":"Field","name":{"kind":"Name","value":"lastError"}},{"kind":"Field","name":{"kind":"Name","value":"autoRestartCount"}},{"kind":"Field","name":{"kind":"Name","value":"lastRestart"}}]}}]}}]}}]} as unknown as DocumentNode<GetInstancesForMonitoringQuery, GetInstancesForMonitoringQueryVariables>;
export const GetInstanceMetricsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"GetInstanceMetrics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instanceMetrics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cpuUsage"}},{"kind":"Field","name":{"kind":"Name","value":"memoryUsage"}},{"kind":"Field","name":{"kind":"Name","value":"memoryUsageMB"}},{"kind":"Field","name":{"kind":"Name","value":"uptime"}},{"kind":"Field","name":{"kind":"Name","value":"uptimeFormatted"}},{"kind":"Field","name":{"kind":"Name","value":"lastActivity"}}]}}]}}]} as unknown as DocumentNode<GetInstanceMetricsSubscription, GetInstanceMetricsSubscriptionVariables>;
export const GetInstanceHealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"GetInstanceHealth"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instanceHealthChanged"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isHealthy"}},{"kind":"Field","name":{"kind":"Name","value":"lastCheck"}},{"kind":"Field","name":{"kind":"Name","value":"responseTime"}},{"kind":"Field","name":{"kind":"Name","value":"errorCount"}},{"kind":"Field","name":{"kind":"Name","value":"lastError"}},{"kind":"Field","name":{"kind":"Name","value":"autoRestartCount"}},{"kind":"Field","name":{"kind":"Name","value":"lastRestart"}}]}}]}}]} as unknown as DocumentNode<GetInstanceHealthSubscription, GetInstanceHealthSubscriptionVariables>;
export const GetInstanceLogsForMonitoringDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"GetInstanceLogsForMonitoring"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instanceLogs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"containerId"}},{"kind":"Field","name":{"kind":"Name","value":"source"}}]}}]}}]} as unknown as DocumentNode<GetInstanceLogsForMonitoringSubscription, GetInstanceLogsForMonitoringSubscriptionVariables>;
export const GetAlertsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"GetAlerts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"level"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AlertLevel"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instanceAlert"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"level"},"value":{"kind":"Variable","name":{"kind":"Name","value":"level"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instanceId"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]} as unknown as DocumentNode<GetAlertsSubscription, GetAlertsSubscriptionVariables>;