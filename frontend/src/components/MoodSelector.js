import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Typography, Box } from '@mui/material';
import Lottie from 'lottie-react';
import happyAnimation from './animations/happy.json'; // Download and place in src/components/animations/

const moods = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  fear: '😨',
  surprise: '😲',
  neutral: '😐',
  disgust: '🤢'
};

function MoodSelector({ setEmotion }) {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>{t('selectMood')}</Typography>
      {Object.entries(moods).map(([mood, emoji]) => (
        <Button key={mood} variant="outlined" sx={{ m: 1 }} onClick={() => setEmotion(mood)} startIcon={<Lottie animationData={happyAnimation} style={{ width: 30, height: 30 }} />}>
          {emoji} {t(mood)}
        </Button>
      ))}
    </Box>
  );
}

export default MoodSelector;
