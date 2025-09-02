const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const profileRoutes = require("./routes/profileRoutes");

app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGO_URI || 'your_mongodb_connection_uri';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
      const conn = mongoose.connection;
      const { host, port, name: dbName } = conn;
      console.log('Connected to MongoDB');
      console.log('Mongo URI (env or fallback) in use:', mongoURI);
      console.log('Mongoose connection:', { host, port, dbName, readyState: conn.readyState });
    })
    .catch((err) => console.error('Error connecting to MongoDB:', err));

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/profile", profileRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "./build")));
  app.get("*", (req, res) => res.sendFile(path.resolve(__dirname, "./build/index.html")));
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.message);
  console.error(err.stack); // Log the stack trace for debugging
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.clear();
  console.log(`Backend is running on port ${port}`);
});

