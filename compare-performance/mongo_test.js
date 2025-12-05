import dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';

async function testMongo() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined!');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB ✅');

    const db = client.db('todo_db');
    const todos = db.collection('todos');

    const doc = { title: 'Hello MongoDB', createdAt: new Date() };

    const startInsert = Date.now();
    const result = await todos.insertOne(doc);
    const endInsert = Date.now();

    console.log(`MongoDB INSERT time: ${endInsert - startInsert} ms | InsertedId: ${result.insertedId}`);

    const startFind = Date.now();
    const found = await todos.findOne({ _id: result.insertedId });
    const endFind = Date.now();

    console.log(`MongoDB FIND time: ${endFind - startFind} ms | Value: ${found.title}`);
  } catch (err) {
    console.error('MongoDB Error:', err);
  } finally {
    await client.close();
  }
}

testMongo();
