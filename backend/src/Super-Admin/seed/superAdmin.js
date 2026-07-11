const bcrypt = require("bcryptjs");
require("dotenv").config();

const { connectDB, sequelize } = require("../../config/db");
const { SuperAdmin } = require("../../index/index.model");

const seedSuperAdmin = async () => {
  try {
    // 🔗 Connect to MySQL
    await connectDB();
    
    // Sync the model to ensure table structure is up to date (e.g. if you changed firstName/lastName to name)
    await SuperAdmin.sync({ alter: true });

    const existing = await SuperAdmin.findOne({ where: { role: "super_admin" } });

    if (existing) {
      console.log("⚠️ Super Admin already exists");
      process.exit();
    }

    // 🔐 Get from ENV
    const name = process.env.SUPER_ADMIN_NAME;
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("Super admin credentials missing in .env");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const superAdmin = await SuperAdmin.create({
      name,
      email,
      password: hashedPassword,
      role: "super_admin",
    });

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Super Admin Created");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit();
  } catch (error) {
    console.error("❌ Seeder Error:", error.message);
    process.exit(1);
  }
};

seedSuperAdmin();