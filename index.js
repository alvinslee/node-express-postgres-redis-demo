require('dotenv').config();

const PORT = process.env.PORT || 8000;

const express = require('express')
const app = new express()

const psqlClient = require('./psql.js');
const redisClient = require('./redis.js');
const REDIS_KEY = 'countries';

app.get('/countries', async (req, res) => {
  try {
    let source;
    let data = await queryCache();
    if (data) {
      source = 'cache';
    } else {
      data = await queryDatabase();
      await writeCache(data);
      source = 'database';
    }
    res.status(200).send({ source, data });
  } catch (e) {
    res.status(500).send(e);
  }
});

app.post('/clear_cache', async (req, res) => {
  try {
    await clearCache();
    res.status(200).send('OK');
  } catch (e) {
    res.status(500).send(e);
  }
});

app.listen(PORT, () => console.log(`listening on ${PORT}...`));

const queryDatabase = async () => {
  psqlClient.connect();
  const sql = "SELECT name from countries order by name";
  const result = await psqlClient.query(sql);
  return result.rows.map(row => row['name']);
}

const queryCache = async () => {
  await redisClient.connect();
  const stringData = await redisClient.get(REDIS_KEY);
console.log(stringData);
console.log(typeof stringData);
  await redisClient.disconnect();
  return stringData ? JSON.parse(stringData) : null;
}

const writeCache = async (data) => {
  await redisClient.connect();
  await redisClient.set(REDIS_KEY, JSON.stringify(data));
  await redisClient.disconnect();
}

const clearCache = async () => {
  await redisClient.connect();
  await redisClient.del(REDIS_KEY);
  await redisClient.disconnect();
}

