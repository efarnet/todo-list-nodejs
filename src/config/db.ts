import mongoose from "mongoose";

interface DBOption {
  maxRetries?: number;
  retryDelay?: number;
  mongoURI?: string;
  attempt?: number;
}

// Fonction connectDB avec retry
const connectDB = async ({
  maxRetries = 3,
  retryDelay = 5000,
  mongoURI = "",
  attempt = 1,
}: DBOption): Promise<void> => {
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed on attempt ${attempt}:`, error);

    if (attempt < maxRetries) {
      console.log(
        `Retrying connection... Attempt ${attempt + 1} of ${maxRetries}`
      );
      setTimeout(
        () =>
          connectDB({ maxRetries, retryDelay, mongoURI, attempt: attempt + 1 }),
        retryDelay
      );
    } else {
      console.error("Could not connect to MongoDB after multiple attempts.");
    }
  }
};

export default connectDB;
