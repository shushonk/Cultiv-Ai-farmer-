import React, { useState, useEffect } from 'react';
import { User, Language } from '../../types';
import { StorageService } from '../../services/storage';
import { API } from '../../services/api';
import { useI18n } from '../../i18n';
import {
  UserSettings,
  NotificationPreferences,
  PrivacyPreferences,
  SecuritySessionItem,
  FarmerPreferences,
} from '../../types/settings';
import {
  User as UserIcon,
  Globe,
  Bell,
  Lock,
  Shield,
  Monitor,
  Sprout,
  Bot,
  Database,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Download,
  Trash2,
  Clock,
  Sparkles,
  MapPin,
  Eye,
  Sliders,
} from 'lucide-react';

interface Props {
  user: User;
  onNavigate: (path: string) => void;
}

export const FarmerSettingsView: React.FC<Props> = ({ user, onNavigate }) => {
  const { language: currentLang, setLanguage, t } = useI18n();

  const [activeTab, setActiveTab] = useState<
    | 'account'
    | 'language'
    | 'notifications'
    | 'privacy'
    | 'security'
    | 'display'
    | 'farm'
    | 'ai'
    | 'data'
  >('account');

  // State slices
  const [userSettings, setUserSettings] = useState<UserSettings>(() =>
    StorageService.getUserSettings(user.id)
  );
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(() =>
    StorageService.getNotificationPreferences(user.id)
  );
  const [privacyPrefs, setPrivacyPrefs] = useState<PrivacyPreferences>(() =>
    StorageService.getPrivacyPreferences(user.id)
  );
  const [farmerPrefs, setFarmerPrefs] = useState<FarmerPreferences>(() =>
    StorageService.getFarmerPreferences(user.id)
  );
  const [sessions, setSessions] = useState<SecuritySessionItem[]>(() =>
    StorageService.getSecuritySessions(user.id)
  );

  // Account form fields
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhone, setProfilePhone] = useState(user.phone);
  const [village, setVillage] = useState(user.location?.village || 'Avani');
  const [taluk, setTaluk] = useState(user.location?.taluk || 'Mulbagal');
  const [district, setDistrict] = useState(user.location?.district || 'Kolar');

  // Security password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  // Status flags
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fields = StorageService.getFields(user.id);
  const cases = StorageService.getCases({ farmerId: user.id });

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // 1. Save Handler
  const handleSaveActiveTab = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'account') {
        const updatedUser: User = {
          ...user,
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
          location: {
            ...user.location,
            state: user.location?.state || 'Karnataka',
            district,
            taluk,
            village,
          },
        };
        StorageService.updateUser(updatedUser);
        StorageService.setCurrentUser(updatedUser);
        await API.updateFarmerProfile({
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
          location: {
            state: user.location?.state || 'Karnataka',
            district,
            taluk,
            village,
          },
        });
      } else if (activeTab === 'language' || activeTab === 'display') {
        StorageService.updateUserSettings(user.id, userSettings);
        await API.updateUserSettings(userSettings);
        if (userSettings.language !== currentLang) {
          setLanguage(userSettings.language);
        }
      } else if (activeTab === 'notifications') {
        StorageService.updateNotificationPreferences(user.id, notifPrefs);
        await API.updateNotificationPreferences(notifPrefs);
      } else if (activeTab === 'privacy') {
        StorageService.updatePrivacyPreferences(user.id, privacyPrefs);
        await API.updatePrivacyPreferences(privacyPrefs);
      } else if (activeTab === 'farm' || activeTab === 'ai') {
        StorageService.updateFarmerPreferences(user.id, farmerPrefs);
        await API.updateFarmerPreferences(farmerPrefs);
      }

      showFeedback('success', t('settings.savedSuccess'));
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      showFeedback('error', t('settings.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Reset Handler
  const handleResetActiveTab = () => {
    if (activeTab === 'language' || activeTab === 'display') {
      const def = StorageService.getUserSettings(user.id);
      setUserSettings({ ...def });
    } else if (activeTab === 'notifications') {
      const def = StorageService.getNotificationPreferences(user.id);
      setNotifPrefs({ ...def });
    } else if (activeTab === 'privacy') {
      const def = StorageService.getPrivacyPreferences(user.id);
      setPrivacyPrefs({ ...def });
    } else if (activeTab === 'farm' || activeTab === 'ai') {
      const def = StorageService.getFarmerPreferences(user.id);
      setFarmerPrefs({ ...def });
    }
    showFeedback('success', 'Reset to previous saved preferences.');
  };

  // 3. Password Change Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword.length < 8) {
      setPwdError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirmation do not match.');
      return;
    }

    try {
      await API.changePassword({ currentPassword, newPassword, confirmPassword });
      setPwdSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdError(err.message || 'Failed to update password.');
    }
  };

  // 4. Session Revocation
  const handleRevokeSession = async (sessId: string) => {
    StorageService.terminateSession(user.id, sessId);
    setSessions(StorageService.getSecuritySessions(user.id));
    await API.revokeSession(sessId);
    showFeedback('success', 'Session terminated.');
  };

  // 5. Data Exports
  const handleExportData = () => {
    const data = {
      exportTimestamp: new Date().toISOString(),
      userProfile: user,
      userSettings,
      notificationPreferences: notifPrefs,
      privacyPreferences: privacyPrefs,
      farmerPreferences: farmerPrefs,
      fields,
      cases,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cultivai-farmer-data-${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('success', 'Export package downloaded.');
  };

  const handleExportCasesCsv = () => {
    const headers = ['CaseID', 'Date', 'Crop', 'Variety', 'Field', 'Condition', 'Confidence', 'Risk', 'Status'];
    const rows = cases.map((c) => [
      c.id,
      c.createdAt,
      c.crop,
      c.variety || 'N/A',
      c.fieldName,
      `"${c.aiPrediction.condition.replace(/"/g, '""')}"`,
      c.aiPrediction.confidence,
      c.riskAssessment.overallRisk,
      c.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cultivai-cases-${user.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('success', 'Case history CSV downloaded.');
  };

  const tabs = [
    { id: 'account', label: t('settings.tabs.account'), icon: UserIcon },
    { id: 'language', label: t('settings.tabs.languageRegion'), icon: Globe },
    { id: 'notifications', label: t('settings.tabs.notifications'), icon: Bell },
    { id: 'privacy', label: t('settings.tabs.privacy'), icon: Shield },
    { id: 'security', label: t('settings.tabs.security'), icon: Lock },
    { id: 'display', label: t('settings.tabs.display'), icon: Monitor },
    { id: 'farm', label: t('settings.tabs.farmPrefs'), icon: Sprout },
    { id: 'ai', label: t('settings.tabs.aiCopilot'), icon: Bot },
    { id: 'data', label: t('settings.tabs.data'), icon: Database },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{t('settings.title')}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Farmer Workspace
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Configure regional defaults, notification thresholds, privacy boundaries, and precision IPM agronomy parameters.
          </p>
        </div>

        {/* Global Save action */}
        {activeTab !== 'security' && activeTab !== 'data' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetActiveTab}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('settings.resetDefaults')}</span>
            </button>
            <button
              onClick={handleSaveActiveTab}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? t('settings.saving') : t('settings.saveChanges')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-medium animate-fadeIn ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Layout Grid: Sidebar Tabs + Content Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="md:col-span-1 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className="md:col-span-3">
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            {/* 1. ACCOUNT */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Farmer Profile & Identity</h3>
                  <p className="text-xs text-slate-400">Manage identity contact channels and administrative agricultural jurisdiction.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Registered Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Farmer Unique ID (Permanent)</label>
                    <input
                      type="text"
                      value={user.id}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-500 text-xs font-mono cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-500 block">System immutable identifier</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Mobile Phone (SMS Gateway)</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Village / Hobli</label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Taluk / Block</label>
                    <input
                      type="text"
                      value={taluk}
                      onChange={(e) => setTaluk(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Account Status</label>
                    <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{user.status || 'Active Grower (Verified)'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. LANGUAGE & REGION */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Language & Regional Preferences</h3>
                  <p className="text-xs text-slate-400">Changes apply immediately across diagnostics, advisories, and the whole portal.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">{t('settings.labels.language')}</label>
                    <select
                      value={userSettings.language}
                      onChange={(e) => {
                        const l = e.target.value as Language;
                        setUserSettings({ ...userSettings, language: l });
                        setLanguage(l);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    >
                      <option value="en">English (Global Technical)</option>
                      <option value="kn">ಕನ್ನಡ (Kannada - ಕರ್ನಾಟಕ ಕೃಷಿ)</option>
                      <option value="hi">हिन्दी (Hindi - राष्ट्रीय कृषि)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">{t('settings.labels.timezone')}</label>
                    <input
                      type="text"
                      value={userSettings.timezone}
                      onChange={(e) => setUserSettings({ ...userSettings, timezone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">{t('settings.labels.dateFormat')}</label>
                    <select
                      value={userSettings.dateFormat}
                      onChange={(e) => setUserSettings({ ...userSettings, dateFormat: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Standard)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">{t('settings.labels.timeFormat')}</label>
                    <select
                      value={userSettings.timeFormat}
                      onChange={(e) => setUserSettings({ ...userSettings, timeFormat: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    >
                      <option value="12h">12-Hour (e.g. 03:45 PM)</option>
                      <option value="24h">24-Hour (e.g. 15:45)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 3. NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Granular Notification Rules</h3>
                  <p className="text-xs text-slate-400">Control real alerts, SMS dispatching, and browser push triggers.</p>
                </div>

                {/* Channels */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Delivery Channels</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifPrefs.inAppEnabled}
                        onChange={(e) => setNotifPrefs({ ...notifPrefs, inAppEnabled: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <span>In-App Banner Notifications</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifPrefs.emailEnabled}
                        onChange={(e) => setNotifPrefs({ ...notifPrefs, emailEnabled: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <span>Email Delivery</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifPrefs.pushEnabled}
                        onChange={(e) => setNotifPrefs({ ...notifPrefs, pushEnabled: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <span>Browser Push</span>
                    </label>
                  </div>
                </div>

                {/* Event triggers */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Crop Health & Case Events</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                      <span className="text-slate-300">Expert Assigned to My Scan</span>
                      <input
                        type="checkbox"
                        checked={notifPrefs.expertAssigned}
                        onChange={(e) => setNotifPrefs({ ...notifPrefs, expertAssigned: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                    </label>
                    <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                      <span className="text-slate-300">Expert Review & Diagnosis Confirmed</span>
                      <input
                        type="checkbox"
                        checked={notifPrefs.reviewCompleted}
                        onChange={(e) => setNotifPrefs({ ...notifPrefs, reviewCompleted: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                    </label>
                    <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                      <span className="text-slate-300">Heavy Rain / Downpour Alert</span>
                      <input
                        type="checkbox"
                        checked={notifPrefs.heavyRain}
                        onChange={(e) => setNotifPrefs({ ...notifPrefs, heavyRain: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                    </label>
                    <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                      <span className="text-slate-300">Fungal Spore Germination Weather Warning</span>
                      <input
                        type="checkbox"
                        checked={notifPrefs.diseaseFavourableWeather}
                        onChange={(e) => setNotifPrefs({ ...notifPrefs, diseaseFavourableWeather: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                    </label>
                    <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                      <span className="text-slate-300">Regional Disease Outbreak / Cluster Broadcast</span>
                      <input
                        type="checkbox"
                        checked={notifPrefs.regionalOutbreak}
                        onChange={(e) => setNotifPrefs({ ...notifPrefs, regionalOutbreak: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                    </label>
                    <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                      <span className="text-slate-300">Direct Consultation Message from Specialist</span>
                      <input
                        type="checkbox"
                        checked={notifPrefs.expertMessages}
                        onChange={(e) => setNotifPrefs({ ...notifPrefs, expertMessages: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 4. PRIVACY */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Data Privacy & Spatial Protection</h3>
                  <p className="text-xs text-slate-400">Configure geolocation privacy and epidemiological surveillance permissions.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-xs font-semibold text-white block">Location Coordinate Sharing</label>
                    <select
                      value={privacyPrefs.locationSharing}
                      onChange={(e) => setPrivacyPrefs({ ...privacyPrefs, locationSharing: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    >
                      <option value="approximate">Fuzzy / Approximate Geolocation (Protects exact boundary, Recommended)</option>
                      <option value="precise_staff_only">Precise GPS coordinates for authorized extension officers only</option>
                      <option value="none">Strictly Private (Do not broadcast coordinates)</option>
                    </select>
                    <p className="text-[11px] text-slate-400">
                      Approximate mode obscures farm centroid within a 500m radius to preserve privacy while supporting cluster contagion tracking.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Epidemic Modeling Participation</h4>
                    <label className="flex items-center justify-between cursor-pointer text-xs">
                      <div>
                        <span className="text-white font-medium block">Contribute anonymized crop diagnoses to state GIS map</span>
                        <span className="text-[11px] text-slate-400">Enables early warnings for neighboring farmers without exposing identity.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacyPrefs.shareForSurveillance}
                        onChange={(e) => setPrivacyPrefs({ ...privacyPrefs, shareForSurveillance: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer text-xs pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-white font-medium block">Include parcel in Hotspot contagion severity index</span>
                        <span className="text-[11px] text-slate-400">Allows Agriculture department to schedule pesticide buffer operations.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacyPrefs.shareForHotspots}
                        onChange={(e) => setPrivacyPrefs({ ...privacyPrefs, shareForHotspots: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Login Security & Password Governance</h3>
                  <p className="text-xs text-slate-400">Manage cryptographic credentials and inspect authenticated browser sessions.</p>
                </div>

                {/* Password form */}
                <form onSubmit={handleChangePassword} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Update Password</h4>

                  {pwdError && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                      {pwdError}
                    </div>
                  )}
                  {pwdSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                      {pwdSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">New Password (Min 8 chars)</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                    >
                      Update Password
                    </button>
                  </div>
                </form>

                {/* Active Sessions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Active Device Sessions</h4>
                    <button
                      onClick={() => {
                        StorageService.terminateAllOtherSessions(user.id);
                        setSessions(StorageService.getSecuritySessions(user.id));
                        showFeedback('success', 'Terminated all other device sessions.');
                      }}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Sign Out All Other Devices
                    </button>
                  </div>

                  <div className="space-y-2">
                    {sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{sess.device}</span>
                            {sess.isCurrent && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Current Active Session
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-[11px]">
                            {sess.browser} • {sess.locationApprox} • IP: {sess.ipAddress}
                          </p>
                        </div>
                        {!sess.isCurrent && (
                          <button
                            onClick={() => handleRevokeSession(sess.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. DISPLAY & ACCESSIBILITY */}
            {activeTab === 'display' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Visual Display & Ergonomics</h3>
                  <p className="text-xs text-slate-400">Tailor UI contrast, density, and animation speeds for field sunlight readability.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Theme Appearance</label>
                    <select
                      value={userSettings.theme}
                      onChange={(e) => setUserSettings({ ...userSettings, theme: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    >
                      <option value="dark">High Contrast Dark (Battery Saver in Sunlight)</option>
                      <option value="light">Clear Light Mode</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Layout Density</label>
                    <select
                      value={userSettings.density}
                      onChange={(e) => setUserSettings({ ...userSettings, density: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    >
                      <option value="comfortable">Comfortable Touch (Spacious controls for outdoor use)</option>
                      <option value="compact">Compact Analytical</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Typography Scale</label>
                    <select
                      value={userSettings.textSize}
                      onChange={(e) => setUserSettings({ ...userSettings, textSize: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    >
                      <option value="default">Default Standard Scale</option>
                      <option value="large">Large Legible Text (Easier Reading)</option>
                      <option value="small">Small Dense</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={userSettings.reducedMotion}
                        onChange={(e) => setUserSettings({ ...userSettings, reducedMotion: e.target.checked })}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <span>Reduced Motion & Transition Effects</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 7. FARM PREFERENCES */}
            {activeTab === 'farm' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Farm Operations & Defaults</h3>
                  <p className="text-xs text-slate-400">Preset default plot, target crop, and measurement units to speed up new scans.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Default Selected Field</label>
                    <select
                      value={farmerPrefs.defaultFieldId || ''}
                      onChange={(e) => setFarmerPrefs({ ...farmerPrefs, defaultFieldId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    >
                      {fields.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.crop} - {f.areaAcres} Acres)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Primary Monitored Crop</label>
                    <select
                      value={farmerPrefs.preferredCrop}
                      onChange={(e) => setFarmerPrefs({ ...farmerPrefs, preferredCrop: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    >
                      <option value="Tomato">Tomato (Solanum lycopersicum)</option>
                      <option value="Rice / Paddy">Rice / Paddy (Oryza sativa)</option>
                      <option value="Chilli">Chilli / Pepper (Capsicum annuum)</option>
                      <option value="Cotton">Cotton (Gossypium hirsutum)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Measurement Units</label>
                    <select
                      value={farmerPrefs.preferredUnitSystem}
                      onChange={(e) => setFarmerPrefs({ ...farmerPrefs, preferredUnitSystem: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    >
                      <option value="metric">Metric (Acres, Liters, Grams, °C)</option>
                      <option value="imperial">Imperial (Hectares, Gallons, Oz, °F)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Weather Microclimate Station</label>
                    <input
                      type="text"
                      value={farmerPrefs.preferredWeatherLocation}
                      onChange={(e) => setFarmerPrefs({ ...farmerPrefs, preferredWeatherLocation: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 8. AI PREFERENCES */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Agronomy Copilot & AI Synthesis</h3>
                  <p className="text-xs text-slate-400">Configure explanation technicality and automatic agronomic context grounding.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">AI Explanation Technical Depth</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(['simple', 'standard', 'detailed'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFarmerPrefs({ ...farmerPrefs, aiExplanationLevel: lvl })}
                          className={`p-3 rounded-xl border text-left text-xs transition-all ${
                            farmerPrefs.aiExplanationLevel === lvl
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="capitalize block mb-0.5">{lvl}</span>
                          <span className="text-[10px] text-slate-500 block">
                            {lvl === 'simple' && 'Plain language, actionable spray steps only'}
                            {lvl === 'standard' && 'Standard agronomy with dosage and PHI'}
                            {lvl === 'detailed' && 'Scientific etiologies and spore biology'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Context Injected into Assistant Queries
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={farmerPrefs.aiIncludeContext.currentCrop}
                          onChange={(e) =>
                            setFarmerPrefs({
                              ...farmerPrefs,
                              aiIncludeContext: { ...farmerPrefs.aiIncludeContext, currentCrop: e.target.checked },
                            })
                          }
                          className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                        />
                        <span>Current Active Crop & Growth Stage</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={farmerPrefs.aiIncludeContext.weather}
                          onChange={(e) =>
                            setFarmerPrefs({
                              ...farmerPrefs,
                              aiIncludeContext: { ...farmerPrefs.aiIncludeContext, weather: e.target.checked },
                            })
                          }
                          className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                        />
                        <span>Real-Time Local Weather & Humidity</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={farmerPrefs.aiIncludeContext.recentScans}
                          onChange={(e) =>
                            setFarmerPrefs({
                              ...farmerPrefs,
                              aiIncludeContext: { ...farmerPrefs.aiIncludeContext, recentScans: e.target.checked },
                            })
                          }
                          className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                        />
                        <span>Recent Diagnostic History on Parcel</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 9. DATA & EXPORTS */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Data Portability & Regulatory Archival</h3>
                  <p className="text-xs text-slate-400">Export your diagnostic data, download certified reports, or view storage allocation.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-2xl font-bold text-white block">{fields.length}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Registered Fields</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-2xl font-bold text-white block">{cases.length}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Historical Scans</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-2xl font-bold text-emerald-400 block">
                      {cases.reduce((acc, c) => acc + c.images.length, 0)}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Leaf Images</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-2xl font-bold text-cyan-400 block">18.4 MB</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Storage Used</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Authorized Data Exports</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleExportData}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>{t('settings.labels.exportData')}</span>
                    </button>
                    <button
                      onClick={handleExportCasesCsv}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-medium text-xs flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>{t('settings.labels.downloadCases')}</span>
                    </button>
                  </div>
                </div>

                {/* Account Anonymization */}
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                  <h4 className="text-xs font-bold text-rose-400">Account Deletion & Data Retention Notice</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Under Indian Agricultural Epidemiology & ICAR guidelines, crop diagnostic images are soft-deleted and anonymized to preserve regional pathogen surveillance integrity while purging personal identifiers.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to request account deactivation and data anonymization?')) {
                        showFeedback('error', 'Deactivation request submitted to District Extension Officer.');
                      }
                    }}
                    className="text-xs text-rose-400 hover:underline font-semibold pt-1"
                  >
                    Request Account Anonymization →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
