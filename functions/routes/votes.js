const express = require('express');
const router = express.Router();
const Vote = require('../models/votes.model');
const Election = require('../models/elections.model');
const Candidate = require('../models/candidate.model');
const Voter = require('../models/voter.model');

// Submit vote
router.post('/', async (req, res) => {
  try {
    const { electionId, candidateId, voterId } = req.body;

    // Validate required fields
    if (!electionId || !candidateId || !voterId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    const now = new Date();
    if (now < election.startDate) {
      return res.status(400).json({ error: 'Election has not started yet' });
    }
    if (now > election.endDate) {
      return res.status(400).json({ error: 'Election has ended' });
    }

    // Validate candidate exists and is part of the election
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Validate voter exists
    const voter = await Voter.findById(voterId);
    if (!voter) {
      return res.status(404).json({ error: 'Voter not found' });
    }

    // Check for duplicate vote
    const existingVote = await Vote.findOne({ electionId, voterId });
    if (existingVote) {
      return res.status(400).json({ error: 'Voter has already voted in this election' });
    }

    const newVote = new Vote({ electionId, candidateId, voterId });
    await newVote.save();

    res.status(201).json({
      message: 'Vote recorded successfully',
      vote: await Vote.findById(newVote._id)
        .populate('candidateId', 'name party')
        .populate('electionId', 'title')
    });
  } catch (error) {
    console.error('Vote submission error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// Get all votes with populated references
router.get('/', async (req, res) => {
  try {
    const votes = await Vote.find()
      .populate('voterId', 'name email')
      .populate('candidateId', 'name party')
      .populate('electionId', 'title startDate endDate')
      .sort('-createdAt');
    res.json(votes);
  } catch (error) {
    console.error('Fetch votes error:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

// Get election results with detailed statistics
router.get('/results/:electionId', async (req, res) => {
  try {
    const { electionId } = req.params;

    // Validate election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    const results = await Vote.aggregate([
      { $match: { electionId: mongoose.Types.ObjectId(electionId) } },
      { $group: { 
          _id: "$candidateId", 
          votes: { $sum: 1 }
      }},
      { $lookup: {
          from: "candidates",
          localField: "_id",
          foreignField: "_id",
          as: "candidate"
      }},
      { $unwind: "$candidate" },
      { $project: {
          _id: 0,
          candidateId: "$_id",
          candidateName: "$candidate.name",
          party: "$candidate.party",
          votes: 1,
      }},
      { $sort: { votes: -1 } }
    ]);

    // Calculate total votes and percentages
    const totalVotes = results.reduce((sum, result) => sum + result.votes, 0);
    const resultsWithPercentage = results.map(result => ({
      ...result,
      percentage: totalVotes > 0 ? ((result.votes / totalVotes) * 100).toFixed(2) : 0
    }));

    res.json({
      electionTitle: election.title,
      totalVotes,
      results: resultsWithPercentage
    });
  } catch (error) {
    console.error('Election results error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid election ID format' });
    }
    res.status(500).json({ error: 'Failed to fetch election results' });
  }
});

module.exports = router;