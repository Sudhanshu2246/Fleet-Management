const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const Driver = sequelize.define("Driver", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  driverType: {
    type: DataTypes.ENUM("driver", "co_driver"),
    allowNull: false,
    defaultValue: "driver",
  },

  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  licenseType: {
    type: DataTypes.ENUM("LL", "DL", "CDL", "IDP"),
    allowNull: true,
  },
  vehicleCategories: {
    type: DataTypes.ENUM("MC_50cc", "MCWOG", "MCWG", "LMV_NT", "LMV_TR", "HMV_HTV", "MGV_MPV"),
    allowNull: true,
  },
  licenseExpiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  licenseImage: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  aadhaarCard: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  aadharImage: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  panCard: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  panImage: {
    type: DataTypes.JSON,
    allowNull: true,
  },

  vehicleAssignedId: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  deviceId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Driver;
