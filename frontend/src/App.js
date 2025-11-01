import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { motion } from 'framer-motion';
import Particles from 'react-particles';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './i18n';

function App() {
  const [currentTheme, setCurrentTheme] = useState(createTheme({
    palette: { mode: 'dark', primary: { main: '#1db954' } }, // Spotify-like green
    typography: { fontFamily: 'Roboto, sans-serif' }
  }));

  const updateTheme = (emotion) => {
    const emotionColors = {
      happy: '#ffeb3b', angry: '#f44336', sad: '#2196f3', neutral: '#9e9e9e', fear: '#9c27b0', surprise: '#ff9800', disgust: '#795548'
    };
    setCurrentTheme(createTheme({
      palette: { mode: 'dark', primary: { main: emotionColors[emotion] || '#1db954' } },
      typography: { fontFamily: 'Roboto, sans-serif' }
    }));
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Particles options={{ particles: { number: { value: 50 }, move: { speed: 1 } } }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="app-container">
          <Router>
            <Routes>
              <Route path="/login" element={<motion.div initial={{ x: -100 }} animate={{ x: 0 }}><Login /></motion.div>} />
              <Route path="/register" element={<motion.div initial={{ x: 100 }} animate={{ x: 0 }}><Register /></motion.div>} />
              <Route path="/" element={<motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}><Dashboard updateTheme={updateTheme} /></motion.div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </div>
      </motion.div>
    </ThemeProvider>
  );
}

export default App;
