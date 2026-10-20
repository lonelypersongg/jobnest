
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/Jobs");
const app = express();
exports.app = app;

app.use(cors());
app.use(express.json());
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "JobNest API is running!" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    database: mongoose.connection.readyState === 1
      ? "Connected"
      : "Disconnected",
  });
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`JobNest API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
  }
}

startServer();