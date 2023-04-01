const { periodicUpdateCacheFromAPI } = require('./cache');
const Queue = require('bull');
const periodicQueue = new Queue('periodicQueue');


const startWorker = () => {
  console.log('Started bull worker');
  
  periodicQueue.process(async (job) => {
    console.log('Consumed periodic update queue process');
    // console.log(job.data);
    periodicUpdateCacheFromAPI(job.data); 
  });
};

module.exports = { startWorker };
