const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require('pg');

const postgresClient = new Pool({
  user: keys.postgresUser,
  host: keys.postgresHost,
  database: keys.postgresDatabase,
  password: keys.postgresPassword,
  port: keys.postgresPort,
  ssl:
    process.env.NODE_ENV !== 'production'
      ? false
      : { rejectUnauthorized: false },
});

postgresClient.on('connect', (client) => {
  client
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.error(err));
});

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

const redisPublisher = redisClient.duplicate();

(async () => {
  // Connect Redis Client
  await redisClient
    .connect()
    .then(() => console.log('Redis Client connected'))
    .catch((err) => console.error('Redis Client connection error', err));

  redisClient.on('error', (err) => {
    console.error('Redis error occurred:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis connected');
  });

  redisClient.on('end', () => {
    console.error('Redis client disconnected unexpectedly');
  });

  await redisPublisher
    .connect()
    .then(() => console.log('Redis Publisher connected'))
    .catch((err) => console.error('Redis Publisher not connected ERROR', err));
})();

// Express route handlers
app.get('/', (req, res) => {
  res.send('Hi');
});

app.get('/values/all', async (req, res) => {
  try {
    const result = await postgresClient.query('SELECT * from values');
    res.send(result.rows);
  } catch (err) {
    console.error('Error fetching values:', err);
    res.status(500).send('Error fetching values');
  }
});

app.get('/values/current', async (req, res) => {
  try {
    const values = await redisClient.hGetAll('values');
    res.send(values);
  } catch (err) {
    console.error('Error fetching values from Redis:', err);
    res.status(500).send('Error fetching values from Redis');
  }
});

app.post('/values', async (req, res) => {
  console.log('visit /values', req.body);
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  try {
    // Check if Redis is connected
    if (!redisClient.isOpen) {
      throw new Error('Redis client is not connected');
    }

    // Ensure the Redis publisher is connected before publishing
    if (redisPublisher.isReady && redisPublisher.isOpen) {
      // Ensure index is a string before publishing to Redis
      await redisPublisher.publish('insert', String(index)); // Convert index to a string
    } else {
      console.error('Redis Publisher is not ready or open');
      throw new Error('Redis Publisher is not connected');
    }

    // Insert into PostgreSQL
    await postgresClient.query('INSERT INTO values(number) VALUES($1)', [
      index,
    ]);

    res.send({ working: true });
  } catch (err) {
    console.error('Error processing POST request:', err);
    res.status(500).send('Error processing the request');
  }
});

app.listen(5000, () => {
  console.log('Listening on port 5000');
});
