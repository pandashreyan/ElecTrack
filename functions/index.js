const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Load environment variables
console.log('Env verification:', {
  JWT_SECRET: process.env.JWT_SECRET ? 'loaded' : 'missing',
  MONGO_URI: process.env.MONGO_URI ? 'loaded' : 'missing'
});
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');

// Middleware
const connectToDatabase = require("./middleware/db");

// Route files
const voterRoutes = require("./routes/voters");
const candidateRoutes = require("./routes/candidates");
const electionRoutes = require("./routes/elections");
const voteRoutes = require("./routes/votes");

const app = express();

// Startup logging
console.log('Initializing server...');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'set' : 'missing');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'set' : 'missing');
console.log('DB_NAME:', process.env.DB_NAME ? 'set' : 'missing');
app.use(cors({ origin: true }));
app.use(express.json());

// MongoDB connection middleware
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Establishing new MongoDB connection...');
      await connectToDatabase(req, res, next);
      console.log('Connection established with', process.env.DB_NAME);
    } else {
      console.log('Reusing existing MongoDB connection');
      next();
    }
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(503).json({ error: 'Database unavailable', details: err.message });
  }
});

// Audit logger middleware


// Route handlers
app.use("/voters", authenticateJWT, voterRoutes);
app.use("/candidates", authenticateJWT, candidateRoutes);
app.use("/elections", authenticateJWT, electionRoutes);
app.use("/votes", authenticateJWT, voteRoutes);

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." }
});
app.use(limiter);

// Export Cloud Function
exports.api = functions.https.onRequest(app);

// Start server when running directly
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// JWT authentication middleware (for non-Firebase endpoints)
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// Simple audit logger middleware
function auditLogger(req, res, next) {
  const logEntry = {
    time: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    user: req.user ? req.user.uid : null,
    ip: req.ip
  };
  const logPath = path.join(__dirname, "audit.log");
  fs.appendFile(logPath, JSON.stringify(logEntry) + "\n", err => {
    if (err) console.error("Audit log error:", err);
  });
  next();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
});
// Remove this duplicate line:
// const mongoose = require('mongoose');