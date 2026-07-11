const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false, // set to console.log to see raw SQL queries
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Connected Successfully via Sequelize");
    console.log(`📦 Database: ${process.env.DB_NAME}`);
  } catch (error) {
    console.error("❌ MySQL Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  sequelize, // Export the instance so models can use it
};
