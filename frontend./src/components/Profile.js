import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

function Profile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState({ username: '', email: '' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await api.get('/profile');
      setProfile(res.data);
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    await api.put('/profile', profile);
    setEditing(false);
    alert(t('profileUpdated'));
  };

  return (
    <div>
      <h2>{t('profile')}</h2>
      {editing ? (
        <div>
          <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <button onClick={handleUpdate}>{t('save')}</button>
        </div>
      ) : (
        <div>
          <p>{t('username')}: {profile.username}</p>
          <p>{t('email')}: {profile.email}</p>
          <button onClick={() => setEditing(true)}>{t('edit')}</button>
        </div>
      )}
    </div>
  );
}

export default Profile;
