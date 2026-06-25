"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'am' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  am: {
    dashboard: 'ዳሽቦርድ',
    news: 'ዜና',
    documents: 'ሰነዶች',
    personnel: 'ሰራተኞች',
    complaints: 'ጥቆማ እና አቤቱታ',
    settings: 'ቅንብሮች',
    qrAccess: 'QR መዳረሻ',
    statistics: 'መረጃ',
    quickAccess: 'ፈጣን መዳረሻ',
    administrator: 'አስተዳዳሪ',
    goodMorning: 'እንደምን አደሩ',
    goodAfternoon: 'እንደምን ዋሉ',
    goodEvening: 'እንደምን አመሹ',
    systemOverview: 'የዛሬው የስርዓት አጠቃላይ እይታ።',
    documentsLibrary: 'ሰነዶች',
    newsMedia: 'ዜናዎች',
    citizenComplaints: 'ጥቆማዎች',
    registeredPersonnel: 'የተመዘገቡ ተቆጣጣሪዎች ',
    pendingQrRequests: 'በመጠባበቅ ላይ ያሉ QR ጥያቄዎች',
    viewAll: 'ሁሉንም ይመልከቱ',
    quickActions: 'ፈጣን እርምጃዎች',
    approve: 'ያጽድቁ',
    deny: 'ይከልክሉ',
    addNewStaff: 'አዲስ አባል ጨምር',
    createNewsArticle: 'ዜና ጽሁፍ ፍጠር',
    manageQrCodes: 'QR ኮዶችን ያስተዳድሩ',
    viewStatistics: 'መረጃ ይመልከቱ',
    recentOperations: 'የቅርብ ጊዜ እንቅስቃሴ',
    idAndUser: 'መለያ እና ተጠቃሚ',
    action: 'እርምጃ',
    target: 'ዒላማ',
    details: 'ዝርዝር',
    synced: 'ተመሳስሏል',
    active: 'ንቁ',
    priority: 'ቅድመ ተሰጥዎ',
    verified: 'ተረጋግጧል',
    added: 'ተጨመረ',
    archived: 'ተደብቋል',
    published: 'ታተመ',
    drafts: 'ረቂቅ',
    new: 'አዲስ',
    resolved: 'ተፈቷል',
    leave: 'በዕረፍት',
    toggleLanguage: 'ቋንቋ ቀይር',
    toggleTheme: 'ገጽታ ቀይር',
    assessment: 'ምዘና',
    feedback: 'አስተያየት መቀበያ',
    admins: 'አስተዳዳሪዎች',
    analytics: 'ትንታኔ',
  },
  en: {
    dashboard: 'Dashboard',
    news: 'News',
    documents: 'Documents',
    personnel: 'Personnel',
    complaints: 'Complaints',
    settings: 'Settings',
    qrAccess: 'QR Access',
    statistics: 'Statistics',
    quickAccess: 'Quick access',
    administrator: 'Administrator',
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    systemOverview: "Here's your system overview for today.",
    documentsLibrary: 'Documents Library',
    newsMedia: 'News & Media',
    citizenComplaints: 'Citizen Complaints',
    registeredPersonnel: 'Registered Personnel',
    pendingQrRequests: 'Pending QR Requests',
    viewAll: 'View All',
    quickActions: 'Quick Actions',
    approve: 'Approve',
    deny: 'Deny',
    addNewStaff: 'Add New Staff',
    createNewsArticle: 'Create News Article',
    manageQrCodes: 'Manage QR Codes',
    viewStatistics: 'View Statistics',
    recentOperations: 'Recent Operations',
    idAndUser: 'ID & User',
    action: 'Action',
    target: 'Target',
    details: 'Details',
    synced: 'Synced',
    active: 'Active',
    priority: 'Priority',
    verified: 'Verified',
    added: 'Added',
    archived: 'Archived',
    published: 'Published',
    drafts: 'Drafts',
    new: 'New',
    resolved: 'Resolved',
    leave: 'Leave',
    toggleLanguage: 'Toggle Language',
    toggleTheme: 'Toggle Theme',
    assessment: 'Assessment',
    feedback: 'Feedback Inbox',
    admins: 'Admins',
    analytics: 'Analytics',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('am');

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
