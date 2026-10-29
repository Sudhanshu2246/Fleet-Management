const { Server } = require("socket.io");
const { Trip, Vehicle } = require("./index/index.model");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join room for specific trip or vehicle
    socket.on("join:trip", (tripId) => {
      socket.join(`trip_${tripId}`);
      console.log(`Socket ${socket.id} joined trip_${tripId}`);
    });

    // Real-time location updates from Driver App or WebSocket client
    socket.on("location:update", async (data) => {
      const { tripId, latitude, longitude, speed = 0, heading = 0, vehicleId, driverId, battery = 100, address } = data;

      try {
        let organizationId = data.organizationId;
        if (!organizationId && vehicleId) {
          const v = await Vehicle.findByPk(vehicleId, { attributes: ["organizationId"] });
          if (v) organizationId = v.organizationId;
        }

        // If organization is resolved, ingest into high-speed Redis tracking pipeline
        if (organizationId) {
          const { recordTelemetry } = require("./tracking/services/tracking.service");
          recordTelemetry({
            organizationId,
            vehicleId,
            driverId,
            tripId,
            latitude,
            longitude,
            speed,
            heading,
            battery,
            address,
          }).catch((err) => console.warn("Socket Redis tracking ingest warning:", err.message));
        } else {
          // Direct fallback if organizationId cannot be resolved
          if (tripId) {
            const trip = await Trip.findOne({
              where: {
                [require("sequelize").Op.or]: [{ tripId }, { id: isNaN(tripId) ? null : Number(tripId) }].filter(Boolean),
              },
            });
            if (trip) {
              const currentPath = Array.isArray(trip.path) ? [...trip.path] : [];
              currentPath.push({ latitude, longitude, speed, heading, timestamp: new Date() });
              await trip.update({ path: currentPath });
            }
          }

          if (vehicleId) {
            await Vehicle.update(
              {
                locationLat: latitude,
                locationLng: longitude,
                speed,
                lastSeen: new Date(),
                status: "active",
              },
              { where: { id: vehicleId } }
            );
          }
        }

        // Broadcast to all listeners in the trip room
        if (tripId) {
          io.to(`trip_${tripId}`).emit("location:changed", {
            tripId,
            latitude,
            longitude,
            speed,
            heading,
          });
        }

        // Broadcast to general fleet listeners (e.g., LiveFleetMap or TrackDriver page)
        io.emit("driver:location:changed", {
          driverId,
          vehicleId,
          organizationId,
          latitude,
          longitude,
          speed,
          heading,
          battery,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Socket location update error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };
