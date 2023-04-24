const amqp = require('amqplib');
const Queue = require('bull');
const redis  = require('redis');
const { fetchFromTwitter } = require('./twitter');

// const rabbitmqUrl = 'amqp://localhost';
const rabbitmqUrl = 'amqp://rabbitmq_service';
const updateQueue = 'cache_update';
const setQueue = 'cache_set';


// Fetch information from the redis cache
const fetchFromCache = async (key, id, twitterQuery, next_token) => {
  const message = { key, id, twitterQuery, next_token };

  // First attempt to retrieve data from the cache
  try {
    let cachedResult;
    // Check if next_token is undefined
    if (next_token === undefined) {
      cachedResult = await redisClient.get(`${key}:${id}`);
    } else {
      cachedResult = await redisClient.get(`${key}:${id}:${next_token}`);
    }
    
    if (cachedResult && Object.keys(cachedResult).length > 2) {    
      publishMessage(message, updateQueue);             // Send message to broker to update cache
      
      console.log(`Cache hit!`);
      return cachedResult;
    }
  } catch (error) {
    console.error('Something happened to Redis', error);
  }
  
  // If the cache didn't have the value, default back to the API
  console.log(`Cache miss!`);
  const twitterApiResponse = await fetchFromTwitter(key, id, twitterQuery, next_token);
  publishMessage({ key, id, twitterApiResponse, next_token }, setQueue);                    // Send message to broker to set the cache
  delete twitterApiResponse.current_token;

  return JSON.stringify(twitterApiResponse);
};

// Delete information from the redis cache
const deleteFromCache = async (id) => {
  try {
    const keys = await redisClient.keys(`*:${id}*`);
    await redisClient.del(keys);
    console.log(`Cache deleted for user ${id}`);
  } catch (error) {
    console.error('Something happened to Redis when deleting keys ', error);
  }
};

// Update the cache using up-to-date information from the Twitter API
const updateCacheFromAPI = async (message, channel) => {
  // Extract information from the message
  const { key, id, twitterQuery, next_token } = JSON.parse(message.content.toString());
  
  try {
    // Get the updated data from the Twitter API
    const twitterApiResponse = await fetchFromTwitter(key, id, twitterQuery, next_token);

    if (next_token === undefined) {
      await redisClient.set(`${key}:${id}`, JSON.stringify(twitterApiResponse));
    } else {
      await redisClient.set(`${key}:${id}:${next_token}`, JSON.stringify(twitterApiResponse));
    }
    console.log(`Cache updated in broker`);
  } catch (error) {
    console.error('Redis had an error while updating the cache', error);
  }
  
  periodicQueue.add({ key, id, twitterQuery, next_token }, {
    // WATCHOUT FOR RATE LIMIT
    repeat: {
      every: 30000,     // Every 30 seconds
      limit: 2          // 2q time
    }
  });

  // Acknowledge message
  channel.ack(message);
};

// Set the cache with already fetched information from the Twitter API
const updateCacheWithValue = async (message, channel) => {
  // Extract information from the message
  const { key, id, twitterApiResponse, next_token } = JSON.parse(message.content.toString());

  try {
    if (next_token === undefined) {
      await redisClient.set(`${key}:${id}`, JSON.stringify(twitterApiResponse));
    } else {
      await redisClient.set(`${key}:${id}:${next_token}`, JSON.stringify(twitterApiResponse));
    }
  } catch (error) {
    console.error('Redis had an error while setting the cache with values', error);
  }

  // Acknowledge message
  channel.ack(message);
};

// Update the cache using up-to-date information from the Twitter API periodically
const periodicUpdateCacheFromAPI = async (data) => {
  // Extract information from the message
  const { key, id, twitterQuery, next_token } = data;
  
  try {
    // Get the updated data from the Twitter API
    const twitterApiResponse = await fetchFromTwitter(key, id, twitterQuery, next_token);

    if (next_token === undefined) {
      await redisClient.set(`${key}:${id}`, JSON.stringify(twitterApiResponse));
    } else {
      await redisClient.set(`${key}:${id}:${next_token}`, JSON.stringify(twitterApiResponse));
    }
    console.log(`Cache updated in broker`);
  } catch (error) {
    console.error('Redis had an error while updating the cache', error);
  }
};


/* Message Broker definitions */
// Producer function
const publishMessage = async (message, queueName) => {
  try {
    // Connect to RabbitMQ
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();

    // Declare queue
    await channel.assertQueue(queueName, { durable: true });

    // Send message to queue
    const jsonMessage = JSON.stringify(message);
    channel.sendToQueue(queueName, Buffer.from(jsonMessage), { persistent: true });

    // Close connection and channel
    setTimeout(() => {
      channel.close();
      connection.close();
    }, 500);
  } catch(error) {
    console.error('RabbitMQ had an error publishing the message', error);
  }
};

// Consumer function
const startConsumer = async () => {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    
		// Queue for user triggered updates (cache hit)
		await channel.assertQueue(updateQueue, { durable: true });
		// Queue for user triggered updates (cache miss)
		await channel.assertQueue(setQueue, { durable: true });
	
		channel.consume(updateQueue, (message) => {
			updateCacheFromAPI(message, channel);
		});

		channel.consume(setQueue, (message) => {
			updateCacheWithValue(message, channel);
		});
	} catch (error) {
		console.error('RabbitMQ had an error starting the consumer', error);
	}
};

/* Start the redis client and broker consumer */
const redisClient = redis.createClient({ url: 'redis://redis:6379' });
redisClient.on("error", (error) => console.error(`Ups : ${error}`));

let periodicQueue;
redisClient.connect().then(() => {
  periodicQueue = new Queue('periodicQueue', {
    defaultJobOptions: {
      timeout: 5000, // 5 seconds
    }
  });
}).catch((error) => {
  console.error('Redis had an error connecting to the broker', error);
});

startConsumer();

module.exports = { fetchFromCache, deleteFromCache, periodicUpdateCacheFromAPI };
