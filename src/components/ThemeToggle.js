import React from 'react';
import { IconButton } from '@mui/material';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';

const ThemeToggle = ({ currentTheme, onToggle }) => (
  <IconButton color="inherit" onClick={onToggle}>
    {currentTheme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
  </IconButton>
);

export default ThemeToggle;