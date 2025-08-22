import { EventEmitter } from "events";
import { MonitoringService } from "./MonitoringService";

export interface SubscriptionContext {
  instanceId?: string;
  level?: string;
  type?: string;
}

export class SubscriptionService extends EventEmitter {
  private monitoringService: MonitoringService;
  private subscriptions: Map<string, Set<string>> = new Map();

  constructor(monitoringService: MonitoringService) {
    super();
    this.monitoringService = monitoringService;
    this.setupMonitoringListeners();
  }

  private setupMonitoringListeners(): void {
    // Listen to monitoring service events and forward them to subscribers
    this.monitoringService.on("metrics", ({ instanceId, metrics }) => {
      this.emit("instanceMetrics", { instanceId, metrics });
    });

    this.monitoringService.on("healthChanged", ({ instanceId, health }) => {
      this.emit("instanceHealthChanged", { instanceId, health });
    });

    this.monitoringService.on("log", ({ instanceId, log }) => {
      this.emit("instanceLogs", { instanceId, log });
    });

    this.monitoringService.on("alert", (alert) => {
      this.emit("instanceAlert", alert);
    });
  }

  // Subscribe to instance status changes
  subscribeToStatusChanges(connectionId: string): void {
    if (!this.subscriptions.has("statusChanges")) {
      this.subscriptions.set("statusChanges", new Set());
    }
    this.subscriptions.get("statusChanges")!.add(connectionId);
  }

  // Subscribe to instance logs
  subscribeToLogs(connectionId: string, instanceId: string): void {
    const key = `logs:${instanceId}`;
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key)!.add(connectionId);
  }

  // Subscribe to instance metrics
  subscribeToMetrics(connectionId: string, instanceId: string): void {
    const key = `metrics:${instanceId}`;
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key)!.add(connectionId);
  }

  // Subscribe to instance health changes
  subscribeToHealthChanges(connectionId: string, instanceId: string): void {
    const key = `health:${instanceId}`;
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key)!.add(connectionId);
  }

  // Subscribe to alerts
  subscribeToAlerts(connectionId: string, level?: string): void {
    const key = level ? `alerts:${level}` : "alerts:all";
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key)!.add(connectionId);
  }

  // Unsubscribe from all subscriptions for a connection
  unsubscribe(connectionId: string): void {
    for (const [key, connections] of this.subscriptions.entries()) {
      connections.delete(connectionId);
      if (connections.size === 0) {
        this.subscriptions.delete(key);
      }
    }
  }

  // Get subscribers for a specific event
  getSubscribers(
    eventType: string,
    context?: SubscriptionContext
  ): Set<string> {
    const key = this.getSubscriptionKey(eventType, context);
    return this.subscriptions.get(key) || new Set();
  }

  private getSubscriptionKey(
    eventType: string,
    context?: SubscriptionContext
  ): string {
    switch (eventType) {
      case "statusChanges":
        return "statusChanges";
      case "logs":
        return `logs:${context?.instanceId}`;
      case "metrics":
        return `metrics:${context?.instanceId}`;
      case "health":
        return `health:${context?.instanceId}`;
      case "alerts":
        return context?.level ? `alerts:${context.level}` : "alerts:all";
      default:
        return eventType;
    }
  }

  // Notify subscribers of an event
  notifySubscribers(
    eventType: string,
    data: any,
    context?: SubscriptionContext
  ): void {
    const subscribers = this.getSubscribers(eventType, context);
    subscribers.forEach((connectionId) => {
      this.emit("notify", { connectionId, eventType, data });
    });
  }

  // Get subscription statistics
  getSubscriptionStats(): {
    totalSubscriptions: number;
    subscriptionsByType: Record<string, number>;
  } {
    const stats = {
      totalSubscriptions: 0,
      subscriptionsByType: {} as Record<string, number>,
    };

    for (const [key, connections] of this.subscriptions.entries()) {
      const count = connections.size;
      stats.totalSubscriptions += count;
      stats.subscriptionsByType[key] = count;
    }

    return stats;
  }
}
