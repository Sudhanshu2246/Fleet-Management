const Geofence = require("../models/geofence.model");
const Alert = require("../../alert/models/alert.model");
const { syncAlertToFirestore, sendPushNotification } = require("../../config/firebase");

// ── Default Seed Geofences ──────────────────────────────────────────────────
const DEFAULT_SEED_GEOFENCES = [
  {
    geofenceId: "GEO-101",
    name: "Okhla Central Logistics Depot",
    code: "OKH-HUB-01",
    description: "Primary regional warehousing, freight staging, and automated loading terminal",
    category: "depot",
    type: "circle",
    centerLat: 28.5355,
    centerLng: 77.2732,
    radius: 750,
    coordinates: null,
    color: "#10B981", // Emerald green (Depot)
    status: "active",
    alertOnEntry: true,
    alertOnExit: true,
    speedLimit: 25,
    dwellLimitMinutes: 120,
    assignedVehicles: ["*"],
    insideVehicles: ["VH-4821", "VH-7740"],
    organizationId: "ORG-101",
  },
  {
    geofenceId: "GEO-102",
    name: "Connaught Place Strict Urban Zone",
    code: "CP-REST-02",
    description: "High-congestion inner circle commercial zone with restricted commercial vehicle access (10 AM - 8 PM)",
    category: "restricted",
    type: "polygon",
    centerLat: 28.6304,
    centerLng: 77.2177,
    radius: null,
    coordinates: [
      [28.6345, 77.2140],
      [28.6340, 77.2230],
      [28.6275, 77.2225],
      [28.6270, 77.2135],
    ],
    color: "#F43F5E", // Rose red (Restricted)
    status: "active",
    alertOnEntry: true,
    alertOnExit: false,
    speedLimit: 30,
    dwellLimitMinutes: 15,
    assignedVehicles: ["*"],
    insideVehicles: ["VH-3310"],
    organizationId: "ORG-101",
  },
  {
    geofenceId: "GEO-103",
    name: "Noida Sector 62 Tech Delivery Cluster",
    code: "NOI-HUB-03",
    description: "High-density enterprise client deliveries, courier drop points, and quick transit lanes",
    category: "client_site",
    type: "circle",
    centerLat: 28.6280,
    centerLng: 77.3670,
    radius: 900,
    coordinates: null,
    color: "#D4AF37", // Gold (Client site)
    status: "active",
    alertOnEntry: true,
    alertOnExit: true,
    speedLimit: 40,
    dwellLimitMinutes: 45,
    assignedVehicles: ["VH-1092", "VH-2104"],
    insideVehicles: ["VH-1092"],
    organizationId: "ORG-101",
  },
  {
    geofenceId: "GEO-104",
    name: "NH-44 Express Freight Corridor",
    code: "NH44-COR-04",
    description: "Designated high-speed heavy truck transit corridor connecting Delhi to Agra logistics bypass",
    category: "corridor",
    type: "polygon",
    centerLat: 28.4800,
    centerLng: 77.3100,
    radius: null,
    coordinates: [
      [28.5100, 77.2950],
      [28.5150, 77.3080],
      [28.4450, 77.3350],
      [28.4400, 77.3200],
    ],
    color: "#3B82F6", // Blue (Corridor)
    status: "active",
    alertOnEntry: false,
    alertOnExit: true,
    speedLimit: 80,
    dwellLimitMinutes: 90,
    assignedVehicles: ["*"],
    insideVehicles: [],
    organizationId: "ORG-101",
  },
];

// ── Geometry Helpers ─────────────────────────────────────────────────────────

// Haversine formula to compute distance in meters between two lat/lng coordinates
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Ray-casting algorithm to test if point is inside a polygon
function isPointInPolygon(lat, lng, polygonCoords) {
  if (!polygonCoords || polygonCoords.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
    const xi = polygonCoords[i][0] || polygonCoords[i].lat;
    const yi = polygonCoords[i][1] || polygonCoords[i].lng;
    const xj = polygonCoords[j][0] || polygonCoords[j].lat;
    const yj = polygonCoords[j][1] || polygonCoords[j].lng;

    const intersect =
      yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// ── Controller Methods ───────────────────────────────────────────────────────

/**
 * @desc Get all geofences for current organization
 * @route GET /api/v1/geofences
 * @access Private
 */
exports.getGeofences = async (req, res) => {
  try {
    const orgId = req.user?.organization || req.user?.organizationId || "ORG-101";

    let geofences = await Geofence.findAll({
      where: { organizationId: orgId },
      order: [["createdAt", "DESC"]],
    });

    // Auto-seed initial realistic geofences if empty
    if (!geofences || geofences.length === 0) {
      console.log(`ℹ️ [Geofence] Seeding initial default geofences for organization ${orgId}...`);
      const seeded = [];
      for (const item of DEFAULT_SEED_GEOFENCES) {
        const created = await Geofence.create({
          ...item,
          organizationId: orgId,
        });
        seeded.push(created);
      }
      geofences = seeded;
    }

    res.status(200).json({
      success: true,
      count: geofences.length,
      data: geofences,
    });
  } catch (error) {
    console.error("❌ [Geofence] getGeofences error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch geofences" });
  }
};

/**
 * @desc Get geofence by ID
 * @route GET /api/v1/geofences/:id
 * @access Private
 */
exports.getGeofenceById = async (req, res) => {
  try {
    const orgId = req.user?.organization || req.user?.organizationId || "ORG-101";
    const geofence = await Geofence.findOne({
      where: {
        id: req.params.id,
        organizationId: orgId,
      },
    });

    if (!geofence) {
      return res.status(404).json({ success: false, message: "Geofence not found" });
    }

    res.status(200).json({
      success: true,
      data: geofence,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Create a new geofence
 * @route POST /api/v1/geofences
 * @access Private
 */
exports.createGeofence = async (req, res) => {
  try {
    const orgId = req.user?.organization || req.user?.organizationId || "ORG-101";
    const {
      name,
      code,
      description,
      category = "depot",
      type = "circle",
      centerLat,
      centerLng,
      radius = 500,
      coordinates = null,
      color = "#10B981",
      status = "active",
      alertOnEntry = true,
      alertOnExit = true,
      speedLimit = 40,
      dwellLimitMinutes = 60,
      assignedVehicles = ["*"],
    } = req.body;

    if (!name || centerLat === undefined || centerLng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid geofence name and center coordinates (lat, lng)",
      });
    }

    const geofenceId = `GEO-${Date.now().toString().slice(-5)}`;

    const newGeofence = await Geofence.create({
      geofenceId,
      name,
      code: code || `ZONE-${geofenceId.slice(-3)}`,
      description,
      category,
      type,
      centerLat: parseFloat(centerLat),
      centerLng: parseFloat(centerLng),
      radius: type === "circle" ? parseFloat(radius) : null,
      coordinates: type === "polygon" ? coordinates : null,
      color,
      status,
      alertOnEntry: alertOnEntry !== false,
      alertOnExit: alertOnExit !== false,
      speedLimit: speedLimit ? parseInt(speedLimit, 10) : 40,
      dwellLimitMinutes: dwellLimitMinutes ? parseInt(dwellLimitMinutes, 10) : 60,
      assignedVehicles: Array.isArray(assignedVehicles) ? assignedVehicles : ["*"],
      insideVehicles: [],
      organizationId: orgId,
    });

    res.status(201).json({
      success: true,
      message: "Geofence created successfully",
      data: newGeofence,
    });
  } catch (error) {
    console.error("❌ [Geofence] createGeofence error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update geofence
 * @route PUT /api/v1/geofences/:id
 * @access Private
 */
exports.updateGeofence = async (req, res) => {
  try {
    const orgId = req.user?.organization || req.user?.organizationId || "ORG-101";

    const geofence = await Geofence.findOne({
      where: {
        id: req.params.id,
        organizationId: orgId,
      },
    });

    if (!geofence) {
      return res.status(404).json({ success: false, message: "Geofence not found" });
    }

    await geofence.update(req.body);

    res.status(200).json({
      success: true,
      message: "Geofence updated successfully",
      data: geofence,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete geofence
 * @route DELETE /api/v1/geofences/:id
 * @access Private
 */
exports.deleteGeofence = async (req, res) => {
  try {
    const orgId = req.user?.organization || req.user?.organizationId || "ORG-101";

    const geofence = await Geofence.findOne({
      where: {
        id: req.params.id,
        organizationId: orgId,
      },
    });

    if (!geofence) {
      return res.status(404).json({ success: false, message: "Geofence not found" });
    }

    await geofence.destroy();

    res.status(200).json({
      success: true,
      message: "Geofence deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Check vehicle position against all active geofences & trigger alerts
 * @route POST /api/v1/geofences/check-breach
 * @access Private
 */
exports.checkVehicleBreach = async (req, res) => {
  try {
    const orgId = req.user?.organization || req.user?.organizationId || "ORG-101";
    const { vehicleId, lat, lng, speed = 0, driverName = "Fleet Driver" } = req.body;

    if (!vehicleId || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: "Missing required telematics parameters" });
    }

    const activeGeofences = await Geofence.findAll({
      where: {
        organizationId: orgId,
        status: ["active", "monitoring"],
      },
    });

    const breachesDetected = [];

    for (const zone of activeGeofences) {
      let isInside = false;

      if (zone.type === "circle") {
        const dist = getHaversineDistance(lat, lng, zone.centerLat, zone.centerLng);
        isInside = dist <= (zone.radius || 500);
      } else if (zone.type === "polygon" && Array.isArray(zone.coordinates)) {
        isInside = isPointInPolygon(lat, lng, zone.coordinates);
      }

      // Check Restricted Zone Breach (Entry into restricted zone)
      if (zone.category === "restricted" && isInside && zone.alertOnEntry) {
        const alertMsg = `Restricted Zone Breach: Vehicle ${vehicleId} entered '${zone.name}' (${zone.code})`;
        breachesDetected.push({
          geofenceId: zone.geofenceId,
          zoneName: zone.name,
          type: "restricted_entry",
          severity: "high",
          message: alertMsg,
        });

        // Create alert in DB and sync to Firebase
        const alertRecord = await Alert.create({
          vehicleId,
          type: "geofence_breach",
          severity: "high",
          message: alertMsg,
          status: "active",
          organizationId: orgId,
        });

        const alertPayload = {
          id: `ALT-GEO-${Date.now().toString().slice(-5)}`,
          title: `📍 Geofence Breach: ${zone.name}`,
          message: alertMsg,
          type: "geofence",
          priority: "High",
          severity: "high",
          vehicleId,
          driverName,
          locationLat: lat,
          locationLng: lng,
          locationAddress: zone.description || `${zone.name} Perimeter`,
          status: "Active",
          organizationId: orgId,
          createdAtIso: new Date().toISOString(),
        };

        syncAlertToFirestore(alertPayload).catch(() => {});
        sendPushNotification({
          title: `🚨 ${alertPayload.title}`,
          body: alertMsg,
          data: alertPayload,
        }).catch(() => {});
      }

      // Check Speed Limit in Zone
      if (isInside && zone.speedLimit && speed > zone.speedLimit) {
        const speedMsg = `Zone Speed Violation: Vehicle ${vehicleId} recorded ${speed} km/h inside '${zone.name}' (limit: ${zone.speedLimit} km/h)`;
        breachesDetected.push({
          geofenceId: zone.geofenceId,
          zoneName: zone.name,
          type: "speed_violation",
          severity: "medium",
          message: speedMsg,
        });
      }
    }

    res.status(200).json({
      success: true,
      vehicleId,
      evaluatedZones: activeGeofences.length,
      breachesDetected,
    });
  } catch (error) {
    console.error("❌ [Geofence] checkVehicleBreach error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Interactive simulation endpoint: trigger a simulated vehicle breach
 * @route POST /api/v1/geofences/simulate-breach
 * @access Private
 */
exports.simulateBreach = async (req, res) => {
  try {
    const orgId = req.user?.organization || req.user?.organizationId || "ORG-101";
    const {
      geofenceId,
      vehicleId = "VH-4821",
      driverName = "Vikram Malhotra",
      breachType = "entry", // 'entry', 'exit', or 'speed'
    } = req.body;

    const zone = await Geofence.findOne({
      where: {
        id: geofenceId,
        organizationId: orgId,
      },
    });

    if (!zone) {
      return res.status(404).json({ success: false, message: "Geofence not found" });
    }

    const title = breachType === "exit"
      ? `📍 Corridor Exit: ${zone.name}`
      : `🚨 Geofence Breach: ${zone.name}`;

    const message = breachType === "exit"
      ? `Vehicle ${vehicleId} exited designated boundary corridor '${zone.name}' (${zone.code})`
      : `Vehicle ${vehicleId} triggered unauthorized entry into '${zone.name}' (${zone.code})`;

    const alertPayload = {
      id: `ALT-GEO-${Date.now().toString().slice(-5)}`,
      title,
      message,
      type: "geofence",
      priority: zone.category === "restricted" ? "Critical" : "High",
      severity: zone.category === "restricted" ? "critical" : "high",
      vehicleId,
      driverName,
      locationLat: zone.centerLat,
      locationLng: zone.centerLng,
      locationAddress: `${zone.name} Boundary Area, New Delhi`,
      status: "Active",
      organizationId: orgId,
      createdAtIso: new Date().toISOString(),
    };

    // 1. Sync to Firebase Firestore in real-time
    await syncAlertToFirestore(alertPayload);

    // 2. Dispatch FCM Web Push
    await sendPushNotification({
      title: `🚨 ${alertPayload.title}`,
      body: message,
      data: alertPayload,
    });

    // 3. Save to database
    await Alert.create({
      vehicleId,
      type: "geofence_breach",
      severity: zone.category === "restricted" ? "critical" : "high",
      message,
      status: "active",
      organizationId: orgId,
    });

    res.status(200).json({
      success: true,
      message: "Simulation alert generated and dispatched via Firebase & FCM",
      data: alertPayload,
    });
  } catch (error) {
    console.error("❌ [Geofence] simulateBreach error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
