
const redisClient = require('../services/redis.service.js');
const logger = require('../utils/logger.js');

const CACHE_TTL = 3600;
const KEYS = {
  ALL_GALLERIES: "galleries:all",
  gallery: (id) => `gallery:${id}`
};

const handleCacheError = (error, operation) => {
  logger.error(`Redis ${operation} failed: ${error.message}`, { error });
};

const cacheUtil = {
  keys: KEYS,

  async getOrSet(key, fetchFn) {
    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        logger.debug(`Cache hit for ${key}`);
        return JSON.parse(cachedData);
      }
    } catch (error) {
      handleCacheError(error, "fetch");
    }

    const freshData = await fetchFn();
    
    try {
      await redisClient.set(key, JSON.stringify(freshData), "EX", CACHE_TTL);
      logger.debug(`Cache updated for ${key}`);
    } catch (error) {
      handleCacheError(error, "update");
    }

    return freshData;
  },

  async invalidate(keys) {
    try {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      const deleteCount = await redisClient.del(keysArray);
      logger.info(`Cache invalidation: Removed ${deleteCount} keys`, { keys: keysArray });
    } catch (error) {
      handleCacheError(error, "invalidation");
    }
  }
};

module.exports = cacheUtil;