// server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js"; 
import studentRoutes from "./routes/studentRoutes.js"; // ✅ Import routes

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use("/api/students", studentRoutes); // ✅ All student-related routes

// --- Default Route ---
app.get("/", (req, res) => {
  res.send("✅ Student Management Backend is running successfully 🚀");
});

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// --- Server Listen ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
