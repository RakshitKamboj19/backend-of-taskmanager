const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const mongoURI = process.env.MONGO_URI || "your_mongodb_connection_uri";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const conn = mongoose.connection;
    const { host, port, name: dbName } = conn;
    console.log("Connected to MongoDB");
    console.log("Mongo URI (env or fallback) in use:", mongoURI);
    console.log("Mongoose connection:", {
      host,
      port,
      dbName,
      readyState: conn.readyState,
    });
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/profile", profileRoutes);

// Health Check Route (to confirm backend is running)
app.get("/", (req, res) => {
  res.json({ message: "Backend is running successfully!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.message);
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// ❌ No app.listen() here
// ✅ Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);
