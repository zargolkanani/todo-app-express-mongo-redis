require('dotenv').config();
const { createClient } = require('redis');

async function testRedis() {
  const client = createClient({ url: process.env.REDIS_URL });
  await client.connect();

  console.log('Testing Redis (1000 items)...');

  const data = { title: 'todo item' };

  // Insert 1000 items
  let start = Date.now();
  for (let i = 0; i < 1000; i++) {
    await client.set(`perf:todo:${i}`, JSON.stringify(data));
  }
  let end = Date.now();
  console.log('Redis Insert Time:', end - start, 'ms');

  // Read 1000 items
  start = Date.now();
  for (let i = 0; i < 1000; i++) {
    await client.get(`perf:todo:${i}`);
  }
  end = Date.now();
  console.log('Redis Read Time:', end - start, 'ms');

  await client.quit();
}

testRedis().catch((e) => console.error(e));
