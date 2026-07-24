const express = require("express");
const router = express.Router();
const { 
  startTrip, 
  endTrip, 
  getDriverTripHistory, 
  getTripDetails,
  createAdminTrip,
  getAllTrips,
  updateTripStatus,
  deleteTrip,
  updateTripDetails
} = require("../controllers/trip.controller");
const { protect } = require("../../middlewares/auth.middleware");

const { validateTripStart } = require("../../middlewares/validator.middleware");

router.use(protect);

router.post("/start", validateTripStart, startTrip);
router.post("/end", endTrip);
router.get("/history", getDriverTripHistory);
router.post("/admin-create", createAdminTrip);
router.get("/all", getAllTrips);
router.get("/:id", getTripDetails);
router.put("/:id/status", updateTripStatus);
router.put("/:id/details", updateTripDetails);
router.delete("/:id", deleteTrip);

module.exports = router;
