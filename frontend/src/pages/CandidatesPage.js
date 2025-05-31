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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [open, setOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', party: '' });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('/candidates');
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const handleCreateCandidate = async () => {
    try {
      await axios.post('/candidates', newCandidate);
      fetchCandidates();
      setOpen(false);
      setNewCandidate({ name: '', party: '' });
    } catch (error) {
      console.error('Error creating candidate:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Candidates Management</Typography>
      
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Add New Candidate
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate._id}>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>{candidate.party}</TableCell>
                <TableCell>
                  <Button variant="outlined">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Candidate</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newCandidate.name}
            onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Party"
            fullWidth
            value={newCandidate.party}
            onChange={(e) => setNewCandidate({...newCandidate, party: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCandidate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}