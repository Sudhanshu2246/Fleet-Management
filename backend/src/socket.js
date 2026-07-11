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

    // Real-time location updates from Driver App
    socket.on("location:update", async (data) => {
      const { tripId, latitude, longitude, speed, heading, vehicleId } = data;

      try {
        // Update Trip Path in DB
        await Trip.findOneAndUpdate(
          { tripId },
          {
            $push: {
              path: {
                latitude,
                longitude,
                speed,
                timestamp: new Date(),
              },
            },
          }
        );

        // Update Vehicle Real-time Status
        await Vehicle.findOneAndUpdate(
          { vehicleId },
          {
            location: {
              lat: latitude,
              lng: longitude,
            },
            speed,
            lastSeen: new Date(),
          }
        );

        // Broadcast to all listeners in the trip room (e.g., Admin Dashboard)
        io.to(`trip_${tripId}`).emit("location:changed", {
          tripId,
          latitude,
          longitude,
          speed,
          heading,
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
