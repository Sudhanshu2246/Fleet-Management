const User = require("../auth/models/user.model");
const Organization = require("../organization/models/organization.model");
const Vehicle = require("../vehical/models/vehicle.model");
const Alert = require("../alert/models/alert.model");
const Driver = require("../drivers/models/driver.model");
const Trip = require("../trip/models/trip.model");
const SuperAdmin = require("../Super-Admin/models/superAdmin.model");
const VehicleAssignment = require("../vehical/models/vehicleAssignment.model");

// Users and Organizations
User.belongsTo(Organization, { foreignKey: "organizationId" });
Organization.hasMany(User, { foreignKey: "organizationId" });

// Driver and User
Driver.belongsTo(User, { foreignKey: "userId" });
User.hasOne(Driver, { foreignKey: "userId" });

// Driver and Assigned Vehicle
Driver.belongsTo(Vehicle, { foreignKey: "vehicleAssignedId", as: "AssignedVehicle" });
Vehicle.hasOne(Driver, { foreignKey: "vehicleAssignedId", as: "AssignedDriverProfile" });

// Vehicles and Organizations
Vehicle.belongsTo(Organization, { foreignKey: "organizationId" });
Organization.hasMany(Vehicle, { foreignKey: "organizationId" });

// Alerts and Vehicles
Alert.belongsTo(Vehicle, { foreignKey: "vehicleId" });
Vehicle.hasMany(Alert, { foreignKey: "vehicleId" });

// Trips and Organizations
Trip.belongsTo(Organization, { foreignKey: "organizationId" });
Organization.hasMany(Trip, { foreignKey: "organizationId" });

// Trips and Vehicles
Trip.belongsTo(Vehicle, { foreignKey: "vehicleId" });
Vehicle.hasMany(Trip, { foreignKey: "vehicleId" });

// Trips and Users (Drivers)
Trip.belongsTo(User, { foreignKey: "driverId" });
User.hasMany(Trip, { foreignKey: "driverId" });

// Vehicle Assignments
VehicleAssignment.belongsTo(Organization, { foreignKey: "organizationId" });
Organization.hasMany(VehicleAssignment, { foreignKey: "organizationId" });
VehicleAssignment.belongsTo(Vehicle, { foreignKey: "vehicleId" });
Vehicle.hasMany(VehicleAssignment, { foreignKey: "vehicleId" });
VehicleAssignment.belongsTo(User, { foreignKey: "driverId" });
User.hasMany(VehicleAssignment, { foreignKey: "driverId" });

module.exports = {
  User,
  Organization,
  Vehicle,
  Alert,
  Driver,
  Trip,
  SuperAdmin,
  VehicleAssignment,
};
