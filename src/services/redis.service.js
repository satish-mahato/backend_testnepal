const Redis = require("ioredis");

const { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } = require("../config/serverConfig.js");

const redisClient = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
});

redisClient.on("connect", () => {
  console.log("Redis connected");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});

module.exports = redisClient;