import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Don't show navbar on login page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <AppBar position="static">
      <Container>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Election Management System
          </Typography>
          
          {isAdmin && (
            <>
              <Button color="inherit" onClick={() => navigate('/voters')}>
                Voters
              </Button>
              <Button color="inherit" onClick={() => navigate('/candidates')}>
                Candidates
              </Button>
              <Button color="inherit" onClick={() => navigate('/elections')}>
                Elections
              </Button>
            </>
          )}
          
          <Button color="inherit" onClick={() => navigate('/votes')}>
            {isAdmin ? 'Results' : 'Vote'}
          </Button>
          
          <Box sx={{ ml: 2 }}>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}