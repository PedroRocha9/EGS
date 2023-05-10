const { periodicUpdateCacheFromAPI } = require('./cache');
const Queue = require('bull');
const logger = require('./logger');

// Connect to the same Redis instance
const redisConfig = { redis: { port: 6379, host: 'redis' } };
const periodicQueue = new Queue('periodicQueue', redisConfig);

const startWorker = () => {
  logger.info(`[WORKER] Worker started`);
  console.log('Started bull worker');
  
  periodicQueue.process(async (job) => {
    logger.info(`[WORKER] Consumed periodic update queue process`);
    console.log('Consumed periodic update queue process');
    //periodicUpdateCacheFromAPI(job.data); 
  });
};

module.exports = { startWorker };
