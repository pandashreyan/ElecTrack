const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Voter',
    index: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Candidate',
    index: true
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Election',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add compound index for preventing duplicate votes
voteSchema.index({ voterId: 1, electionId: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
