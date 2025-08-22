# N8N Instances Monitoring System

## Overview

The monitoring system provides comprehensive real-time monitoring capabilities for n8n instances, including metrics collection, health checks, log management, and alerting.

## Features

### 1. Real-time GraphQL Subscriptions

- **instanceStatusChanged**: Emits when instance status changes
- **instanceLogs**: Real-time log stream for each instance
- **instanceMetrics**: Real-time performance metrics
- **instanceHealthChanged**: Health status updates
- **instanceAlert**: System alerts and notifications

### 2. Instance Metrics

- **CPU Usage**: Percentage of CPU utilization
- **Memory Usage**: Memory consumption in MB and percentage
- **Uptime**: Instance uptime in seconds with formatted display
- **Status**: Running/Stopped/Paused/Error/Crashed/Restarting

### 3. Centralized Log Management

- **Docker API Integration**: Collects logs via Docker API
- **Log Filtering**: Filter by timestamp, level, and search terms
- **Buffer Management**: Limited to last 1000 lines per instance
- **Log Export**: Export filtered logs to JSON files
- **Real-time Streaming**: Live log updates via WebSocket

### 4. Health Checks

- **Periodic Health Checks**: Configurable intervals (default: 30s)
- **Response Time Monitoring**: Track instance response times
- **Auto-restart**: Automatic restart of unhealthy instances
- **Failure Tracking**: Count consecutive failures
- **Alert Thresholds**: Configurable alert levels

## Architecture

### Services

1. **MonitoringService**: Core monitoring functionality
2. **SubscriptionService**: WebSocket subscription management
3. **N8NInstanceService**: Enhanced with monitoring integration

### Components

```
MonitoringService
├── Metrics Collection
├── Health Checks
├── Log Management
└── Alert System

SubscriptionService
├── WebSocket Management
├── Event Broadcasting
└── Connection Tracking

WebSocket Server
├── GraphQL Subscriptions
├── Real-time Updates
└── Connection Handling
```

## Configuration

### Monitoring Configuration

```json
{
  "healthCheck": {
    "interval": 30,
    "timeout": 10,
    "retries": 3,
    "autoRestart": true,
    "alertThreshold": 3
  },
  "logBufferSize": 1000,
  "metricsInterval": 60,
  "retentionDays": 30
}
```

### Environment Variables

- `PORT`: HTTP server port (default: 4000)
- `WS_PORT`: WebSocket server port (default: 4001)
- `NODE_ENV`: Environment mode

## API Endpoints

### GraphQL Queries

```graphql
# Get all instances with metrics and health
query GetInstances {
  instances {
    id
    clientName
    status
    metrics {
      cpuUsage
      memoryUsage
      uptime
    }
    health {
      isHealthy
      lastCheck
      responseTime
    }
  }
}

# Get instance logs with filtering
query GetInstanceLogs($id: ID!, $filter: LogFilter) {
  instanceLogs(id: $id, filter: $filter) {
    timestamp
    level
    message
  }
}

# Get monitoring configuration
query GetMonitoringConfig {
  monitoringConfig {
    healthCheck {
      interval
      timeout
      autoRestart
    }
    logBufferSize
    metricsInterval
  }
}
```

### GraphQL Mutations

```graphql
# Update monitoring configuration
mutation UpdateMonitoringConfig($config: MonitoringConfigInput!) {
  updateMonitoringConfig(config: $config) {
    healthCheck {
      interval
      timeout
    }
  }
}

# Trigger manual health check
mutation TriggerHealthCheck($id: ID!) {
  triggerHealthCheck(id: $id) {
    isHealthy
    responseTime
    lastError
  }
}

# Export logs
query ExportLogs($id: ID!, $filter: LogFilter) {
  exportLogs(id: $id, filter: $filter)
}
```

### GraphQL Subscriptions

```graphql
# Real-time metrics
subscription GetInstanceMetrics($id: ID!) {
  instanceMetrics(id: $id) {
    cpuUsage
    memoryUsage
    uptime
  }
}

# Real-time logs
subscription GetInstanceLogs($id: ID!) {
  instanceLogs(id: $id) {
    timestamp
    level
    message
  }
}

# Health status changes
subscription GetInstanceHealth($id: ID!) {
  instanceHealthChanged(id: $id) {
    isHealthy
    lastCheck
    responseTime
  }
}

# System alerts
subscription GetAlerts($level: AlertLevel) {
  instanceAlert(level: $level) {
    instanceId
    level
    message
    type
  }
}
```

## Frontend Integration

### Monitoring Dashboard

The frontend includes a comprehensive monitoring dashboard with:

- **Instance Overview**: Grid view of all instances with status and health
- **Real-time Metrics**: Live CPU, memory, and uptime displays
- **Health Status**: Detailed health information with response times
- **Log Viewer**: Real-time log display with filtering
- **Alert System**: Real-time alert notifications

### Usage

```tsx
import { Monitoring } from "./components/Monitoring";

function App() {
  return (
    <div>
      <Monitoring selectedInstanceId="optional-instance-id" />
    </div>
  );
}
```

## WebSocket Connection

### Connection Details

- **URL**: `ws://localhost:4001/graphql`
- **Protocol**: GraphQL over WebSocket
- **Authentication**: Not implemented (add as needed)

### Connection Example

```javascript
import { createClient } from "graphql-ws";
import WebSocket from "ws";

const client = createClient({
  url: "ws://localhost:4001/graphql",
  webSocketImpl: WebSocket,
});

// Subscribe to metrics
const unsubscribe = client.subscribe(
  {
    query: `
      subscription GetInstanceMetrics($id: ID!) {
        instanceMetrics(id: $id) {
          cpuUsage
          memoryUsage
        }
      }
    `,
    variables: { id: "instance-id" },
  },
  {
    next: (data) => console.log("Metrics:", data),
    error: (error) => console.error("Error:", error),
    complete: () => console.log("Subscription completed"),
  }
);
```

## Alert Types

### Alert Levels

- **INFO**: Informational messages
- **WARNING**: Warning conditions
- **ERROR**: Error conditions
- **CRITICAL**: Critical system issues

### Alert Types

- **HEALTH_CHECK_FAILED**: Instance health check failed
- **AUTO_RESTART**: Instance auto-restarted
- **HIGH_CPU_USAGE**: CPU usage above threshold
- **HIGH_MEMORY_USAGE**: Memory usage above threshold
- **INSTANCE_CRASHED**: Instance crashed
- **LOG_ERROR**: Error log detected

## Performance Considerations

### Resource Usage

- **Memory**: Log buffers limited to 1000 lines per instance
- **CPU**: Metrics collection every 60 seconds
- **Network**: WebSocket connections for real-time updates
- **Storage**: Log exports and configuration files

### Scalability

- **Horizontal Scaling**: Multiple monitoring instances
- **Load Balancing**: WebSocket connection distribution
- **Database**: Consider persistent storage for historical data
- **Caching**: Implement caching for frequently accessed data

## Security

### Recommendations

- **Authentication**: Implement user authentication
- **Authorization**: Role-based access control
- **Encryption**: Use WSS for secure WebSocket connections
- **Rate Limiting**: Implement API rate limiting
- **Input Validation**: Validate all GraphQL inputs

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**

   - Check if WebSocket server is running
   - Verify port configuration
   - Check firewall settings

2. **No Metrics Data**

   - Verify Docker container is running
   - Check Docker API permissions
   - Review container naming convention

3. **Health Checks Failing**

   - Verify n8n instance is accessible
   - Check network connectivity
   - Review health check configuration

4. **Log Collection Issues**
   - Check Docker log permissions
   - Verify container exists
   - Review log buffer configuration

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=monitoring:* npm run dev
```

## Future Enhancements

### Planned Features

- **Historical Data**: Time-series database integration
- **Advanced Analytics**: Performance trend analysis
- **Custom Alerts**: User-defined alert rules
- **Dashboard Customization**: Configurable dashboards
- **Multi-tenancy**: Tenant isolation and management
- **API Rate Limiting**: Request throttling
- **Metrics Export**: Prometheus/InfluxDB integration
- **Notification System**: Email/Slack integrations
