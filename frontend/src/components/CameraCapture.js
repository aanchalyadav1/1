import React, { useRef } from 'react';
import Webcam from 'react-webcam';
import { useTranslation } from 'react-i18next';
import api from '../api';

function CameraCapture({ setEmotion }) {
  const { t } = useTranslation();
  const webcamRef = useRef(null);

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const blob = await fetch(imageSrc).then(res => res.blob());
    const formData = new FormData();
    formData.append('image', blob, 'capture.jpg');
    try {
      const res = await api.post('/detect_emotion', formData);
      setEmotion(res.data.emotion);
    } catch (err) {
      alert('Error detecting emotion');
    }
  };

  const upload = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await api.post('/detect_emotion', formData);
      setEmotion(res.data.emotion);
    } catch (err) {
      alert('Error detecting emotion');
    }
  };

  return (
    <div>
      <h3>{t('captureOrUpload')}</h3>
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
      <button onClick={capture}>{t('capture')}</button>
      <input type="file" onChange={upload} />
    </div>
  );
}

export default CameraCapture;
