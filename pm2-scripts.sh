#!/bin/bash

# PM2 Scripts for n8n-instances
# Usage: ./pm2-scripts.sh [start|stop|restart|status|logs|delete]

case "$1" in
  "start")
    echo "🚀 Starting n8n-instances with PM2..."
    pm2 start ecosystem.config.js
    echo "✅ Applications started!"
    echo "📊 Backend: http://localhost:4019/graphql"
    echo "🎨 Frontend: http://localhost:3000"
    echo "📈 Monitoring: http://localhost:4019/monitoring"
    ;;
  "stop")
    echo "🛑 Stopping n8n-instances..."
    pm2 stop ecosystem.config.js
    echo "✅ Applications stopped!"
    ;;
  "restart")
    echo "🔄 Restarting n8n-instances..."
    pm2 restart ecosystem.config.js
    echo "✅ Applications restarted!"
    ;;
  "status")
    echo "📊 PM2 Status:"
    pm2 status
    ;;
  "logs")
    echo "📝 PM2 Logs:"
    pm2 logs
    ;;
  "delete")
    echo "🗑️  Deleting n8n-instances from PM2..."
    pm2 delete ecosystem.config.js
    echo "✅ Applications deleted from PM2!"
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs|delete}"
    echo ""
    echo "Commands:"
    echo "  start   - Start all applications"
    echo "  stop    - Stop all applications"
    echo "  restart - Restart all applications"
    echo "  status  - Show PM2 status"
    echo "  logs    - Show PM2 logs"
    echo "  delete  - Delete applications from PM2"
    exit 1
    ;;
esac
