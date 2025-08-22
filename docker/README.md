# Docker Template System for N8N Instances

This directory contains the Docker template system for managing N8N instances with automated container orchestration.

## Directory Structure

```
docker/
├── templates/
│   └── n8n-compose.template.yml    # Docker Compose template
├── instances/
│   └── [instance-id]/              # Generated instance directories
│       ├── docker-compose.yml      # Generated compose file
│       ├── .env                    # Environment variables
│       ├── README.md               # Instance documentation
│       ├── data/                   # N8N data volume
│       ├── workflows/              # Workflow definitions
│       ├── credentials/            # Encrypted credentials
│       └── logs/                   # Instance logs
└── README.md                       # This file
```

## Template System

### Template Variables

The `n8n-compose.template.yml` template supports the following variables:

- `{{INSTANCE_ID}}` - Unique instance identifier
- `{{PORT}}` - Assigned port number (5600-5699)
- `{{CLIENT_NAME}}` - Client/organization name
- `{{USERNAME}}` - N8N authentication username
- `{{PASSWORD}}` - N8N authentication password
- `{{ENCRYPTION_KEY}}` - Auto-generated encryption key
- `{{PASSWORD_HASH}}` - Base64 encoded auth for Traefik
- `{{CREATED_AT}}` - Instance creation timestamp
- `{{SUBNET_ID}}` - Auto-generated subnet identifier

### Template Features

#### Container Configuration

- **N8N Container**: Latest n8nio/n8n image
- **Redis Container**: For queue management
- **Resource Limits**: CPU and memory constraints
- **Health Checks**: Automated health monitoring
- **Restart Policies**: Automatic recovery

#### Security Features

- **Basic Authentication**: Username/password protection
- **Encryption**: Auto-generated encryption keys
- **Network Isolation**: Separate Docker networks
- **Resource Limits**: Prevent resource exhaustion

#### Persistence

- **Data Volume**: N8N database and settings
- **Workflows Volume**: Workflow definitions
- **Credentials Volume**: Encrypted credentials
- **Redis Volume**: Queue data persistence

#### Networking

- **Internal Network**: Isolated communication
- **Traefik Integration**: Reverse proxy support
- **Port Mapping**: Dynamic port allocation
- **Subnet Management**: Automatic subnet assignment

## Port Management

### Port Range

- **Range**: 5600-5699 (100 ports)
- **Auto-detection**: Checks Docker containers and system ports
- **Conflict Prevention**: Validates availability before assignment
- **Statistics**: Tracks usage and availability

### Port Detection Methods

1. **Docker Containers**: Scans running containers
2. **System Ports**: Uses `ss` or `netstat` commands
3. **Instance Metadata**: Reads existing instance files
4. **Connectivity Testing**: Tests port accessibility

## Instance Management

### Instance Creation Process

1. **Port Allocation**: Finds next available port
2. **Directory Creation**: Creates instance directory structure
3. **Template Processing**: Substitutes variables in template
4. **File Generation**: Creates docker-compose.yml and config files
5. **Metadata Storage**: Saves instance information

### Instance Directory Structure

```
[instance-id]/
├── docker-compose.yml      # Generated compose configuration
├── .env                    # Environment variables
├── README.md               # Instance documentation
├── data/                   # N8N persistent data
├── workflows/              # Workflow storage
├── credentials/            # Credential storage
└── logs/                   # Log files
```

### Instance Lifecycle

1. **Created**: Instance files generated
2. **Starting**: Containers being started
3. **Running**: Instance operational
4. **Paused**: Instance paused
5. **Stopped**: Instance stopped
6. **Error**: Instance in error state
7. **Deleting**: Instance being removed

## Docker Integration

### Container Management

- **Start/Stop**: Full container lifecycle control
- **Pause/Resume**: Temporary suspension
- **Restart**: Graceful restart with health checks
- **Remove**: Complete cleanup with volumes

### Metrics Collection

- **CPU Usage**: Real-time CPU utilization
- **Memory Usage**: Memory consumption tracking
- **Network I/O**: Network traffic monitoring
- **Uptime**: Container uptime calculation
- **Health Status**: Health check results

### Log Management

- **Real-time Logs**: Live log streaming
- **Log Filtering**: Level-based filtering
- **Log Rotation**: Automatic log management
- **Log Parsing**: Structured log processing

## Traefik Integration

### Reverse Proxy Configuration

- **Host Rules**: `{client-name}.n8n.local`
- **Basic Auth**: Automatic authentication setup
- **SSL/TLS**: HTTPS support (when configured)
- **Load Balancing**: Multiple instance support

### Labels Configuration

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.n8n-{{INSTANCE_ID}}.rule=Host(`{{CLIENT_NAME}}.n8n.local`)"
  - "traefik.http.routers.n8n-{{INSTANCE_ID}}.entrypoints=web"
  - "traefik.http.services.n8n-{{INSTANCE_ID}}.loadbalancer.server.port=5678"
  - "traefik.http.middlewares.n8n-{{INSTANCE_ID}}-auth.basicauth.users={{USERNAME}}:{{PASSWORD_HASH}}"
```

## Security Considerations

### Authentication

- **Default Credentials**: admin/admin123
- **Custom Credentials**: Configurable per instance
- **Password Hashing**: Secure password storage
- **Session Management**: Secure session handling

### Network Security

- **Isolated Networks**: Each instance in separate network
- **Port Restrictions**: Limited port range access
- **Firewall Rules**: Network-level protection
- **Traefik Security**: Reverse proxy security

### Data Protection

- **Encryption Keys**: Auto-generated per instance
- **Volume Isolation**: Separate data volumes
- **Backup Support**: Volume backup capabilities
- **Access Control**: File system permissions

## Monitoring and Health Checks

### Health Check Configuration

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5678/healthz"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Metrics Collection

- **Container Stats**: Real-time performance metrics
- **Resource Usage**: CPU, memory, network monitoring
- **Health Status**: Automated health monitoring
- **Alerting**: Health status notifications

## Troubleshooting

### Common Issues

#### Port Conflicts

```bash
# Check port usage
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Check system ports
ss -tln | grep -E ':(560[0-9]|56[1-9][0-9])'
```

#### Container Issues

```bash
# Check container logs
docker logs n8n-{instance-id}

# Check container status
docker inspect n8n-{instance-id}

# Restart container
docker restart n8n-{instance-id}
```

#### Network Issues

```bash
# Check network connectivity
docker network ls
docker network inspect n8n_network_{instance-id}

# Test port connectivity
telnet localhost {port}
```

### Debug Commands

#### Instance Management

```bash
# List all instances
ls -la docker/instances/

# Check instance status
docker-compose -f docker/instances/{instance-id}/docker-compose.yml ps

# View instance logs
docker-compose -f docker/instances/{instance-id}/docker-compose.yml logs -f
```

#### System Diagnostics

```bash
# Check Docker daemon
docker info

# Check system resources
docker system df

# Clean up unused resources
docker system prune
```

## Development

### Adding New Templates

1. Create template file in `templates/` directory
2. Add variable placeholders using `{{VARIABLE_NAME}}` syntax
3. Update `TemplateService` to handle new variables
4. Test template generation

### Extending Port Management

1. Modify `PortManager` class
2. Add new port detection methods
3. Update port range configuration
4. Test port allocation logic

### Customizing Container Configuration

1. Edit `n8n-compose.template.yml`
2. Add new environment variables
3. Configure additional services
4. Update health check configuration

## Best Practices

### Resource Management

- Set appropriate CPU and memory limits
- Monitor resource usage regularly
- Implement resource quotas
- Use resource reservations

### Security

- Change default credentials
- Use strong passwords
- Enable encryption
- Regular security updates

### Monitoring

- Implement comprehensive logging
- Set up health check monitoring
- Monitor resource usage
- Configure alerting

### Backup

- Regular volume backups
- Configuration backups
- Test restore procedures
- Document backup procedures
