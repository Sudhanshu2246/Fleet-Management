const { Trip, Vehicle, User } = require("../../index/index.model");
const { sequelize } = require("../../config/db");
const { generateTripId } = require("../../utils/generateTripId");

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
          attributes: ["id", "name", "type", "vehicleNumber"]
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
    console.error("Get Trip Details Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─── Admin Create Trip (Scheduled Booking) ────────
exports.createAdminTrip = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      tripType,
      vehicleTypeRequired,
      sourceAddress,
      sourceLat,
      sourceLng,
      destAddress,
      destLat,
      destLng,
      startTime,
      returnDate,
      multiCityLegs
    } = req.body;

    const organizationId = req.user.organizationId || req.user.organization;

    const tripIdString = await generateTripId(organizationId, vehicleTypeRequired, tripType, transaction);

    const newTrip = await Trip.create({
      tripId: tripIdString,
      organizationId: organizationId,
      vehicleId: null,
      driverId: null,
      coPilotName: null,
      coPilotPhone: null,
      sourceAddress: sourceAddress || "",
      sourceLat: sourceLat || null,
      sourceLng: sourceLng || null,
      destAddress: destAddress || "",
      destLat: destLat || null,
      destLng: destLng || null,
      status: "scheduled",
      startTime: startTime ? new Date(startTime) : new Date(),
      tripType: tripType || "one-way",
      vehicleTypeRequired: vehicleTypeRequired || null,
      returnDate: returnDate ? new Date(returnDate) : null,
      multiCityLegs: multiCityLegs || null
    }, { transaction });

    await transaction.commit();

    // Fetch complete trip with associations
    const completeTrip = await Trip.findOne({
      where: { id: newTrip.id },
      include: [
        { model: Vehicle, attributes: ["id", "name", "type", "vehicleNumber"] },
        { model: User, attributes: ["firstName", "lastName", "phone"] }
      ]
    });

    res.status(201).json({
      success: true,
      message: "Trip booking created successfully",
      trip: completeTrip,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error("Admin Create Trip Error:", error);
    res.status(500).json({ success: false, message: "Failed to create trip booking", error: error.message });
  }
};

// ─── Get All Trips (Admin) ──────────────
exports.getAllTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const organizationId = req.user.organizationId || req.user.organization;

    const { count, rows: trips } = await Trip.findAndCountAll({
      where: { organizationId },
      include: [
        {
          model: Vehicle,
          attributes: ["id", "name", "type", "vehicleNumber"]
        },
        {
          model: User,
          attributes: ["firstName", "lastName", "phone"]
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
      totalTrips: count
    });
  } catch (error) {
    console.error("Get All Trips Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch trips" });
  }
};

// ─── Update Trip Status ───────────────────
exports.updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'scheduled', 'assigned', 'ongoing', 'completed', 'cancelled'

    if (!["scheduled", "assigned", "ongoing", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const trip = await Trip.findByPk(id);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    trip.status = status;
    if (status === "completed") {
      trip.endTime = new Date();
    }
    await trip.save();

    res.status(200).json({
      success: true,
      message: "Trip status updated successfully",
      trip
    });
  } catch (error) {
    console.error("Update Trip Status Error:", error);
    res.status(500).json({ success: false, message: "Failed to update trip status" });
  }
};

// ─── Delete Trip ─────────────────────────
exports.deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findByPk(id);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    await trip.destroy();

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully"
    });
  } catch (error) {
    console.error("Delete Trip Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete trip" });
  }
};

// ─── Update Trip Details ─────────────────
exports.updateTripDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tripType,
      vehicleTypeRequired,
      sourceAddress,
      sourceLat,
      sourceLng,
      destAddress,
      destLat,
      destLng,
      startTime,
      returnDate,
      multiCityLegs
    } = req.body;

    const trip = await Trip.findByPk(id);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    if (tripType !== undefined) trip.tripType = tripType;
    if (vehicleTypeRequired !== undefined) trip.vehicleTypeRequired = vehicleTypeRequired;
    if (sourceAddress !== undefined) trip.sourceAddress = sourceAddress;
    if (sourceLat !== undefined) trip.sourceLat = sourceLat;
    if (sourceLng !== undefined) trip.sourceLng = sourceLng;
    if (destAddress !== undefined) trip.destAddress = destAddress;
    if (destLat !== undefined) trip.destLat = destLat;
    if (destLng !== undefined) trip.destLng = destLng;
    if (startTime !== undefined) trip.startTime = new Date(startTime);
    if (returnDate !== undefined) trip.returnDate = returnDate ? new Date(returnDate) : null;
    if (multiCityLegs !== undefined) trip.multiCityLegs = multiCityLegs;

    await trip.save();

    // Fetch complete trip with associations
    const completeTrip = await Trip.findOne({
      where: { id: trip.id },
      include: [
        { model: require("../../index/index.model").Vehicle, attributes: ["id", "name", "type", "vehicleNumber"] },
        { model: require("../../index/index.model").User, attributes: ["firstName", "lastName", "phone"] }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Trip details updated successfully",
      trip: completeTrip
    });
  } catch (error) {
    console.error("Update Trip Details Error:", error);
    res.status(500).json({ success: false, message: "Failed to update trip details" });
  }
};
