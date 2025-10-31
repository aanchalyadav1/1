import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

function Recommendations({ emotion }) {
  const { t } = useTranslation();
  const [tracks, setTracks] = useState([]);
  const [liked, setLiked] = useState([]);

  useEffect(() => {
    if (emotion) {
      const fetchRecommendations = async () => {
        const res = await api.get(`/recommend?emotion=${emotion}`);
        setTracks(res.data);
      };
      fetchRecommendations();
    }
  }, [emotion]);

  useEffect(() => {
    const fetchLiked = async () => {
      const res = await api.get('/liked_songs');
      setLiked(res.data);
    };
    fetchLiked();
  }, []);

  const handleLike = async (songId) => {
    if (liked.includes(songId)) {
      await api.delete('/liked_songs', { data: { song_id: songId } });
    } else {
      await api.post('/liked_songs', { song_id: songId });
    }
    const res = await api.get('/liked_songs');
    setLiked(res.data);
  };

  return (
    <div>
      <h2>{t('recommendations')}</h2>
      {tracks.map(track => (
        <div key={track.id}>
          <p>{track.name} by {track.artist}</p>
          <iframe src={`https://open.spotify.com/embed/track/${track.id}`} width="300" height="80" frameBorder="0" allowtransparency="true" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
          <button onClick={() => handleLike(track.id)}>
            {liked.includes(track.id) ? 'Unlike' : 'Like'}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Recommendations;
