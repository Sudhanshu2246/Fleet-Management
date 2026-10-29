const express = require("express");
const router = express.Router();
const {
  getGeofences,
  getGeofenceById,
  createGeofence,
  updateGeofence,
  deleteGeofence,
  checkVehicleBreach,
  simulateBreach,
} = require("../controllers/geofence.controller");
const { protect } = require("../../middlewares/auth.middleware");

// All routes protected by JWT auth
router.use(protect);

router.get("/", getGeofences);
router.post("/", createGeofence);
router.get("/:id", getGeofenceById);
router.put("/:id", updateGeofence);
router.delete("/:id", deleteGeofence);

router.post("/check-breach", checkVehicleBreach);
router.post("/simulate-breach", simulateBreach);

module.exports = router;
