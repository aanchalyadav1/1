import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardMedia, Typography, IconButton, Grid, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { motion } from 'framer-motion';
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Typography variant="h4" gutterBottom>{t('recommendations')}</Typography>
      <Grid container spacing={2}>
        {tracks.map((track, index) => (
          <Grid item xs={12} sm={6} md={4} key={track.id}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card sx={{ maxWidth: 345 }} whileHover={{ scale: 1.05 }}>
                <CardMedia component="img" height="140" image={track.albumArt || 'https://via.placeholder.com/300'} alt={track.name} />
                <CardContent>
                  <Typography variant="h6">{track.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{track.artist}</Typography>
                  <iframe src={`https://open.spotify.com/embed/track/${track.id}`} width="100%" height="80" frameBorder="0" allowtransparency="true" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                  <IconButton onClick={() => handleLike(track.id)}>
                    <FavoriteIcon color={liked.includes(track.id) ? 'error' : 'default'} />
                  </IconButton>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}

export default Recommendations;
