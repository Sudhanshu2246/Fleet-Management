const express = require("express");
const router = express.Router();
const { 
  startTrip, 
  endTrip, 
  getDriverTripHistory, 
  getTripDetails 
} = require("../controllers/trip.controller");
const { protect } = require("../../middlewares/auth.middleware");

const { validateTripStart } = require("../../middlewares/validator.middleware");

router.use(protect);

router.post("/start", validateTripStart, startTrip);
router.post("/end", endTrip);
router.get("/history", getDriverTripHistory);
router.get("/:id", getTripDetails);

module.exports = router;
