import React, { useState } from 'react';
import { User, Language, AlertItem } from '../../types';
import { StorageService } from '../../services/storage';
import { getTranslation } from '../../i18n/translations';
import {
  Bell,
  Globe,
  LogOut,
  ChevronDown,
  Menu,
  Shield,
  Sprout,
  CheckCircle,
  AlertTriangle,
  X,
  User as UserIcon,
} from 'lucide-react';

interface Props {
  user: User | null;
  onNavigate: (path: string) => void;
  onToggleSidebar?: () => void;
  currentPath: string;
}

export const Header: React.FC<Props> = ({ user, onNavigate, onToggleSidebar, currentPath }) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [alertMenuOpen, setAlertMenuOpen] = useState(false);
  const currentLang = StorageService.getLanguage();
  const t = getTranslation(currentLang);
  const alerts = user ? StorageService.getAlerts(user.role, user.id) : [];
  const unreadCount = alerts.filter((a) => !a.read).length;

  const handleLangSelect = (lang: Language) => {
    StorageService.setLanguage(lang);
    setLangMenuOpen(false);
    window.location.reload(); // Quick refresh to apply full dictionary
  };

  const handleLogout = () => {
    if (user) {
      const rolePath = user.role.toLowerCase();
      StorageService.logout();
      onNavigate(`/${rolePath}/login`);
    } else {
      StorageService.logout();
      onNavigate('/');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'FARMER':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'EXPERT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'OFFICER':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0b1324]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left branding and mobile toggle */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => onNavigate(user ? `/${user.role.toLowerCase()}/dashboard` : '/')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-white font-sans">
                  Cultiv<span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  v2.6
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Agricultural Crop Health Intelligence</p>
            </div>
          </div>
        </div>

        {/* Center / Navigation for public mode */}
        {!user && (
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300 font-medium">
            <button
              onClick={() => onNavigate('/')}
              className={`hover:text-white transition-colors ${currentPath === '/' ? 'text-emerald-400 font-semibold' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('/features')}
              className={`hover:text-white transition-colors ${currentPath === '/features' ? 'text-emerald-400 font-semibold' : ''}`}
            >
              Features
            </button>
            <button
              onClick={() => onNavigate('/how-it-works')}
              className={`hover:text-white transition-colors ${currentPath === '/how-it-works' ? 'text-emerald-400 font-semibold' : ''}`}
            >
              How It Works
            </button>
            <button
              onClick={() => onNavigate('/technology')}
              className={`hover:text-white transition-colors ${currentPath === '/technology' ? 'text-emerald-400 font-semibold' : ''}`}
            >
              Technology & IPM
            </button>
            <button
              onClick={() => onNavigate('/about')}
              className={`hover:text-white transition-colors ${currentPath === '/about' ? 'text-emerald-400 font-semibold' : ''}`}
            >
              About
            </button>
          </nav>
        )}

        {/* Right tools (Language, Notifications, Profile / Portal Access) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multilingual Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="uppercase">{currentLang}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1.5 z-50">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-800">
                  Select Language
                </div>
                <button
                  onClick={() => handleLangSelect('en')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${currentLang === 'en' ? 'text-emerald-400 font-semibold' : 'text-slate-300'}`}
                >
                  <span>English (EN)</span>
                  {currentLang === 'en' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
                <button
                  onClick={() => handleLangSelect('kn')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${currentLang === 'kn' ? 'text-emerald-400 font-semibold' : 'text-slate-300'}`}
                >
                  <span>ಕನ್ನಡ (Kannada)</span>
                  {currentLang === 'kn' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
                <button
                  onClick={() => handleLangSelect('hi')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 ${currentLang === 'hi' ? 'text-emerald-400 font-semibold' : 'text-slate-300'}`}
                >
                  <span>हिंदी (Hindi)</span>
                  {currentLang === 'hi' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Notifications if logged in */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setAlertMenuOpen(!alertMenuOpen)}
                className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
                aria-label="View system alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-[#0b1324]" />
                )}
              </button>

              {alertMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Alerts & Advisories ({unreadCount} New)
                    </span>
                    <button
                      onClick={() => setAlertMenuOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No new alerts at this time.</div>
                    ) : (
                      alerts.slice(0, 5).map((a) => (
                        <div
                          key={a.id}
                          className={`p-3 text-xs hover:bg-slate-800/50 cursor-pointer ${!a.read ? 'bg-slate-800/20' : ''}`}
                          onClick={() => {
                            StorageService.markAlertRead(a.id);
                            if (a.linkedCaseId) {
                              onNavigate(`/${user.role.toLowerCase()}/cases?id=${a.linkedCaseId}`);
                            }
                            setAlertMenuOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
                            {a.level === 'critical' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                            <span>{a.title}</span>
                          </div>
                          <p className="text-slate-300 line-clamp-2">{a.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User profile or Public Login Button */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-white truncate max-w-[140px]">{user.name}</div>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out of current workspace"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/login')}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Access Portal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
