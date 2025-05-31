const express = require('express');
const router = express.Router();
const Election = require('../models/elections.model');

// Create election
router.post('/', async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    // Validate required fields
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ message: 'Title, start date, and end date are required' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const election = new Election({
      title,
      description,
      startDate: start,
      endDate: end,
      isActive: false
    });

    await election.save();
    res.status(201).json(election);
  } catch (error) {
    console.error('Error creating election:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all elections
router.get('/', async (req, res) => {
  try {
    const elections = await Election.find().sort({ startDate: -1 });
    res.json(elections);
  } catch (error) {
    console.error('Error fetching elections:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get election by ID
router.get('/:id', async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json(election);
  } catch (error) {
    console.error('Error fetching election:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update election
router.put('/:id', async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      if (end <= start) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }

    const updatedElection = await Election.findByIdAndUpdate(
      req.params.id,
      { title, description, startDate, endDate },
      { new: true, runValidators: true }
    );

    if (!updatedElection) {
      return res.status(404).json({ message: 'Election not found' });
    }

    res.json(updatedElection);
  } catch (error) {
    console.error('Error updating election:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete election
router.delete('/:id', async (req, res) => {
  try {
    const election = await Election.findByIdAndDelete(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    console.error('Error deleting election:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;