const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const Alert = sequelize.define(
  "Alert",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vehicleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(
        "overspeed",
        "low_battery",
        "geofence_breach",
        "offline",
        "maintenance_due",
      ),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      defaultValue: "low",
    },
    message: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "resolved", "dismissed"),
      defaultValue: "active",
    },
    resolvedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ["organizationId", "status", "createdAt"],
      },
      {
        fields: ["vehicleId", "createdAt"],
      },
    ],
  },
);

module.exports = Alert;
