import { useState } from "react";
import { useQuery, useSubscription } from "@apollo/client";
import { gql } from "@apollo/client";

const GET_INSTANCES = gql`
  query GetInstancesForMonitoring {
    instances {
      id
      clientName
      status
      port
      subdomain
      createdAt
      metrics {
        cpuUsage
        memoryUsage
        memoryUsageMB
        uptime
        uptimeFormatted
        lastActivity
      }
      health {
        isHealthy
        lastCheck
        responseTime
        errorCount
        lastError
        autoRestartCount
        lastRestart
      }
    }
  }
`;

const GET_INSTANCE_METRICS = gql`
  subscription GetInstanceMetrics($id: ID!) {
    instanceMetrics(id: $id) {
      cpuUsage
      memoryUsage
      memoryUsageMB
      uptime
      uptimeFormatted
      lastActivity
    }
  }
`;

const GET_INSTANCE_HEALTH = gql`
  subscription GetInstanceHealth($id: ID!) {
    instanceHealthChanged(id: $id) {
      isHealthy
      lastCheck
      responseTime
      errorCount
      lastError
      autoRestartCount
      lastRestart
    }
  }
`;

const GET_INSTANCE_LOGS = gql`
  subscription GetInstanceLogsForMonitoring($id: ID!) {
    instanceLogs(id: $id) {
      timestamp
      level
      message
      containerId
      source
    }
  }
`;

const GET_ALERTS = gql`
  subscription GetAlerts($level: AlertLevel!) {
    instanceAlert(level: $level) {
      instanceId
      level
      message
      timestamp
      type
    }
  }
`;

interface MonitoringProps {
  selectedInstanceId?: string; // Will be replaced by generated types
}

export default function Monitoring({ selectedInstanceId }: MonitoringProps) {
  const [selectedInstance, setSelectedInstance] = useState<string | null>(
    selectedInstanceId || null
  );
  const [logFilter, setLogFilter] = useState({
    level: "",
    search: "",
    limit: 100,
  });

  const {
    data: instancesData,
    loading: instancesLoading,
    error: instancesError,
  } = useQuery(GET_INSTANCES, {
    pollInterval: 5000, // Refresh every 5 seconds
  });

  // Real-time metrics subscription
  const { data: metricsData } = useSubscription(GET_INSTANCE_METRICS, {
    variables: { id: selectedInstance },
    skip: !selectedInstance,
  });

  // Real-time health subscription
  const { data: healthData } = useSubscription(GET_INSTANCE_HEALTH, {
    variables: { id: selectedInstance },
    skip: !selectedInstance,
  });

  // Real-time logs subscription
  const { data: logsData } = useSubscription(GET_INSTANCE_LOGS, {
    variables: { id: selectedInstance },
    skip: !selectedInstance,
  });

  // Real-time alerts subscription
  const { data: alertsData } = useSubscription(GET_ALERTS);

  const instances = instancesData?.instances || [];
  const currentInstance = instances.find(
    (inst: any) => inst.id === selectedInstance // Will be replaced by generated types
  );
  const metrics = metricsData?.instanceMetrics || currentInstance?.metrics;
  const health = healthData?.instanceHealthChanged || currentInstance?.health;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RUNNING":
        return "text-green-600 bg-green-100";
      case "STOPPED":
        return "text-red-600 bg-red-100";
      case "PAUSED":
        return "text-yellow-600 bg-yellow-100";
      case "ERROR":
        return "text-red-600 bg-red-100";
      case "STARTING":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getHealthColor = (isHealthy: boolean) => {
    return isHealthy
      ? "text-green-600 bg-green-100"
      : "text-red-600 bg-red-100";
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "ERROR":
        return "text-red-600";
      case "WARN":
        return "text-yellow-600";
      case "INFO":
        return "text-blue-600";
      case "DEBUG":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  if (instancesLoading)
    return <div className="p-4">Loading monitoring data...</div>;
  if (instancesError)
    return (
      <div className="p-4 text-red-600">
        Error loading monitoring data: {instancesError.message}
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Monitoring Dashboard
        </h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Instance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {instances.map(
          (
            instance: any // Will be replaced by generated types
          ) => (
            <div
              key={instance.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedInstance === instance.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedInstance(instance.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {instance.clientName}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    instance.status
                  )}`}
                >
                  {instance.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Port: {instance.port}</div>
                <div>Subdomain: {instance.subdomain}</div>
                {instance.health && (
                  <div
                    className={`mt-2 px-2 py-1 rounded text-xs ${getHealthColor(
                      instance.health.isHealthy
                    )}`}
                  >
                    {instance.health.isHealthy ? "Healthy" : "Unhealthy"}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* Selected Instance Details */}
      {selectedInstance && currentInstance && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentInstance.clientName} - Details
            </h2>

            {/* Metrics */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">CPU Usage</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.cpuUsage
                      ? `${metrics.cpuUsage.toFixed(1)}%`
                      : "N/A"}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Memory Usage</div>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.memoryUsageMB
                      ? `${metrics.memoryUsageMB.toFixed(1)} MB`
                      : "N/A"}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Uptime</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.uptimeFormatted || "N/A"}
                  </div>
                </div>
              </div>
            )}

            {/* Health Status */}
            {health && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Health Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(
                          health.isHealthy
                        )}`}
                      >
                        {health.isHealthy ? "Healthy" : "Unhealthy"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Last check: {new Date(health.lastCheck).toLocaleString()}
                    </div>
                    {health.responseTime && (
                      <div className="text-sm text-gray-600">
                        Response time: {health.responseTime}ms
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Error Count</div>
                    <div className="text-xl font-bold text-red-600">
                      {health.errorCount}
                    </div>
                    {health.autoRestartCount > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        Auto-restarts: {health.autoRestartCount}
                      </div>
                    )}
                  </div>
                </div>
                {health.lastError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm font-medium text-red-800">
                      Last Error
                    </div>
                    <div className="text-sm text-red-700 mt-1">
                      {health.lastError}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logs */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Logs</h3>
              <div className="flex space-x-2">
                <select
                  value={logFilter.level}
                  onChange={(e) =>
                    setLogFilter({ ...logFilter, level: e.target.value })
                  }
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="">All Levels</option>
                  <option value="DEBUG">Debug</option>
                  <option value="INFO">Info</option>
                  <option value="WARN">Warning</option>
                  <option value="ERROR">Error</option>
                </select>
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={logFilter.search}
                  onChange={(e) =>
                    setLogFilter({ ...logFilter, search: e.target.value })
                  }
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
              {logsData?.instanceLogs ? (
                <div className="space-y-1">
                  <div
                    className={`${getLogLevelColor(
                      logsData.instanceLogs.level
                    )}`}
                  >
                    [
                    {new Date(
                      logsData.instanceLogs.timestamp
                    ).toLocaleTimeString()}
                    ] [{logsData.instanceLogs.level}]{" "}
                    {logsData.instanceLogs.message}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No recent logs...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alertsData?.instanceAlert && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
          <div className="space-y-2">
            <div
              className={`p-3 rounded-lg border ${
                alertsData.instanceAlert.level === "ERROR"
                  ? "bg-red-50 border-red-200"
                  : alertsData.instanceAlert.level === "WARNING"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">
                    {alertsData.instanceAlert.type}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {alertsData.instanceAlert.message}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(
                    alertsData.instanceAlert.timestamp
                  ).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
