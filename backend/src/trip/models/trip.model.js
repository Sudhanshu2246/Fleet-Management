const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const Trip = sequelize.define(
  "Trip",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tripId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    organizationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vehicleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    coPilotName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coPilotPhone: {
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
    status: {
      type: DataTypes.ENUM("scheduled", "assigned", "ongoing", "completed", "cancelled"),
      defaultValue: "scheduled",
    },
    distanceTravelled: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    averageSpeed: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    maxSpeed: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    path: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    tripType: {
      type: DataTypes.ENUM("one-way", "round-trip", "multi-city"),
      defaultValue: "one-way",
    },
    vehicleTypeRequired: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    returnDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    multiCityLegs: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Trip;
