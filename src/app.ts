import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import todoRoutes from "./routes/todo.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

connectDB({ mongoURI: process.env.MONGO_URI || "" });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/todos", todoRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
