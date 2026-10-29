const trackingService = require("../services/tracking.service");

// Helper to safely extract organizationId from authenticated user token
const getOrgId = (req) => {
  return req.user.organizationId || req.user.organization;
};

// ─── 1. Ingest Telemetry Ping (Driver App or GPS Hardware Tracker) ───
// @route POST /api/v1/tracking/ping
// @access Private (Driver / Authenticated Device)
exports.recordTelemetryPing = async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const {
      latitude,
      longitude,
      speed = 0,
      heading = 0,
      battery = 100,
      address,
      vehicleId,
      tripId,
    } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude are mandatory for telematics tracking.",
      });
    }

    const driverId = req.user.role === "driver" ? req.user.id : req.body.driverId || null;

    // Ingest into Redis and DB with Stoppage Analytics
    const result = await trackingService.recordTelemetry({
      organizationId: orgId,
      vehicleId: vehicleId || null,
      driverId: driverId || null,
      tripId: tripId || null,
      latitude,
      longitude,
      speed,
      heading,
      battery,
      address,
    });

    // Real-time broadcast via Socket.io
    try {
      const { getIO } = require("../../socket");
      const io = getIO();
      if (io) {
        // Broadcast continuous driver telemetry stream
        io.emit("driver:telemetry:stream", {
          driverId,
          vehicleId,
          organizationId: orgId,
          tripId,
          latitude: result.coordinates.latitude,
          longitude: result.coordinates.longitude,
          speed: result.speed,
          heading: result.heading,
          battery: parseFloat(battery) || 100,
          status: result.status,
          stoppage: result.stoppage,
          address: address || null,
          timestamp: result.timestamp,
        });

        // Broadcast legacy event for backward compatibility with existing map listeners
        io.emit("driver:location:changed", {
          driverId,
          vehicleId,
          organizationId: orgId,
          latitude: result.coordinates.latitude,
          longitude: result.coordinates.longitude,
          speed: result.speed,
          heading: result.heading,
          battery: parseFloat(battery) || 100,
          status: result.status,
          address: address || null,
          timestamp: result.timestamp,
        });

        // Broadcast to specific trip room
        if (tripId) {
          io.to(`trip_${tripId}`).emit("location:changed", {
            tripId,
            latitude: result.coordinates.latitude,
            longitude: result.coordinates.longitude,
            speed: result.speed,
            heading: result.heading,
            isStopped: result.stoppage?.isStopped || false,
          });
        }
      }
    } catch (sockErr) {
      // Socket emission is non-fatal
    }

    res.status(200).json({
      success: true,
      message: "Telemetry recorded successfully",
      data: result,
    });
  } catch (error) {
    console.error("Telemetry Ingestion Error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to record telemetry",
    });
  }
};

// ─── 2. Get Logged-In Drivers with Full Continuous Telemetry & Stoppage ───
// @route GET /api/v1/tracking/drivers/logged-in
// @access Private
exports.getLoggedInDrivers = async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const data = await trackingService.getLoggedInDriversWithTelemetry(orgId);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Get Logged In Drivers Telemetry Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch logged-in drivers telemetry",
    });
  }
};

// ─── 3. Dedicated Single Driver Continuous Tracking ───
// @route GET /api/v1/tracking/drivers/:driverId/live
// @access Private
exports.getSingleDriverLive = async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { driverId } = req.params;

    const data = await trackingService.getSingleDriverLiveTelemetry(orgId, driverId);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Driver not found in organization",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get Single Driver Live Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch driver live telemetry",
    });
  }
};

// ─── 4. Dedicated Trip Stoppages (Completed & Currently Active >60s) ───
// @route GET /api/v1/tracking/trips/:tripId/stops
// @access Private
exports.getTripStoppages = async (req, res) => {
  try {
    const { tripId } = req.params;
    const data = await trackingService.getTripStoppages(tripId);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Get Trip Stoppages Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch trip stoppage records",
    });
  }
};

// ─── 5. Dedicated Active Stoppage for a Specific Trip ───
// @route GET /api/v1/tracking/trips/:tripId/stoppage/active
// @access Private
exports.getActiveTripStoppage = async (req, res) => {
  try {
    const { tripId } = req.params;
    const data = await trackingService.getActiveTripStoppage(tripId);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Get Active Trip Stoppage Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch active trip stoppage",
    });
  }
};

// ─── 6. Dedicated Fleet-Wide Active Stoppages (>60s) ───
// @route GET /api/v1/tracking/stops/active
// @access Private (Dispatcher / Admin)
exports.getFleetActiveStops = async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const data = await trackingService.getOrganizationActiveStops(orgId);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Get Fleet Active Stops Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch active stops",
    });
  }
};

// ─── 7. Dedicated Live Trip Status & Telemetry Summary ───
// @route GET /api/v1/tracking/trips/:tripId/live-status
// @access Private
exports.getTripLiveStatus = async (req, res) => {
  try {
    const { tripId } = req.params;
    const data = await trackingService.getTripLiveStatus(tripId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get Trip Live Status Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch trip live status",
    });
  }
};

// ─── 8. Live Fleet Snapshot (All Vehicles in Org) ───
// @route GET /api/v1/tracking/live
// @access Private
exports.getLiveFleet = async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const data = await trackingService.getOrganizationLiveFleet(orgId);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Get Live Fleet Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch live fleet telemetry",
    });
  }
};

// ─── 9. Real-time Telemetry for Specific Vehicle ───
// @route GET /api/v1/tracking/vehicle/:id
// @access Private
exports.getVehicleTracking = async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { id } = req.params;

    const data = await trackingService.getVehicleTelemetry(orgId, id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found in organization",
      });
    }

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Get Vehicle Tracking Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch vehicle telemetry",
    });
  }
};

// ─── 10. Redis Geospatial Proximity Search ───
// @route GET /api/v1/tracking/nearby?lat=...&lng=...&radius=10&type=vehicles
// @access Private
exports.getNearbyUnits = async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { lat, lng, radius = 10, type = "vehicles", limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude (lat) and Longitude (lng) query parameters are required.",
      });
    }

    const data = await trackingService.findNearbyUnits(orgId, {
      latitude: lat,
      longitude: lng,
      radiusKm: radius,
      unitType: type,
      limit,
    });

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Geospatial Proximity Search Error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Geospatial search failed",
    });
  }
};

// ─── 11. Live Trip Breadcrumb Trail ───
// @route GET /api/v1/tracking/trip/:tripId/trail
// @access Private
exports.getTripTrail = async (req, res) => {
  try {
    const { tripId } = req.params;
    const data = await trackingService.getTripLiveTrail(tripId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Get Trip Trail Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch trip breadcrumbs",
    });
  }
};

// ─── 12. Tracking System Stats & Redis Health ───
// @route GET /api/v1/tracking/stats
// @access Private
exports.getTrackingStats = async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const stats = await trackingService.getTrackingStats(orgId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get Tracking Stats Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tracking system statistics",
    });
  }
};

// ─── 13. Record & Store Trip History Audit ───
// @route POST /api/v1/tracking/trip-history/record
// @access Private
exports.recordTripHistory = async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const tripData = {
      ...req.body,
      organizationId: orgId,
    };

    if (!tripData.tripId) {
      return res.status(400).json({
        success: false,
        message: "tripId is required to record trip history.",
      });
    }

    const savedHistory = await trackingService.recordTripHistory(tripData);

    res.status(201).json({
      success: true,
      message: "Trip history recorded and archived successfully",
      data: savedHistory,
    });
  } catch (error) {
    console.error("Record Trip History Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to record trip history",
    });
  }
};

// ─── 14. Query All Trip Histories (Filtered & Paginated) ───
// @route GET /api/v1/tracking/trip-history
// @access Private
exports.getTripHistoryList = async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const result = await trackingService.getTripHistoryList(orgId, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get Trip History List Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch trip history list",
    });
  }
};

// ─── 15. Query Trip History for a Specific Driver ───
// @route GET /api/v1/tracking/trip-history/driver/:driverId
// @access Private
exports.getTripHistoryByDriver = async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { driverId } = req.params;

    const result = await trackingService.getTripHistoryByDriver(orgId, driverId, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get Driver Trip History Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch driver trip history",
    });
  }
};

// ─── 16. Query Trip History for a Specific Vehicle ───
// @route GET /api/v1/tracking/trip-history/vehicle/:vehicleId
// @access Private
exports.getTripHistoryByVehicle = async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { vehicleId } = req.params;

    const result = await trackingService.getTripHistoryByVehicle(orgId, vehicleId, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get Vehicle Trip History Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch vehicle trip history",
    });
  }
};

// ─── 17. Query Single Granular Trip History Audit ───
// @route GET /api/v1/tracking/trip-history/:tripId
// @access Private
exports.getTripHistoryById = async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { tripId } = req.params;

    const history = await trackingService.getTripHistoryById(orgId, tripId);
    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Trip history record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get Trip History Details Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch trip history details",
    });
  }
};

