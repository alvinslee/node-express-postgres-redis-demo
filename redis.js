const { createClient } = require('redis');
const redisAuthString = (process.env.REDIS_USER && process.end.REDIS_PASSWORD) ? `${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@` : '';
const redisClient = createClient({
  url: `redis://${redisAuthString}${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

module.exports = redisClient;
