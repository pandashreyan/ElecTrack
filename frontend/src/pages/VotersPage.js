import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function VotersPage() {
  const [voters, setVoters] = useState([]);
  const [open, setOpen] = useState(false);
  const [newVoter, setNewVoter] = useState({ voterId: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      const response = await axios.get('/voters');
      setVoters(response.data);
    } catch (error) {
      console.error('Error fetching voters:', error);
      setError('Failed to fetch voters');
    }
  };

  const handleCreateVoter = async () => {
    try {
      if (!newVoter.voterId || !newVoter.name || !newVoter.email || !newVoter.password) {
        setError('All fields are required');
        return;
      }
      await axios.post('/voters', newVoter);
      fetchVoters();
      setOpen(false);
      setNewVoter({ voterId: '', name: '', email: '', password: '' });
      setError('');
    } catch (error) {
      console.error('Error creating voter:', error);
      setError(error.response?.data?.message || 'Failed to create voter');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Voters Management</Typography>
      
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Add New Voter
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Voter ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {voters.map((voter) => (
              <TableRow key={voter._id}>
                <TableCell>{voter.voterId}</TableCell>
                <TableCell>{voter.name}</TableCell>
                <TableCell>{voter.email}</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate(`/voters/${voter._id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Voter</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Voter ID"
            fullWidth
            value={newVoter.voterId}
            onChange={(e) => setNewVoter({...newVoter, voterId: e.target.value})}
            required
          />
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={newVoter.name}
            onChange={(e) => setNewVoter({...newVoter, name: e.target.value})}
            required
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newVoter.email}
            onChange={(e) => setNewVoter({...newVoter, email: e.target.value})}
            required
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newVoter.password}
            onChange={(e) => setNewVoter({...newVoter, password: e.target.value})}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateVoter}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}