const redisClient = require("../services/redis.service.js");
const { UserError, AuthenticationError } = require("./error.js");

const handleControllerError = (res, error) => {
  console.error(error.message);

  if (error instanceof UserError) {
    return res.status(400).json({ message: error.message });
  }
  if (error instanceof AuthenticationError) {
    return res.status(401).json({ error: error.message });
  }

  const response = { error: "Internal server error" };
  if (process.env.NODE_ENV === "development") {
    response.details = error.message;
  }
  return res.status(500).json(response);
};

const clearUserCache = async (userId) => {
  await Promise.all([
    redisClient.del(`user:profile:${userId}`),
    redisClient.del("all:users"),
  ]);
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  isVerified: user.isVerified,
  verificationToken: user.verificationToken,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

module.exports = {
  handleControllerError,
  clearUserCache,
  sanitizeUser
};