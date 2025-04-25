const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/serverConfig.js");
const redisClient = require("../services/redis.service.js");
const crypto = require("crypto");

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const validatePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateJWT = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

const getFromRedis = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Redis GET error:", err);
    return null;
  }
};

const setInRedis = async (key, value, ttlInSeconds = 3600) => {
  try {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlInSeconds);
  } catch (err) {
    console.error("Redis SET error:", err);
  }
};

const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = {
  hashPassword,
  validatePassword,
  generateJWT,
  getFromRedis,
  setInRedis,
  generateToken
};