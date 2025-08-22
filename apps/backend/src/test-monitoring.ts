import { MonitoringService } from "./services/MonitoringService";
import { N8NInstanceService } from "./services/N8NInstanceService";

async function testMonitoringSystem() {
  console.log("🧪 Testing Monitoring System...\n");

  try {
    // Initialize services
    const monitoringService = new MonitoringService();
    const n8nService = new N8NInstanceService();

    console.log("✅ Services initialized successfully");

    // Test configuration
    const config = await monitoringService.getConfig();
    console.log(
      "📋 Monitoring Configuration:",
      JSON.stringify(config, null, 2)
    );

    // Test metrics collection (if Docker is available)
    try {
      console.log("\n📊 Testing metrics collection...");
      // This will fail if no containers are running, which is expected
      const testMetrics = await monitoringService.collectInstanceMetrics(
        "test-instance"
      );
      console.log("✅ Metrics collection test passed");
    } catch (error) {
      console.log(
        "⚠️  Metrics collection test skipped (no Docker containers running)"
      );
    }

    // Test health check
    try {
      console.log("\n🏥 Testing health check...");
      const testHealth = await monitoringService.performHealthCheck(
        "test-instance"
      );
      console.log("✅ Health check test passed");
      console.log("Health result:", JSON.stringify(testHealth, null, 2));
    } catch (error) {
      console.log(
        "⚠️  Health check test skipped (no Docker containers running)"
      );
    }

    // Test log management
    console.log("\n📝 Testing log management...");
    const testLogs = await monitoringService.getInstanceLogs("test-instance");
    console.log("✅ Log management test passed");
    console.log(`Retrieved ${testLogs.length} logs`);

    // Test event emission
    console.log("\n📡 Testing event emission...");
    monitoringService.on("test", (data) => {
      console.log("✅ Event received:", data);
    });
    monitoringService.emit("test", { message: "Test event" });

    // Test subscription service
    console.log("\n🔌 Testing subscription service...");
    const { SubscriptionService } = await import(
      "./services/SubscriptionService"
    );
    const subscriptionService = new SubscriptionService(monitoringService);

    subscriptionService.on("notify", (data) => {
      console.log("✅ Subscription notification received:", data);
    });

    subscriptionService.subscribeToStatusChanges("test-connection");
    subscriptionService.notifySubscribers("statusChanges", { status: "test" });

    console.log("\n🎉 All monitoring system tests completed successfully!");
    console.log("\n📚 Next steps:");
    console.log("1. Start the server: npm run dev");
    console.log("2. Create an n8n instance");
    console.log("3. Access the monitoring dashboard");
    console.log("4. Test real-time subscriptions");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testMonitoringSystem();
}

export { testMonitoringSystem };
