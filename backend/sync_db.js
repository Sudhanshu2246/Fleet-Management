require("dotenv").config();
const { sequelize } = require("./src/config/db");
const { User, Driver, Organization, Vehicle, Alert, Trip } = require("./src/index/index.model");

const syncDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database Connected");
    
    // Warning: force: true will drop all tables
    await sequelize.sync({ force: true });
    console.log("✅ All tables synced successfully");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Sync Error:", error);
    process.exit(1);
  }
};

syncDb();
