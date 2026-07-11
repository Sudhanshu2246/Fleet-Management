const { Trip, Vehicle, User } = require("../../index/index.model");
const { sequelize } = require("../../config/db");

// ─── Start New Trip ──────────────────────
exports.startTrip = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      vehicleId, // actually vehicle string id or db id? Usually it's the custom string id sent by driver app.
      coPilotName, 
      coPilotPhone, 
      source, 
      destination 
    } = req.body;

    const driverId = req.user.id;
    const organizationId = req.user.organization;

    // Generate unique Trip ID
    const tripIdString = `TRIP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Verify Vehicle exists and belongs to org
    const vehicle = await Vehicle.findOne({ 
      where: {
        vehicleId: vehicleId, 
        organizationId: organizationId
      }
    });

    if (!vehicle) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or unauthorized",
      });
    }

    const sourceLat = source?.location?.coordinates?.[1] || null;
    const sourceLng = source?.location?.coordinates?.[0] || null;
    const destLat = destination?.location?.coordinates?.[1] || null;
    const destLng = destination?.location?.coordinates?.[0] || null;

    const newTrip = await Trip.create({
      tripId: tripIdString,
      organizationId: organizationId,
      vehicleId: vehicle.id,
      driverId: driverId,
      coPilotName,
      coPilotPhone,
      sourceAddress: source?.address || "",
      sourceLat,
      sourceLng,
      destAddress: destination?.address || "",
      destLat,
      destLng,
      status: "ongoing",
      startTime: new Date(),
      path: sourceLat && sourceLng ? [{ latitude: sourceLat, longitude: sourceLng }] : [] // Start point
    }, { transaction });

    // Update vehicle status
    await Vehicle.update({ 
      status: "active",
      driverAssignedId: driverId
    }, {
      where: { id: vehicle.id },
      transaction
    });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Trip started successfully",
      trip: newTrip,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Start Trip Error:", error);
    res.status(500).json({ success: false, message: "Failed to start trip" });
  }
};

// ─── End Trip ─────────────────────────────
exports.endTrip = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { tripId, finalMetrics } = req.body;

    const trip = await Trip.findOne({ 
      where: { 
        tripId, 
        driverId: req.user.id 
      } 
    });

    if (!trip) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Trip not found or unauthorized",
      });
    }

    await Trip.update({
      status: "completed",
      endTime: new Date(),
      distanceTravelled: finalMetrics.distance,
      duration: finalMetrics.duration,
      averageSpeed: finalMetrics.averageSpeed,
      maxSpeed: finalMetrics.maxSpeed
    }, {
      where: { id: trip.id },
      transaction
    });

    // Set vehicle to idle
    await Vehicle.update(
      { status: "idle" },
      { where: { id: trip.vehicleId }, transaction }
    );

    await transaction.commit();
    const updatedTrip = await Trip.findByPk(trip.id);

    res.status(200).json({
      success: true,
      message: "Trip completed successfully",
      trip: updatedTrip,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: "Failed to end trip" });
  }
};

// ─── Get Trip History (Driver) ────────────
exports.getDriverTripHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows: trips } = await Trip.findAndCountAll({
      where: { driverId: req.user.id },
      include: [
        {
          model: Vehicle,
          attributes: ["vehicleId", "name", "type"]
        }
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset
    });

    res.status(200).json({
      success: true,
      trips,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
};

// ─── Get Trip Details ─────────────────────
exports.getTripDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findOne({
      where: { id },
      include: [
        {
          model: Vehicle,
          attributes: ["vehicleId", "name", "type"]
        },
        {
          model: User,
          attributes: ["firstName", "lastName", "phone"]
        }
      ]
    });

    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    res.status(200).json({
      success: true,
      trip,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
