import { N8NInstanceService } from "./services/N8NInstanceService";
import { InstanceStatus, LogLevel } from "./types";

const n8nService = new N8NInstanceService();

export const resolvers = {
  Query: {
    instances: async () => {
      return await n8nService.listInstances();
    },

    instance: async (_: any, { id }: { id: string }) => {
      return await n8nService.getInstance(id);
    },

    instanceLogs: async (
      _: any,
      { id, filter }: { id: string; filter?: any }
    ) => {
      return await n8nService.getInstanceLogs(id, filter);
    },

    instanceMetrics: async (_: any, { id }: { id: string }) => {
      return await n8nService.getInstanceMetrics(id);
    },

    instanceHealth: async (_: any, { id }: { id: string }) => {
      return await n8nService.getInstanceHealth(id);
    },

    exportLogs: async (
      _: any,
      { id, filter }: { id: string; filter?: any }
    ) => {
      return await n8nService.exportLogs(id, filter);
    },

    monitoringConfig: async () => {
      return await n8nService.getMonitoringConfig();
    },
  },

  Mutation: {
    createInstance: async (
      _: any,
      {
        input,
      }: {
        input: {
          clientName: string;
          subdomain: string;
          username?: string;
          password?: string;
        };
      }
    ) => {
      return await n8nService.createInstance(input);
    },

    startInstance: async (_: any, { id }: { id: string }) => {
      return await n8nService.startInstance(id);
    },

    stopInstance: async (_: any, { id }: { id: string }) => {
      return await n8nService.stopInstance(id);
    },

    pauseInstance: async (_: any, { id }: { id: string }) => {
      return await n8nService.pauseInstance(id);
    },

    restartInstance: async (_: any, { id }: { id: string }) => {
      return await n8nService.restartInstance(id);
    },

    deleteInstance: async (_: any, { id }: { id: string }) => {
      return await n8nService.deleteInstance(id);
    },

    updateMonitoringConfig: async (_: any, { config }: { config: any }) => {
      return await n8nService.updateMonitoringConfig(config);
    },

    triggerHealthCheck: async (_: any, { id }: { id: string }) => {
      return await n8nService.triggerHealthCheck(id);
    },

    cleanupOrphanedInstances: async () => {
      return await n8nService.cleanupOrphanedInstances();
    },

    checkDockerHealth: async () => {
      return await n8nService.checkDockerHealth();
    },

    validateDockerCompose: async (_: any, { id }: { id: string }) => {
      return await n8nService.validateDockerCompose(id);
    },
  },

  Subscription: {
    instanceStatusChanged: {
      subscribe: (parent: any, args: any, context: any) => {
        const { subscriptionService } = context;
        const connectionId = context.connectionId || Math.random().toString(36);

        subscriptionService.subscribeToStatusChanges(connectionId);

        return {
          [Symbol.asyncIterator]: () => ({
            next: () => {
              return new Promise((resolve) => {
                const handler = (data: any) => {
                  subscriptionService.off("notify", handler);
                  resolve({ value: data, done: false });
                };
                subscriptionService.on("notify", handler);
              });
            },
          }),
        };
      },
    },

    instanceLogs: {
      subscribe: (parent: any, { id }: { id: string }, context: any) => {
        const { subscriptionService } = context;
        const connectionId = context.connectionId || Math.random().toString(36);

        subscriptionService.subscribeToLogs(connectionId, id);

        return {
          [Symbol.asyncIterator]: () => ({
            next: () => {
              return new Promise((resolve) => {
                const handler = (data: any) => {
                  if (data.instanceId === id) {
                    subscriptionService.off("notify", handler);
                    resolve({ value: data.log, done: false });
                  }
                };
                subscriptionService.on("notify", handler);
              });
            },
          }),
        };
      },
    },

    instanceMetrics: {
      subscribe: (parent: any, { id }: { id: string }, context: any) => {
        const { subscriptionService } = context;
        const connectionId = context.connectionId || Math.random().toString(36);

        subscriptionService.subscribeToMetrics(connectionId, id);

        return {
          [Symbol.asyncIterator]: () => ({
            next: () => {
              return new Promise((resolve) => {
                const handler = (data: any) => {
                  if (data.instanceId === id) {
                    subscriptionService.off("notify", handler);
                    resolve({ value: data.metrics, done: false });
                  }
                };
                subscriptionService.on("notify", handler);
              });
            },
          }),
        };
      },
    },

    instanceHealthChanged: {
      subscribe: (parent: any, { id }: { id: string }, context: any) => {
        const { subscriptionService } = context;
        const connectionId = context.connectionId || Math.random().toString(36);

        subscriptionService.subscribeToHealthChanges(connectionId, id);

        return {
          [Symbol.asyncIterator]: () => ({
            next: () => {
              return new Promise((resolve) => {
                const handler = (data: any) => {
                  if (data.instanceId === id) {
                    subscriptionService.off("notify", handler);
                    resolve({ value: data.health, done: false });
                  }
                };
                subscriptionService.on("notify", handler);
              });
            },
          }),
        };
      },
    },

    instanceAlert: {
      subscribe: (parent: any, { level }: { level?: string }, context: any) => {
        const { subscriptionService } = context;
        const connectionId = context.connectionId || Math.random().toString(36);

        subscriptionService.subscribeToAlerts(connectionId, level);

        return {
          [Symbol.asyncIterator]: () => ({
            next: () => {
              return new Promise((resolve) => {
                const handler = (data: any) => {
                  if (!level || data.level === level) {
                    subscriptionService.off("notify", handler);
                    resolve({ value: data, done: false });
                  }
                };
                subscriptionService.on("notify", handler);
              });
            },
          }),
        };
      },
    },
  },
};
