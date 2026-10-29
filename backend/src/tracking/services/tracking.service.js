const { getRedisClient, isRedisConnected } = require("../../config/redis");
const { Vehicle, Driver, Trip, TripHistory, User, Alert } = require("../../index/index.model");

/**
 * Enterprise Fleet Tracking & Stoppage Analytics Service
 * High-throughput in-memory telemetry, automated trip stoppage detection (>60s),
 * live driver tracking, geospatial proximity queries, and fail-safe database persistence.
 */

// Key generators for clean tenant isolation in Redis
const keys = {
  vehicleTelemetry: (orgId, vehicleId) => `fleet:${orgId}:vehicle:${vehicleId}:telemetry`,
  driverTelemetry: (orgId, driverId) => `fleet:${orgId}:driver:${driverId}:telemetry`,
  geoVehicles: (orgId) => `fleet:${orgId}:geo:vehicles`,
  geoDrivers: (orgId) => `fleet:${orgId}:geo:drivers`,
  activeVehicles: (orgId) => `fleet:${orgId}:active:vehicles`,
  activeDrivers: (orgId) => `fleet:${orgId}:active:drivers`,
  heartbeat: (orgId, vehicleId) => `fleet:${orgId}:heartbeat:${vehicleId}`,
  tripTrail: (tripId) => `fleet:trip:${tripId}:trail`,

  // Stoppage Analytics Keys
  stopCandidate: (tripId) => `fleet:trip:${tripId}:stop_candidate`,
  activeStop: (tripId) => `fleet:trip:${tripId}:active_stop`,
  tripStops: (tripId) => `fleet:trip:${tripId}:stops`,
  orgActiveStops: (orgId) => `fleet:${orgId}:active_stops`,
};

// Configuration thresholds
const HEARTBEAT_TTL = 120; // 2 minutes before marking vehicle offline
const MAX_TRAIL_POINTS = 1000;
const OVERSPEED_THRESHOLD = 90; // km/h
const SPEED_STOP_THRESHOLD = 2.0; // km/h (speed under 2 km/h considered stationary)
const SPEED_MOVE_THRESHOLD = 5.0; // km/h (speed above 5 km/h considered moving again)
const STOP_MIN_DURATION_SECONDS = 60; // 60 seconds minimum to qualify as an official stop

/**
 * Formats seconds into human-readable duration (e.g., "3m 42s" or "1h 12m 5s")
 */
const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "0s";
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

/**
 * Validates GPS coordinate inputs
 */
const isValidCoordinate = (lat, lng) => {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Trip Stoppage State Machine
 * Automatically detects when a driver stops in between a trip for > 60 seconds.
 * Actively monitors how long the driver remains stopped, and when movement resumes,
 * records the exact stopped location, time, and duration.
 */
const processTripStoppage = async ({
  organizationId,
  tripId,
  driverId,
  vehicleId,
  speed,
  latitude,
  longitude,
  address,
  nowMs,
  isoTime,
}) => {
  if (!tripId) {
    return {
      isStopped: false,
      movementState: speed < SPEED_STOP_THRESHOLD ? "idle" : "moving",
    };
  }

  const redis = getRedisClient();
  const hasRedis = isRedisConnected();
  if (!hasRedis) {
    return { isStopped: false, movementState: "moving" };
  }

  try {
    const candidateKey = keys.stopCandidate(tripId);
    const activeStopKey = keys.activeStop(tripId);
    const tripStopsKey = keys.tripStops(tripId);
    const orgActiveStopsKey = keys.orgActiveStops(organizationId);

    // ─── Case 1: Driver is Stationary (Speed < 2 km/h) ───
    if (speed < SPEED_STOP_THRESHOLD) {
      const candidateRaw = await redis.get(candidateKey);

      if (!candidateRaw) {
        // Vehicle just became stationary: record candidate start time
        const candidateData = {
          startedAt: nowMs,
          isoStartedAt: isoTime,
          latitude,
          longitude,
          address: address || "",
          tripId: String(tripId),
          driverId: driverId ? String(driverId) : "",
          vehicleId: vehicleId ? String(vehicleId) : "",
        };
        await redis.set(candidateKey, JSON.stringify(candidateData), "EX", 86400);

        return {
          isStopped: false,
          movementState: "stationary",
          candidateElapsedSeconds: 0,
        };
      }

      // Candidate exists: evaluate stationary duration
      const candidate = JSON.parse(candidateRaw);
      const elapsedSeconds = Math.floor((nowMs - candidate.startedAt) / 1000);

      // Has the vehicle been stationary for at least 60 seconds?
      if (elapsedSeconds >= STOP_MIN_DURATION_SECONDS) {
        const activeStopRaw = await redis.get(activeStopKey);

        if (!activeStopRaw) {
          // 🚨 TRANSITION INTO ACTIVE STOP: exceeded 60 seconds threshold
          const stopId = `STOP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
          const stopRecord = {
            stopId,
            tripId: String(tripId),
            driverId: driverId ? String(driverId) : candidate.driverId || "",
            vehicleId: vehicleId ? String(vehicleId) : candidate.vehicleId || "",
            organizationId: String(organizationId),
            startedAtMs: candidate.startedAt,
            stoppedAt: candidate.isoStartedAt,
            latitude: candidate.latitude,
            longitude: candidate.longitude,
            address: candidate.address || address || "",
          };

          await redis.set(activeStopKey, JSON.stringify(stopRecord), "EX", 172800);
          await redis.sadd(orgActiveStopsKey, String(tripId));

          // Emit Real-Time Socket Event: Stop Detected
          try {
            const { getIO } = require("../../socket");
            const io = getIO();
            if (io) {
              const payload = {
                eventType: "STOP_DETECTED",
                stopId,
                tripId: String(tripId),
                driverId: driverId ? Number(driverId) : null,
                vehicleId: vehicleId || null,
                stoppedAt: candidate.isoStartedAt,
                durationSeconds: elapsedSeconds,
                durationFormatted: formatDuration(elapsedSeconds),
                location: {
                  latitude: candidate.latitude,
                  longitude: candidate.longitude,
                  address: candidate.address || address || null,
                },
                message: `Driver stopped for ${formatDuration(elapsedSeconds)} (exceeded 60s threshold)`,
                timestamp: isoTime,
              };

              io.to(`trip_${tripId}`).emit("trip:stoppage:detected", payload);
              io.emit("trip:stoppage:detected", payload);
              io.emit("driver:stopped", payload);
            }
          } catch (sockErr) {
            // Socket emission non-fatal
          }

          return {
            isStopped: true,
            movementState: "stopped",
            stopId,
            stoppedAt: candidate.isoStartedAt,
            durationSeconds: elapsedSeconds,
            durationFormatted: formatDuration(elapsedSeconds),
            location: {
              latitude: candidate.latitude,
              longitude: candidate.longitude,
              address: candidate.address || address || null,
            },
          };
        }

        // Active stop is ongoing: actively track duration counter
        const activeStop = JSON.parse(activeStopRaw);
        const currentStopDuration = Math.floor((nowMs - activeStop.startedAtMs) / 1000);

        // Emit live stop duration tick via Socket.io
        try {
          const { getIO } = require("../../socket");
          const io = getIO();
          if (io) {
            const tickPayload = {
              eventType: "STOP_TICK",
              stopId: activeStop.stopId,
              tripId: String(tripId),
              driverId: driverId ? Number(driverId) : null,
              vehicleId: vehicleId || null,
              stoppedAt: activeStop.stoppedAt,
              durationSeconds: currentStopDuration,
              durationFormatted: formatDuration(currentStopDuration),
              location: {
                latitude: activeStop.latitude,
                longitude: activeStop.longitude,
                address: activeStop.address || null,
              },
              timestamp: isoTime,
            };
            io.to(`trip_${tripId}`).emit("trip:stoppage:tick", tickPayload);
          }
        } catch (sockErr) {}

        return {
          isStopped: true,
          movementState: "stopped",
          stopId: activeStop.stopId,
          stoppedAt: activeStop.stoppedAt,
          durationSeconds: currentStopDuration,
          durationFormatted: formatDuration(currentStopDuration),
          location: {
            latitude: activeStop.latitude,
            longitude: activeStop.longitude,
            address: activeStop.address || null,
          },
        };
      }

      // Stationary but under 60 seconds (e.g. traffic light or brief halt)
      return {
        isStopped: false,
        movementState: "stationary",
        candidateElapsedSeconds: elapsedSeconds,
      };
    }

    // ─── Case 2: Driver Has Resumed Movement (Speed >= 5 km/h) ───
    if (speed >= SPEED_MOVE_THRESHOLD) {
      const activeStopRaw = await redis.get(activeStopKey);

      if (activeStopRaw) {
        // 🚀 STOP COMPLETED: Driver resumed trip after a registered stop (>60s)
        const activeStop = JSON.parse(activeStopRaw);
        const resumedAtMs = nowMs;
        const totalDurationSeconds = Math.max(60, Math.floor((resumedAtMs - activeStop.startedAtMs) / 1000));

        const completedStop = {
          stopId: activeStop.stopId,
          tripId: String(tripId),
          driverId: driverId ? Number(driverId) : null,
          vehicleId: vehicleId || null,
          stoppedAt: activeStop.stoppedAt,
          resumedAt: isoTime,
          durationSeconds: totalDurationSeconds,
          durationFormatted: formatDuration(totalDurationSeconds),
          location: {
            latitude: parseFloat(activeStop.latitude),
            longitude: parseFloat(activeStop.longitude),
            address: activeStop.address || null,
          },
          resumedLocation: {
            latitude,
            longitude,
            address: address || null,
          },
          resumedSpeed: speed,
        };

        // Store completed stop in Redis trip stops list
        await redis.rpush(tripStopsKey, JSON.stringify(completedStop));
        await redis.expire(tripStopsKey, 172800);

        // Clean up active stop and candidate state
        await redis.del(activeStopKey);
        await redis.del(candidateKey);
        await redis.srem(orgActiveStopsKey, String(tripId));

        // Asynchronously update MySQL Trip model
        setImmediate(async () => {
          try {
            const trip = await Trip.findOne({
              where: {
                [require("sequelize").Op.or]: [
                  { tripId },
                  { id: isNaN(tripId) ? null : Number(tripId) },
                ].filter(Boolean),
              },
            });
            if (trip) {
              const existingStops = Array.isArray(trip.stops) ? [...trip.stops] : [];
              existingStops.push(completedStop);
              const totalStopTime = (trip.totalStopTime || 0) + totalDurationSeconds;
              await trip.update({ stops: existingStops, totalStopTime });
            }
          } catch (dbErr) {
            console.error("⚠️ [Async DB Stop Sync Error]:", dbErr.message);
          }
        });

        // Emit Real-Time Socket Event: Driver Resumed
        try {
          const { getIO } = require("../../socket");
          const io = getIO();
          if (io) {
            const resumedPayload = {
              eventType: "STOP_RESUMED",
              ...completedStop,
              message: `Driver resumed trip after ${completedStop.durationFormatted} stop`,
              timestamp: isoTime,
            };
            io.to(`trip_${tripId}`).emit("trip:stoppage:resumed", resumedPayload);
            io.emit("trip:stoppage:resumed", resumedPayload);
            io.emit("driver:resumed", resumedPayload);
          }
        } catch (sockErr) {}

        return {
          isStopped: false,
          movementState: "moving",
          justCompletedStop: completedStop,
        };
      }

      // No active stop existed (was stationary <60s, e.g. stop sign): clear candidate
      await redis.del(candidateKey);
      return {
        isStopped: false,
        movementState: "moving",
      };
    }

    // Intermediate speed (2.0 to 4.9 km/h): preserve existing state to prevent jitter
    return {
      isStopped: false,
      movementState: speed > 0 ? "moving" : "idle",
    };
  } catch (error) {
    console.error("⚠️ [Stoppage Engine Error]:", error.message);
    return { isStopped: false, movementState: "moving" };
  }
};

/**
 * Ingest telemetry update for a vehicle and/or driver
 * Pipelined across Redis Hash, GEO set, Sorted Set, Trip Trail, and Stoppage Engine.
 */
const recordTelemetry = async (telemetry) => {
  const {
    organizationId,
    vehicleId,
    driverId,
    tripId,
    latitude,
    longitude,
    speed = 0,
    heading = 0,
    battery = 100,
    address = null,
  } = telemetry;

  const numLat = parseFloat(latitude);
  const numLng = parseFloat(longitude);
  const numSpeed = Math.max(0, parseFloat(speed) || 0);
  const numHeading = parseFloat(heading) || 0;
  const numBattery = Math.min(100, Math.max(0, parseFloat(battery) || 100));
  const now = new Date();
  const timestampMs = now.getTime();
  const isoTime = now.toISOString();

  if (!isValidCoordinate(numLat, numLng)) {
    throw new Error("Invalid GPS coordinates. Latitude must be -90..90 and Longitude -180..180.");
  }

  // ─── Stoppage Analytics Processing ───
  const stoppageInfo = await processTripStoppage({
    organizationId,
    tripId,
    driverId,
    vehicleId,
    speed: numSpeed,
    latitude: numLat,
    longitude: numLng,
    address,
    nowMs: timestampMs,
    isoTime,
  });

  // Movement state determination
  let status = "active";
  if (stoppageInfo.isStopped) {
    status = "stopped";
  } else if (numSpeed === 0) {
    status = "idle";
  }

  const redis = getRedisClient();
  const hasRedis = isRedisConnected();

  // ─── 1. Write to Redis (High-speed in-memory pipeline) ───
  if (hasRedis) {
    try {
      const pipeline = redis.pipeline();

      // Vehicle telemetry & Geospatial index
      if (vehicleId) {
        const vKey = keys.vehicleTelemetry(organizationId, vehicleId);
        pipeline.hset(vKey, {
          vehicleId: String(vehicleId),
          driverId: driverId ? String(driverId) : "",
          tripId: tripId ? String(tripId) : "",
          organizationId: String(organizationId),
          latitude: numLat,
          longitude: numLng,
          speed: numSpeed,
          heading: numHeading,
          battery: numBattery,
          status,
          isStopped: stoppageInfo.isStopped ? "true" : "false",
          address: address || "",
          lastSeen: isoTime,
          updatedAt: timestampMs,
        });

        pipeline.expire(vKey, 86400);
        pipeline.geoadd(keys.geoVehicles(organizationId), numLng, numLat, String(vehicleId));
        pipeline.zadd(keys.activeVehicles(organizationId), timestampMs, String(vehicleId));
        pipeline.setex(keys.heartbeat(organizationId, vehicleId), HEARTBEAT_TTL, "online");
      }

      // Driver telemetry & Geospatial index
      if (driverId) {
        const dKey = keys.driverTelemetry(organizationId, driverId);
        pipeline.hset(dKey, {
          driverId: String(driverId),
          vehicleId: vehicleId ? String(vehicleId) : "",
          tripId: tripId ? String(tripId) : "",
          organizationId: String(organizationId),
          latitude: numLat,
          longitude: numLng,
          speed: numSpeed,
          heading: numHeading,
          status,
          isStopped: stoppageInfo.isStopped ? "true" : "false",
          movementState: stoppageInfo.movementState || "moving",
          currentStopDuration: stoppageInfo.durationSeconds ? String(stoppageInfo.durationSeconds) : "0",
          isLoggedIn: "true",
          address: address || "",
          lastSeen: isoTime,
          updatedAt: timestampMs,
        });

        pipeline.expire(dKey, 86400);
        pipeline.geoadd(keys.geoDrivers(organizationId), numLng, numLat, String(driverId));
        pipeline.zadd(keys.activeDrivers(organizationId), timestampMs, String(driverId));
      }

      // Active Trip breadcrumb trail (Redis List)
      if (tripId) {
        const trailKey = keys.tripTrail(tripId);
        const pointData = JSON.stringify({
          latitude: numLat,
          longitude: numLng,
          speed: numSpeed,
          heading: numHeading,
          isStopped: stoppageInfo.isStopped,
          timestamp: isoTime,
        });
        pipeline.rpush(trailKey, pointData);
        pipeline.ltrim(trailKey, -MAX_TRAIL_POINTS, -1);
        pipeline.expire(trailKey, 172800);
      }

      await pipeline.exec();
    } catch (redisErr) {
      console.error("⚠️ [Redis Tracking Pipeline Error]:", redisErr.message);
    }
  }

  // ─── 2. Overspeed Alert Detection ───
  if (numSpeed > OVERSPEED_THRESHOLD && vehicleId) {
    try {
      const alertCooldownKey = `fleet:${organizationId}:alert:cooldown:${vehicleId}:overspeed`;
      const isCooldown = hasRedis ? await redis.get(alertCooldownKey) : null;
      if (!isCooldown) {
        if (hasRedis) await redis.setex(alertCooldownKey, 300, "1");
        Alert.create({
          organizationId,
          vehicleId: String(vehicleId),
          type: "overspeed",
          severity: numSpeed > OVERSPEED_THRESHOLD + 20 ? "critical" : "high",
          message: `Vehicle exceeded speed threshold (${numSpeed} km/h recorded)`,
          status: "active",
        }).catch((err) => console.error("Alert create error:", err.message));
      }
    } catch (e) {}
  }

  // ─── 3. Asynchronous Database Persistence ───
  setImmediate(async () => {
    try {
      if (vehicleId) {
        await Vehicle.update(
          {
            locationLat: numLat,
            locationLng: numLng,
            speed: numSpeed,
            status: stoppageInfo.isStopped ? "occupied" : status,
            battery: numBattery,
            lastSeen: now,
            ...(address ? { locationAddress: address } : {}),
          },
          { where: { id: vehicleId }, validate: false }
        );
      }

      if (driverId) {
        await Driver.update(
          {
            currentLat: numLat,
            currentLng: numLng,
            currentSpeed: numSpeed,
            heading: numHeading,
            isLoggedIn: true,
            lastLocationUpdate: now,
            ...(address ? { locationAddress: address } : {}),
          },
          { where: { userId: driverId }, validate: false }
        );
      }

      if (tripId) {
        const trip = await Trip.findOne({
          where: {
            [require("sequelize").Op.or]: [
              { tripId },
              { id: isNaN(tripId) ? null : Number(tripId) },
            ].filter(Boolean),
          },
        });
        if (trip && trip.status === "ongoing") {
          const currentPath = Array.isArray(trip.path) ? [...trip.path] : [];
          currentPath.push({
            latitude: numLat,
            longitude: numLng,
            speed: numSpeed,
            heading: numHeading,
            isStopped: stoppageInfo.isStopped,
            timestamp: now,
          });
          await trip.update({ path: currentPath });
        }
      }
    } catch (dbErr) {
      console.error("⚠️ [Async DB Telemetry Sync Error]:", dbErr.message);
    }
  });

  return {
    success: true,
    status,
    timestamp: isoTime,
    coordinates: { latitude: numLat, longitude: numLng },
    speed: numSpeed,
    heading: numHeading,
    stoppage: stoppageInfo,
  };
};

/**
 * Fetch All Logged-in Drivers with Full Continuous Telemetry & Live Stoppage
 * Specifically tailored for real-time fleet map & driver tracking table.
 * Returns driver details, vehicle, live coordinates, speed, heading, active trip,
 * and live stoppage timer (>60s) directly from Redis with SQL backing.
 */
const getLoggedInDriversWithTelemetry = async (organizationId) => {
  if (!organizationId) {
    return { count: 0, drivers: [] };
  }

  const redis = getRedisClient();
  const hasRedis = isRedisConnected();
  const nowMs = Date.now();

  // 1. Fetch all logged-in drivers from relational DB
  const drivers = await User.findAll({
    where: {
      organizationId,
      role: "driver",
    },
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Driver,
        as: "Driver",
        where: { isLoggedIn: true },
        required: true,
        include: [
          {
            model: Vehicle,
            as: "AssignedVehicle",
            attributes: [
              "id",
              "vehicleNumber",
              "name",
              "type",
              "status",
              "battery",
              "speed",
              "locationLat",
              "locationLng",
              "locationAddress",
              "lastSeen",
            ],
          },
        ],
      },
    ],
    order: [[{ model: Driver, as: "Driver" }, "lastLocationUpdate", "DESC"]],
  });

  if (!drivers || drivers.length === 0) {
    return { count: 0, drivers: [] };
  }

  // 2. Fetch active trips for all logged-in drivers
  const driverIds = drivers.map((d) => d.id);
  const activeTrips = await Trip.findAll({
    where: {
      driverId: driverIds,
      status: ["assigned", "ongoing"],
    },
    attributes: [
      "id",
      "tripId",
      "driverId",
      "vehicleId",
      "status",
      "sourceAddress",
      "destAddress",
      "sourceLat",
      "sourceLng",
      "destLat",
      "destLng",
      "startTime",
      "distanceTravelled",
      "tripType",
      "totalStopTime",
      "stops",
    ],
  });

  const tripByDriverId = {};
  activeTrips.forEach((t) => {
    tripByDriverId[t.driverId] = t;
  });

  // 3. Pipeline Redis for live telemetry & active stoppage state
  let redisDriverMap = {};
  let redisVehicleMap = {};
  let activeStopMap = {};

  if (hasRedis) {
    try {
      const pipeline = redis.pipeline();
      drivers.forEach((user) => {
        const d = user.Driver || {};
        const v = d.AssignedVehicle || {};
        const trip = tripByDriverId[user.id];

        pipeline.hgetall(keys.driverTelemetry(organizationId, user.id));
        if (v.id) {
          pipeline.hgetall(keys.vehicleTelemetry(organizationId, v.id));
          pipeline.get(keys.heartbeat(organizationId, v.id));
        } else {
          pipeline.ping();
          pipeline.ping();
        }

        if (trip && trip.tripId) {
          pipeline.get(keys.activeStop(trip.tripId));
        } else {
          pipeline.ping();
        }
      });

      const execResults = await pipeline.exec();
      let resIdx = 0;

      drivers.forEach((user) => {
        const [errD, dData] = execResults[resIdx++];
        const [errV, vData] = execResults[resIdx++];
        const [errHb, hb] = execResults[resIdx++];
        const [errStop, stopRaw] = execResults[resIdx++];

        if (!errD && dData && dData.driverId) {
          redisDriverMap[user.id] = dData;
        }

        const v = user.Driver?.AssignedVehicle;
        if (v && v.id && !errV && vData && vData.vehicleId) {
          redisVehicleMap[v.id] = { ...vData, isOnline: Boolean(hb) };
        }

        const trip = tripByDriverId[user.id];
        if (trip && !errStop && stopRaw && typeof stopRaw === "string" && stopRaw.startsWith("{")) {
          try {
            activeStopMap[trip.tripId] = JSON.parse(stopRaw);
          } catch (e) {}
        }
      });
    } catch (redisErr) {
      console.warn("⚠️ [Redis Logged-in Drivers Cache Read Warning]:", redisErr.message);
    }
  }

  // 4. Construct rich telematics responses
  const formattedDrivers = drivers.map((user) => {
    const d = user.Driver || {};
    const v = d.AssignedVehicle || {};
    const trip = tripByDriverId[user.id] || null;

    const rDriver = redisDriverMap[user.id] || null;
    const rVehicle = v.id ? redisVehicleMap[v.id] || null : null;
    const activeStop = trip ? activeStopMap[trip.tripId] || null : null;

    // Resolve coordinates (Redis in-memory優先)
    const lat = rDriver?.latitude !== undefined
      ? parseFloat(rDriver.latitude)
      : (d.currentLat || v.locationLat || null);

    const lng = rDriver?.longitude !== undefined
      ? parseFloat(rDriver.longitude)
      : (d.currentLng || v.locationLng || null);

    const speed = rDriver?.speed !== undefined
      ? parseFloat(rDriver.speed)
      : (d.currentSpeed !== undefined && d.currentSpeed !== null ? d.currentSpeed : (v.speed || 0));

    const heading = rDriver?.heading !== undefined
      ? parseFloat(rDriver.heading)
      : (d.heading || 0);

    const battery = rVehicle?.battery !== undefined
      ? parseFloat(rVehicle.battery)
      : (v.battery || 100);

    const address = rDriver?.address || d.locationAddress || v.locationAddress || null;
    const lastLocationUpdate = rDriver?.lastSeen || d.lastLocationUpdate || null;
    const isOnline = rVehicle?.isOnline !== undefined ? rVehicle.isOnline : Boolean(d.isLoggedIn);

    // Stoppage state calculation
    const isCurrentlyStopped = Boolean(activeStop);
    let currentStopDurationSeconds = 0;
    let currentStopDurationFormatted = "0s";
    let stopLocation = null;

    if (activeStop) {
      currentStopDurationSeconds = Math.max(60, Math.floor((nowMs - activeStop.startedAtMs) / 1000));
      currentStopDurationFormatted = formatDuration(currentStopDurationSeconds);
      stopLocation = {
        latitude: parseFloat(activeStop.latitude),
        longitude: parseFloat(activeStop.longitude),
        address: activeStop.address || null,
      };
    }

    // Movement state
    let movementState = "moving";
    if (isCurrentlyStopped) {
      movementState = "stopped";
    } else if (speed < SPEED_STOP_THRESHOLD) {
      movementState = "idle";
    }

    // Historical trip stops count
    const completedStopsCount = trip && Array.isArray(trip.stops) ? trip.stops.length : 0;
    const totalTripStopsCount = completedStopsCount + (isCurrentlyStopped ? 1 : 0);
    const totalTripStopTime = (trip?.totalStopTime || 0) + currentStopDurationSeconds;

    return {
      id: user.id,
      driverId: user.id,
      userId: user.id,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage || null,
      role: user.role,
      driverProfile: {
        id: d.id,
        driverType: d.driverType,
        licenseNumber: d.licenseNumber,
        licenseType: d.licenseType,
        vehicleCategories: d.vehicleCategories,
        occupiedStatus: d.occupiedStatus,
        isLoggedIn: d.isLoggedIn,
        lastLogin: d.lastLogin,
      },
      vehicle: v.id ? {
        id: v.id,
        vehicleNumber: v.vehicleNumber,
        name: v.name,
        type: v.type,
        status: v.status,
        battery,
      } : null,
      activeTrip: trip ? {
        id: trip.id,
        tripId: trip.tripId,
        status: trip.status,
        sourceAddress: trip.sourceAddress,
        destAddress: trip.destAddress,
        sourceCoordinates: [trip.sourceLng, trip.sourceLat],
        destCoordinates: [trip.destLng, trip.destLat],
        startTime: trip.startTime,
        distanceTravelled: trip.distanceTravelled,
        tripType: trip.tripType,
      } : null,
      telemetry: {
        latitude: lat,
        longitude: lng,
        speed,
        heading,
        battery,
        address,
        lastSeen: lastLocationUpdate,
        lastLocationUpdate,
        isOnline,
        movementState,
      },
      stoppage: {
        isCurrentlyStopped,
        stopId: activeStop?.stopId || null,
        stoppedSince: activeStop?.stoppedAt || null,
        currentStopDurationSeconds,
        currentStopDurationFormatted,
        stopLocation,
        totalTripStopsCount,
        totalTripStopTimeSeconds: totalTripStopTime,
        totalTripStopTimeFormatted: formatDuration(totalTripStopTime),
      },
    };
  });

  return {
    count: formattedDrivers.length,
    timestamp: new Date().toISOString(),
    drivers: formattedDrivers,
  };
};

/**
 * Fetch Continuous Telemetry for a Single Driver
 * Designed for dedicated live tracking views (e.g. TrackDriver.jsx)
 */
const getSingleDriverLiveTelemetry = async (organizationId, driverId) => {
  const allDrivers = await getLoggedInDriversWithTelemetry(organizationId);
  const match = allDrivers.drivers.find((d) => d.driverId === Number(driverId) || d.id === Number(driverId));
  if (match) return match;

  // Fallback to general DB record if driver is currently offline or logged out
  const user = await User.findOne({
    where: { id: driverId, organizationId, role: "driver" },
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Driver,
        as: "Driver",
        include: [{ model: Vehicle, as: "AssignedVehicle" }],
      },
    ],
  });

  if (!user) return null;

  const d = user.Driver || {};
  const v = d.AssignedVehicle || {};

  return {
    id: user.id,
    driverId: user.id,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage || null,
    role: user.role,
    driverProfile: {
      id: d.id,
      driverType: d.driverType,
      licenseNumber: d.licenseNumber,
      isLoggedIn: d.isLoggedIn,
      lastLogin: d.lastLogin,
    },
    vehicle: v.id ? {
      id: v.id,
      vehicleNumber: v.vehicleNumber,
      name: v.name,
      type: v.type,
      status: v.status,
      battery: v.battery || 100,
    } : null,
    activeTrip: null,
    telemetry: {
      latitude: d.currentLat || v.locationLat || null,
      longitude: d.currentLng || v.locationLng || null,
      speed: d.currentSpeed || 0,
      heading: d.heading || 0,
      battery: v.battery || 100,
      address: d.locationAddress || v.locationAddress || null,
      lastSeen: d.lastLocationUpdate,
      lastLocationUpdate: d.lastLocationUpdate,
      isOnline: false,
      movementState: "offline",
    },
    stoppage: {
      isCurrentlyStopped: false,
      stopId: null,
      stoppedSince: null,
      currentStopDurationSeconds: 0,
      currentStopDurationFormatted: "0s",
      stopLocation: null,
      totalTripStopsCount: 0,
      totalTripStopTimeSeconds: 0,
      totalTripStopTimeFormatted: "0s",
    },
  };
};

/**
 * Fetch all Stoppages for a Trip
 * Returns all historical completed stops plus any currently active stop (>60s)
 */
const getTripStoppages = async (tripId) => {
  const redis = getRedisClient();
  const hasRedis = isRedisConnected();
  const nowMs = Date.now();

  let completedStops = [];
  let activeStop = null;

  if (hasRedis) {
    try {
      // 1. Get completed stops from Redis list
      const rawStops = await redis.lrange(keys.tripStops(tripId), 0, -1);
      if (rawStops && rawStops.length > 0) {
        completedStops = rawStops.map((s) => {
          try {
            return JSON.parse(s);
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
      }

      // 2. Check for currently active stop
      const activeRaw = await redis.get(keys.activeStop(tripId));
      if (activeRaw) {
        activeStop = JSON.parse(activeRaw);
      }
    } catch (e) {
      console.warn("⚠️ [Redis Trip Stoppages Read Error]:", e.message);
    }
  }

  // Fallback to MySQL if Redis had no completed stops (e.g. cold start or completed trip)
  let tripRecord = null;
  if (completedStops.length === 0) {
    tripRecord = await Trip.findOne({
      where: {
        [require("sequelize").Op.or]: [
          { tripId },
          { id: isNaN(tripId) ? null : Number(tripId) },
        ].filter(Boolean),
      },
      attributes: ["id", "tripId", "status", "stops", "totalStopTime", "startTime", "endTime"],
    });

    if (tripRecord && Array.isArray(tripRecord.stops)) {
      completedStops = tripRecord.stops;
    }
  }

  // Compute live active stop duration
  let ongoingStopInfo = null;
  if (activeStop) {
    const elapsedSeconds = Math.max(60, Math.floor((nowMs - activeStop.startedAtMs) / 1000));
    ongoingStopInfo = {
      isCurrentlyStopped: true,
      stopId: activeStop.stopId,
      stoppedAt: activeStop.stoppedAt,
      currentDurationSeconds: elapsedSeconds,
      currentDurationFormatted: formatDuration(elapsedSeconds),
      location: {
        latitude: parseFloat(activeStop.latitude),
        longitude: parseFloat(activeStop.longitude),
        address: activeStop.address || null,
      },
    };
  }

  const completedDuration = completedStops.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  const totalDuration = completedDuration + (ongoingStopInfo ? ongoingStopInfo.currentDurationSeconds : 0);

  return {
    tripId,
    status: tripRecord?.status || (ongoingStopInfo ? "ongoing" : "active"),
    isCurrentlyStopped: Boolean(ongoingStopInfo),
    currentActiveStop: ongoingStopInfo,
    completedStopsCount: completedStops.length,
    totalStopsCount: completedStops.length + (ongoingStopInfo ? 1 : 0),
    totalStopTimeSeconds: totalDuration,
    totalStopTimeFormatted: formatDuration(totalDuration),
    completedStops,
  };
};

/**
 * Fetch only the active stoppage for a trip (if driver is currently stopped >60s)
 */
const getActiveTripStoppage = async (tripId) => {
  const redis = getRedisClient();
  const hasRedis = isRedisConnected();
  if (!hasRedis) return { isCurrentlyStopped: false };

  const activeRaw = await redis.get(keys.activeStop(tripId));
  if (!activeRaw) return { isCurrentlyStopped: false };

  const activeStop = JSON.parse(activeRaw);
  const elapsedSeconds = Math.max(60, Math.floor((Date.now() - activeStop.startedAtMs) / 1000));

  return {
    isCurrentlyStopped: true,
    tripId,
    stopId: activeStop.stopId,
    driverId: activeStop.driverId ? Number(activeStop.driverId) : null,
    vehicleId: activeStop.vehicleId || null,
    stoppedAt: activeStop.stoppedAt,
    elapsedSeconds,
    elapsedFormatted: formatDuration(elapsedSeconds),
    location: {
      latitude: parseFloat(activeStop.latitude),
      longitude: parseFloat(activeStop.longitude),
      address: activeStop.address || null,
    },
  };
};

/**
 * Fetch all currently active stops across the entire organization
 * Allows dispatchers to see every driver halted for >60s in one view.
 */
const getOrganizationActiveStops = async (organizationId) => {
  const redis = getRedisClient();
  const hasRedis = isRedisConnected();
  if (!hasRedis) return { count: 0, stops: [] };

  const activeTripIds = await redis.smembers(keys.orgActiveStops(organizationId));
  if (!activeTripIds || activeTripIds.length === 0) {
    return { count: 0, stops: [] };
  }

  const pipeline = redis.pipeline();
  activeTripIds.forEach((tId) => {
    pipeline.get(keys.activeStop(tId));
  });

  const results = await pipeline.exec();
  const nowMs = Date.now();
  const activeStops = [];

  for (let i = 0; i < results.length; i++) {
    const [err, stopRaw] = results[i];
    if (!err && stopRaw) {
      try {
        const stop = JSON.parse(stopRaw);
        const elapsedSeconds = Math.max(60, Math.floor((nowMs - stop.startedAtMs) / 1000));
        activeStops.push({
          stopId: stop.stopId,
          tripId: stop.tripId,
          driverId: stop.driverId ? Number(stop.driverId) : null,
          vehicleId: stop.vehicleId || null,
          stoppedAt: stop.stoppedAt,
          durationSeconds: elapsedSeconds,
          durationFormatted: formatDuration(elapsedSeconds),
          location: {
            latitude: parseFloat(stop.latitude),
            longitude: parseFloat(stop.longitude),
            address: stop.address || null,
          },
        });
      } catch (e) {}
    }
  }

  return {
    organizationId,
    count: activeStops.length,
    timestamp: new Date().toISOString(),
    stops: activeStops,
  };
};

/**
 * Fetch Live Trip Status & Telemetry Summary
 */
const getTripLiveStatus = async (tripId) => {
  const trip = await Trip.findOne({
    where: {
      [require("sequelize").Op.or]: [
        { tripId },
        { id: isNaN(tripId) ? null : Number(tripId) },
      ].filter(Boolean),
    },
    include: [
      { model: Vehicle, attributes: ["id", "vehicleNumber", "name", "type", "speed", "locationLat", "locationLng"] },
      { model: User, attributes: ["id", "firstName", "lastName", "phone"] },
    ],
  });

  if (!trip) return null;

  // Stoppage details
  const stoppage = await getTripStoppages(trip.tripId);
  // Live breadcrumbs from Redis
  const trail = await getTripLiveTrail(trip.tripId);

  return {
    tripId: trip.tripId,
    id: trip.id,
    status: trip.status,
    driver: trip.User ? {
      id: trip.User.id,
      name: `${trip.User.firstName || ""} ${trip.User.lastName || ""}`.trim(),
      phone: trip.User.phone,
    } : null,
    vehicle: trip.Vehicle ? {
      id: trip.Vehicle.id,
      vehicleNumber: trip.Vehicle.vehicleNumber,
      name: trip.Vehicle.name,
      type: trip.Vehicle.type,
    } : null,
    source: {
      address: trip.sourceAddress,
      coordinates: [trip.sourceLng, trip.sourceLat],
    },
    destination: {
      address: trip.destAddress,
      coordinates: [trip.destLng, trip.destLat],
    },
    startTime: trip.startTime,
    distanceTravelled: trip.distanceTravelled,
    stoppageSummary: {
      isCurrentlyStopped: stoppage.isCurrentlyStopped,
      currentActiveStop: stoppage.currentActiveStop,
      totalStopsCount: stoppage.totalStopsCount,
      totalStopTimeFormatted: stoppage.totalStopTimeFormatted,
    },
    recentTrailCount: trail?.pointCount || 0,
    recentTrail: trail?.trail ? trail.trail.slice(-50) : [],
  };
};

/**
 * Get live fleet tracking for an organization
 */
const getOrganizationLiveFleet = async (organizationId) => {
  const redis = getRedisClient();
  const hasRedis = isRedisConnected();

  if (hasRedis) {
    try {
      const activeIds = await redis.zrevrange(keys.activeVehicles(organizationId), 0, -1);

      if (activeIds && activeIds.length > 0) {
        const pipeline = redis.pipeline();
        activeIds.forEach((vId) => {
          pipeline.hgetall(keys.vehicleTelemetry(organizationId, vId));
          pipeline.get(keys.heartbeat(organizationId, vId));
        });

        const results = await pipeline.exec();
        const vehicles = [];

        for (let i = 0; i < results.length; i += 2) {
          const [err1, telemetryData] = results[i];
          const [err2, heartbeatStatus] = results[i + 1];

          if (!err1 && telemetryData && telemetryData.vehicleId) {
            const isOnline = Boolean(heartbeatStatus);
            vehicles.push({
              vehicleId: telemetryData.vehicleId,
              id: telemetryData.vehicleId,
              driverId: telemetryData.driverId ? Number(telemetryData.driverId) : null,
              tripId: telemetryData.tripId || null,
              latitude: parseFloat(telemetryData.latitude),
              longitude: parseFloat(telemetryData.longitude),
              speed: parseFloat(telemetryData.speed) || 0,
              heading: parseFloat(telemetryData.heading) || 0,
              battery: parseFloat(telemetryData.battery) || 100,
              status: isOnline ? (telemetryData.status || "active") : "offline",
              address: telemetryData.address || null,
              lastSeen: telemetryData.lastSeen,
              isOnline,
            });
          }
        }

        if (vehicles.length > 0) {
          return {
            source: "redis",
            count: vehicles.length,
            vehicles,
          };
        }
      }
    } catch (redisErr) {
      console.warn("⚠️ [Redis Live Fleet Read Warning]:", redisErr.message);
    }
  }

  // Database Fallback & Cache Warming
  if (!organizationId) {
    return { source: "database", count: 0, vehicles: [] };
  }

  const dbVehicles = await Vehicle.findAll({
    where: { organizationId },
    attributes: [
      "id",
      "vehicleNumber",
      "name",
      "type",
      "status",
      "speed",
      "battery",
      "locationLat",
      "locationLng",
      "locationAddress",
      "lastSeen",
      "driverAssignedId",
    ],
  });

  const formatted = dbVehicles.map((v) => ({
    vehicleId: v.id,
    id: v.id,
    vehicleNumber: v.vehicleNumber,
    name: v.name,
    type: v.type,
    driverId: v.driverAssignedId,
    latitude: v.locationLat,
    longitude: v.locationLng,
    speed: v.speed || 0,
    heading: 0,
    battery: v.battery || 100,
    status: v.status || "offline",
    address: v.locationAddress,
    lastSeen: v.lastSeen ? v.lastSeen.toISOString() : null,
    isOnline: v.status === "active",
  }));

  // Warm Redis cache asynchronously
  if (hasRedis && formatted.length > 0) {
    setImmediate(async () => {
      try {
        const pipeline = redis.pipeline();
        formatted.forEach((v) => {
          if (isValidCoordinate(v.latitude, v.longitude)) {
            const vKey = keys.vehicleTelemetry(organizationId, v.vehicleId);
            pipeline.hset(vKey, {
              vehicleId: String(v.vehicleId),
              driverId: v.driverId ? String(v.driverId) : "",
              organizationId: String(organizationId),
              latitude: v.latitude,
              longitude: v.longitude,
              speed: v.speed,
              heading: 0,
              battery: v.battery,
              status: v.status,
              address: v.address || "",
              lastSeen: v.lastSeen || new Date().toISOString(),
              updatedAt: Date.now(),
            });
            pipeline.expire(vKey, 86400);
            pipeline.geoadd(keys.geoVehicles(organizationId), v.longitude, v.latitude, String(v.vehicleId));
            pipeline.zadd(keys.activeVehicles(organizationId), Date.now(), String(v.vehicleId));
          }
        });
        await pipeline.exec();
      } catch (err) {}
    });
  }

  return {
    source: "database",
    count: formatted.length,
    vehicles: formatted,
  };
};

/**
 * Get real-time telemetry for a specific vehicle
 */
const getVehicleTelemetry = async (organizationId, vehicleId) => {
  const redis = getRedisClient();
  const hasRedis = isRedisConnected();

  if (hasRedis) {
    try {
      const vKey = keys.vehicleTelemetry(organizationId, vehicleId);
      const data = await redis.hgetall(vKey);
      if (data && data.vehicleId) {
        const isOnline = Boolean(await redis.get(keys.heartbeat(organizationId, vehicleId)));
        return {
          source: "redis",
          vehicle: {
            ...data,
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            speed: parseFloat(data.speed) || 0,
            heading: parseFloat(data.heading) || 0,
            battery: parseFloat(data.battery) || 100,
            status: isOnline ? (data.status || "active") : "offline",
            isOnline,
          },
        };
      }
    } catch (e) {
      console.warn("⚠️ [Redis Vehicle Telemetry Read Error]:", e.message);
    }
  }

  const vehicle = await Vehicle.findOne({
    where: { id: vehicleId, organizationId },
  });

  if (!vehicle) return null;

  return {
    source: "database",
    vehicle: {
      vehicleId: vehicle.id,
      id: vehicle.id,
      name: vehicle.name,
      type: vehicle.type,
      vehicleNumber: vehicle.vehicleNumber,
      driverId: vehicle.driverAssignedId,
      latitude: vehicle.locationLat,
      longitude: vehicle.locationLng,
      speed: vehicle.speed,
      status: vehicle.status,
      battery: vehicle.battery,
      address: vehicle.locationAddress,
      lastSeen: vehicle.lastSeen,
      isOnline: vehicle.status === "active",
    },
  };
};

/**
 * Get real-time telemetry for a specific driver
 */
const getDriverTelemetry = async (organizationId, driverId) => {
  return getSingleDriverLiveTelemetry(organizationId, driverId);
};

/**
 * Redis Geospatial Query: Find nearest vehicles within radius
 */
const findNearbyUnits = async (organizationId, { latitude, longitude, radiusKm = 10, unitType = "vehicles", limit = 20 }) => {
  const numLat = parseFloat(latitude);
  const numLng = parseFloat(longitude);
  const numRadius = Math.max(0.1, parseFloat(radiusKm) || 10);
  const numLimit = Math.min(100, parseInt(limit, 10) || 20);

  if (!isValidCoordinate(numLat, numLng)) {
    throw new Error("Valid numerical latitude and longitude are required.");
  }

  const redis = getRedisClient();
  const hasRedis = isRedisConnected();

  if (!hasRedis) {
    throw new Error("Geospatial index requires an active Redis instance.");
  }

  const geoKey = unitType === "drivers" ? keys.geoDrivers(organizationId) : keys.geoVehicles(organizationId);

  let rawResults = [];
  try {
    rawResults = await redis.geosearch(
      geoKey,
      "FROMLONLAT",
      numLng,
      numLat,
      "BYRADIUS",
      numRadius,
      "km",
      "WITHDIST",
      "WITHCOORD",
      "ASC",
      "COUNT",
      numLimit
    );
  } catch (geoSearchErr) {
    rawResults = await redis.georadius(
      geoKey,
      numLng,
      numLat,
      numRadius,
      "km",
      "WITHDIST",
      "WITHCOORD",
      "ASC",
      "COUNT",
      numLimit
    );
  }

  if (!rawResults || rawResults.length === 0) {
    return {
      query: { latitude: numLat, longitude: numLng, radiusKm: numRadius, unitType },
      count: 0,
      results: [],
    };
  }

  const pipeline = redis.pipeline();
  rawResults.forEach(([id]) => {
    if (unitType === "drivers") {
      pipeline.hgetall(keys.driverTelemetry(organizationId, id));
    } else {
      pipeline.hgetall(keys.vehicleTelemetry(organizationId, id));
      pipeline.get(keys.heartbeat(organizationId, id));
    }
  });

  const detailResults = await pipeline.exec();
  const nearbyUnits = [];

  let detailIdx = 0;
  for (let i = 0; i < rawResults.length; i++) {
    const [memberId, distanceKm, [memberLng, memberLat]] = rawResults[i];

    if (unitType === "drivers") {
      const [err, dData] = detailResults[detailIdx++];
      nearbyUnits.push({
        driverId: memberId,
        distanceKm: parseFloat(distanceKm),
        latitude: parseFloat(memberLat),
        longitude: parseFloat(memberLng),
        speed: dData?.speed ? parseFloat(dData.speed) : 0,
        heading: dData?.heading ? parseFloat(dData.heading) : 0,
        status: dData?.status || "active",
        vehicleId: dData?.vehicleId || null,
        address: dData?.address || null,
      });
    } else {
      const [err1, vData] = detailResults[detailIdx++];
      const [err2, heartbeat] = detailResults[detailIdx++];
      const isOnline = Boolean(heartbeat);

      nearbyUnits.push({
        vehicleId: memberId,
        id: memberId,
        distanceKm: parseFloat(distanceKm),
        latitude: parseFloat(memberLat),
        longitude: parseFloat(memberLng),
        speed: vData?.speed ? parseFloat(vData.speed) : 0,
        heading: vData?.heading ? parseFloat(vData.heading) : 0,
        battery: vData?.battery ? parseFloat(vData.battery) : 100,
        status: isOnline ? (vData?.status || "active") : "offline",
        isOnline,
        driverId: vData?.driverId || null,
        tripId: vData?.tripId || null,
        address: vData?.address || null,
      });
    }
  }

  return {
    query: { latitude: numLat, longitude: numLng, radiusKm: numRadius, unitType },
    count: nearbyUnits.length,
    results: nearbyUnits,
  };
};

/**
 * Get high-resolution live trip breadcrumb trail from Redis memory
 */
const getTripLiveTrail = async (tripId) => {
  const redis = getRedisClient();
  const hasRedis = isRedisConnected();

  if (hasRedis) {
    try {
      const trailKey = keys.tripTrail(tripId);
      const points = await redis.lrange(trailKey, 0, -1);
      if (points && points.length > 0) {
        const parsedTrail = points.map((p) => {
          try {
            return JSON.parse(p);
          } catch (e) {
            return null;
          }
        }).filter(Boolean);

        return {
          source: "redis",
          tripId,
          pointCount: parsedTrail.length,
          trail: parsedTrail,
        };
      }
    } catch (e) {
      console.warn("⚠️ [Redis Trip Trail Error]:", e.message);
    }
  }

  const trip = await Trip.findOne({
    where: {
      [require("sequelize").Op.or]: [
        { tripId },
        { id: isNaN(tripId) ? null : Number(tripId) },
      ].filter(Boolean),
    },
    attributes: ["tripId", "status", "path", "sourceLat", "sourceLng", "destLat", "destLng"],
  });

  if (!trip) return null;

  return {
    source: "database",
    tripId: trip.tripId,
    status: trip.status,
    pointCount: Array.isArray(trip.path) ? trip.path.length : 0,
    trail: trip.path || [],
  };
};

/**
 * Flush and finalize trip trail from Redis into MySQL
 */
const finalizeTripTrail = async (tripId) => {
  const redis = getRedisClient();
  const hasRedis = isRedisConnected();

  if (!hasRedis) return;

  try {
    const trailKey = keys.tripTrail(tripId);
    const points = await redis.lrange(trailKey, 0, -1);

    if (points && points.length > 0) {
      const parsedTrail = points.map((p) => {
        try {
          return JSON.parse(p);
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      const trip = await Trip.findOne({
        where: {
          [require("sequelize").Op.or]: [
            { tripId },
            { id: isNaN(tripId) ? null : Number(tripId) },
          ].filter(Boolean),
        },
      });

      if (trip) {
        await trip.update({ path: parsedTrail });
      }

      await redis.del(trailKey);
    }
  } catch (e) {
    console.error("⚠️ [Finalize Trip Trail Error]:", e.message);
  }
};

/**
 * Get tracking system health and real-time fleet metrics
 */
const getTrackingStats = async (organizationId) => {
  const redis = getRedisClient();
  const hasRedis = isRedisConnected();

  let redisInfo = {
    connected: hasRedis,
    status: redis ? redis.status : "disconnected",
    memoryUsed: "N/A",
    totalKeys: 0,
    pingMs: null,
  };

  if (hasRedis) {
    try {
      const t0 = Date.now();
      await redis.ping();
      redisInfo.pingMs = Date.now() - t0;

      const infoStr = await redis.info("memory");
      const memMatch = infoStr.match(/used_memory_human:(.+)/);
      if (memMatch) redisInfo.memoryUsed = memMatch[1].trim();

      const dbsize = await redis.dbsize();
      redisInfo.totalKeys = dbsize;
    } catch (e) {
      redisInfo.connected = false;
    }
  }

  let activeUnits = 0;
  let idleUnits = 0;
  let stoppedUnits = 0;
  let offlineUnits = 0;

  try {
    const driversData = await getLoggedInDriversWithTelemetry(organizationId);
    if (driversData && driversData.drivers) {
      driversData.drivers.forEach((d) => {
        if (!d.telemetry?.isOnline) offlineUnits++;
        else if (d.stoppage?.isCurrentlyStopped) stoppedUnits++;
        else if (d.telemetry?.speed > 0) activeUnits++;
        else idleUnits++;
      });
    }
  } catch (e) {}

  return {
    organizationId,
    timestamp: new Date().toISOString(),
    redis: redisInfo,
    telematics: {
      activeUnits,
      idleUnits,
      stoppedUnits,
      offlineUnits,
      totalTracked: activeUnits + idleUnits + stoppedUnits + offlineUnits,
    },
  };
};

/**
 * Record & Archive Trip History
 * Persists an immutable historical audit record with high/low speed, stops, duration, and GPS trail.
 * Automatically synchronizes with Redis in-memory breadcrumbs and MySQL Trip records.
 */
const recordTripHistory = async (tripData) => {
  const { Op } = require("sequelize");
  const { tripId, organizationId: explicitOrgId } = tripData;

  if (!tripId) {
    throw new Error("tripId is mandatory to record trip history.");
  }

  // 1. Look up existing active Trip if present
  const trip = await Trip.findOne({
    where: {
      [Op.or]: [{ tripId }, { id: isNaN(tripId) ? null : Number(tripId) }].filter(Boolean),
    },
    include: [
      { model: Vehicle, attributes: ["id", "vehicleNumber", "name", "type"] },
      { model: User, attributes: ["id", "firstName", "lastName", "phone"] },
    ],
  });

  const organizationId = explicitOrgId || trip?.organizationId;
  if (!organizationId) {
    throw new Error("organizationId could not be determined for trip history.");
  }

  // 2. Fetch path from Redis breadcrumbs or Trip record or input
  let path = tripData.path || trip?.path || [];
  if (!Array.isArray(path) || path.length === 0) {
    const redisTrail = await getTripLiveTrail(tripId);
    if (redisTrail && Array.isArray(redisTrail.trail)) {
      path = redisTrail.trail;
    }
  }

  // 3. Fetch stops from Trip or Redis stops list or input
  let stops = tripData.stops || trip?.stops || [];
  if (!Array.isArray(stops) || stops.length === 0) {
    const stoppages = await getTripStoppages(tripId);
    if (stoppages && Array.isArray(stoppages.completedStops)) {
      stops = stoppages.completedStops;
    }
  }

  // 4. Calculate Speed Telematics Metrics
  let speeds = [];
  if (Array.isArray(path) && path.length > 0) {
    speeds = path.map((p) => parseFloat(p.speed) || 0);
  }

  const maxSpeed = tripData.maxSpeed !== undefined
    ? parseFloat(tripData.maxSpeed)
    : (speeds.length > 0 ? Math.max(...speeds) : (trip?.maxSpeed || 0));

  const movingSpeeds = speeds.filter((s) => s >= 5);
  const minSpeed = tripData.minSpeed !== undefined
    ? parseFloat(tripData.minSpeed)
    : (movingSpeeds.length > 0 ? Math.min(...movingSpeeds) : 0);

  const averageSpeed = tripData.averageSpeed !== undefined
    ? parseFloat(tripData.averageSpeed)
    : (speeds.length > 0 ? Math.round((speeds.reduce((a, b) => a + b, 0) / speeds.length) * 10) / 10 : (trip?.averageSpeed || 0));

  const overspeedCount = tripData.overspeedCount !== undefined
    ? parseInt(tripData.overspeedCount, 10)
    : speeds.filter((s) => s > OVERSPEED_THRESHOLD).length;

  // 5. Calculate Timing and Stoppage Metrics
  const startTime = tripData.startTime ? new Date(tripData.startTime) : (trip?.startTime || new Date());
  const endTime = tripData.endTime ? new Date(tripData.endTime) : (trip?.endTime || new Date());
  const durationSeconds = tripData.durationSeconds !== undefined
    ? parseInt(tripData.durationSeconds, 10)
    : Math.max(0, Math.floor((new Date(endTime) - new Date(startTime)) / 1000));

  const durationFormatted = formatDuration(durationSeconds);

  const stopsCount = Array.isArray(stops) ? stops.length : 0;
  const totalStopTime = tripData.totalStopTime !== undefined
    ? parseFloat(tripData.totalStopTime)
    : stops.reduce((sum, s) => sum + (parseFloat(s.durationSeconds) || 0), 0);

  const totalStopTimeFormatted = formatDuration(totalStopTime);
  const movingDuration = Math.max(0, durationSeconds - totalStopTime);
  const movingDurationFormatted = formatDuration(movingDuration);

  // 6. Identity Snapshots
  const driverId = tripData.driverId || trip?.driverId || null;
  const user = trip?.User || null;
  const driverName = tripData.driverName || (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : null);
  const driverPhone = tripData.driverPhone || user?.phone || null;

  const vehicleId = tripData.vehicleId || trip?.vehicleId || null;
  const vehicle = trip?.Vehicle || null;
  const vehicleNumber = tripData.vehicleNumber || vehicle?.vehicleNumber || null;
  const vehicleName = tripData.vehicleName || vehicle?.name || null;
  const vehicleType = tripData.vehicleType || vehicle?.type || null;

  const distanceTravelled = tripData.distanceTravelled !== undefined
    ? parseFloat(tripData.distanceTravelled)
    : (trip?.distanceTravelled || 0);

  const historyId = tripData.historyId || `HIST-${tripId}-${Date.now()}`;

  // 7. Upsert into TripHistory table
  const existingHistory = await TripHistory.findOne({
    where: { tripId, organizationId },
  });

  const recordPayload = {
    historyId: existingHistory ? existingHistory.historyId : historyId,
    tripId: String(tripId),
    organizationId: String(organizationId),
    driverId: driverId ? Number(driverId) : null,
    driverName,
    driverPhone,
    vehicleId: vehicleId ? String(vehicleId) : null,
    vehicleNumber,
    vehicleName,
    vehicleType,
    sourceAddress: tripData.sourceAddress || trip?.sourceAddress || null,
    sourceLat: tripData.sourceLat !== undefined ? parseFloat(tripData.sourceLat) : trip?.sourceLat || null,
    sourceLng: tripData.sourceLng !== undefined ? parseFloat(tripData.sourceLng) : trip?.sourceLng || null,
    destAddress: tripData.destAddress || trip?.destAddress || null,
    destLat: tripData.destLat !== undefined ? parseFloat(tripData.destLat) : trip?.destLat || null,
    destLng: tripData.destLng !== undefined ? parseFloat(tripData.destLng) : trip?.destLng || null,
    startTime,
    endTime,
    durationSeconds,
    durationFormatted,
    distanceTravelled,
    maxSpeed,
    minSpeed,
    averageSpeed,
    stopsCount,
    totalStopTime,
    totalStopTimeFormatted,
    movingDuration,
    movingDurationFormatted,
    stops,
    path,
    overspeedCount,
    status: tripData.status || trip?.status || "completed",
    tripType: tripData.tripType || trip?.tripType || "one-way",
    metadata: tripData.metadata || null,
  };

  let savedHistory;
  if (existingHistory) {
    savedHistory = await existingHistory.update(recordPayload);
  } else {
    savedHistory = await TripHistory.create(recordPayload);
  }

  return savedHistory;
};

/**
 * Query All Trip Histories for an Organization with Flexible Filters
 */
const getTripHistoryList = async (organizationId, filters = {}) => {
  const { Op } = require("sequelize");
  const {
    page = 1,
    limit = 20,
    driverId,
    vehicleId,
    tripId,
    status,
    startDate,
    endDate,
    search,
  } = filters;

  const numPage = Math.max(1, parseInt(page, 10) || 1);
  const numLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const offset = (numPage - 1) * numLimit;

  const whereConditions = { organizationId };

  if (driverId) {
    whereConditions.driverId = Number(driverId);
  }

  if (vehicleId) {
    whereConditions.vehicleId = String(vehicleId);
  }

  if (tripId) {
    whereConditions.tripId = String(tripId);
  }

  if (status) {
    whereConditions.status = status;
  }

  if (startDate || endDate) {
    whereConditions.startTime = {};
    if (startDate) whereConditions.startTime[Op.gte] = new Date(startDate);
    if (endDate) whereConditions.startTime[Op.lte] = new Date(endDate);
  }

  if (search) {
    whereConditions[Op.or] = [
      { tripId: { [Op.like]: `%${search}%` } },
      { driverName: { [Op.like]: `%${search}%` } },
      { vehicleNumber: { [Op.like]: `%${search}%` } },
      { sourceAddress: { [Op.like]: `%${search}%` } },
      { destAddress: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await TripHistory.findAndCountAll({
    where: whereConditions,
    order: [["createdAt", "DESC"]],
    limit: numLimit,
    offset,
  });

  return {
    totalRecords: count,
    totalPages: Math.ceil(count / numLimit),
    currentPage: numPage,
    limit: numLimit,
    data: rows,
  };
};

/**
 * Dedicated API Query: All Trip History for a Specific Driver
 */
const getTripHistoryByDriver = async (organizationId, driverId, filters = {}) => {
  const result = await getTripHistoryList(organizationId, { ...filters, driverId });

  // Calculate Driver Cumulative Performance Metrics
  let totalDistance = 0;
  let totalStops = 0;
  let totalStopTimeSec = 0;
  let maxSpeeds = [];

  result.data.forEach((t) => {
    totalDistance += (t.distanceTravelled || 0);
    totalStops += (t.stopsCount || 0);
    totalStopTimeSec += (t.totalStopTime || 0);
    if (t.maxSpeed > 0) maxSpeeds.push(t.maxSpeed);
  });

  const topSpeed = maxSpeeds.length > 0 ? Math.max(...maxSpeeds) : 0;
  const avgMaxSpeed = maxSpeeds.length > 0
    ? Math.round((maxSpeeds.reduce((a, b) => a + b, 0) / maxSpeeds.length) * 10) / 10
    : 0;

  return {
    driverId: Number(driverId),
    summary: {
      totalTripsCompleted: result.totalRecords,
      totalDistanceKm: Math.round(totalDistance * 10) / 10,
      totalStopsRecorded: totalStops,
      totalStopTimeFormatted: formatDuration(totalStopTimeSec),
      peakSpeedRecorded: topSpeed,
      averageMaxSpeed: avgMaxSpeed,
    },
    ...result,
  };
};

/**
 * Dedicated API Query: All Trip History for a Specific Vehicle
 */
const getTripHistoryByVehicle = async (organizationId, vehicleId, filters = {}) => {
  const result = await getTripHistoryList(organizationId, { ...filters, vehicleId });

  let totalDistance = 0;
  let totalStops = 0;

  result.data.forEach((t) => {
    totalDistance += (t.distanceTravelled || 0);
    totalStops += (t.stopsCount || 0);
  });

  return {
    vehicleId: String(vehicleId),
    summary: {
      totalTripsRecorded: result.totalRecords,
      totalDistanceKm: Math.round(totalDistance * 10) / 10,
      totalStopsRecorded: totalStops,
    },
    ...result,
  };
};

/**
 * Dedicated API Query: Detailed Single Trip History Audit by TripId
 */
const getTripHistoryById = async (organizationId, identifier) => {
  const { Op } = require("sequelize");

  const history = await TripHistory.findOne({
    where: {
      organizationId,
      [Op.or]: [
        { tripId: identifier },
        { historyId: identifier },
        { id: isNaN(identifier) ? null : Number(identifier) },
      ].filter(Boolean),
    },
  });

  return history;
};

module.exports = {
  recordTelemetry,
  processTripStoppage,
  getLoggedInDriversWithTelemetry,
  getSingleDriverLiveTelemetry,
  getTripStoppages,
  getActiveTripStoppage,
  getOrganizationActiveStops,
  getTripLiveStatus,
  getOrganizationLiveFleet,
  getVehicleTelemetry,
  getDriverTelemetry,
  findNearbyUnits,
  getTripLiveTrail,
  finalizeTripTrail,
  getTrackingStats,
  isValidCoordinate,
  formatDuration,
  // Trip History exports
  recordTripHistory,
  getTripHistoryList,
  getTripHistoryByDriver,
  getTripHistoryByVehicle,
  getTripHistoryById,
};
