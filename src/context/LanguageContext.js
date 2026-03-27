'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [t, setT] = useState(translations.en);

  useEffect(() => {
    // Check localStorage for saved preference
    const savedLang = localStorage.getItem('ai_council_lang');
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      setLanguage(savedLang);
      setT(translations[savedLang]);
      document.body.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      document.body.classList.toggle('rtl', savedLang === 'ar');
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    setT(translations[newLang]);
    localStorage.setItem('ai_council_lang', newLang);
    document.body.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', newLang === 'ar');
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      <div className={language === 'ar' ? 'font-noto-sans-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
