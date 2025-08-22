import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { json } from "body-parser";
import dotenv from "dotenv";
import { createServer } from "http";

import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { setupWebSocketServer } from "./websocket";

dotenv.config();

const PORT = process.env.PORT || 4019;
const WS_PORT = parseInt(process.env.WS_PORT || "4020");

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  // Security middleware
  app.use(helmet());
  app.use(cors());
  app.use(json());

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== "production",
  });

  await server.start();

  // Apply Apollo middleware
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Add authentication logic here
        return {
          user: undefined,
          isAuthenticated: false,
        };
      },
    })
  );

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // Monitoring dashboard endpoint
  app.get("/monitoring", (req, res) => {
    res.json({
      status: "Monitoring Active",
      websocket: `ws://localhost:${WS_PORT}/graphql`,
      timestamp: new Date().toISOString(),
    });
  });

  // Start HTTP server
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`📊 Health check at http://localhost:${PORT}/health`);
    console.log(
      `📈 Monitoring dashboard at http://localhost:${PORT}/monitoring`
    );
  });

  // Start WebSocket server for subscriptions
  const { subscriptionService, monitoringService } =
    setupWebSocketServer(WS_PORT);

  // Graceful shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully...");
    await monitoringService.cleanup();
    httpServer.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });

  process.on("SIGINT", async () => {
    console.log("SIGINT received, shutting down gracefully...");
    await monitoringService.cleanup();
    httpServer.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
