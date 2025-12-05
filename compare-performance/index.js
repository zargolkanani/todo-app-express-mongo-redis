require("dotenv").config({ path: "./.env" });
const express = require("express");
const { createClient } = require("redis");

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// اتصال Redis TCP/SSL
const client = createClient({ url: process.env.REDIS_URL });
client.on("error", (err) => console.error("Redis Client Error:", err));

async function start() {
  await client.connect();
  console.log("Connected to Upstash Redis TCP!");
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

// CREATE TODO
app.post("/todos", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  const id = await client.incr("todo:id");
  const todo = { id, title, completed: false, createdAt: new Date().toISOString() };

  await client.set(`todo:${id}`, JSON.stringify(todo));
  await client.rPush("todo:ids", id.toString());
  res.json(todo);
});

// READ ALL
app.get("/todos", async (req, res) => {
  const ids = await client.lRange("todo:ids", 0, -1);
  const todos = [];
  for (const id of ids) {
    const data = await client.get(`todo:${id}`);
    if (data) todos.push(JSON.parse(data));
  }
  res.json(todos);
});

// UPDATE
app.put("/todos/:id", async (req, res) => {
  const id = req.params.id;
  const oldTodo = await client.get(`todo:${id}`);
  if (!oldTodo) return res.status(404).json({ error: "Todo not found" });

  const { title, completed } = req.body;
  const updated = { ...JSON.parse(oldTodo), title, completed };
  await client.set(`todo:${id}`, JSON.stringify(updated));
  res.json(updated);
});

// DELETE
app.delete("/todos/:id", async (req, res) => {
  const id = req.params.id;
  const deleted = await client.del(`todo:${id}`);
  if (deleted === 0) return res.status(404).json({ error: "Todo not found" });

  await client.lRem("todo:ids", 1, id);
  res.json({ message: "Todo deleted" });
});

start();
