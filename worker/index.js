const keys = require('./keys');

// Redis Client Setup
// https://redis.io/docs/latest/develop/clients/nodejs/
const { createClient } = require('redis');

const redisClient = createClient({
  url: `redis://${keys.redisHost}:${keys.redisPort}`,
  socket: {
    reconnectStrategy: (retries) => {
      // Generate a random jitter between 0 – 200 ms:
      const jitter = Math.floor(Math.random() * 200);

      // Delay is an exponential back off, (times^2) * 50 ms, with a
      // maximum value of 2000 ms:
      const delay = Math.min(Math.pow(2, retries) * 50, 2000);

      return delay + jitter;
    },
  },
});

// Function to simulate Fibonacci calculation
function fib(index) {
  if (index <= 2) return 1;

  let prev = 1;
  let next = 1;
  for (let i = 3; i <= index; i++) {
    const temp = next;
    next = prev + next;
    prev = temp;
  }

  return next;
}

// Redis Subscriber Setup (duplicate instance to handle subscriptions)
const redisSubscriber = redisClient.duplicate();

(async () => {
  // Connect Redis Client
  await redisClient
    .connect()
    .then(() => console.log('Connected to Redis'))
    .catch((err) => console.error('Redis connection error:', err));

  await redisSubscriber
    .connect()
    .then(() => console.log('Connected to Redis subscriber'))
    .catch((err) => console.error('Redis connection error:', err));

  // Subscribe to the 'insert' channel
  redisSubscriber.subscribe('insert', async (message, channel) => {
    console.log('Received message:', message);
    console.log('Channel:', channel);

    try {
      const index = parseInt(message);

      if (isNaN(index)) {
        console.error('Received invalid index:', message);
        return;
      }

      // Check if the Fibonacci value is already stored
      const existingValue = await redisClient.hGet('values', index.toString());

      if (existingValue !== null) {
        console.log(`Index ${index} already calculated. Skipping.`);
        return;
      }

      // Calculate the Fibonacci number for the received index
      const fibValue = fib(index);

      console.log(`Calculated Fibonacci for index ${index}: ${fibValue}`);

      // Store the Fibonacci result in Redis
      redisClient
        .hSet('values', index.toString(), fibValue.toString())
        .then(() => {
          console.log(`Stored Fibonacci value for index ${index}: ${fibValue}`);
        })
        .catch((err) => {
          console.error('Error storing Fibonacci result in Redis:', err);
        });
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });
})();

// Handling messages from the subscribed channel
redisSubscriber.on('message', (channel, message) => {
  console.log(`Received message on channel ${channel}: ${message}`);
  try {
    // Process the message, assuming it's an index
    const index = parseInt(message);
    if (isNaN(index)) {
      console.error('Invalid index received:', message);
      return;
    }
    // Store the computed Fibonacci value in Redis
    redisClient.hSet('values', message, fib(index));
  } catch (err) {
    console.error('Error processing message:', err);
  }
});
