const { Alert, Vehicle } = require("../../index/index.model");
const { sequelize } = require("../../config/db");
const {
  syncAlertToFirestore,
  resolveAlertInFirestore,
  sendPushNotification,
  registerFcmToken,
} = require("../../config/firebase");

// @desc    Get all alerts for an organization
// @route   GET /api/v1/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
  try {
    const { status, type, severity } = req.query;
    
    let whereClause = { organizationId: req.user.organization || req.user.organizationId };

    if (status) whereClause.status = status;
    if (type) whereClause.type = type;
    if (severity) whereClause.severity = severity;

    const alerts = await Alert.findAll({
      where: whereClause,
      include: [
        {
          model: Vehicle,
          attributes: ["vehicleId", "name"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Create new alert (Manual or System)
// @route   POST /api/v1/alerts
// @access  Private
exports.createAlert = async (req, res) => {
  try {
    const { vehicleId, type, severity = "high", message, title, driverName, lat, lng, address } = req.body;
    const orgId = req.user.organization || req.user.organizationId || "ORG-101";

    const alert = await Alert.create({
      vehicleId,
      type,
      severity,
      message,
      organizationId: orgId,
    });

    const alertPayload = {
      id: String(alert.id),
      alertId: String(alert.id),
      title: title || `${(type || "FLEET").toUpperCase()} Alert`,
      message: alert.message,
      type: alert.type,
      priority: (severity || "high").charAt(0).toUpperCase() + (severity || "high").slice(1),
      severity: alert.severity,
      vehicleId: alert.vehicleId || "VH-4821",
      driverName: driverName || "Fleet Driver",
      locationLat: lat || 28.6139,
      locationLng: lng || 77.2090,
      locationAddress: address || "Transit Highway",
      status: "Active",
      organizationId: orgId,
      createdAtIso: new Date().toISOString(),
    };

    // Realtime Sync to Firebase Firestore
    syncAlertToFirestore(alertPayload).catch((e) =>
      console.warn("Firestore sync non-blocking warning:", e.message)
    );

    // Broadcast FCM Web Push Notification
    sendPushNotification({
      title: `🚨 ${alertPayload.title}: ${alertPayload.vehicleId}`,
      body: alertPayload.message,
      data: alertPayload,
    }).catch((e) => console.warn("FCM push non-blocking warning:", e.message));

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Resolve an alert
// @route   PUT /api/v1/alerts/:id/resolve
// @access  Private
exports.resolveAlert = async (req, res) => {
  try {
    const orgId = req.user.organization || req.user.organizationId;
    let alert = await Alert.findOne({
      where: {
        id: req.params.id,
        organizationId: orgId,
      }
    });

    if (alert) {
      await Alert.update({
        status: "resolved",
        resolvedById: req.user.id,
        resolvedAt: new Date()
      }, {
        where: { id: req.params.id }
      });
      alert = await Alert.findByPk(req.params.id);
    }

    // Also resolve in Firebase Firestore
    await resolveAlertInFirestore(req.params.id, req.user?.firstName || "Admin");

    res.status(200).json({
      success: true,
      message: "Alert resolved successfully in database and Firebase",
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get alert stats for dashboard
// @route   GET /api/v1/alerts/stats
// @access  Private
exports.getAlertStats = async (req, res) => {
  try {
    const stats = await Alert.findAll({
      where: { organizationId: req.user.organization || req.user.organizationId, status: "active" },
      attributes: [
        "type",
        [sequelize.fn("COUNT", sequelize.col("type")), "count"]
      ],
      group: ["type"]
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Register FCM device token for Web Push
// @route   POST /api/v1/alerts/fcm-token
// @access  Private
exports.registerFcmDeviceToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "FCM token is required" });
    }
    registerFcmToken(token);
    res.status(200).json({
      success: true,
      message: "FCM token registered successfully for Web Push notifications",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trigger a test alert with Firebase Firestore & Web Push
// @route   POST /api/v1/alerts/test
// @access  Private
exports.triggerTestAlert = async (req, res) => {
  try {
    const {
      type = "sos",
      title = "SOS Emergency Triggered",
      message = "Emergency SOS button pressed on vehicle VH-4821 near Connaught Place",
      priority = "Critical",
      severity = "critical",
      vehicleId = "VH-4821",
      driverName = "Vikram Malhotra",
      lat = 28.6304,
      lng = 77.2177,
      address = "Barakhamba Road, Connaught Place, New Delhi",
    } = req.body;

    const alertId = `ALT-${Date.now().toString().slice(-6)}`;
    const organizationId = req.user?.organization || req.user?.organizationId || "ORG-101";

    const alertPayload = {
      id: alertId,
      alertId,
      title: title || `${type.toUpperCase()} Alert`,
      message,
      type,
      priority,
      severity,
      vehicleId,
      driverName,
      locationLat: lat,
      locationLng: lng,
      locationAddress: address,
      status: "Active",
      organizationId,
      createdAtIso: new Date().toISOString(),
    };

    // 1. Sync to Firebase Firestore
    await syncAlertToFirestore(alertPayload);

    // 2. Broadcast Web Push notification via FCM
    await sendPushNotification({
      title: `🚨 ${alertPayload.title} (${vehicleId})`,
      body: alertPayload.message,
      data: alertPayload,
    });

    res.status(201).json({
      success: true,
      message: "Real-time test alert created in Firebase Firestore and dispatched via FCM",
      data: alertPayload,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
