import mongoose from "mongoose";
import { delay } from "../helpers/helpers";

interface DBConnectionOptions {
  maxRetries?: number;
  retryDelay?: number;
  mongoURI?: string;
  attempt?: number;
}

enum DbConfig {
  MAX_RETRIES = 3,
  RETRY_DELAY = 1000,
  ATTEMPT = 1,
}

const connectDB = async ({
  maxRetries = DbConfig.MAX_RETRIES,
  retryDelay = DbConfig.RETRY_DELAY,
  mongoURI = "",
  attempt = DbConfig.ATTEMPT,
}: DBConnectionOptions): Promise<void> => {
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed on attempt ${attempt}:`, error);

    if (attempt < maxRetries) {
      await delay(retryDelay);

      return connectDB({
        maxRetries,
        retryDelay,
        mongoURI,
        attempt: attempt + 1,
      });
    } else {
      console.error("🚨 Could not connect to MongoDB after multiple attempts.");
    }
  }
};

export default connectDB;
