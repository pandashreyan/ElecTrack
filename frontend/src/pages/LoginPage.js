import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/voters');
      } else {
        navigate('/votes');
      }
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/voters/login', credentials);
      
      const { token, user } = response.data;
      
      // Store user info and token in localStorage
      localStorage.setItem('user', JSON.stringify(user)); // Store user details
      localStorage.setItem('token', token); // Store JWT token
      
      // Trigger storage event for App.js to detect login state change
      window.dispatchEvent(new Event('storage'));
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/voters');
      } else {
        navigate('/votes');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={credentials.email}
          onChange={(e) => setCredentials({...credentials, email: e.target.value})}
        />
        
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={credentials.password}
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        />
        
        <Button 
          variant="contained" 
          fullWidth 
          sx={{ mt: 2 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
        </Button>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Demo accounts:
          </Typography>
          <Typography variant="body2">
            admin@example.com (admin)
          </Typography>
          <Typography variant="body2">
            voter@example.com (voter)
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}