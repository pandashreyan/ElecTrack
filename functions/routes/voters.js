const express = require('express');
const router = express.Router();
const Voter = require('../models/voter.model');

// Create voter
router.post('/', async (req, res) => {
  try {
    const voter = new Voter(req.body);
    await voter.save();
    res.status(201).json(voter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all voters
router.get('/', async (req, res) => {
  try {
    const voters = await Voter.find();
    res.json(voters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get voter by ID
router.get('/:id', async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) return res.status(404).json({ message: 'Voter not found' });
    res.json(voter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update voter
router.put('/:id', async (req, res) => {
  try {
    const updatedVoter = await Voter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedVoter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete voter
router.delete('/:id', async (req, res) => {
  try {
    await Voter.findByIdAndDelete(req.params.id);
    res.json({ message: 'Voter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Voter Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const voter = await Voter.findOne({ email });
    if (!voter) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, voter.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: voter.id,
        role: voter.role,
        email: voter.email
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: voter.id,
            email: voter.email,
            name: voter.name,
            role: voter.role
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;