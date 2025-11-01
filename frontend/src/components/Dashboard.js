import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer, List, ListItem, ListItemText, Box, Button, Switch, FormControlLabel, Typography } from '@mui/material';
import Profile from './Profile';
import Playlists from './Playlists';
import CameraCapture from './CameraCapture';
import MoodSelector from './MoodSelector';
import Recommendations from './Recommendations';
import api from '../api';

function Dashboard({ updateTheme }) {
  const { i18n, t } = useTranslation();
  const [emotion, setEmotion] = useState(null);
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        setUser(res.data);
      } catch (err) {
        window.location.href = '/login';
      }
    };
    fetchProfile();
  }, []);

  const handleEmotion = (emotion) => {
    setEmotion(emotion);
    updateTheme(emotion);
  };

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 250 }}>
          <ListItem button onClick={() => setDrawerOpen(false)}><ListItemText primary={t('profile')} /></ListItem>
          <ListItem button><ListItemText primary={t('playlists')} /></ListItem>
        </List>
      </Drawer>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Button onClick={() => setDrawerOpen(true)}>Menu</Button>
        <FormControlLabel control={<Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />} label="Dark Mode" />
        <select onChange={(e) => i18n.changeLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
        <Typography variant="h4">{t('welcome')} {user.username}</Typography>
        <Profile />
        <Playlists />
        <CameraCapture setEmotion={handleEmotion} />
        <MoodSelector setEmotion={handleEmotion} />
        {emotion && <Typography variant="h5">{t('detectedEmotion')}: {emotion} 😊</Typography>}
        <Recommendations emotion={emotion} />
      </Box>
    </Box>
  );
}

export default Dashboard;
