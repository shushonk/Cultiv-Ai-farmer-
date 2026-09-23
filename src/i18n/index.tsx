import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import enDict from './en.json';
import knDict from './kn.json';
import hiDict from './hi.json';
import { Language } from '../types';

type TranslationTree = Record<string, any>;

const DICTIONARIES: Record<Language, TranslationTree> = {
  en: enDict,
  kn: knDict,
  hi: hiDict,
};

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tStatus: (status: string) => string;
  tRisk: (risk: string) => string;
  tSeverity: (severity: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cultivai_language_v2') as Language;
      if (stored && ['en', 'kn', 'hi'].includes(stored)) {
        return stored;
      }
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cultivai_language_v2', lang);
      document.documentElement.lang = lang;
      // also notify storage service if present
      try {
        const storedUser = localStorage.getItem('cultivai_session_v2');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          u.preferredLanguage = lang;
          localStorage.setItem('cultivai_session_v2', JSON.stringify(u));
        }
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      const dict = DICTIONARIES[language] || DICTIONARIES.en;
      const parts = key.split('.');
      let current: any = dict;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          // Fallback to English dictionary
          let fallback: any = DICTIONARIES.en;
          for (const fbPart of parts) {
            if (fallback && typeof fallback === 'object' && fbPart in fallback) {
              fallback = fallback[fbPart];
            } else {
              fallback = null;
              break;
            }
          }
          current = fallback || key;
          break;
        }
      }

      if (typeof current !== 'string') {
        return key;
      }

      let res = current;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          res = res.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return res;
    };
  }, [language]);

  const tStatus = (status: string): string => {
    const map: Record<string, string> = {
      'AI Analysed': 'status.aiAnalysed',
      'Under Review': 'status.underReview',
      'Confirmed by Expert': 'status.confirmed',
      'Expert Confirmed': 'status.confirmed',
      'Advisory Dispatched': 'status.advisoryDispatched',
      'Resolved': 'status.resolved',
      'Rejected': 'status.rejected',
      'Escalated to Lab': 'status.escalated',
      'Scheduled': 'status.scheduled',
      'Completed': 'status.completed',
      'Pending': 'status.pending',
      'Healthy': 'status.healthy',
      'Attention': 'status.attention',
    };
    const key = map[status];
    return key ? t(key) : status;
  };

  const tRisk = (risk: string): string => {
    const key = `risk.${risk.toLowerCase()}`;
    const translated = t(key);
    return translated !== key ? translated : risk;
  };

  const tSeverity = (sev: string): string => {
    const key = `severity.${sev.toLowerCase()}`;
    const translated = t(key);
    return translated !== key ? translated : sev;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, tStatus, tRisk, tSeverity }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
};
