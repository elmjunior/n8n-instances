import { useState } from "react";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

import {
  PlayIcon,
  StopIcon,
  PauseIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  CpuChipIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";
import LogsViewer from "./LogsViewer";

const START_INSTANCE = gql`
  mutation StartInstance($id: ID!) {
    startInstance(id: $id) {
      id
      status
    }
  }
`;

const STOP_INSTANCE = gql`
  mutation StopInstance($id: ID!) {
    stopInstance(id: $id) {
      id
      status
    }
  }
`;

const PAUSE_INSTANCE = gql`
  mutation PauseInstance($id: ID!) {
    pauseInstance(id: $id) {
      id
      status
    }
  }
`;

const RESTART_INSTANCE = gql`
  mutation RestartInstance($id: ID!) {
    restartInstance(id: $id) {
      id
      status
    }
  }
`;

const DELETE_INSTANCE = gql`
  mutation DeleteInstance($id: ID!) {
    deleteInstance(id: $id)
  }
`;

interface N8NInstanceCardProps {
  instance: any; // Will be replaced by generated types after codegen
  onUpdate: () => void;
}

export default function N8NInstanceCard({
  instance,
  onUpdate,
}: N8NInstanceCardProps) {
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [startInstance] = useMutation(START_INSTANCE, {
    onCompleted: onUpdate,
  });

  const [stopInstance] = useMutation(STOP_INSTANCE, {
    onCompleted: onUpdate,
  });

  const [pauseInstance] = useMutation(PAUSE_INSTANCE, {
    onCompleted: onUpdate,
  });

  const [restartInstance] = useMutation(RESTART_INSTANCE, {
    onCompleted: onUpdate,
  });

  const [deleteInstance] = useMutation(DELETE_INSTANCE, {
    onCompleted: onUpdate,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RUNNING":
        return "bg-green-100 text-green-800 border-green-200";
      case "STOPPED":
        return "bg-red-100 text-red-800 border-red-200";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "STARTING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ERROR":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RUNNING":
        return "🟢";
      case "STOPPED":
        return "🔴";
      case "PAUSED":
        return "🟡";
      case "STARTING":
        return "🔵";
      case "ERROR":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete the instance "${instance.clientName}"? This action cannot be undone.`
      )
    ) {
      setIsDeleting(true);
      try {
        await deleteInstance({ variables: { id: instance.id } });
      } catch (error) {
        console.error("Error deleting instance:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleAction = async (action: string) => {
    try {
      switch (action) {
        case "start":
          await startInstance({ variables: { id: instance.id } });
          break;
        case "stop":
          await stopInstance({ variables: { id: instance.id } });
          break;
        case "pause":
          await pauseInstance({ variables: { id: instance.id } });
          break;
        case "restart":
          await restartInstance({ variables: { id: instance.id } });
          break;
      }
    } catch (error) {
      console.error(`Error ${action}ing instance:`, error);
    }
  };

  const canStart = instance.status === "STOPPED" || instance.status === "ERROR";
  const canStop = instance.status === "RUNNING";
  const canPause = instance.status === "RUNNING";
  const canRestart =
    instance.status === "RUNNING" || instance.status === "PAUSED";

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getStatusIcon(instance.status)}</span>
              <h3 className="font-medium text-gray-900 truncate">
                {instance.clientName}
              </h3>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                instance.status
              )}`}
            >
              {instance.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <div className="space-y-3">
            {/* Instance Info */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ID:</span>
                <span className="text-gray-900 font-mono text-xs">
                  {instance.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Port:</span>
                <span className="text-gray-900">{instance.port}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subdomain:</span>
                <span className="text-gray-900">{instance.subdomain}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900">
                  {new Date(instance.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Metrics */}
            {instance.metrics && (
              <div className="pt-2 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2">
                  {instance.metrics.cpuUsage && (
                    <div className="flex items-center space-x-1">
                      <CpuChipIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        CPU: {instance.metrics.cpuUsage}%
                      </span>
                    </div>
                  )}
                  {instance.metrics.memoryUsage && (
                    <div className="flex items-center space-x-1">
                      <CircleStackIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        RAM: {instance.metrics.memoryUsage}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-2">
                {canStart && (
                  <button
                    onClick={() => handleAction("start")}
                    className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded hover:bg-green-200 transition-colors duration-200"
                  >
                    <PlayIcon className="h-3 w-3 mr-1" />
                    Start
                  </button>
                )}
                {canStop && (
                  <button
                    onClick={() => handleAction("stop")}
                    className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded hover:bg-red-200 transition-colors duration-200"
                  >
                    <StopIcon className="h-3 w-3 mr-1" />
                    Stop
                  </button>
                )}
                {canPause && (
                  <button
                    onClick={() => handleAction("pause")}
                    className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 border border-yellow-200 rounded hover:bg-yellow-200 transition-colors duration-200"
                  >
                    <PauseIcon className="h-3 w-3 mr-1" />
                    Pause
                  </button>
                )}
                {canRestart && (
                  <button
                    onClick={() => handleAction("restart")}
                    className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded hover:bg-blue-200 transition-colors duration-200"
                  >
                    <ArrowPathIcon className="h-3 w-3 mr-1" />
                    Restart
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  onClick={() => setIsLogsOpen(true)}
                  className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded hover:bg-gray-200 transition-colors duration-200"
                >
                  <DocumentTextIcon className="h-3 w-3 mr-1" />
                  Logs
                </button>
                <a
                  href={`http://localhost:${instance.port}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded hover:bg-blue-200 transition-colors duration-200"
                >
                  <ArrowTopRightOnSquareIcon className="h-3 w-3 mr-1" />
                  Open
                </a>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded hover:bg-red-200 transition-colors duration-200 disabled:opacity-50"
                >
                  <TrashIcon className="h-3 w-3 mr-1" />
                  {isDeleting ? "..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Modal */}
      <LogsViewer
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        instanceId={instance.id}
        instanceName={instance.clientName}
      />
    </>
  );
}
