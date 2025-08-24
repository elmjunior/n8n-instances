import { useState } from "react";
import { useQuery, useSubscription } from "@apollo/client";
import { gql } from "@apollo/client";
import type { GetInstancesForDashboardQuery } from "../../gql/graphql";
import { FunnelIcon } from "@heroicons/react/24/outline";
import N8NInstanceCard from "./N8NInstanceCard";
import CreateInstanceModal from "./CreateInstanceModal";
import Header from "./Header";

const GET_INSTANCES = gql`
  query GetInstancesForDashboard {
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
        uptime
        lastActivity
      }
    }
  }
`;

const SUBSCRIBE_INSTANCE_STATUS = gql`
  subscription SubscribeInstanceStatus {
    instanceStatusChanged {
      id
      status
      metrics {
        cpuUsage
        memoryUsage
        uptime
        lastActivity
      }
    }
  }
`;

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [clientFilter, setClientFilter] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { loading, error, data, refetch } =
    useQuery<GetInstancesForDashboardQuery>(GET_INSTANCES);

  // Subscribe to real-time status changes
  const { data: _statusData } = useSubscription(SUBSCRIBE_INSTANCE_STATUS); // TODO: Use statusData to update instances in real-time

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const filteredInstances =
    data?.instances?.filter((instance) => {
      const matchesStatus =
        statusFilter === "ALL" || instance.status === statusFilter;
      const matchesClient =
        !clientFilter ||
        instance.clientName.toLowerCase().includes(clientFilter.toLowerCase());
      return matchesStatus && matchesClient;
    }) || [];

  const getStatusCounts = () => {
    if (!data?.instances) return {};

    return data.instances.reduce((acc, instance) => {
      acc[instance.status] = (acc[instance.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        onRefresh={handleRefresh}
        onCreateInstance={() => setIsCreateModalOpen(true)}
        isRefreshing={isRefreshing}
      />

      {/* Status Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">
              {data?.instances?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Total Instances</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {statusCounts.RUNNING || 0}
            </div>
            <div className="text-sm text-gray-500">Running</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.STOPPED || 0}
            </div>
            <div className="text-sm text-gray-500">Stopped</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {statusCounts.PAUSED || 0}
            </div>
            <div className="text-sm text-gray-500">Paused</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {statusCounts.STARTING || 0}
            </div>
            <div className="text-sm text-gray-500">Starting</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.ERROR || 0}
            </div>
            <div className="text-sm text-gray-500">Error</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="RUNNING">Running</option>
                  <option value="STOPPED">Stopped</option>
                  <option value="PAUSED">Paused</option>
                  <option value="STARTING">Starting</option>
                  <option value="ERROR">Error</option>
                  <option value="CREATED">Created</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  placeholder="Filter by client name..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Instances Grid */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Instances ({filteredInstances.length})
            </h3>
          </div>
          <div className="p-6">
            {loading && !data ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading instances...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-2">Error loading instances</div>
                <div className="text-sm text-gray-500">{error.message}</div>
              </div>
            ) : filteredInstances.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-2">No instances found</div>
                <div className="text-sm text-gray-400">
                  {statusFilter !== "ALL" || clientFilter
                    ? "Try adjusting your filters"
                    : "Create your first N8N instance to get started"}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInstances.map((instance) => (
                  <N8NInstanceCard
                    key={instance.id}
                    instance={instance}
                    onUpdate={refetch}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Instance Modal */}
      <CreateInstanceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
