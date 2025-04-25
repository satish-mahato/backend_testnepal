const redisClient = require("../services/redis.service"); // Directly import the client you exported

/**
 * Clear cache entries by keys
 * @param {string[]} keys - Array of cache keys to clear
 */
const clearCache = async (keys = []) => {
  if (!redisClient || typeof redisClient.del !== "function") {
    console.warn("Redis client not available, skipping cache clearing");
    return;
  }

  try {
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Cleared cache keys: ${keys.join(", ")}`);
    }
  } catch (error) {
    console.error("Error clearing cache:", error);
    // Fail silently to not block the main operation
  }
};

/**
 * Clear all cached products data
 */
const clearProductsCache = async () => {
  await clearCache(["products:all"]);
};

/**
 * Clear cache for specific product
 * @param {string} productId - Product ID to clear cache for
 */
const clearProductCache = async (productId) => {
  await clearCache([`product:${productId}`, "products:all"]);
};

module.exports = {
  clearCache,
  clearProductsCache,
  clearProductCache,
};