import express from "express";
import cors from "cors";
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const redisUrl = process.env.REDIS_URL;

let client;

async function setupRedis() {
  try {
    if (!process.env.REDIS_URL) {
      console.warn("⚠️  REDIS_URL not set");
    }

    console.log("🔧 Redis URL:", redisUrl);

    client = createClient({ url: redisUrl });

    client.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    client.on("connect", () => {
      console.log("📡 Connected to Redis");
    });

    client.on("ready", () => {
      console.log("✅ Redis client ready");
    });

    await client.connect();

    await client.ping();
    console.log(`📊 Connected to Redis using URL: ${redisUrl}`);
  } catch (error) {
    console.error("❌ Redis setup failed:", error.message);
    process.exit(1);
  }
}

app.get("/api/health", async (req, res) => {
  try {
    const pong = await client.ping();
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      redis: {
        url: redisUrl,
        ping: pong,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: "Redis connection failed",
    });
  }
});

app.get("/api/:key", async (req, res) => {
  try {
    const value = await client.get(req.params.key);

    if (value === null) {
      return res.status(404).json({ error: "Key not found" });
    }

    res.json({
      key: req.params.key,
      value: value,
    });
  } catch (error) {
    console.error("Error getting key:", error);
    res.status(500).json({ error: "Failed to get key" });
  }
});

app.post("/api", async (req, res) => {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({ error: "Key and value are required" });
  }

  try {
    await client.set(key, value);
    res.status(201).json({ key, value });
  } catch (error) {
    console.error("Error setting key:", error);
    res.status(500).json({ error: "Failed to set key" });
  }
});

process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");
  if (client) {
    await client.disconnect();
    console.log("✅ Redis connection closed");
  }
  process.exit(0);
});

async function startServer() {
  await setupRedis();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 API endpoints:`);
    console.log(`   GET    /api/health`);
    console.log(`   GET    /api/:key`);
    console.log(`   POST   /api`);
  });
}

startServer().catch(console.error);
