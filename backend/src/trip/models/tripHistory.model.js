const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

/**
 * TripHistory Model
 * Immutable telematics historical audit record for all completed and archived trips.
 * Captures comprehensive performance metrics: max/min/average speed, all stop records (>60s),
 * moving vs idle duration, total distance, GPS breadcrumb trail, and driver/vehicle snapshots.
 */
const TripHistory = sequelize.define(
  "TripHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    historyId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    tripId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    driverName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    driverPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vehicleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vehicleNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vehicleName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vehicleType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sourceAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sourceLat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sourceLng: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    destAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    destLat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    destLng: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    durationSeconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Total trip duration in seconds",
    },
    durationFormatted: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Human readable duration (e.g. 2h 15m 30s)",
    },
    distanceTravelled: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: "Total distance in kilometers",
    },
    maxSpeed: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: "Highest recorded GPS speed during trip (km/h)",
    },
    minSpeed: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: "Lowest non-zero moving GPS speed recorded during trip (km/h)",
    },
    averageSpeed: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: "Average speed across trip duration (km/h)",
    },
    stopsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Total number of stationary stops (>60 seconds)",
    },
    totalStopTime: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: "Total cumulative time spent stopped in seconds",
    },
    totalStopTimeFormatted: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Formatted stoppage time (e.g. 15m 30s)",
    },
    movingDuration: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: "Pure moving duration in seconds (durationSeconds - totalStopTime)",
    },
    movingDurationFormatted: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stops: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of detailed stop objects (stopId, stoppedAt, resumedAt, duration, location)",
    },
    path: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "GPS breadcrumbs trail array (lat, lng, speed, heading, timestamp)",
    },
    overspeedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "Count of overspeeding incidents recorded during trip",
    },
    status: {
      type: DataTypes.ENUM("completed", "ongoing", "cancelled", "interrupted"),
      defaultValue: "completed",
    },
    tripType: {
      type: DataTypes.STRING,
      defaultValue: "one-way",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Extra telematics metadata (battery, coPilot, notes, etc.)",
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["organizationId", "createdAt"] },
      { fields: ["driverId", "createdAt"] },
      { fields: ["vehicleId", "createdAt"] },
      { fields: ["tripId"] },
      { fields: ["historyId"] },
    ],
  }
);

module.exports = TripHistory;
