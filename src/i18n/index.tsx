import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import enDict from './en.json';
import knDict from './kn.json';
import hiDict from './hi.json';
import mrDict from './mr.json';
import { translations as flatTranslations } from './translations';
import { StorageService } from '../services/storage';
import { Language } from '../types';

type TranslationTree = Record<string, any>;

const DICTIONARIES: Record<Language, TranslationTree> = {
  en: enDict,
  kn: knDict,
  hi: hiDict,
  mr: mrDict,
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
  const [language, setLanguageState] = useState<Language>(() => StorageService.getLanguage());

  const setLanguage = useCallback((lang: Language) => {
    StorageService.setLanguage(lang);
    setLanguageState(lang);

    // Synchronize with user_settings in the backend database if authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('cultivai_token_v2') : null;
    if (token) {
      fetch('/api/settings/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ language: lang }),
      }).catch((err) => {
        console.warn('Backend language sync warning:', err);
      });
    }
  }, []);

  // Subscription mechanism for cross-component / storage updates
  useEffect(() => {
    const handleLanguageChange = () => {
      const activeLang = StorageService.getLanguage();
      setLanguageState(activeLang);
    };

    window.addEventListener('cultivai_language_changed' as any, handleLanguageChange);
    window.addEventListener('storage', handleLanguageChange);

    return () => {
      window.removeEventListener('cultivai_language_changed' as any, handleLanguageChange);
      window.removeEventListener('storage', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      if (!key) return '';

      // Helper for nested dictionary traversal
      const lookupNested = (dict: TranslationTree, pathKey: string): string | null => {
        const parts = pathKey.split('.');
        let curr: any = dict;
        for (const part of parts) {
          if (curr && typeof curr === 'object' && part in curr) {
            curr = curr[part];
          } else {
            return null;
          }
        }
        return typeof curr === 'string' ? curr : null;
      };

      // 1. Try active language nested dictionary
      let found = lookupNested(DICTIONARIES[language] || DICTIONARIES.en, key);

      // 2. Try active language flat translations dictionary
      if (!found && flatTranslations[language] && (flatTranslations[language] as any)[key]) {
        found = (flatTranslations[language] as any)[key];
      }

      // 3. Fall back to English nested dictionary
      if (!found && language !== 'en') {
        found = lookupNested(DICTIONARIES.en, key);
      }

      // 4. Fall back to English flat translations dictionary
      if (!found && flatTranslations.en && (flatTranslations.en as any)[key]) {
        found = (flatTranslations.en as any)[key];
      }

      // 5. Final fallback formatting: convert 'nav.home' -> 'Home', 'nav.howItWorks' -> 'How It Works'
      if (!found) {
        const rawLastPart = key.split('.').pop() || key;
        found = rawLastPart
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
      }

      let res = found;
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
