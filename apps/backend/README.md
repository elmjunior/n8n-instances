# N8N Instances Backend

Backend service for managing N8N instances using Docker containers with GraphQL API.

## Features

- **N8N Instance Management**: Create, start, stop, pause, restart, and delete N8N instances
- **Docker Integration**: Uses Docker API to manage containers
- **Port Management**: Automatic port allocation (5600-5699)
- **Instance Isolation**: Each instance runs in its own Docker network
- **Log Management**: Retrieve container logs
- **GraphQL API**: Full GraphQL interface for all operations

## Prerequisites

- Docker installed and running
- Docker Compose installed
- Node.js 18+
- Yarn package manager

## Installation

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Build the project:

   ```bash
   yarn build
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

## GraphQL Schema

### Types

```graphql
type N8NInstance {
  id: ID!
  clientName: String!
  status: InstanceStatus!
  port: Int!
  subdomain: String!
  createdAt: String!
  metrics: InstanceMetrics
}

enum InstanceStatus {
  CREATED
  STARTING
  RUNNING
  PAUSED
  STOPPED
  ERROR
  DELETING
}
```

### Queries

- `instances`: List all N8N instances
- `instance(id: ID!)`: Get specific instance by ID
- `instanceLogs(id: ID!, lines: Int)`: Get instance logs

### Mutations

- `createInstance(input: CreateInstanceInput!)`: Create new N8N instance
- `startInstance(id: ID!)`: Start an instance
- `stopInstance(id: ID!)`: Stop an instance
- `pauseInstance(id: ID!)`: Pause an instance
- `restartInstance(id: ID!)`: Restart an instance
- `deleteInstance(id: ID!)`: Delete an instance

## Docker Integration

### Instance Structure

Each N8N instance is stored in `./docker/instances/[instance-id]/` with:

```
docker/instances/
├── [instance-id]/
│   ├── docker-compose.yml    # Docker Compose configuration
│   └── metadata.json         # Instance metadata
```

### Docker Compose Template

Each instance gets a custom `docker-compose.yml` with:

- Unique container name: `n8n-{instance-id}`
- Port mapping: `{port}:5678`
- Persistent volume: `n8n_data_{instance-id}`
- Isolated network: `n8n_network_{instance-id}`
- Environment variables for N8N configuration

### Port Management

- Ports are automatically allocated from range 5600-5699
- System checks for port availability before assignment
- Port conflicts are avoided by checking both existing instances and running containers

## API Usage Examples

### Create Instance

```graphql
mutation CreateInstance {
  createInstance(input: { clientName: "My Company", subdomain: "mycompany" }) {
    id
    clientName
    status
    port
    subdomain
    createdAt
  }
}
```

### List Instances

```graphql
query GetInstances {
  instances {
    id
    clientName
    status
    port
    subdomain
    createdAt
  }
}
```

### Start Instance

```graphql
mutation StartInstance {
  startInstance(id: "n8n-1234567890") {
    id
    status
  }
}
```

### Get Instance Logs

```graphql
query GetLogs {
  instanceLogs(id: "n8n-1234567890", lines: 50) {
    timestamp
    level
    message
  }
}
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=4000
NODE_ENV=development
```

## Docker Requirements

### Docker Permissions

Ensure the application has access to Docker:

```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER

# Or run with sudo (not recommended for production)
sudo yarn dev
```

### Docker Compose

The service uses `docker-compose` commands to manage containers. Ensure it's installed:

```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Security Considerations

- Each instance runs in its own Docker network for isolation
- Basic authentication is enabled for N8N instances (admin/admin123)
- Consider implementing proper authentication for the GraphQL API
- Review and customize N8N environment variables as needed

## Troubleshooting

### Common Issues

1. **Docker permission denied**: Add user to docker group or run with sudo
2. **Port already in use**: Check for existing containers using the port range
3. **Container fails to start**: Check Docker logs and N8N configuration
4. **GraphQL connection errors**: Ensure backend is running on correct port

### Debug Commands

```bash
# Check Docker containers
docker ps -a

# Check Docker networks
docker network ls

# Check Docker volumes
docker volume ls

# View container logs
docker logs n8n-{instance-id}

# Check instance directory
ls -la docker/instances/
```

## Development

### Project Structure

```
src/
├── index.ts              # Main server file
├── schema.ts             # GraphQL schema
├── resolvers.ts          # GraphQL resolvers
├── types.ts              # TypeScript types
└── services/
    └── N8NInstanceService.ts  # Core business logic
```

### Adding New Features

1. Update GraphQL schema in `schema.ts`
2. Add TypeScript types in `types.ts`
3. Implement business logic in `N8NInstanceService.ts`
4. Add resolvers in `resolvers.ts`
5. Test with GraphQL Playground at `http://localhost:4000/graphql`
