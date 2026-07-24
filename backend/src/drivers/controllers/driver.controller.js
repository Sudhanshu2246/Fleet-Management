const { Driver, User, Vehicle, Trip, Organization } = require("../../index/index.model");
const bcrypt = require("bcryptjs");
const { uploadFromBuffer } = require("../../utils/cloudinary");
const { sequelize } = require("../../config/db");

// @desc    Create new driver
// @route   POST /api/v1/drivers
// @access  Private (Company Admin)
exports.createDriver = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      name, email, phone, driverType,
      licenseNumber, licenseType, vehicleCategories, licenseExpiryDate,
      aadhaarCard, panCard
    } = req.body;

    // Handle optional email
    const driverEmail = email && email.trim() !== "" ? email : `driver_${phone}@fleet.com`;

    const existingUser = await User.findOne({ where: { email: driverEmail } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Email or phone already registered",
      });
    }

    // Default password to phone number since drivers don't provide a password on creation
    // The user model now supports null passwords for drivers who use OTPs or alternative logins.

    const uploadMultiple = async (filesArray) => {
      let urls = [];
      if (filesArray && Array.isArray(filesArray)) {
        for (const file of filesArray) {
          try {
            const result = await uploadFromBuffer(file.buffer, "driver_docs");
            urls.push(result.secure_url);
          } catch (error) { 
            console.log("Cloudinary Upload Failed:", error.message); 
          }
        }
      }
      return urls;
    };

    // Helper to safely parse req.body fields into arrays
    const parseBodyArray = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      return [field];
    };

    let licenseImage = parseBodyArray(req.body.licenseImage);
    let aadharImage = parseBodyArray(req.body.aadhaarImage);
    let panImage = parseBodyArray(req.body.panImage);

    if (req.files) {
      if (req.files.licenseImage) licenseImage = await uploadMultiple(req.files.licenseImage);
      if (req.files.aadhaarImage) aadharImage = await uploadMultiple(req.files.aadhaarImage);
      if (req.files.panImage) panImage = await uploadMultiple(req.files.panImage);
    }

    const [firstName, ...lastNameParts] = name.split(" ");

    const user = await User.create({
      firstName: firstName || name,
      lastName: lastNameParts.join(" ") || " ",
      email: driverEmail,
      phone: phone || "0000000000",
      role: "driver",
      organizationId: req.user.organizationId, // Fixed reference
    }, { transaction });

    const normalizedDriverType = driverType ? driverType.replace("-", "_").toLowerCase() : "driver";

    const driver = await Driver.create({
      userId: user.id,
      driverType: normalizedDriverType,
      licenseNumber,
      licenseType,
      vehicleCategories,
      licenseExpiryDate,
      licenseImage, // JSON array
      aadhaarCard, // string
      aadharImage, // JSON array
      panCard, // string
      panImage, // JSON array
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Driver created successfully",
      data: { user, driver },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Update a driver
// @route   PUT /api/v1/drivers/:id
// @access  Private (Company Admin)
exports.updateDriver = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      name, phone, driverType,
      licenseNumber, licenseType, vehicleCategories, licenseExpiryDate,
      aadhaarCard, panCard
    } = req.body;

    const driverUser = await User.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId || req.user.organization,
        role: "driver"
      }
    });

    if (!driverUser) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: "Driver not found" });
    }

    const uploadMultiple = async (filesArray) => {
      let urls = [];
      if (filesArray && Array.isArray(filesArray)) {
        for (const file of filesArray) {
          try {
            const result = await uploadFromBuffer(file.buffer, "driver_docs");
            urls.push(result.secure_url);
          } catch (error) { 
            console.log("Cloudinary Upload Failed:", error.message); 
          }
        }
      }
      return urls;
    };

    let licenseImage = undefined;
    let aadharImage = undefined;
    let panImage = undefined;

    if (req.files) {
      if (req.files.licenseImage) licenseImage = await uploadMultiple(req.files.licenseImage);
      if (req.files.aadhaarImage) aadharImage = await uploadMultiple(req.files.aadhaarImage);
      if (req.files.panImage) panImage = await uploadMultiple(req.files.panImage);
    }

    if (name) {
      const [firstName, ...lastNameParts] = name.split(" ");
      driverUser.firstName = firstName;
      driverUser.lastName = lastNameParts.join(" ") || " ";
    }
    if (phone) driverUser.phone = phone;
    await driverUser.save({ transaction });

    const driverProfile = await Driver.findOne({ where: { userId: driverUser.id } });
    if (driverProfile) {
      if (driverType) driverProfile.driverType = driverType.replace("-", "_").toLowerCase();
      if (licenseNumber !== undefined) driverProfile.licenseNumber = licenseNumber;
      if (licenseType !== undefined) driverProfile.licenseType = licenseType;
      if (vehicleCategories !== undefined) driverProfile.vehicleCategories = vehicleCategories;
      if (licenseExpiryDate !== undefined) driverProfile.licenseExpiryDate = licenseExpiryDate;
      if (aadhaarCard !== undefined) driverProfile.aadhaarCard = aadhaarCard;
      if (panCard !== undefined) driverProfile.panCard = panCard;

      if (licenseImage) driverProfile.licenseImage = licenseImage;
      if (aadharImage) driverProfile.aadharImage = aadharImage;
      if (panImage) driverProfile.panImage = panImage;

      await driverProfile.save({ transaction });
    }

    await transaction.commit();

    // Fetch the updated driver with full details
    const updatedDriver = await User.findOne({
      where: { id: driverUser.id },
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Driver,
          as: "Driver",
          include: [
            {
              model: Vehicle,
              as: "AssignedVehicle",
              attributes: ["id", "vehicleNumber", "name", "type", "status"]
            }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Driver updated successfully",
      data: updatedDriver,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get all drivers (with pagination and filtering)
// @route   GET /api/v1/drivers
// @access  Private
exports.getDrivers = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive, search } = req.query;
    
    const offset = (page - 1) * limit;

    const whereCondition = {
      organizationId: req.user.organizationId || req.user.organization,
      role: "driver",
    };

    if (search) {
      const { Op } = require("sequelize");
      whereCondition[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const driverInclude = {
      model: Driver,
      as: "Driver"
    };

    if (isActive !== undefined) {
      driverInclude.where = { isActive: isActive === 'true' };
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      include: [driverInclude],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true // Important when using findAndCountAll with includes
    });

    res.status(200).json({
      success: true,
      count: rows.length,
      total: count,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(count / limit)
      },
      data: rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Assign vehicle to driver
// @route   POST /api/v1/drivers/assign-vehicle
// @access  Private
exports.assignVehicle = async (req, res) => {
  try {
    const { driverId, vehicleId } = req.body; // driverId is User ID

    const driverUser = await User.findOne({
      where: {
        id: driverId,
        organizationId: req.user.organizationId || req.user.organization,
        role: "driver",
      }
    });

    const driverProfile = await Driver.findOne({
      where: { userId: driverId }
    });

    const vehicle = await Vehicle.findOne({
      where: {
        id: vehicleId,
        organizationId: req.user.organizationId || req.user.organization,
      }
    });

    if (!driverUser || !driverProfile || !vehicle) {
      return res.status(404).json({
        success: false,
        message: "Driver or Vehicle not found",
      });
    }

    // 1. Unassign previous driver from this vehicle if any
    if (vehicle.driverAssignedId) {
      await Driver.update(
        { vehicleAssignedId: null }, 
        { where: { userId: vehicle.driverAssignedId } }
      );
    }

    // 2. Unassign previous vehicle from this driver if any
    if (driverProfile.vehicleAssignedId) {
      await Vehicle.update(
        { driverAssignedId: null }, 
        { where: { id: driverProfile.vehicleAssignedId } }
      );
    }

    // 3. Link them
    driverProfile.vehicleAssignedId = vehicle.id;
    vehicle.driverAssignedId = driverUser.id;

    await driverProfile.save();
    await vehicle.save();

    res.status(200).json({
      success: true,
      message: "Vehicle assigned to driver successfully",
      data: { driver: driverUser, vehicle },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Update driver status (Activate/Suspend)
// @route   PUT /api/v1/drivers/:id/status
// @access  Private
exports.updateDriverStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const driverUser = await User.findOne({
      where: { id: req.params.id, organizationId: req.user.organizationId || req.user.organization, role: "driver" }
    });

    if (!driverUser) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    await Driver.update(
      { isActive },
      { where: { userId: driverUser.id } }
    );

    const driverProfile = await Driver.findOne({ where: { userId: driverUser.id } });

    res.status(200).json({
      success: true,
      message: `Driver ${isActive ? "activated" : "suspended"} successfully`,
      data: driverProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get single driver by ID
// @route   GET /api/v1/drivers/:id
// @access  Private
exports.getDriverById = async (req, res) => {
  try {
    const driver = await User.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId || req.user.organization,
        role: "driver",
      },
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Driver,
          as: "Driver",
          include: [
            {
              model: Vehicle,
              as: "AssignedVehicle",
              attributes: ["id", "vehicleNumber", "name", "type", "status"]
            }
          ]
        }
      ]
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Delete a driver
// @route   DELETE /api/v1/drivers/:id
// @access  Private
exports.deleteDriver = async (req, res) => {
  try {
    const { VehicleAssignment } = require("../../index/index.model");

    const driverUser = await User.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId || req.user.organization,
        role: "driver"
      }
    });

    if (!driverUser) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    // Check for Driver profile and unassign from active vehicle
    const driverProfile = await Driver.findOne({ where: { userId: driverUser.id } });
    if (driverProfile && driverProfile.vehicleAssignedId) {
      await Vehicle.update(
        { driverAssignedId: null, status: 'idle' },
        { where: { id: driverProfile.vehicleAssignedId } }
      );
    }
    
    // Clear out assignment history for this driver
    await VehicleAssignment.destroy({ where: { driverId: driverUser.id } });

    // Destroy Profile and User
    if (driverProfile) await driverProfile.destroy();
    await driverUser.destroy();

    res.status(200).json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
};

// ─── DRIVER DASHBOARD DATA ────────────────
exports.getDriverDashboard = async (req, res) => {
  try {
    const { Trip, VehicleAssignment, Vehicle } = require("../../index/index.model");

    // req.user has the driver user details from protect middleware
    const driverId = req.user.id;
    const organizationId = req.user.organizationId;

    // 1. Get the active assignment for this driver
    const assignment = await VehicleAssignment.findOne({
      where: {
        driverId,
        organizationId,
        status: "active",
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Vehicle,
          attributes: ["id", "vehicleNumber", "name", "type", "speed", "battery", "locationLat", "locationLng"],
        },
      ],
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "No active assignment found for this driver",
      });
    }

    // 2. Try to get the active trip for this driver and vehicle
    const trip = await Trip.findOne({
      where: {
        driverId,
        vehicleId: assignment.vehicleId,
        status: ["ongoing", "scheduled"],
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: require("../../index/index.model").User,
          attributes: ["id", "firstName", "lastName", "phone", "email"]
        }
      ]
    });

    // Also get CoDriver if applicable (find by coPilotPhone)
    let coDriver = null;
    if (trip && trip.coPilotPhone) {
      coDriver = await require("../../index/index.model").User.findOne({
        where: { phone: trip.coPilotPhone, role: "driver", organizationId },
        attributes: ["id", "firstName", "lastName", "phone", "email"]
      });
    } else if (assignment.coDriverPhone) {
      coDriver = await require("../../index/index.model").User.findOne({
        where: { phone: assignment.coDriverPhone, role: "driver", organizationId },
        attributes: ["id", "firstName", "lastName", "phone", "email"]
      });
    }

    // Attach CoDriver to trip if it exists
    const tripData = trip ? trip.toJSON() : null;
    if (tripData && coDriver) {
      tripData.CoDriver = coDriver;
    }

    res.status(200).json({
      success: true,
      data: {
        assignment,
        vehicle: assignment.Vehicle || null,
        trip: tripData || null,
      },
    });
  } catch (error) {
    console.error("Driver Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
