const express = require("express");
const router = express.Router();
const {
  recordTelemetryPing,
  getLoggedInDrivers,
  getSingleDriverLive,
  getTripStoppages,
  getActiveTripStoppage,
  getFleetActiveStops,
  getTripLiveStatus,
  getLiveFleet,
  getVehicleTracking,
  getNearbyUnits,
  getTripTrail,
  getTrackingStats,
  recordTripHistory,
  getTripHistoryList,
  getTripHistoryByDriver,
  getTripHistoryByVehicle,
  getTripHistoryById,
} = require("../controllers/tracking.controller");
const { protect } = require("../../middlewares/auth.middleware");

// Enforce authentication on all tracking routes for organizational tenancy isolation
router.use(protect);

// ─── Telemetry Ingestion ───
// Ingest telematics ping (Driver Mobile App or GPS hardware)
router.post("/ping", recordTelemetryPing);

// ─── Dedicated Logged-In Drivers Tracking ───
// Fetch all logged-in drivers with continuous live GPS, speed, vehicle, active trip, and live stoppage timer
router.get("/drivers/logged-in", getLoggedInDrivers);

// Continuous live tracking for a specific single driver
router.get("/drivers/:driverId/live", getSingleDriverLive);

// ─── Dedicated Stoppage Analytics APIs ───
// All stoppage records for a trip (completed stops + currently ongoing stop with live counter)
router.get("/trips/:tripId/stops", getTripStoppages);

// Dedicated check if a specific trip is currently stopped (>60 seconds)
router.get("/trips/:tripId/stoppage/active", getActiveTripStoppage);

// Fleet-wide active stops across all drivers in the organization
router.get("/stops/active", getFleetActiveStops);

// Live trip route progress, current speed, elapsed time, and stops summary
router.get("/trips/:tripId/live-status", getTripLiveStatus);

// High-resolution live GPS breadcrumbs trail for active trip
router.get("/trip/:tripId/trail", getTripTrail);

// ─── Dedicated Trip History APIs (Immutable Audit Logs) ───
// Explicitly store / archive any trip history with vehicleId, driverId, stops, high/low speed, duration
router.post("/trip-history/record", recordTripHistory);

// Query all trip histories with flexible filtering (driverId, vehicleId, date range, search, pagination)
router.get("/trip-history", getTripHistoryList);

// Query trip history specifically for a given driver
router.get("/trip-history/driver/:driverId", getTripHistoryByDriver);

// Query trip history specifically for a given vehicle
router.get("/trip-history/vehicle/:vehicleId", getTripHistoryByVehicle);

// Query detailed single trip history audit by tripId or historyId
router.get("/trip-history/:tripId", getTripHistoryById);

// ─── Live Fleet & Geospatial Search ───
// Live fleet snapshot (sub-millisecond Redis response)
router.get("/live", getLiveFleet);

// Redis Geospatial proximity search (Find nearest vehicles/drivers within radius X km)
router.get("/nearby", getNearbyUnits);

// Tracking system health and Redis telematics metrics
router.get("/stats", getTrackingStats);

// Single unit real-time telemetry
router.get("/vehicle/:id", getVehicleTracking);
router.get("/driver/:id", getSingleDriverLive);

module.exports = router;
