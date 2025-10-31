import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Profile from './Profile';
import Playlists from './Playlists';
import CameraCapture from './CameraCapture';
import MoodSelector from './MoodSelector';
import Recommendations from './Recommendations';
import api from '../api';

function Dashboard() {
  const { i18n, t } = useTranslation();
  const [emotion, setEmotion] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        setUser(res.data);
      } catch (err) {
        window.location.href = '/login'; // Redirect if not logged in
      }
    };
    fetchProfile();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>{t('welcome')} {user.username}</h1>
      <select onChange={(e) => i18n.changeLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
      <Profile />
      <Playlists />
      <CameraCapture setEmotion={setEmotion} />
      <MoodSelector setEmotion={setEmotion} />
      {emotion && <p>{t('detectedEmotion')}: {emotion} 😊</p>}
      <Recommendations emotion={emotion} />
    </div>
  );
}

export default Dashboard;
