import React from 'react';
import { useTranslation } from 'react-i18next';

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
    <div>
      <h3>{t('selectMood')}</h3>
      {Object.entries(moods).map(([mood, emoji]) => (
        <button key={mood} onClick={() => setEmotion(mood)}>
          {emoji} {t(mood)}
        </button>
      ))}
    </div>
  );
}

export default MoodSelector;
