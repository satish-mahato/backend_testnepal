const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client.js');
const redisClient = require('../services/redis.service.js');
const { JWT_SECRET } = require('../config/serverConfig.js');

const authUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized: Token missing" });

    const isBlackListed = await redisClient.get(token);
    if (isBlackListed) return res.status(401).json({ error: "Unauthorized: Token blacklisted" });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, isAdmin: true }
    });

    if (!user) return res.status(401).json({ error: "User not found" });
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Unauthorized: Token expired" });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { authUser };