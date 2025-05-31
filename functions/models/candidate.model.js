const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  party: {
    type: String,
    required: true,
    trim: true
  },
  electionId: {
    type: String, // or use ObjectId if elections are stored as documents
    required: true,
    index: true
  },
  age: {
    type: Number,
    required: false,
    min: 18,
    max: 120
  },
  bio: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Add index for name and electionId
candidateSchema.index({ name: 1, electionId: 1 });

const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;
