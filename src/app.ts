import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

connectDB({ mongoURI: process.env.MONGO_URI || "" });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", (req, res, next) => {
  console.log("API middleware");
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
