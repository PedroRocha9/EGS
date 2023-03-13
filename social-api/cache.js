const amqp = require('amqplib');
const redis  = require('redis');
const { fetchFromTwitterApi } = require('./twitter');

const rabbitmqUrl = 'amqp://localhost'; // or replace with the URL of your RabbitMQ server
const queueName = 'cache_update';

const fetchFromCache = async (key, id, twitterQuery) => {
  const message = { key, id, twitterQuery };

  // First attempt to retrieve data from the cache
  try {
    const cachedResult = await redisClient.get(`${key}:${id}`);
    if (cachedResult && Object.keys(cachedResult).length > 2) {    
      publishMessage(message);    // Send message to broker to update cache
      
      console.log(`Cache hit! ${cachedResult}`);
      return cachedResult;
    }
  } catch (error) {
    console.error('Something happened to Redis', error);
  }
  
  // If the cache is empty or we fail reading it, default back to the API
  const twitterApiResult = await fetchFromTwitterApi(id, twitterQuery);
  let twitterApiResponse;

  // Finally, if you got any results, save the data back to the cache
  try {
    console.log('Cache miss!');

    if (key === "external_information") {
      twitterApiResponse = {
        twitter_name: twitterApiResult.name,
        twitter_username: twitterApiResult.username,
      };
    }
    
    if (key === "public_metrics") {
      twitterApiResponse = {
        followers_count: twitterApiResult.public_metrics.followers_count,
        following_count: twitterApiResult.public_metrics.following_count,
      };
    }

    publishMessage(message);    // Send message to broker to update cache
  } catch (error) {
    console.error('Something happened to Redis', error);
  }

  return JSON.stringify(twitterApiResponse);
};

const updateCache = async (message, channel) => {
  const content = message.content.toString();
  let parsedMessage = JSON.parse(content);

  // Extract information from the message
  const { key, id, twitterQuery } = parsedMessage;

  // Get the updated data from the Twitter API
  const twitterApiResult = await fetchFromTwitterApi(id, twitterQuery);
  let twitterApiResponse;

  // Finally, if you got any results, save the data back to the cache
  try {
    if (key === "external_information") {
      twitterApiResponse = {
        twitter_name: twitterApiResult.name,
        twitter_username: twitterApiResult.username,
      };
    }
    
    if (key === "public_metrics") {
      twitterApiResponse = {
        followers_count: twitterApiResult.public_metrics.followers_count,
        following_count: twitterApiResult.public_metrics.following_count,
      };
    }

    console.log(`Cache updated in broker with value ${JSON.stringify(twitterApiResponse)}`);

    await redisClient.set(`${key}:${id}`, JSON.stringify(twitterApiResponse));
  } catch (error) {
    console.error('Something happened to Redis', error);
  }

  // Acknowledge message
  channel.ack(message);
};

const startConsumer = async () => {
  // Connect to RabbitMQ
  const connection = await amqp.connect(rabbitmqUrl);
  const channel = await connection.createChannel();

  // Declare queue
  await channel.assertQueue(queueName, { durable: true });

  // Consume messages from the queue
  channel.consume(queueName, (message) => {    
    updateCache(message, channel);
  });
};

const publishMessage = async (message) => {
  // Connect to RabbitMQ
  const connection = await amqp.connect(rabbitmqUrl);
  const channel = await connection.createChannel();

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
};

const redisClient = redis.createClient();
(async () => {
  redisClient.on("error", (error) => console.error(`Ups : ${error}`));
  await redisClient.connect();
})();

// Start consuming messages from the queue
startConsumer();

module.exports = { publishMessage, fetchFromCache };