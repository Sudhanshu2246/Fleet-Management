const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const Geofence = sequelize.define(
  "Geofence",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    geofenceId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        "depot",
        "warehouse",
        "restricted",
        "corridor",
        "client_site",
        "service_center"
      ),
      defaultValue: "depot",
    },
    type: {
      type: DataTypes.ENUM("circle", "polygon"),
      defaultValue: "circle",
    },
    centerLat: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    centerLng: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    radius: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 500, // meters for circle
    },
    coordinates: {
      type: DataTypes.JSON,
      allowNull: true, // Array of [lat, lng] for polygon
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: "#10B981", // Emerald default
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "monitoring"),
      defaultValue: "active",
    },
    alertOnEntry: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    alertOnExit: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    speedLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 40, // km/h
    },
    dwellLimitMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 60,
    },
    assignedVehicles: {
      type: DataTypes.JSON,
      allowNull: true, // e.g. ["*"] or ["VH-4821", "VH-3310"]
      defaultValue: ["*"],
    },
    insideVehicles: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    organizationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "geofences",
  }
);

module.exports = Geofence;
