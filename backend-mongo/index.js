require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mongo client
const client = new MongoClient(process.env.MONGODB_URI, {
  // options left default
});
let db;

async function start() {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME || 'todo_db');
    console.log('Connected to MongoDB Atlas');
    app.listen(port, () => console.log(`Mongo app running on port ${port}`));
  } catch (err) {
    console.error('Mongo connection error:', err);
    process.exit(1);
  }
}

// CREATE
app.post('/todos', async (req, res) => {
  try {
    const title = req.body.title || req.body.text;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const result = await db.collection('todos').insertOne({
      title,
      completed: false,
      createdAt: new Date()
    });

    res.json({ success: true, data: { _id: result.insertedId, title, completed: false } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// READ ALL
app.get('/todos', async (req, res) => {
  try {
    const todos = await db.collection('todos').find().toArray();
    res.json({ success: true, data: todos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE (edit fields or toggle)
app.put('/todos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { title, completed } = req.body;

    const update = {};
    if (typeof title === 'string') update.title = title;
    if (typeof completed === 'boolean') update.completed = completed;

    // if no body, toggle completed
    if (Object.keys(update).length === 0) {
      const doc = await db.collection('todos').findOne({ _id: new ObjectId(id) });
      if (!doc) return res.status(404).json({ error: 'Todo not found' });
      update.completed = !doc.completed;
    }

    const result = await db.collection('todos').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: 'after' }
    );

    if (!result.value) return res.status(404).json({ error: 'Todo not found' });
    res.json({ success: true, data: result.value });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid ID or bad request' });
  }
});

// DELETE
app.delete('/todos/:id', async (req, res) => {
  try {
    const result = await db.collection('todos').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Todo not found' });
    res.json({ success: true, message: 'Todo deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid ID or bad request' });
  }
});

start();
