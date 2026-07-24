require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5001;
const ENV = process.env.NODE_ENV || "development";

const startServer = async () => {
  try {
    console.clear();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚀 Fleet Management Backend Starting...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Connect DB
    await connectDB();

    const { sequelize } = require("./config/db");
    require("./index/index.model");
    await sequelize.sync({ alter: true });

    console.log("✅Database Models Synced");

    // Create HTTP server
    const http = require("http");
    const server = http.createServer(app);

    // Initialize Socket.io
    const { initSocket } = require("./socket");
    initSocket(server);

    // Start server
    server.listen(PORT, () => {
      console.clear();
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`🌐 Server Status   : RUNNING`);
      console.log(`📍 Port           : ${PORT}`);
      console.log(`🛠 Environment    : ${ENV}`);
      console.log(`🔗 URL            : http://localhost:${PORT}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ System Ready to Accept Requests");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();