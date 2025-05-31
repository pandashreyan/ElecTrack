const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  voterId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    default: 'voter',
    enum: ['voter', 'admin']
  }
}, {
  timestamps: true
});

// Add index for voterId and email
voterSchema.index({ voterId: 1, email: 1 });

const bcrypt = require('bcryptjs');

// Pre-save hook to hash password
voterSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Voter = mongoose.model('Voter', voterSchema);

module.exports = Voter;