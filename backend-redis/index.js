require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Redis client
const client = createClient({ url: process.env.REDIS_URL });

client.on('error', (err) => console.error('Redis Client Error', err));

async function start() {
  try {
    await client.connect();
    console.log('Connected to Redis');
    app.listen(port, () => console.log(`Redis app running on port ${port}`));
  } catch (err) {
    console.error('Redis connection error:', err);
    process.exit(1);
  }
}

// CREATE
app.post('/todos', async (req, res) => {
  try {
    const title = req.body.title || req.body.text;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const id = await client.incr('todo:id');
    const todo = {
      id: id.toString(),
      title,
      completed: false,
      createdAt: new Date().toISOString()
    };

    await client.set(`todo:${id}`, JSON.stringify(todo));
    await client.rPush('todo:ids', id.toString());

    res.json({ success: true, data: todo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// READ ALL
app.get('/todos', async (req, res) => {
  try {
    const ids = await client.lRange('todo:ids', 0, -1);
    const todos = [];
    for (const id of ids) {
      const data = await client.get(`todo:${id}`);
      if (data) todos.push(JSON.parse(data));
    }
    res.json({ success: true, data: todos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE
app.put('/todos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const old = await client.get(`todo:${id}`);
    if (!old) return res.status(404).json({ error: 'Todo not found' });

    const { title, completed } = req.body;
    const obj = JSON.parse(old);
    if (typeof title === 'string') obj.title = title;
    if (typeof completed === 'boolean') obj.completed = completed;
    else obj.completed = !obj.completed;

    await client.set(`todo:${id}`, JSON.stringify(obj));
    res.json({ success: true, data: obj });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid request' });
  }
});

// DELETE
app.delete('/todos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await client.del(`todo:${id}`);
    if (deleted === 0) return res.status(404).json({ error: 'Todo not found' });
    await client.lRem('todo:ids', 1, id);
    res.json({ success: true, message: 'Todo deleted' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid request' });
  }
});

start();
