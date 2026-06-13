"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'am' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    news: 'News',
    documents: 'Documents',
    personnel: 'Personnel',
    complaints: 'Complaints',
    settings: 'Settings',
  },
  am: {
    dashboard: 'ዳሽቦርድ',
    news: 'ዜና',
    documents: 'ሰነዶች',
    personnel: 'ሰራተኞች',
    complaints: 'ጥቆማ እና አቤቱታ',
    settings: 'ቅንብሮች',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => translations[language][key] || key;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
