const redis = require('redis');
const { REDIS_HOST, REDIS_PORT }  = process.env;

const redisClient = redis.createClient({
  host: REDIS_HOST, 
  port: REDIS_PORT
});

redisClient.on('connect', () => {
  console.log(`Connected to Redis on port ${redisClient.options.port}`);
});

redisClient.on('error', (error) => {
  console.error('Error connecting to Redis:', error);
});



(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
