const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const VehicleAssignment = sequelize.define(
  "VehicleAssignment",
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
      allowNull: false,
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tripFrom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tripTo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tripStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    coDriverName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coDriverPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "completed", "cancelled"),
      defaultValue: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = VehicleAssignment;
