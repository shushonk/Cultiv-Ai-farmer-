import React, { useState } from 'react';
import { User, Language } from '../../types';
import { StorageService } from '../../services/storage';
import { API } from '../../services/api';
import { useI18n } from '../../i18n';
import {
  UserSettings,
  NotificationPreferences,
  SecuritySessionItem,
  OfficerPreferences,
} from '../../types/settings';
import {
  User as UserIcon,
  Globe,
  Bell,
  Lock,
  MapPin,
  BarChart3,
  Flame,
  Radio,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Calendar,
  Layers,
} from 'lucide-react';

interface Props {
  user: User;
  onNavigate: (path: string) => void;
}

export const OfficerSettingsView: React.FC<Props> = ({ user, onNavigate }) => {
  const { language: currentLang, setLanguage, t } = useI18n();

  const [activeTab, setActiveTab] = useState<
    | 'profile'
    | 'map'
    | 'reports'
    | 'notifications'
    | 'display'
    | 'security'
  >('profile');

  // State
  const [userSettings, setUserSettings] = useState<UserSettings>(() =>
    StorageService.getUserSettings(user.id)
  );
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(() =>
    StorageService.getNotificationPreferences(user.id)
  );
  const [officerPrefs, setOfficerPrefs] = useState<OfficerPreferences>(() =>
    StorageService.getOfficerPreferences(user.id)
  );
  const [sessions, setSessions] = useState<SecuritySessionItem[]>(() =>
    StorageService.getSecuritySessions(user.id)
  );

  // Profile fields
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [jurisdiction, setJurisdiction] = useState(user.location?.district || 'Kolar District (Mulbagal, Srinivaspur, Bangarapet Taluks)');
  const [department, setDepartment] = useState(user.organization || 'Department of Agriculture, Govt. of Karnataka');

  // Security password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleSaveActiveTab = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'profile') {
        const updated: User = {
          ...user,
          name,
          email,
          phone,
          organization: department,
          location: {
            ...user.location,
            district: jurisdiction.split(' ')[0],
            state: 'Karnataka',
          },
        };
        StorageService.updateUser(updated);
        StorageService.setCurrentUser(updated);
      } else if (activeTab === 'map' || activeTab === 'reports') {
        StorageService.updateOfficerPreferences(user.id, officerPrefs);
        await API.updateOfficerPreferences(officerPrefs);
      } else if (activeTab === 'notifications') {
        StorageService.updateNotificationPreferences(user.id, notifPrefs);
        await API.updateNotificationPreferences(notifPrefs);
      } else if (activeTab === 'display') {
        StorageService.updateUserSettings(user.id, userSettings);
        await API.updateUserSettings(userSettings);
        if (userSettings.language !== currentLang) {
          setLanguage(userSettings.language);
        }
      }
      showFeedback('success', t('settings.savedSuccess'));
    } catch (err: any) {
      console.error(err);
      showFeedback('error', t('settings.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetActiveTab = () => {
    if (activeTab === 'map' || activeTab === 'reports') {
      setOfficerPrefs(StorageService.getOfficerPreferences(user.id));
    } else if (activeTab === 'notifications') {
      setNotifPrefs(StorageService.getNotificationPreferences(user.id));
    } else if (activeTab === 'display') {
      setUserSettings(StorageService.getUserSettings(user.id));
    }
    showFeedback('success', 'Reset to saved defaults.');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);
    if (newPassword.length < 8) {
      setPwdError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Passwords do not match.');
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

  const tabs = [
    { id: 'profile', label: 'Officer Jurisdiction', icon: UserIcon },
    { id: 'map', label: 'GIS & Map Preferences', icon: MapPin },
    { id: 'reports', label: 'Epidemic Reports & Export', icon: BarChart3 },
    { id: 'notifications', label: 'Broadcast & Alert Rules', icon: Bell },
    { id: 'display', label: 'Language & Interface', icon: Globe },
    { id: 'security', label: 'Security & Access', icon: Lock },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{t('settings.title')}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Agricultural Surveillance Officer
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Configure jurisdiction boundaries, GIS cluster layers, emergency broadcast channels, and epidemiology data parameters.
          </p>
        </div>

        {activeTab !== 'security' && (
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
              className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? t('settings.saving') : t('settings.saveChanges')}</span>
            </button>
          </div>
        )}
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    ? 'bg-blue-500 text-slate-950 font-bold shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="md:col-span-3">
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            {/* 1. JURISDICTION PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Extension Officer Identification</h3>
                  <p className="text-xs text-slate-400">Assigned taluk jurisdiction, administrative agency, and official contact info.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Officer Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Jurisdiction Territory / Taluks</label>
                    <input
                      type="text"
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Department / Directorate</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Official Mobile (SMS Broadcast Node)</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. MAP & GIS */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">GIS Surveillance Map Preferences</h3>
                  <p className="text-xs text-slate-400">Configure default layer visibility, cluster aggregation radius, and satellite rendering.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Default Map Perspective</label>
                    <select
                      value={officerPrefs.defaultMapView}
                      onChange={(e) => setOfficerPrefs({ ...officerPrefs, defaultMapView: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400"
                    >
                      <option value="region">Regional District Overview</option>
                      <option value="district">Assigned District Centric</option>
                      <option value="assignment">Direct Field Visit Route</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Hotspot Sensitivity Level</label>
                    <select
                      value={officerPrefs.mapSettings.hotspotSensitivity}
                      onChange={(e) =>
                        setOfficerPrefs({
                          ...officerPrefs,
                          mapSettings: {
                            ...officerPrefs.mapSettings,
                            hotspotSensitivity: e.target.value as any,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400"
                    >
                      <option value="high">High (Highlights even small 2-acre clusters)</option>
                      <option value="medium">Medium Standard (Recommended)</option>
                      <option value="low">Low (Large epidemic clusters &gt; 50 acres only)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Base Map Cartography</label>
                    <select
                      value={officerPrefs.mapSettings.mapStyle}
                      onChange={(e) =>
                        setOfficerPrefs({
                          ...officerPrefs,
                          mapSettings: {
                            ...officerPrefs.mapSettings,
                            mapStyle: e.target.value as any,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400"
                    >
                      <option value="streets">High-Contrast Dark Vector Streets</option>
                      <option value="satellite">High-Res Satellite Multispectral</option>
                      <option value="terrain">Topographic Relief & Watershed</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Cluster Radius (Pixels)</label>
                    <input
                      type="number"
                      min={20}
                      max={120}
                      value={officerPrefs.mapSettings.clusterRadius}
                      onChange={(e) =>
                        setOfficerPrefs({
                          ...officerPrefs,
                          mapSettings: {
                            ...officerPrefs.mapSettings,
                            clusterRadius: parseInt(e.target.value) || 50,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Active Layers on Launch
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={officerPrefs.defaultMapLayers.hotspots}
                        onChange={(e) =>
                          setOfficerPrefs({
                            ...officerPrefs,
                            defaultMapLayers: { ...officerPrefs.defaultMapLayers, hotspots: e.target.checked },
                          })
                        }
                        className="rounded border-slate-700 text-blue-500 focus:ring-0"
                      />
                      <span>Active Hotspot Polygons</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={officerPrefs.defaultMapLayers.fieldVisits}
                        onChange={(e) =>
                          setOfficerPrefs({
                            ...officerPrefs,
                            defaultMapLayers: { ...officerPrefs.defaultMapLayers, fieldVisits: e.target.checked },
                          })
                        }
                        className="rounded border-slate-700 text-blue-500 focus:ring-0"
                      />
                      <span>Scheduled Field Visits</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={officerPrefs.defaultMapLayers.weather}
                        onChange={(e) =>
                          setOfficerPrefs({
                            ...officerPrefs,
                            defaultMapLayers: { ...officerPrefs.defaultMapLayers, weather: e.target.checked },
                          })
                        }
                        className="rounded border-slate-700 text-blue-500 focus:ring-0"
                      />
                      <span>Weather Precipitation Radar</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 3. REPORTS & EXPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Epidemiological Report Defaults</h3>
                  <p className="text-xs text-slate-400">Preset aggregation windows and government ministry export templates.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Default Analysis Window</label>
                    <select
                      value={officerPrefs.reportPreferences.defaultPeriod}
                      onChange={(e) =>
                        setOfficerPrefs({
                          ...officerPrefs,
                          reportPreferences: {
                            ...officerPrefs.reportPreferences,
                            defaultPeriod: e.target.value as any,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400"
                    >
                      <option value="7d">Last 7 Days (Emergency Velocity)</option>
                      <option value="30d">Last 30 Days (Monthly Trend)</option>
                      <option value="90d">Quarterly Extension Cycle</option>
                      <option value="season">Full Kharif / Rabi Cropping Season</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Preferred File Format</label>
                    <select
                      value={officerPrefs.reportPreferences.preferredExportFormat}
                      onChange={(e) =>
                        setOfficerPrefs({
                          ...officerPrefs,
                          reportPreferences: {
                            ...officerPrefs.reportPreferences,
                            preferredExportFormat: e.target.value as any,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400"
                    >
                      <option value="PDF">Formatted Briefing PDF (with Charts)</option>
                      <option value="CSV">Raw Tabular CSV</option>
                      <option value="XLSX">Excel Spreadsheet (XLSX)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 4. NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Emergency Broadcast & Officer Alerts</h3>
                  <p className="text-xs text-slate-400">Receive alerts when outbreak conditions exceed statistical standard deviations.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">New High-Risk Cluster Detected in Taluk</span>
                    <input
                      type="checkbox"
                      checked={notifPrefs.regionalOutbreak}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, regionalOutbreak: e.target.checked })}
                      className="rounded border-slate-700 text-blue-500 focus:ring-0"
                    />
                  </label>
                  <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Pest Surge & Invasive Moth Warnings</span>
                    <input
                      type="checkbox"
                      checked={notifPrefs.pestSurge}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, pestSurge: e.target.checked })}
                      className="rounded border-slate-700 text-blue-500 focus:ring-0"
                    />
                  </label>
                  <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Field Inspection Scheduled / Reassigned</span>
                    <input
                      type="checkbox"
                      checked={notifPrefs.caseCreated}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, caseCreated: e.target.checked })}
                      className="rounded border-slate-700 text-blue-500 focus:ring-0"
                    />
                  </label>
                  <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Direct Farmer Escalation Messages</span>
                    <input
                      type="checkbox"
                      checked={notifPrefs.farmerMessages}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, farmerMessages: e.target.checked })}
                      className="rounded border-slate-700 text-blue-500 focus:ring-0"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 5. DISPLAY & LANGUAGE */}
            {activeTab === 'display' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Language & Regional Presentation</h3>
                  <p className="text-xs text-slate-400">Seamless toggle between administrative state languages.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Portal Interface Language</label>
                    <select
                      value={userSettings.language}
                      onChange={(e) => {
                        const l = e.target.value as Language;
                        setUserSettings({ ...userSettings, language: l });
                        setLanguage(l);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400"
                    >
                      <option value="en">English (Official Government)</option>
                      <option value="kn">ಕನ್ನಡ (Karnataka Agriculture Dept.)</option>
                      <option value="hi">हिन्दी (Central Ministry)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 6. SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Officer Authentication & Session Guard</h3>
                  <p className="text-xs text-slate-400">Update officer access credentials and manage authenticated devices.</p>
                </div>

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
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">New Password (Min 8 chars)</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs"
                    >
                      Update Password
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Active Field Officer Sessions</h4>
                  {sessions.map((sess) => (
                    <div key={sess.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{sess.device}</div>
                        <div className="text-slate-400 text-[11px]">{sess.browser} • {sess.locationApprox} • IP: {sess.ipAddress}</div>
                      </div>
                      {sess.isCurrent ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Current Surveillance Terminal
                        </span>
                      ) : (
                        <button
                          onClick={async () => {
                            StorageService.terminateSession(user.id, sess.id);
                            setSessions(StorageService.getSecuritySessions(user.id));
                            await API.revokeSession(sess.id);
                            showFeedback('success', 'Session terminated.');
                          }}
                          className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 text-xs font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
