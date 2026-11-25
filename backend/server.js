import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";

if (!process.env.VERCEL) {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let cachedPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in environment variables");
  }
  if (!cachedPromise) {
    cachedPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
  }
  await cachedPromise;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    cachedPromise = null;
    console.error("MongoDB connection error:", err.message);
    res.status(500).json({ message: err.message || "Database connection failed" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running!" });
});

if (!process.env.VERCEL) {
  connectDB()
    .then(() => {
      console.log("MongoDB Atlas connected successfully!");
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
    });
}

export default app;
