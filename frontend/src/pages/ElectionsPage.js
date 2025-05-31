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
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';

export default function ElectionsPage() {
  const [elections, setElections] = useState([]);
  const [open, setOpen] = useState(false);
  const [newElection, setNewElection] = useState({ title: '', description: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchElections();
  }, []);

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

  const handleCreateElection = async () => {
    // Validate form
    if (!newElection.title || !newElection.startDate || !newElection.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate dates
    const start = new Date(newElection.startDate);
    const end = new Date(newElection.endDate);
    if (end <= start) {
      setError('End date must be after start date');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await axios.post('/elections', newElection);
      fetchElections();
      setOpen(false);
      setNewElection({ title: '', description: '', startDate: '', endDate: '' });
      setSuccess('Election created successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating election:', error);
      setError(error.response?.data?.message || 'Failed to create election. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Elections Management</Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Add New Election
      </Button>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {elections.map((election) => (
                <TableRow key={election._id}>
                  <TableCell>{election.title}</TableCell>
                  <TableCell>{election.description}</TableCell>
                  <TableCell>{new Date(election.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(election.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {new Date() < new Date(election.startDate) ? 'Upcoming' :
                     new Date() > new Date(election.endDate) ? 'Ended' : 'Active'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => {
                        // Add edit functionality
                      }}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Election</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newElection.title}
            onChange={(e) => setNewElection({...newElection, title: e.target.value})}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newElection.description}
            onChange={(e) => setNewElection({...newElection, description: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Start Date"
            type="datetime-local"
            fullWidth
            value={newElection.startDate}
            onChange={(e) => setNewElection({...newElection, startDate: e.target.value})}
            required
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="datetime-local"
            fullWidth
            value={newElection.endDate}
            onChange={(e) => setNewElection({...newElection, endDate: e.target.value})}
            required
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateElection} disabled={loading}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}