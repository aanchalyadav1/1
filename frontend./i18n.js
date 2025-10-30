import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: { login: 'Login', register: 'Register', username: 'Username', password: 'Password', email: 'Email', capture: 'Capture', upload: 'Upload', happy: 'Happy', sad: 'Sad', angry: 'Angry', playlists: 'Playlists', profile: 'Profile' } },
      es: { translation: { login: 'Iniciar Sesión', register: 'Registrarse', username: 'Usuario', password: 'Contraseña', email: 'Correo', capture: 'Capturar', upload: 'Subir', happy: 'Feliz', sad: 'Triste', angry: 'Enojado', playlists: 'Listas', profile: 'Perfil' } }
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
