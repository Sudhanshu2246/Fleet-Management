const { Alert, Vehicle } = require("../../index/index.model");
const { sequelize } = require("../../config/db");

// @desc    Get all alerts for an organization
// @route   GET /api/v1/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
  try {
    const { status, type, severity } = req.query;
    
    let whereClause = { organizationId: req.user.organization };

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
    const { vehicleId, type, severity, message } = req.body;

    const alert = await Alert.create({
      vehicleId,
      type,
      severity,
      message,
      organizationId: req.user.organization,
    });

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
    let alert = await Alert.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organization,
      }
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    await Alert.update({
      status: "resolved",
      resolvedById: req.user.id,
      resolvedAt: new Date()
    }, {
      where: { id: req.params.id }
    });

    alert = await Alert.findByPk(req.params.id);

    res.status(200).json({
      success: true,
      message: "Alert resolved successfully",
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
      where: { organizationId: req.user.organization, status: "active" },
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
