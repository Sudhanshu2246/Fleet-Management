const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const FleetSettings = sequelize.define(
  "FleetSettings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    organizationId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    companyProfile: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        companyName: "FleetIQ Logistics & Mobility Pvt. Ltd.",
        tradeName: "FleetIQ Express",
        companyType: "private_limited", // private_limited | public_limited | llp | partnership | sole_proprietorship
        fleetPrefix: "FLT-IND-",
        gstIn: "07AAAAA0000A1Z5",
        panNumber: "AAACA0000A",
        website: "https://fleetiq.io",
      },
    },
    officeAddress: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        registeredAddress: "Plot No. 42, Okhla Industrial Area, Phase-III",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110020",
        country: "India",
        fleetHubLocation: "Depot Hub 01 - South Delhi Freight Terminal",
      },
    },
    emergencyContacts: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        emergencyHotline: "+91 1800 233 4567",
        roadsideAssistance: "+91 98110 23456",
        escalationEmail: "emergency-dispatch@fleetiq.io",
        policeLiaison: "112 / +91 11 2346 9900",
        primaryManagerName: "John Doe",
        primaryManagerPhone: "+91 98765 43210",
        primaryManagerEmail: "admin@fleetiq.io",
      },
    },
    operatingSchedule: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        workingDays: "Monday - Saturday",
        shiftStartTime: "08:00",
        shiftEndTime: "20:00",
        nightSupervisorContact: "+91 98110 54321",
      },
    },
    updatedBy: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "System Administrator",
    },
  },
  {
    timestamps: true,
    tableName: "fleet_settings",
  }
);

module.exports = FleetSettings;
