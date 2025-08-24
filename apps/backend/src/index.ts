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
import { authMiddleware } from "./middleware/auth";

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

  // Authentication middleware
  app.use(authMiddleware);

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
        return {
          user: (req as any).user,
          isAuthenticated: (req as any).isAuthenticated || false,
        };
      },
    })
  );

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // Authentication endpoints
  app.post("/auth/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "junior@primata.digital" && password === "Passw*rd123") {
      res.json({
        success: true,
        token: "dummy-token",
        user: {
          id: "1",
          username: "junior@primata.digital",
          email: "junior@primata.digital",
        },
      });
    } else {
      res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }
  });

  app.post("/auth/logout", (req, res) => {
    res.json({ success: true });
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
