//index.js

const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./auth.route");


// ------------------ Normal Protected Routes ------------------
router.use("/auth", authRoutes);

// ------------------ API Info ------------------
router.get("/", (req, res) => {
  res.json({
    message: "Fleet Management API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
    },
  });
});

module.exports = router;
