import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";

const MONGODB_URI = process.env.DB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ Missing DB_URI in environment variables");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  try {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URI, {
        dbName: "estore",
        bufferCommands: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, 
        socketTimeoutMS: 45000,           
        retryWrites: true,              
        w: "majority",
      });
    }

    cached.conn = await cached.promise;
    console.log("✅ MongoDB connected successfully");
    return cached.conn;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}
