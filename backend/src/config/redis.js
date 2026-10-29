const Redis = require("ioredis");

const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD && process.env.REDIS_PASSWORD.trim() !== "" 
    ? process.env.REDIS_PASSWORD 
    : undefined,
  db: parseInt(process.env.REDIS_DB, 10) || 0,
  retryStrategy(times) {
    if (times > 10) {
      console.warn("⚠️ [Redis] Exceeded maximum connection retries (10). Retrying with 5s backoff.");
      return 5000;
    }
    const delay = Math.min(times * 200, 3000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
};

let redisClient = null;
let isConnected = false;

const initRedis = () => {
  if (redisClient) return redisClient;

  try {
    redisClient = new Redis(redisConfig);

    redisClient.on("connect", () => {
      console.log("🔌 [Redis] Connection initiated to " + redisConfig.host + ":" + redisConfig.port);
    });

    redisClient.on("ready", () => {
      isConnected = true;
      console.log("✅ [Redis] Connection established and ready to accept commands");
    });

    redisClient.on("error", (err) => {
      isConnected = false;
      console.error("❌ [Redis Error]:", err.message);
    });

    redisClient.on("close", () => {
      isConnected = false;
      console.warn("⚠️ [Redis] Connection closed");
    });

    redisClient.on("reconnecting", (delay) => {
      isConnected = false;
      console.log(`🔄 [Redis] Reconnecting in ${delay}ms...`);
    });

    return redisClient;
  } catch (error) {
    console.error("❌ [Redis Init Error]:", error.message);
    return null;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
};

const isRedisConnected = () => {
  return isConnected && redisClient && redisClient.status === "ready";
};

const disconnectRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log("🛑 [Redis] Client disconnected cleanly");
    } catch (e) {
      redisClient.disconnect();
    }
  }
};

module.exports = {
  initRedis,
  getRedisClient,
  isRedisConnected,
  disconnectRedis,
};
