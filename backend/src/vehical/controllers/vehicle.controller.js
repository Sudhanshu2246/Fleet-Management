const { Vehicle, User, VehicleAssignment } = require("../../index/index.model");
const { uploadFromBuffer } = require("../../utils/cloudinary");

// @desc    Create new vehicle
// @route   POST /api/v1/vehicles
// @access  Private (Company Admin)
exports.createVehicle = async (req, res) => {
  try {
    const { name, type, vehicleNumber, chassisNumber } = req.body;

    // Validate required fields
    if (!name || !type || !vehicleNumber || !chassisNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, type, vehicleNumber, chassisNumber)",
      });
    }

    // Validate duplicate vehicleNumber or chassisNumber
    const existingVehicle = await Vehicle.findOne({
      where: { vehicleNumber },
    });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle with this vehicleNumber already exists",
      });
    }
    const existingChassis = await Vehicle.findOne({
      where: { chassisNumber },
    });
    if (existingChassis) {
      return res.status(400).json({
        success: false,
        message: "Vehicle with this chassisNumber already exists",
      });
    }

    let registrationImage = req.body.registrationImage || "";
    let rcImage = req.body.rcImage || "";
    let insuranceImage = req.body.insuranceImage || "";
    let pollutionImage = req.body.pollutionImage || "";

    // Validate mandatory documents (either file upload or string URL)
    const hasReg = (req.files && req.files.registrationImage) || registrationImage;
    const hasRc = (req.files && req.files.rcImage) || rcImage;
    const hasIns = (req.files && req.files.insuranceImage) || insuranceImage;
    const hasPol = (req.files && req.files.pollutionImage) || pollutionImage;

    if (!hasReg || !hasRc || !hasIns || !hasPol) {
      return res.status(400).json({
        success: false,
        message: "All vehicle documents (Registration, RC, Insurance, Pollution) are mandatory",
      });
    }

    if (req.files) {
      if (req.files.registrationImage && req.files.registrationImage[0]) {
        try {
          const result = await uploadFromBuffer(req.files.registrationImage[0].buffer, "vehicle_docs");
          registrationImage = result.secure_url;
        } catch (error) { console.log("Cloudinary Upload Failed for Registration:", error.message); }
      }
      if (req.files.rcImage && req.files.rcImage[0]) {
        try {
          const result = await uploadFromBuffer(req.files.rcImage[0].buffer, "vehicle_docs");
          rcImage = result.secure_url;
        } catch (error) { console.log("Cloudinary Upload Failed for RC:", error.message); }
      }
      if (req.files.insuranceImage && req.files.insuranceImage[0]) {
        try {
          const result = await uploadFromBuffer(req.files.insuranceImage[0].buffer, "vehicle_docs");
          insuranceImage = result.secure_url;
        } catch (error) { console.log("Cloudinary Upload Failed for Insurance:", error.message); }
      }
      if (req.files.pollutionImage && req.files.pollutionImage[0]) {
        try {
          const result = await uploadFromBuffer(req.files.pollutionImage[0].buffer, "vehicle_docs");
          pollutionImage = result.secure_url;
        } catch (error) { console.log("Cloudinary Upload Failed for Pollution:", error.message); }
      }
    }

    const vehicle = await Vehicle.create({
      vehicleNumber,
      chassisNumber,
      name,
      type,
      registrationImage,
      rcImage,
      insuranceImage,
      pollutionImage,
      organizationId: req.user.organizationId,
    });

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get all vehicles for an organization
// @desc    Get all vehicles (with pagination and filtering)
// @route   GET /api/v1/vehicles
// @access  Private
exports.getVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, search } = req.query;

    const offset = (page - 1) * limit;
    
    // Base query conditions
    const whereCondition = { organizationId: req.user.organizationId };

    // Apply exact filters if provided
    if (status) whereCondition.status = status;
    if (type) whereCondition.type = type;

    // Apply search filter (vehicleNumber or name)
    if (search) {
      const { Op } = require("sequelize");
      whereCondition[Op.or] = [
        { vehicleNumber: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Vehicle.findAndCountAll({ 
      where: whereCondition,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
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

// @desc    Get single vehicle details
// @route   GET /api/v1/vehicles/:id
// @access  Private
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Update vehicle
// @route   PUT /api/v1/vehicles/:id
// @access  Private
exports.updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // Filter allowed fields to prevent injecting read-only fields like id, organizationId
    const allowedFields = ["name", "type", "vehicleNumber", "chassisNumber", "status", "registrationImage", "rcImage", "insuranceImage", "pollutionImage"];
    let updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    // Check uniqueness if vehicleNumber is being updated
    if (updateData.vehicleNumber && updateData.vehicleNumber !== vehicle.vehicleNumber) {
      const existingVehicle = await Vehicle.findOne({
        where: { vehicleNumber: updateData.vehicleNumber },
      });
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: "Vehicle with this vehicleNumber already exists",
        });
      }
    }

    // Check uniqueness if chassisNumber is being updated
    if (updateData.chassisNumber && updateData.chassisNumber !== vehicle.chassisNumber) {
      const existingChassis = await Vehicle.findOne({
        where: { chassisNumber: updateData.chassisNumber },
      });
      if (existingChassis) {
        return res.status(400).json({
          success: false,
          message: "Vehicle with this chassisNumber already exists",
        });
      }
    }

    if (req.files) {
      if (req.files.registrationImage && req.files.registrationImage[0]) {
        try {
          const result = await uploadFromBuffer(req.files.registrationImage[0].buffer, "vehicle_docs");
          updateData.registrationImage = result.secure_url;
        } catch (error) { console.log("Cloudinary Upload Failed for Registration:", error.message); }
      }
      if (req.files.rcImage && req.files.rcImage[0]) {
        try {
          const result = await uploadFromBuffer(req.files.rcImage[0].buffer, "vehicle_docs");
          updateData.rcImage = result.secure_url;
        } catch (error) { console.log("Cloudinary Upload Failed for RC:", error.message); }
      }
      if (req.files.insuranceImage && req.files.insuranceImage[0]) {
        try {
          const result = await uploadFromBuffer(req.files.insuranceImage[0].buffer, "vehicle_docs");
          updateData.insuranceImage = result.secure_url;
        } catch (error) { console.log("Cloudinary Upload Failed for Insurance:", error.message); }
      }
      if (req.files.pollutionImage && req.files.pollutionImage[0]) {
        try {
          const result = await uploadFromBuffer(req.files.pollutionImage[0].buffer, "vehicle_docs");
          updateData.pollutionImage = result.secure_url;
        } catch (error) { console.log("Cloudinary Upload Failed for Pollution:", error.message); }
      }
    }

    if (Object.keys(updateData).length > 0) {
      await vehicle.update(updateData);
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/v1/vehicles/:id
// @access  Private
exports.deleteVehicle = async (req, res) => {
  try {
    const { Driver, User, VehicleAssignment } = require("../../index/index.model");

    const vehicle = await Vehicle.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    // 1. Unassign and suspend the primary driver if assigned
    if (vehicle.driverAssignedId) {
      await Driver.update(
        { vehicleAssignedId: null, isActive: false },
        { where: { userId: vehicle.driverAssignedId } }
      );
    }

    // 2. Find any active assignments to suspend co-drivers
    const activeAssignments = await VehicleAssignment.findAll({
      where: { vehicleId: vehicle.id }
    });

    for (const assignment of activeAssignments) {
      if (assignment.coDriverPhone) {
        const coDriverUser = await User.findOne({ 
          where: { phone: assignment.coDriverPhone, role: 'driver', organizationId: req.user.organizationId } 
        });
        if (coDriverUser) {
          await Driver.update(
            { vehicleAssignedId: null, isActive: false }, 
            { where: { userId: coDriverUser.id } }
          );
        }
      }
    }

    // 3. Remove all assignment history/records for this vehicle
    await VehicleAssignment.destroy({ where: { vehicleId: vehicle.id } });

    // 4. Finally, delete the vehicle itself
    await vehicle.destroy();

    res.status(200).json({
      success: true,
      message: "Vehicle removed, and its associated drivers/co-drivers have been suspended successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Assign vehicle to a driver
// @route   POST /api/v1/vehicles/assign
// @access  Private
exports.assignVehicleToDriver = async (req, res) => {
  try {
    const {
      vehicleType,
      vehicleNumber,
      tripFrom,
      tripTo,
      tripStartDate,
      driverName,
      driverPhone,
      coDriverName,
      coDriverPhone,
    } = req.body;

    // Validate required base fields
    if (!vehicleType || !vehicleNumber || !tripFrom || !tripTo || !tripStartDate || !driverName || !driverPhone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (vehicleType, vehicleNumber, tripFrom, tripTo, tripStartDate, driverName, driverPhone)",
      });
    }

    // Validate co-driver if vehicle type requires it
    const heavyVehicles = ["truck", "mini_truck", "bus", "mini_bus"];
    if (heavyVehicles.includes(vehicleType.toLowerCase())) {
      if (!coDriverName || !coDriverPhone) {
        return res.status(400).json({
          success: false,
          message: `coDriverName and coDriverPhone are mandatory for vehicle type: ${vehicleType}`,
        });
      }
    }

    // Find the Vehicle by vehicleNumber and organization
    const vehicle = await Vehicle.findOne({
      where: {
        vehicleNumber,
        organizationId: req.user.organizationId,
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found in this organization",
      });
    }

    // Check if vehicle type matches
    if (vehicle.type !== vehicleType.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: `Provided vehicleType '${vehicleType}' does not match actual vehicle type '${vehicle.type}'`,
      });
    }

    // Find the Driver by driverPhone and organization
    const driverUser = await User.findOne({
      where: {
        phone: driverPhone,
        organizationId: req.user.organizationId,
        role: "driver",
      },
    });

    if (!driverUser) {
      return res.status(404).json({
        success: false,
        message: "Driver not found with this phone number in this organization",
      });
    }

    // Create the assignment
    const assignment = await VehicleAssignment.create({
      organizationId: req.user.organizationId,
      vehicleId: vehicle.id,
      driverId: driverUser.id,
      tripFrom,
      tripTo,
      tripStartDate,
      coDriverName: coDriverName || null,
      coDriverPhone: coDriverPhone || null,
    });

    // Optionally update the vehicle to show it's currently assigned to this driver
    await vehicle.update({
      driverAssignedId: driverUser.id,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Vehicle assigned to driver successfully",
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get all assigned vehicles (assignments)
// @route   GET /api/v1/vehicles/assignments
// @access  Private
exports.getAssignedVehicles = async (req, res) => {
  try {
    const assignments = await VehicleAssignment.findAll({
      where: { organizationId: req.user.organizationId },
      include: [
        {
          model: require("../../index/index.model").Vehicle,
          as: "Vehicle", // check relationship name if needed. In index.model.js, Vehicle.hasMany(VehicleAssignment, { foreignKey: "vehicleId" }); VehicleAssignment.belongsTo(Vehicle, { foreignKey: "vehicleId" })
          attributes: ["id", "vehicleNumber", "type", "name"]
        },
        {
          model: require("../../index/index.model").User,
          as: "User", // VehicleAssignment.belongsTo(User, { foreignKey: "driverId" })
          attributes: ["id", "firstName", "lastName", "phone"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
