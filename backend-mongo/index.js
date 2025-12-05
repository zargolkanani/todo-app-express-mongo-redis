require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// ------- سرو فایل‌های استاتیک -------
app.use(express.static(path.join(__dirname, "public")));

// ------- Middleware API Key -------
app.use("/api", (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== '123456') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// ------- MongoDB -------
let db;
const client = new MongoClient(process.env.MONGODB_URI);

async function start() {
  await client.connect();
  db = client.db(process.env.DB_NAME);
  console.log("Connected to MongoDB Atlas");
  app.listen(port, () => console.log(`MongoDB backend running on port ${port}`));
}

// ------- CRUD -------
app.post("/api/todos", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const result = await db.collection("todos").insertOne({
    text,
    done: false,
    createdAt: new Date(),
  });
  res.json({ id: result.insertedId, text, done: false });
});

app.get("/api/todos", async (req, res) => {
  const todos = await db.collection("todos").find().toArray();
  res.json({ data: todos.map(t => ({ id: t._id, text: t.text, done: t.done })) });
});

app.put("/api/todos/:id", async (req, res) => {
  const { text, done } = req.body;
  const result = await db.collection("todos").findOneAndUpdate(
    { _id: new ObjectId(req.params.id) },
    { $set: { text, done } },
    { returnDocument: "after" }
  );
  if (!result.value) return res.status(404).json({ error: "Todo not found" });
  res.json({ id: result.value._id, text: result.value.text, done: result.value.done });
});

app.delete("/api/todos/:id", async (req, res) => {
  const result = await db.collection("todos").deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount === 0) return res.status(404).json({ error: "Todo not found" });
  res.json({ message: "Todo deleted" });
});

start();
