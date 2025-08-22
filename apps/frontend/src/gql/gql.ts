/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreateInstance($input: CreateInstanceInput!) {\n    createInstance(input: $input) {\n      id\n      clientName\n      status\n      port\n      subdomain\n      createdAt\n    }\n  }\n": typeof types.CreateInstanceDocument,
    "\n  query GetInstancesForDashboard {\n    instances {\n      id\n      clientName\n      status\n      port\n      subdomain\n      createdAt\n      metrics {\n        cpuUsage\n        memoryUsage\n        uptime\n        lastActivity\n      }\n    }\n  }\n": typeof types.GetInstancesForDashboardDocument,
    "\n  subscription SubscribeInstanceStatus {\n    instanceStatusChanged {\n      id\n      status\n      metrics {\n        cpuUsage\n        memoryUsage\n        uptime\n        lastActivity\n      }\n    }\n  }\n": typeof types.SubscribeInstanceStatusDocument,
    "\n  query GetInstanceLogsForViewer($id: ID!) {\n    instanceLogs(id: $id) {\n      timestamp\n      level\n      message\n    }\n  }\n": typeof types.GetInstanceLogsForViewerDocument,
    "\n  subscription SubscribeInstanceLogs($id: ID!) {\n    instanceLogs(id: $id) {\n      timestamp\n      level\n      message\n    }\n  }\n": typeof types.SubscribeInstanceLogsDocument,
    "\n  mutation StartInstance($id: ID!) {\n    startInstance(id: $id) {\n      id\n      status\n    }\n  }\n": typeof types.StartInstanceDocument,
    "\n  mutation StopInstance($id: ID!) {\n    stopInstance(id: $id) {\n      id\n      status\n    }\n  }\n": typeof types.StopInstanceDocument,
    "\n  mutation PauseInstance($id: ID!) {\n    pauseInstance(id: $id) {\n      id\n      status\n    }\n  }\n": typeof types.PauseInstanceDocument,
    "\n  mutation RestartInstance($id: ID!) {\n    restartInstance(id: $id) {\n      id\n      status\n    }\n  }\n": typeof types.RestartInstanceDocument,
    "\n  mutation DeleteInstance($id: ID!) {\n    deleteInstance(id: $id)\n  }\n": typeof types.DeleteInstanceDocument,
    "\n  query GetInstancesForMonitoring {\n    instances {\n      id\n      clientName\n      status\n      port\n      subdomain\n      createdAt\n      metrics {\n        cpuUsage\n        memoryUsage\n        memoryUsageMB\n        uptime\n        uptimeFormatted\n        lastActivity\n      }\n      health {\n        isHealthy\n        lastCheck\n        responseTime\n        errorCount\n        lastError\n        autoRestartCount\n        lastRestart\n      }\n    }\n  }\n": typeof types.GetInstancesForMonitoringDocument,
    "\n  subscription GetInstanceMetrics($id: ID!) {\n    instanceMetrics(id: $id) {\n      cpuUsage\n      memoryUsage\n      memoryUsageMB\n      uptime\n      uptimeFormatted\n      lastActivity\n    }\n  }\n": typeof types.GetInstanceMetricsDocument,
    "\n  subscription GetInstanceHealth($id: ID!) {\n    instanceHealthChanged(id: $id) {\n      isHealthy\n      lastCheck\n      responseTime\n      errorCount\n      lastError\n      autoRestartCount\n      lastRestart\n    }\n  }\n": typeof types.GetInstanceHealthDocument,
    "\n  subscription GetInstanceLogsForMonitoring($id: ID!) {\n    instanceLogs(id: $id) {\n      timestamp\n      level\n      message\n      containerId\n      source\n    }\n  }\n": typeof types.GetInstanceLogsForMonitoringDocument,
    "\n  subscription GetAlerts($level: AlertLevel!) {\n    instanceAlert(level: $level) {\n      instanceId\n      level\n      message\n      timestamp\n      type\n    }\n  }\n": typeof types.GetAlertsDocument,
};
const documents: Documents = {
    "\n  mutation CreateInstance($input: CreateInstanceInput!) {\n    createInstance(input: $input) {\n      id\n      clientName\n      status\n      port\n      subdomain\n      createdAt\n    }\n  }\n": types.CreateInstanceDocument,
    "\n  query GetInstancesForDashboard {\n    instances {\n      id\n      clientName\n      status\n      port\n      subdomain\n      createdAt\n      metrics {\n        cpuUsage\n        memoryUsage\n        uptime\n        lastActivity\n      }\n    }\n  }\n": types.GetInstancesForDashboardDocument,
    "\n  subscription SubscribeInstanceStatus {\n    instanceStatusChanged {\n      id\n      status\n      metrics {\n        cpuUsage\n        memoryUsage\n        uptime\n        lastActivity\n      }\n    }\n  }\n": types.SubscribeInstanceStatusDocument,
    "\n  query GetInstanceLogsForViewer($id: ID!) {\n    instanceLogs(id: $id) {\n      timestamp\n      level\n      message\n    }\n  }\n": types.GetInstanceLogsForViewerDocument,
    "\n  subscription SubscribeInstanceLogs($id: ID!) {\n    instanceLogs(id: $id) {\n      timestamp\n      level\n      message\n    }\n  }\n": types.SubscribeInstanceLogsDocument,
    "\n  mutation StartInstance($id: ID!) {\n    startInstance(id: $id) {\n      id\n      status\n    }\n  }\n": types.StartInstanceDocument,
    "\n  mutation StopInstance($id: ID!) {\n    stopInstance(id: $id) {\n      id\n      status\n    }\n  }\n": types.StopInstanceDocument,
    "\n  mutation PauseInstance($id: ID!) {\n    pauseInstance(id: $id) {\n      id\n      status\n    }\n  }\n": types.PauseInstanceDocument,
    "\n  mutation RestartInstance($id: ID!) {\n    restartInstance(id: $id) {\n      id\n      status\n    }\n  }\n": types.RestartInstanceDocument,
    "\n  mutation DeleteInstance($id: ID!) {\n    deleteInstance(id: $id)\n  }\n": types.DeleteInstanceDocument,
    "\n  query GetInstancesForMonitoring {\n    instances {\n      id\n      clientName\n      status\n      port\n      subdomain\n      createdAt\n      metrics {\n        cpuUsage\n        memoryUsage\n        memoryUsageMB\n        uptime\n        uptimeFormatted\n        lastActivity\n      }\n      health {\n        isHealthy\n        lastCheck\n        responseTime\n        errorCount\n        lastError\n        autoRestartCount\n        lastRestart\n      }\n    }\n  }\n": types.GetInstancesForMonitoringDocument,
    "\n  subscription GetInstanceMetrics($id: ID!) {\n    instanceMetrics(id: $id) {\n      cpuUsage\n      memoryUsage\n      memoryUsageMB\n      uptime\n      uptimeFormatted\n      lastActivity\n    }\n  }\n": types.GetInstanceMetricsDocument,
    "\n  subscription GetInstanceHealth($id: ID!) {\n    instanceHealthChanged(id: $id) {\n      isHealthy\n      lastCheck\n      responseTime\n      errorCount\n      lastError\n      autoRestartCount\n      lastRestart\n    }\n  }\n": types.GetInstanceHealthDocument,
    "\n  subscription GetInstanceLogsForMonitoring($id: ID!) {\n    instanceLogs(id: $id) {\n      timestamp\n      level\n      message\n      containerId\n      source\n    }\n  }\n": types.GetInstanceLogsForMonitoringDocument,
    "\n  subscription GetAlerts($level: AlertLevel!) {\n    instanceAlert(level: $level) {\n      instanceId\n      level\n      message\n      timestamp\n      type\n    }\n  }\n": types.GetAlertsDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateInstance($input: CreateInstanceInput!) {\n    createInstance(input: $input) {\n      id\n      clientName\n      status\n      port\n      subdomain\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateInstance($input: CreateInstanceInput!) {\n    createInstance(input: $input) {\n      id\n      clientName\n      status\n      port\n      subdomain\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetInstancesForDashboard {\n    instances {\n      id\n      clientName\n      status\n      port\n      subdomain\n      createdAt\n      metrics {\n        cpuUsage\n        memoryUsage\n        uptime\n        lastActivity\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetInstancesForDashboard {\n    instances {\n      id\n      clientName\n      status\n      port\n      subdomain\n      createdAt\n      metrics {\n        cpuUsage\n        memoryUsage\n        uptime\n        lastActivity\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription SubscribeInstanceStatus {\n    instanceStatusChanged {\n      id\n      status\n      metrics {\n        cpuUsage\n        memoryUsage\n        uptime\n        lastActivity\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription SubscribeInstanceStatus {\n    instanceStatusChanged {\n      id\n      status\n      metrics {\n        cpuUsage\n        memoryUsage\n        uptime\n        lastActivity\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetInstanceLogsForViewer($id: ID!) {\n    instanceLogs(id: $id) {\n      timestamp\n      level\n      message\n    }\n  }\n"): (typeof documents)["\n  query GetInstanceLogsForViewer($id: ID!) {\n    instanceLogs(id: $id) {\n      timestamp\n      level\n      message\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription SubscribeInstanceLogs($id: ID!) {\n    instanceLogs(id: $id) {\n      timestamp\n      level\n      message\n    }\n  }\n"): (typeof documents)["\n  subscription SubscribeInstanceLogs($id: ID!) {\n    instanceLogs(id: $id) {\n      timestamp\n      level\n      message\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation StartInstance($id: ID!) {\n    startInstance(id: $id) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation StartInstance($id: ID!) {\n    startInstance(id: $id) {\n      id\n      status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation StopInstance($id: ID!) {\n    stopInstance(id: $id) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation StopInstance($id: ID!) {\n    stopInstance(id: $id) {\n      id\n      status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation PauseInstance($id: ID!) {\n    pauseInstance(id: $id) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation PauseInstance($id: ID!) {\n    pauseInstance(id: $id) {\n      id\n      status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RestartInstance($id: ID!) {\n    restartInstance(id: $id) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation RestartInstance($id: ID!) {\n    restartInstance(id: $id) {\n      id\n      status\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteInstance($id: ID!) {\n    deleteInstance(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteInstance($id: ID!) {\n    deleteInstance(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetInstancesForMonitoring {\n    instances {\n      id\n      clientName\n      status\n      port\n      subdomain\n      createdAt\n      metrics {\n        cpuUsage\n        memoryUsage\n        memoryUsageMB\n        uptime\n        uptimeFormatted\n        lastActivity\n      }\n      health {\n        isHealthy\n        lastCheck\n        responseTime\n        errorCount\n        lastError\n        autoRestartCount\n        lastRestart\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetInstancesForMonitoring {\n    instances {\n      id\n      clientName\n      status\n      port\n      subdomain\n      createdAt\n      metrics {\n        cpuUsage\n        memoryUsage\n        memoryUsageMB\n        uptime\n        uptimeFormatted\n        lastActivity\n      }\n      health {\n        isHealthy\n        lastCheck\n        responseTime\n        errorCount\n        lastError\n        autoRestartCount\n        lastRestart\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription GetInstanceMetrics($id: ID!) {\n    instanceMetrics(id: $id) {\n      cpuUsage\n      memoryUsage\n      memoryUsageMB\n      uptime\n      uptimeFormatted\n      lastActivity\n    }\n  }\n"): (typeof documents)["\n  subscription GetInstanceMetrics($id: ID!) {\n    instanceMetrics(id: $id) {\n      cpuUsage\n      memoryUsage\n      memoryUsageMB\n      uptime\n      uptimeFormatted\n      lastActivity\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription GetInstanceHealth($id: ID!) {\n    instanceHealthChanged(id: $id) {\n      isHealthy\n      lastCheck\n      responseTime\n      errorCount\n      lastError\n      autoRestartCount\n      lastRestart\n    }\n  }\n"): (typeof documents)["\n  subscription GetInstanceHealth($id: ID!) {\n    instanceHealthChanged(id: $id) {\n      isHealthy\n      lastCheck\n      responseTime\n      errorCount\n      lastError\n      autoRestartCount\n      lastRestart\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription GetInstanceLogsForMonitoring($id: ID!) {\n    instanceLogs(id: $id) {\n      timestamp\n      level\n      message\n      containerId\n      source\n    }\n  }\n"): (typeof documents)["\n  subscription GetInstanceLogsForMonitoring($id: ID!) {\n    instanceLogs(id: $id) {\n      timestamp\n      level\n      message\n      containerId\n      source\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription GetAlerts($level: AlertLevel!) {\n    instanceAlert(level: $level) {\n      instanceId\n      level\n      message\n      timestamp\n      type\n    }\n  }\n"): (typeof documents)["\n  subscription GetAlerts($level: AlertLevel!) {\n    instanceAlert(level: $level) {\n      instanceId\n      level\n      message\n      timestamp\n      type\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;