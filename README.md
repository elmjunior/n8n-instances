# N8N Instances Monorepo

A monorepo built with Turborepo containing a full-stack N8N instance management system with React frontend and Node.js backend.

## Structure

```
n8n-instances/
├── apps/
│   ├── frontend/     # React 18 + TypeScript + TailwindCSS + Apollo Client
│   └── backend/      # Node.js + TypeScript + Apollo Server + GraphQL + Docker
├── packages/
│   └── shared/       # Shared TypeScript types
├── docker/
│   └── instances/    # N8N instance data and configurations
├── package.json      # Root workspace configuration
├── turbo.json        # Turborepo configuration
└── tsconfig.json     # Root TypeScript configuration
```

## Prerequisites

- Node.js 18+
- Yarn package manager

## Getting Started

1. **Install dependencies:**

   ```bash
   yarn install
   ```

2. **Build shared packages:**

   ```bash
   yarn build
   ```

3. **Start development servers:**
   ```bash
   yarn dev
   ```

This will start both applications simultaneously:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000/graphql

## Available Scripts

### Root Level

- `yarn dev` - Start all applications in development mode
- `yarn build` - Build all applications and packages
- `yarn lint` - Run linting across all packages
- `yarn test` - Run tests across all packages
- `yarn clean` - Clean all build artifacts
- `yarn type-check` - Run TypeScript type checking

### Individual Packages

Each package has its own scripts that can be run individually:

**Frontend:**

- `yarn workspace @n8n-instances/frontend dev`
- `yarn workspace @n8n-instances/frontend build`

**Backend:**

- `yarn workspace @n8n-instances/backend dev`
- `yarn workspace @n8n-instances/backend build`

**Shared:**

- `yarn workspace @n8n-instances/shared build`

## Features

### Frontend (React + Apollo Client)

- React 18 with TypeScript
- TailwindCSS for styling
- Apollo Client for GraphQL operations
- Vite for fast development and building
- Hot reload enabled

### Backend (Node.js + Apollo Server + Docker)

- Node.js with TypeScript
- Apollo Server for GraphQL
- Express.js framework
- Docker integration for N8N instance management
- Automatic port allocation (5600-5699)
- Instance isolation with Docker networks
- Container lifecycle management

### Shared Package

- Common TypeScript types and interfaces
- GraphQL context types
- API response types
- User and pagination types

## GraphQL Schema

The backend provides the following GraphQL operations for N8N instance management:

**Queries:**

- `instances` - List all N8N instances
- `instance(id: ID!)` - Get specific instance by ID
- `instanceLogs(id: ID!, lines: Int)` - Get instance logs

**Mutations:**

- `createInstance(input: CreateInstanceInput!)` - Create new N8N instance
- `startInstance(id: ID!)` - Start an instance
- `stopInstance(id: ID!)` - Stop an instance
- `pauseInstance(id: ID!)` - Pause an instance
- `restartInstance(id: ID!)` - Restart an instance
- `deleteInstance(id: ID!)` - Delete an instance

## Development

The monorepo is configured with Turborepo for efficient development:

- **Parallel execution** - Scripts run in parallel when possible
- **Caching** - Build outputs are cached for faster subsequent runs
- **Dependency management** - Automatic dependency resolution between packages
- **Hot reload** - Both frontend and backend support hot reloading

## Environment Variables

Create a `.env` file in the backend directory for environment-specific configuration:

```env
PORT=4000
NODE_ENV=development
```

## Technologies Used

- **Turborepo** - Monorepo build system
- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **Apollo Client** - GraphQL client
- **Apollo Server** - GraphQL server
- **Node.js** - Backend runtime
- **Express** - Web framework
- **Vite** - Frontend build tool
- **Docker** - Container management
- **Docker Compose** - Multi-container orchestration
