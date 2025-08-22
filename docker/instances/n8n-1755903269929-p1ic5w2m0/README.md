# N8N Instance: ContrutoraPro

## Instance Information
- **Instance ID**: n8n-1755903269929-p1ic5w2m0
- **Client Name**: ContrutoraPro
- **Port**: 5601
- **Created**: 2025-08-22T22:54:29.955Z
- **Username**: admin

## Access Information
- **Local Access**: http://localhost:5601
- **Traefik Route**: http://ContrutoraPro.n8n.local
- **Default Credentials**: admin / admin123

## Management Commands

### Start Instance
```bash
cd /home/junior/dev/n8n-instances/docker/instances/n8n-1755903269929-p1ic5w2m0
docker-compose up -d
```

### Stop Instance
```bash
cd /home/junior/dev/n8n-instances/docker/instances/n8n-1755903269929-p1ic5w2m0
docker-compose down
```

### View Logs
```bash
cd /home/junior/dev/n8n-instances/docker/instances/n8n-1755903269929-p1ic5w2m0
docker-compose logs -f n8n
```

### Restart Instance
```bash
cd /home/junior/dev/n8n-instances/docker/instances/n8n-1755903269929-p1ic5w2m0
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
- **N8N**: http://localhost:5601/healthz
- **Redis**: redis-cli ping

## Networks
- **Internal**: n8n_network_n8n-1755903269929-p1ic5w2m0
- **Traefik**: traefik_network (external)

## Volumes
- n8n_data_n8n-1755903269929-p1ic5w2m0: N8N data and database
- n8n_workflows_n8n-1755903269929-p1ic5w2m0: Workflow definitions
- n8n_credentials_n8n-1755903269929-p1ic5w2m0: Encrypted credentials
- n8n_redis_n8n-1755903269929-p1ic5w2m0: Redis data

## Security
- Basic authentication enabled
- Encryption key automatically generated
- Isolated Docker network
- Resource limits applied
