import { useState, useEffect, useRef } from "react";
import { useQuery, useSubscription } from "@apollo/client";
import { gql } from "@apollo/client";
import {
  XMarkIcon,
  FunnelIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";

const GET_INSTANCE_LOGS = gql`
  query GetInstanceLogsForViewer($id: ID!) {
    instanceLogs(id: $id) {
      timestamp
      level
      message
    }
  }
`;

const SUBSCRIBE_INSTANCE_LOGS = gql`
  subscription SubscribeInstanceLogs($id: ID!) {
    instanceLogs(id: $id) {
      timestamp
      level
      message
    }
  }
`;

interface LogsViewerProps {
  isOpen: boolean;
  onClose: () => void;
  instanceId: string;
  instanceName: string;
}

export default function LogsViewer({
  isOpen,
  onClose,
  instanceId,
  instanceName,
}: LogsViewerProps) {
  const [logLevel, setLogLevel] = useState<string>("ALL");
  const [autoScroll, setAutoScroll] = useState(true);
  const [maxLines, setMaxLines] = useState(100);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, refetch } = useQuery(GET_INSTANCE_LOGS, {
    variables: { id: instanceId },
    skip: !isOpen,
  });

  // Subscribe to real-time logs
  const { data: _logsData } = useSubscription(SUBSCRIBE_INSTANCE_LOGS, {
    variables: { id: instanceId },
    skip: !isOpen,
  }); // TODO: Use logsData to update logs in real-time

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [data, autoScroll]);

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  const filteredLogs =
    data?.instanceLogs?.filter((log: any) => {
      if (logLevel === "ALL") return true;
      return log.level === logLevel;
    }) || [];

  const getLogLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "ERROR":
        return "text-red-600 bg-red-50";
      case "WARN":
        return "text-yellow-600 bg-yellow-50";
      case "INFO":
        return "text-blue-600 bg-blue-50";
      case "DEBUG":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Logs - {instanceName}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Real-time logs for instance {instanceId}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Log Level Filter */}
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-4 w-4 text-gray-400" />
                    <select
                      value={logLevel}
                      onChange={(e) => setLogLevel(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Levels</option>
                      <option value="ERROR">Error</option>
                      <option value="WARN">Warning</option>
                      <option value="INFO">Info</option>
                      <option value="DEBUG">Debug</option>
                    </select>
                  </div>

                  {/* Max Lines */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Max Lines:</span>
                    <select
                      value={maxLines}
                      onChange={(e) => setMaxLines(Number(e.target.value))}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={500}>500</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Auto-scroll toggle */}
                  <button
                    onClick={() => setAutoScroll(!autoScroll)}
                    className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                      autoScroll
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {autoScroll ? (
                      <ArrowDownIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                    )}
                    Auto-scroll
                  </button>

                  {/* Manual scroll to bottom */}
                  <button
                    onClick={scrollToBottom}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                    Bottom
                  </button>
                </div>
              </div>
            </div>

            {/* Logs Content */}
            <div className="px-6 py-4">
              {loading && !data ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading logs...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-2">Error loading logs</div>
                  <div className="text-sm text-gray-500">{error.message}</div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                  {filteredLogs.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">
                      No logs found
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredLogs.map((log: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 text-gray-300"
                        >
                          <span className="text-gray-500 flex-shrink-0">
                            {formatTimestamp(log.timestamp)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getLogLevelColor(
                              log.level
                            )}`}
                          >
                            {log.level}
                          </span>
                          <span className="flex-1 break-all">
                            {log.message}
                          </span>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  )}
                </div>
              )}

              {/* Log Stats */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div>
                  Showing {filteredLogs.length} of{" "}
                  {data?.instanceLogs?.length || 0} logs
                  {logLevel !== "ALL" && ` (filtered by ${logLevel})`}
                </div>
                <div className="flex items-center space-x-4">
                  <span>Auto-refresh: 2s</span>
                  <button
                    onClick={() => refetch()}
                    className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
