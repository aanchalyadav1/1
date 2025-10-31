import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

function Playlists() {
  const { t } = useTranslation();
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylist, setNewPlaylist] = useState('');

  useEffect(() => {
    const fetchPlaylists = async () => {
      const res = await api.get('/playlists');
      setPlaylists(res.data);
    };
    fetchPlaylists();
  }, []);

  const handleCreate = async () => {
    await api.post('/playlists', { name: newPlaylist });
    setNewPlaylist('');
    // Refresh playlists
    const res = await api.get('/playlists');
    setPlaylists(res.data);
  };

  return (
    <div>
      <h2>{t('playlists')}</h2>
      <input value={newPlaylist} onChange={(e) => setNewPlaylist(e.target.value)} placeholder={t('newPlaylist')} />
      <button onClick={handleCreate}>{t('create')}</button>
      <ul>
        {playlists.map(p => (
          <li key={p.id}>{p.name} - Songs: {p.songs.length}</li>
        ))}
      </ul>
    </div>
  );
}

export default Playlists;
