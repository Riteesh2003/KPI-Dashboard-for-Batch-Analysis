import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppBarComponent from './components/AppBarComponent';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Profile from './components/Profile';

// Create a Theme Context (if you plan to use it for other purposes later)
const ThemeContext = createContext();

// Theme Provider component
const ThemeProviderComponent = ({ children }) => {
  // Set dark mode by default
  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <ThemeContext.Provider value={{}}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the Theme Context (if needed)
const useTheme = () => useContext(ThemeContext);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authState = localStorage.getItem('isAuthenticated') === 'true';
        setIsAuthenticated(authState);
      } catch (error) {
        console.error("Failed to check authentication", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProviderComponent>
      <Router>
        <Routes>
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <>
                  <AppBarComponent />
                  <Dashboard />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route 
            path="/login" 
            element={<Login setIsAuthenticated={setIsAuthenticated} />} 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? (
                <Profile />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route 
            path="*" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </Router>
    </ThemeProviderComponent>
  );
};

export default App;
