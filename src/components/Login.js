import React, { useState } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const users = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' },
  { username: 'user3', password: 'password3' },
];

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      
      // Navigate directly to the profile page after successful login
      navigate('/profile');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      <Typography variant="h4" marginBottom={2}>Login</Typography>
      <TextField 
        label="Username" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        margin="normal"
      />
      <TextField 
        label="Password" 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleLogin}>Login</Button>
    </Box>
  );
};

export default Login;
