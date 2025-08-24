import fs from "fs-extra";
import path from "path";
import crypto from "crypto";

export interface TemplateVariables {
  INSTANCE_ID: string;
  PORT: number;
  CLIENT_NAME: string;
  USERNAME: string;
  PASSWORD: string;
  ENCRYPTION_KEY: string;
  PASSWORD_HASH: string;
  CREATED_AT: string;
  SUBNET_ID: number;
}

export class TemplateService {
  private templatesDir: string;
  private instancesDir: string;

  constructor() {
    this.templatesDir = path.join(
      process.cwd(),
      "..",
      "..",
      "docker",
      "templates"
    );
    this.instancesDir = path.join(
      process.cwd(),
      "..",
      "..",
      "docker",
      "instances"
    );
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    await fs.ensureDir(this.templatesDir);
    await fs.ensureDir(this.instancesDir);
  }

  /**
   * Generate Docker Compose file from template
   */
  async generateDockerCompose(
    instanceId: string,
    port: number,
    clientName: string,
    username: string = "junior@primata.digital",
    password: string = "Passw*rd123"
  ): Promise<string> {
    const templatePath = path.join(
      this.templatesDir,
      "n8n-compose.template.yml"
    );

    if (!(await fs.pathExists(templatePath))) {
      throw new Error("Template file not found: n8n-compose.template.yml");
    }

    const template = await fs.readFile(templatePath, "utf-8");
    const variables = this.generateTemplateVariables(
      instanceId,
      port,
      clientName,
      username,
      password
    );

    return this.replaceTemplateVariables(template, variables);
  }

  /**
   * Create instance directory and save Docker Compose file
   */
  async createInstanceFiles(
    instanceId: string,
    port: number,
    clientName: string,
    username?: string,
    password?: string
  ): Promise<void> {
    const instanceDir = path.join(this.instancesDir, instanceId);

    // Create instance directory
    await fs.ensureDir(instanceDir);

    // Create subdirectories for data
    await fs.ensureDir(path.join(instanceDir, "data"));
    await fs.ensureDir(path.join(instanceDir, "workflows"));
    await fs.ensureDir(path.join(instanceDir, "credentials"));
    await fs.ensureDir(path.join(instanceDir, "logs"));

    // Generate Docker Compose content
    const dockerComposeContent = await this.generateDockerCompose(
      instanceId,
      port,
      clientName,
      username,
      password
    );

    // Save Docker Compose file
    await fs.writeFile(
      path.join(instanceDir, "docker-compose.yml"),
      dockerComposeContent
    );

    // Create .env file for additional configuration
    await this.createEnvFile(instanceDir, instanceId, port, clientName);

    // Create README file with instance information
    await this.createReadmeFile(
      instanceDir,
      instanceId,
      port,
      clientName,
      username
    );
  }

  /**
   * Generate template variables
   */
  private generateTemplateVariables(
    instanceId: string,
    port: number,
    clientName: string,
    username: string,
    password: string
  ): TemplateVariables {
    // Generate encryption key
    const encryptionKey = crypto.randomBytes(32).toString("hex");

    // Generate password hash for Traefik basic auth
    const passwordHash = this.generatePasswordHash(username, password);

    // Generate subnet ID based on instance ID hash
    const subnetId = this.generateSubnetId(instanceId);

    return {
      INSTANCE_ID: instanceId,
      PORT: port,
      CLIENT_NAME: clientName,
      USERNAME: username,
      PASSWORD: password,
      ENCRYPTION_KEY: encryptionKey,
      PASSWORD_HASH: passwordHash,
      CREATED_AT: new Date().toISOString(),
      SUBNET_ID: subnetId,
    };
  }

  /**
   * Replace template variables in content
   */
  private replaceTemplateVariables(
    content: string,
    variables: TemplateVariables
  ): string {
    let result = content;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, "g"), String(value));
    }

    return result;
  }

  /**
   * Generate password hash for Traefik basic auth
   */
  private generatePasswordHash(username: string, password: string): string {
    // Traefik uses htpasswd format: username:encrypted_password
    const combined = `${username}:${password}`;
    return Buffer.from(combined).toString("base64");
  }

  /**
   * Generate subnet ID based on instance ID
   */
  private generateSubnetId(instanceId: string): number {
    // Generate a number between 20-250 based on instance ID hash
    // Using a larger range to avoid conflicts with common Docker networks
    const hash = crypto.createHash("md5").update(instanceId).digest("hex");
    const number = parseInt(hash.substring(0, 8), 16);
    return (number % 230) + 20; // Range 20-249
  }

  /**
   * Create .env file for additional configuration
   */
  private async createEnvFile(
    instanceDir: string,
    instanceId: string,
    port: number,
    clientName: string
  ): Promise<void> {
    const envContent = `# N8N Instance Configuration
INSTANCE_ID=${instanceId}
PORT=${port}
CLIENT_NAME=${clientName}
CREATED_AT=${new Date().toISOString()}

# Docker Compose Configuration
COMPOSE_PROJECT_NAME=n8n-${instanceId}

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json

# Health Check Configuration
HEALTH_CHECK_INTERVAL=30s
HEALTH_CHECK_TIMEOUT=10s
HEALTH_CHECK_RETRIES=3
`;

    await fs.writeFile(path.join(instanceDir, ".env"), envContent);
  }

  /**
   * Create README file with instance information
   */
  private async createReadmeFile(
    instanceDir: string,
    instanceId: string,
    port: number,
    clientName: string,
    username?: string
  ): Promise<void> {
    const readmeContent = `# N8N Instance: ${clientName}

## Instance Information
- **Instance ID**: ${instanceId}
- **Client Name**: ${clientName}
- **Port**: ${port}
- **Created**: ${new Date().toISOString()}
- **Username**: ${username || "admin"}

## Access Information
- **Local Access**: http://localhost:${port}
- **Traefik Route**: http://${clientName}.n8n.local
- **Default Credentials**: ${username || "junior@primata.digital"} / Passw*rd123

## Management Commands

### Start Instance
\`\`\`bash
cd ${instanceDir}
docker-compose up -d
\`\`\`

### Stop Instance
\`\`\`bash
cd ${instanceDir}
docker-compose down
\`\`\`

### View Logs
\`\`\`bash
cd ${instanceDir}
docker-compose logs -f n8n
\`\`\`

### Restart Instance
\`\`\`bash
cd ${instanceDir}
docker-compose restart
\`\`\`

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
- **N8N**: http://localhost:${port}/healthz
- **Redis**: redis-cli ping

## Networks
- **Internal**: n8n_network_${instanceId}
- **Traefik**: traefik_network (external)

## Volumes
- n8n_data_${instanceId}: N8N data and database
- n8n_workflows_${instanceId}: Workflow definitions
- n8n_credentials_${instanceId}: Encrypted credentials
- n8n_redis_${instanceId}: Redis data

## Security
- Basic authentication enabled
- Encryption key automatically generated
- Isolated Docker network
- Resource limits applied
`;

    await fs.writeFile(path.join(instanceDir, "README.md"), readmeContent);
  }

  /**
   * Get template path
   */
  getTemplatePath(): string {
    return path.join(this.templatesDir, "n8n-compose.template.yml");
  }

  /**
   * Check if template exists
   */
  async templateExists(): Promise<boolean> {
    const templatePath = this.getTemplatePath();
    return await fs.pathExists(templatePath);
  }

  /**
   * Get instance directory path
   */
  getInstanceDir(instanceId: string): string {
    return path.join(this.instancesDir, instanceId);
  }

  /**
   * List all instance directories
   */
  async listInstanceDirs(): Promise<string[]> {
    const items = await fs.readdir(this.instancesDir);
    const instanceDirs: string[] = [];

    for (const item of items) {
      const itemPath = path.join(this.instancesDir, item);
      const stats = await fs.stat(itemPath);

      if (stats.isDirectory()) {
        instanceDirs.push(item);
      }
    }

    return instanceDirs;
  }

  /**
   * Remove instance directory and all files
   */
  async removeInstanceDir(instanceId: string): Promise<void> {
    const instanceDir = this.getInstanceDir(instanceId);

    if (await fs.pathExists(instanceDir)) {
      await fs.remove(instanceDir);
    }
  }
}
