const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");
const { generateVehicleId } = require("../../utils/generateVehicleId");

const Vehicle = sequelize.define(
  "Vehicle",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    vehicleNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    chassisNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "bus", "mini_bus", "truck", "mini_truck", "car", "suv", "motorbike", "other"
      ),
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    driverAssignedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "idle", "offline"),
      defaultValue: "offline",
    },
    speed: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    battery: {
      type: DataTypes.FLOAT,
      defaultValue: 100,
    },
    locationAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    locationLat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    locationLng: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    lastSeen: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    registrationImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rcImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    insuranceImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pollutionImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tripsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalDistance: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ["organizationId", "status"],
      },
      {
        fields: ["organizationId", "type"],
      },
    ],
    hooks: {
      beforeValidate: async (vehicle, options) => {
        if (!vehicle.id) {
          // Find the last vehicle in this organization to get the latest id
          const lastVehicle = await sequelize.models.Vehicle.findOne({
            where: { organizationId: vehicle.organizationId },
            order: [["createdAt", "DESC"]], 
            attributes: ["id"],
            transaction: options.transaction,
          });

          vehicle.id = await generateVehicleId(
            lastVehicle ? lastVehicle.id : null, 
            vehicle.organizationId, 
            vehicle.type
          );
        }
      },
    },
  }
);

module.exports = Vehicle;
