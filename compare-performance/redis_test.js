// redis_test.js
import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

async function testRedis() {
  const redisClient = createClient({ url: process.env.REDIS_URL });

  redisClient.on("error", (err) => console.log("Redis Client Error:", err));

  await redisClient.connect();
  console.log("Connected to Redis ✅");

  const start = Date.now();
  await redisClient.set("test_key", "Hello Redis");
  const end = Date.now();
  console.log("Redis SET time:", end - start, "ms");

  const startGet = Date.now();
  const value = await redisClient.get("test_key");
  const endGet = Date.now();
  console.log("Redis GET time:", endGet - startGet, "ms", "| Value:", value);

  await redisClient.quit();
}

testRedis();
