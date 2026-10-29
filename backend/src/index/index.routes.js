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
const driverProfileRoutes = require("../drivers/routes/driver-profile.route");
const trackingRoutes = require("../tracking/routes/tracking.route");
const geofenceRoutes = require("../geofence/routes/geofence.route");
const analyticsRoutes = require("../analytics/routes/analytics.route");
const securityRoutes = require("../security/routes/auditLog.route");
const settingsRoutes = require("../organization/routes/settings.route");

// ------------------ Normal Protected Routes ------------------
router.use("/auth", authRoutes);
router.use("/organizations", organizationRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/drivers", driverRoutes);
router.use("/driver-profile", driverProfileRoutes);
router.use("/alerts", alertRoutes);
router.use("/trips", tripRoutes);
router.use("/tracking", trackingRoutes);
router.use("/geofences", geofenceRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/security", securityRoutes);
router.use("/settings", settingsRoutes);

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
