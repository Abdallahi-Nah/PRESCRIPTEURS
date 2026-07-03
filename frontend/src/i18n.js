import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationAR from './locales/ar.json';
import translationFR from './locales/fr.json';
import translationEN from './locales/en.json';

const resources = {
  ar: { translation: translationAR },
  fr: { translation: translationFR },
  en: { translation: translationEN }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false 
    }
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lng);
});

// Set auto dir
document.documentElement.setAttribute('dir', i18n.language === 'ar' ? 'rtl' : 'ltr');
document.documentElement.setAttribute('lang', i18n.language || 'fr');

export default i18n;
