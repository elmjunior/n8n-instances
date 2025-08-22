# N8N Instance: primata.digital

## Instance Information
- **Instance ID**: n8n-1755876406368-a8giylsaz
- **Client Name**: primata.digital
- **Port**: 5600
- **Created**: 2025-08-22T15:26:46.427Z
- **Username**: admin

## Access Information
- **Local Access**: http://localhost:5600
- **Traefik Route**: http://primata.digital.n8n.local
- **Default Credentials**: admin / admin123

## Management Commands

### Start Instance
```bash
cd /Users/elmjunior/dev/n8n-instances/docker/instances/n8n-1755876406368-a8giylsaz
docker-compose up -d
```

### Stop Instance
```bash
cd /Users/elmjunior/dev/n8n-instances/docker/instances/n8n-1755876406368-a8giylsaz
docker-compose down
```

### View Logs
```bash
cd /Users/elmjunior/dev/n8n-instances/docker/instances/n8n-1755876406368-a8giylsaz
docker-compose logs -f n8n
```

### Restart Instance
```bash
cd /Users/elmjunior/dev/n8n-instances/docker/instances/n8n-1755876406368-a8giylsaz
docker-compose restart
```

## Data Persistence
- **Workflows**: ./workflows/
- **Credentials**: ./credentials/
- **Database**: ./data/
- **Logs**: ./logs/

## Resource Limits
- **CPU**: 1.0 cores (limit), 0.5 cores (reservation)
- **Memory**: 1GB (limit), 512MB (reservation)
- **Redis**: 256MB memory limit

## Health Checks
- **N8N**: http://localhost:5600/healthz
- **Redis**: redis-cli ping

## Networks
- **Internal**: n8n_network_n8n-1755876406368-a8giylsaz
- **Traefik**: traefik_network (external)

## Volumes
- n8n_data_n8n-1755876406368-a8giylsaz: N8N data and database
- n8n_workflows_n8n-1755876406368-a8giylsaz: Workflow definitions
- n8n_credentials_n8n-1755876406368-a8giylsaz: Encrypted credentials
- n8n_redis_n8n-1755876406368-a8giylsaz: Redis data

## Security
- Basic authentication enabled
- Encryption key automatically generated
- Isolated Docker network
- Resource limits applied
