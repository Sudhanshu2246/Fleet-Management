//index.js

const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("../auth/routes/auth.route");
const vehicleRoutes = require("../vehical/routes/vehicle.route");
const driverRoutes = require("../drivers/routes/driver.route");
const alertRoutes = require("../alert/routes/alert.route");
const tripRoutes = require("../trip/routes/trip.routes");
const organizationRoutes = require("../organization/routes/organization.route");

// ------------------ Normal Protected Routes ------------------
router.use("/auth", authRoutes);
router.use("/organizations", organizationRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/drivers", driverRoutes);
router.use("/alerts", alertRoutes);
router.use("/trips", tripRoutes);

// ------------------ API Info ------------------
router.get("/", (req, res) => {
  res.json({
    message: "Fleet Management API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/v1/auth",
      vehicles: "/api/v1/vehicles",
      drivers: "/api/v1/drivers",
      alerts: "/api/v1/alerts",
    },
  });
});

module.exports = router;
