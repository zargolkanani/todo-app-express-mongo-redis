require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testMongo() {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  const db = client.db('test_db');
  const col = db.collection('perf_todos');

  console.log('Testing MongoDB Atlas (1000 items)...');

  const data = { title: 'todo item' };

  // Insert 1000 items
  let start = Date.now();
  for (let i = 0; i < 1000; i++) {
    await col.insertOne(data);
  }
  let end = Date.now();
  console.log('MongoDB Insert Time:', end - start, 'ms');

  // Read 1000 items
  start = Date.now();
  await col.find({}).toArray();
  end = Date.now();
  console.log('MongoDB Read Time:', end - start, 'ms');

  await client.close();
}

testMongo().catch((e) => console.error(e));
