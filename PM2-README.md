# PM2 Configuration for n8n-instances

This project uses PM2 to manage the backend and frontend applications in development mode.

## Ports Used

- **Backend HTTP**: `4019` (GraphQL API)
- **Backend WebSocket**: `4020` (GraphQL Subscriptions)
- **Frontend**: `3000` (Vite Dev Server)

## Quick Start

### Using the Script (Recommended)

```bash
# Start all applications
./pm2-scripts.sh start

# Stop all applications
./pm2-scripts.sh stop

# Restart all applications
./pm2-scripts.sh restart

# Check status
./pm2-scripts.sh status

# View logs
./pm2-scripts.sh logs

# Remove from PM2
./pm2-scripts.sh delete
```

### Using PM2 Directly

```bash
# Start applications
pm2 start ecosystem.config.js

# Stop applications
pm2 stop ecosystem.config.js

# Restart applications
pm2 restart ecosystem.config.js

# Delete applications
pm2 delete ecosystem.config.js

# View status
pm2 status

# View logs
pm2 logs
```

## Access Points

Once started, you can access:

- **Frontend**: http://localhost:3000
- **Backend GraphQL**: http://localhost:4019/graphql
- **Health Check**: http://localhost:4019/health
- **Monitoring**: http://localhost:4019/monitoring
- **WebSocket**: ws://localhost:4020/graphql

## Configuration

The PM2 configuration is in `ecosystem.config.js` and includes:

- **Auto-restart** on file changes
- **Memory limits** (1GB per app)
- **Logging** to separate files
- **Environment variables** for development
- **File watching** for hot reload

## Logs

Logs are stored in:

- Backend: `apps/backend/logs/`
- Frontend: `apps/frontend/logs/`
- PM2 logs: `pm2 logs` command

## Troubleshooting

If applications fail to start:

1. Check if ports are available: `netstat -tlnp | grep LISTEN`
2. Ensure dependencies are installed: `yarn install`
3. Check PM2 logs: `pm2 logs`
4. Restart PM2 daemon: `pm2 kill && pm2 start ecosystem.config.js`
