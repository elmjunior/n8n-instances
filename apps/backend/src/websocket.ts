import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { createServer } from "http";
import { SubscriptionService } from "./services/SubscriptionService";
import { MonitoringService } from "./services/MonitoringService";
import { N8NInstanceService } from "./services/N8NInstanceService";
import { buildSchema, print } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";

export function setupWebSocketServer(port: number = 4001) {
  const httpServer = createServer();
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  // Create services
  const monitoringService = new MonitoringService();
  const subscriptionService = new SubscriptionService(monitoringService);
  const n8nService = new N8NInstanceService();

  // Build GraphQL schema with resolvers
  const schema = makeExecutableSchema({
    typeDefs: print(typeDefs),
    resolvers,
  });

  // Setup GraphQL WebSocket server
  useServer(
    {
      schema,
      context: (ctx) => {
        // Add services to context
        return {
          ...ctx,
          n8nService,
          monitoringService,
          subscriptionService,
        };
      },
      onSubscribe: (ctx, msg) => {
        console.log("Client subscribed:", msg.payload);
      },
      onNext: (ctx, msg, args, result) => {
        console.log("Subscription result:", result);
      },
      onError: (ctx, msg, errors) => {
        console.error("Subscription error:", errors);
      },
      onComplete: (ctx, msg) => {
        console.log("Client unsubscribed");
      },
    },
    wsServer
  );

  // Start HTTP server
  httpServer.listen(port, () => {
    console.log(`WebSocket server running on ws://localhost:${port}/graphql`);
  });

  return { wsServer, httpServer, subscriptionService, monitoringService };
}
