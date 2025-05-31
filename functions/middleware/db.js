require('dotenv').config({path: '../.env'});
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000 // Increase timeout to 30 seconds
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

let db;

async function connectToDatabase(req, res, next) {
  try {
    if (!db) {
      db = mongoose.connection;
    }
    req.db = db;
    next();
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    res.status(500).send({ error: 'Database connection failed' });
  }
}

module.exports = connectToDatabase;
