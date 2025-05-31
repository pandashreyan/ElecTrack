import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import VotersPage from './pages/VotersPage';
import CandidatesPage from './pages/CandidatesPage';
import ElectionsPage from './pages/ElectionsPage';
import VotesPage from './pages/VotesPage';
import LoginPage from './pages/LoginPage';

// Components
import Navbar from './components/Navbar';

// Configure axios
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Add request interceptor for authentication
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
    
    // Listen for storage events (login/logout)
    const handleStorageChange = () => {
      const user = localStorage.getItem('user');
      setIsAuthenticated(!!user);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/voters" element={
            <ProtectedRoute>
              <VotersPage />
            </ProtectedRoute>
          } />
          <Route path="/candidates" element={
            <ProtectedRoute>
              <CandidatesPage />
            </ProtectedRoute>
          } />
          <Route path="/elections" element={
            <ProtectedRoute>
              <ElectionsPage />
            </ProtectedRoute>
          } />
          <Route path="/votes" element={
            <ProtectedRoute>
              <VotesPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;