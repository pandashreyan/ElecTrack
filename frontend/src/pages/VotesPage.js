import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Grid,
  Snackbar
} from '@mui/material';

export default function VotesPage() {
  const [votes, setVotes] = useState([]);
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [activeElections, setActiveElections] = useState([]);
  const [hasVoted, setHasVoted] = useState({});

  // Get user info from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  useEffect(() => {
    fetchElections();
    fetchCandidates();
    fetchVotes();
  }, []);

  // Filter active elections and check voting status
  useEffect(() => {
    const now = new Date();
    const active = elections.filter(election => {
      const startDate = new Date(election.startDate);
      const endDate = new Date(election.endDate);
      return now >= startDate && now <= endDate;
    });
    setActiveElections(active);

    // Check if user has voted in each election
    const votedStatus = {};
    votes.forEach(vote => {
      if (vote.voterId === user?.uid) {
        votedStatus[vote.electionId] = true;
      }
    });
    setHasVoted(votedStatus);
  }, [elections, votes, user]);

  const fetchElections = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/elections');
      setElections(response.data || []);
    } catch (error) {
      console.error('Error fetching elections:', error);
      setError('Failed to load elections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/candidates');
      setCandidates(response.data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError('Failed to load candidates. Please try again.');
    }
  };

  const fetchVotes = async () => {
    try {
      const response = await axios.get('/votes');
      setVotes(response.data || []);
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  };

  const fetchResults = async (electionId) => {
    if (!electionId) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/votes/results/${electionId}`);
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to load election results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedElection || !selectedCandidate) {
      setError('Please select both an election and a candidate');
      return;
    }

    if (!user?.uid) {
      setError('Please log in to vote');
      return;
    }

    if (hasVoted[selectedElection]) {
      setError('You have already voted in this election');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await axios.post('/votes', {
        electionId: selectedElection,
        candidateId: selectedCandidate,
        voterId: user.uid
      });
      
      setSuccess('Your vote has been submitted successfully!');
      setSelectedCandidate('');
      
      // Update local state
      setHasVoted({ ...hasVoted, [selectedElection]: true });
      
      // Refresh data
      fetchResults(selectedElection);
      fetchVotes();
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError(error.response?.data?.error || 'Failed to submit vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Voting System</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Cast Your Vote</Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Election</InputLabel>
                <Select
                  value={selectedElection}
                  onChange={(e) => {
                    setSelectedElection(e.target.value);
                    setSelectedCandidate('');
                  }}
                  disabled={loading}
                >
                  {activeElections.map((election) => (
                    <MenuItem 
                      key={election._id} 
                      value={election._id}
                      disabled={hasVoted[election._id]}
                    >
                      {election.title} {hasVoted[election._id] && '(Voted)'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedElection && !hasVoted[selectedElection] && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Candidate</InputLabel>
                  <Select
                    value={selectedCandidate}
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    disabled={loading}
                  >
                    {candidates.map((candidate) => (
                      <MenuItem key={candidate._id} value={candidate._id}>
                        {candidate.name} ({candidate.party})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Button
                variant="contained"
                onClick={handleVote}
                disabled={loading || !selectedElection || !selectedCandidate || hasVoted[selectedElection]}
                fullWidth
              >
                {loading ? 'Submitting...' : 'Submit Vote'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          {selectedElection && results.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Election Results</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Candidate</TableCell>
                        <TableCell>Party</TableCell>
                        <TableCell align="right">Votes</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.candidateId}>
                          <TableCell>{result.candidateName}</TableCell>
                          <TableCell>{result.party}</TableCell>
                          <TableCell align="right">{result.votes}</TableCell>
                          <TableCell align="right">{result.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={success}
      />
    </Box>
  );
}