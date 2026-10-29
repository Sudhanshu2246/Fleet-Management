const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

/**
 * AuditLog Model
 * Immutable enterprise audit log & compliance trail.
 * Tracks security events, administrative changes, authorization failures,
 * telematics anomalies, and cryptographic hash verification.
 */
const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    traceId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false, // e.g. "USER_LOGIN", "GEOFENCE_BREACH", "VEHICLE_ASSIGNED", "TELEMETRY_TAMPER_DETECTED"
    },
    actionLabel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        "auth_access",
        "telematics_geofence",
        "vehicle_operations",
        "system_data",
        "security_threat"
      ),
      defaultValue: "auth_access",
    },
    severity: {
      type: DataTypes.ENUM("critical", "high", "warning", "info"),
      defaultValue: "info",
    },
    actorId: {
      type: DataTypes.STRING,
      allowNull: true, // User ID or 'SYSTEM'
    },
    actorName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "System Daemon",
    },
    actorRole: {
      type: DataTypes.STRING,
      allowNull: true, // "Admin", "SuperAdmin", "Driver", "Dispatcher"
    },
    actorEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    targetResource: {
      type: DataTypes.STRING,
      allowNull: true, // "Vehicle", "Geofence", "User", "Trip"
    },
    targetId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "127.0.0.1",
    },
    locationCity: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "New Delhi, IN",
    },
    deviceInfo: {
      type: DataTypes.STRING,
      allowNull: true, // "Chrome / Windows 11", "FleetIQ Android v2.4"
    },
    status: {
      type: DataTypes.ENUM("success", "blocked", "failed", "flagged"),
      defaultValue: "success",
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    hashSignature: {
      type: DataTypes.STRING,
      allowNull: true, // SHA-256 integrity hash
    },
    organizationId: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ORG-101",
    },
  },
  {
    timestamps: true,
    tableName: "audit_logs",
  }
);

module.exports = AuditLog;
