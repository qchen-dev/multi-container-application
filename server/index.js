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
const { createClient } = require('redis');

const redisClient = createClient({
  // host: keys.redisHost,
  // port: keys.redisPort,
  // retry_strategy: () => 1000,
  url: `redis://${keys.redisHost}:${keys.redisPort}`,
});

const redisPublisher = redisClient.duplicate();

// Connect Redis Client
redisClient
  .connect()
  .catch((err) => console.error('Redis connection error', err));

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
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  try {
    // Store in Redis
    await redisClient.hSet('values', index, 'Nothing yet!');
    // Publish the change in Redis
    redisPublisher.publish('insert', index);
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
