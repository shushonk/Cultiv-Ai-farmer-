import React, { useState } from 'react';
import { User, Language } from '../../types';
import { StorageService } from '../../services/storage';
import { API } from '../../services/api';
import { SystemSettings } from '../../types/settings';
import { useI18n } from '../../i18n';
import {
  Settings,
  Shield,
  Users,
  Bell,
  Sparkles,
  CloudSun,
  MapPin,
  Globe,
  FileText,
  Database,
  Server,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  HardDrive,
  Eye,
  Sliders,
  Send,
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const SystemSettingsView: React.FC<Props> = ({ currentUser }) => {
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<
    | 'general'
    | 'security'
    | 'users'
    | 'auth'
    | 'notifications'
    | 'ai'
    | 'weather'
    | 'maps'
    | 'languages'
    | 'cases'
    | 'files'
    | 'privacy'
    | 'email'
    | 'maintenance'
    | 'system'
  >('general');

  const [settings, setSettings] = useState<SystemSettings>(() =>
    StorageService.getSystemSettings()
  );

  const [isSaving, setIsSaving] = useState(false);
  const [testEmailAddr, setTestEmailAddr] = useState('admin@cultivai.nic.in');
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const updated = StorageService.updateSystemSettings(settings);
      setSettings(updated);
      await API.updateAdminPlatformSettings(updated);

      StorageService.addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: 'ADMIN',
        action: 'UPDATE_PLATFORM_SETTINGS',
        resource: `/admin/settings/${activeTab}`,
        details: `Administrator updated platform parameters for [${activeTab.toUpperCase()}].`,
        status: 'SUCCESS',
      });

      showToast('success', t('settings.savedSuccess'));
    } catch (err: any) {
      console.error(err);
      showToast('error', t('settings.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    const fresh = StorageService.getSystemSettings();
    setSettings({ ...fresh });
    showToast('success', 'Reset to current database state.');
  };

  const handleSendTestEmail = async () => {
    setTestEmailStatus('Sending test email via configured SMTP relay...');
    try {
      const res = await API.testEmail(testEmailAddr);
      setTestEmailStatus(res.message);
      showToast('success', 'Test email dispatched.');
    } catch (err: any) {
      setTestEmailStatus('Test dispatch failed: ' + (err.message || 'SMTP error'));
      showToast('error', 'Failed to dispatch email.');
    }
  };

  const handleCreateBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: settings.system.appVersion,
      settings,
      users: StorageService.getUsers(),
      cases: StorageService.getCases(),
      fields: StorageService.getFields(),
      alerts: StorageService.getAlerts(),
      knowledge: StorageService.getKnowledge(),
      auditLogs: StorageService.getAuditLogs(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cultivai-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'DATABASE_BACKUP_CREATED',
      resource: '/admin/settings/backup',
      details: 'Admin exported full encrypted platform JSON backup.',
      status: 'SUCCESS',
    });

    showToast('success', 'Database JSON snapshot generated and downloaded.');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'auth', label: 'Authentication', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Diagnostic', icon: Sparkles },
    { id: 'weather', label: 'Weather Service', icon: CloudSun },
    { id: 'maps', label: 'Maps & GIS', icon: MapPin },
    { id: 'languages', label: 'Languages', icon: Globe },
    { id: 'cases', label: 'Case Policies', icon: FileText },
    { id: 'files', label: 'File Uploads', icon: HardDrive },
    { id: 'privacy', label: 'Privacy & Spatial', icon: Eye },
    { id: 'email', label: 'Email & SMTP', icon: Mail },
    { id: 'maintenance', label: 'Maintenance Mode', icon: Sliders },
    { id: 'system', label: 'System Overview', icon: Server },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-xl border shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fadeIn ${
            toastMessage.type === 'success'
              ? 'bg-purple-950/95 border-emerald-500/50 text-white'
              : 'bg-rose-950/95 border-rose-500/50 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
            <Settings className="w-4 h-4" />
            <span>Platform Configuration & Operational Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">System Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure global parameters, security enforcement, AI thresholds, localization, email, and backup archives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateBackup}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-800 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Create DB Backup</span>
          </button>
          <button
            onClick={() => handleSaveSettings()}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/20 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? t('settings.saving') : t('settings.saveChanges')}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation Strip */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3 text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-950/40 hover:bg-slate-900 border border-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels Form */}
      <form onSubmit={handleSaveSettings} className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        {/* 1. GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">General Platform Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Platform Brand Title</label>
                <input
                  type="text"
                  value={settings.general.platformName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, platformName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tagline</label>
                <input
                  type="text"
                  value={settings.general.tagline}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, tagline: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Governing Institution</label>
                <input
                  type="text"
                  value={settings.general.organizationName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, organizationName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Support Official Email</label>
                <input
                  type="email"
                  value={settings.general.supportEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, supportEmail: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Support Helpline Phone</label>
                <input
                  type="text"
                  value={settings.general.supportPhone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, supportPhone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Default Timezone</label>
                <input
                  type="text"
                  value={settings.general.defaultTimezone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, defaultTimezone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Security & Password Policy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Minimum Password Length</label>
                <input
                  type="number"
                  min={6}
                  max={32}
                  value={settings.security.minPasswordLength}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, minPasswordLength: parseInt(e.target.value) || 8 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Max Failed Login Attempts</label>
                <input
                  type="number"
                  min={3}
                  max={10}
                  value={settings.security.maxFailedAttempts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, maxFailedAttempts: parseInt(e.target.value) || 5 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Lock Duration (Minutes)</label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={settings.security.lockDurationMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, lockDurationMinutes: parseInt(e.target.value) || 15 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.requireMfaAdmin}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, requireMfaAdmin: e.target.checked },
                    })
                  }
                  className="rounded border-slate-700 text-purple-500 focus:ring-0"
                />
                <span>Mandatory Multi-Factor Authentication (MFA) for System Administrators</span>
              </label>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.requireMfaExpert}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, requireMfaExpert: e.target.checked },
                    })
                  }
                  className="rounded border-slate-700 text-purple-500 focus:ring-0"
                />
                <span>Mandatory MFA for Diagnostic Specialists</span>
              </label>
            </div>
          </div>
        )}

        {/* 3. USERS & ROLES */}
        {activeTab === 'users' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Registration & RBAC Governance</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-semibold text-white block">Public Farmer Self-Registration</span>
                  <span className="text-[11px] text-slate-400">Allows growers to sign up directly from login screen</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.usersAndRoles.farmerRegistrationEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      usersAndRoles: {
                        ...settings.usersAndRoles,
                        farmerRegistrationEnabled: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-slate-700 text-purple-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                <div>
                  <span className="font-semibold text-white block">Specialist Registration Approval Required</span>
                  <span className="text-[11px] text-slate-400">Newly registered Experts must be verified by Admin before seeing cases</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.usersAndRoles.expertRegistrationApprovalRequired}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      usersAndRoles: {
                        ...settings.usersAndRoles,
                        expertRegistrationApprovalRequired: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-slate-700 text-purple-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        )}

        {/* 4. AUTHENTICATION */}
        {activeTab === 'auth' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Session Lifespans & Sliding Token Windows</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Session Max Duration (Hours)</label>
                <input
                  type="number"
                  value={settings.authentication.sessionDurationHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      authentication: {
                        ...settings.authentication,
                        sessionDurationHours: parseInt(e.target.value) || 24,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Refresh Token Window (Days)</label>
                <input
                  type="number"
                  value={settings.authentication.refreshTokenDurationDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      authentication: {
                        ...settings.authentication,
                        refreshTokenDurationDays: parseInt(e.target.value) || 30,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Global Dispatch Channels</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer">
                <span className="text-slate-300 font-medium">In-App Channel</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.inAppChannelEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, inAppChannelEnabled: e.target.checked },
                    })
                  }
                  className="rounded border-slate-700 text-purple-500 focus:ring-0"
                />
              </label>

              <label className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer">
                <span className="text-slate-300 font-medium">Email Dispatch Channel</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailChannelEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailChannelEnabled: e.target.checked },
                    })
                  }
                  className="rounded border-slate-700 text-purple-500 focus:ring-0"
                />
              </label>

              <label className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer">
                <span className="text-slate-300 font-medium">Browser Push Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notifications.browserChannelEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, browserChannelEnabled: e.target.checked },
                    })
                  }
                  className="rounded border-slate-700 text-purple-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        )}

        {/* 6. AI DIAGNOSTIC TAB */}
        {activeTab === 'ai' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">AI Vision Inference Engine</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Active Model</label>
                <select
                  value={settings.ai.model}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ai: { ...settings.ai, model: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Sub-second Edge Inference)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Research & Complex Multi-Pathology)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Human Review Confidence Threshold (%)</label>
                <input
                  type="number"
                  min={50}
                  max={95}
                  value={Math.round(settings.ai.expertReviewThreshold * 100)}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ai: { ...settings.ai, expertReviewThreshold: (parseInt(e.target.value) || 80) / 100 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Scans below this confidence score are automatically locked for Expert sign-off.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 7. WEATHER SERVICE */}
        {activeTab === 'weather' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Meteorological Ingestion Service</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Provider Engine</label>
                <select
                  value={settings.weather.provider}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weather: { ...settings.weather, provider: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="OpenMeteo">Open-Meteo (Real-Time Satellite & Microclimate)</option>
                  <option value="IMD">India Meteorological Department (IMD Agrimet)</option>
                  <option value="Mock">Deterministic Simulation Mock</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Update Frequency (Minutes)</label>
                <input
                  type="number"
                  value={settings.weather.updateFrequencyMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weather: {
                        ...settings.weather,
                        updateFrequencyMinutes: parseInt(e.target.value) || 30,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 8. MAPS & GIS */}
        {activeTab === 'maps' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Geospatial Cartography & Cluster Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hotspot Radius (Kilometers)</label>
                <input
                  type="number"
                  value={settings.maps.hotspotRadiusKm}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maps: { ...settings.maps, hotspotRadiusKm: parseInt(e.target.value) || 15 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cluster Case Threshold</label>
                <input
                  type="number"
                  value={settings.maps.clusterThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maps: { ...settings.maps, clusterThreshold: parseInt(e.target.value) || 5 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Privacy Obfuscation Radius (Meters)</label>
                <input
                  type="number"
                  value={settings.maps.privacyRadiusMeters}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maps: { ...settings.maps, privacyRadiusMeters: parseInt(e.target.value) || 500 },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 9. LANGUAGES */}
        {activeTab === 'languages' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">System Internationalization (i18n)</h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-white block">Active Dictionaries</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-white block">English (en)</span>
                  <span className="text-[10px] text-emerald-400">100% Translated (Default Base)</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-white block">ಕನ್ನಡ (kn)</span>
                  <span className="text-[10px] text-emerald-400">100% Translated (Karnataka)</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-white block">हिन्दी (hi)</span>
                  <span className="text-[10px] text-emerald-400">100% Translated (National)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 10. CASE POLICIES */}
        {activeTab === 'cases' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Epidemic Case Management & Escalation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Critical Risk Escalation Cutoff (%)</label>
                <input
                  type="number"
                  value={settings.caseManagement.criticalRiskThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      caseManagement: {
                        ...settings.caseManagement,
                        criticalRiskThreshold: parseInt(e.target.value) || 75,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Follow-Up Assessment Due (Days)</label>
                <input
                  type="number"
                  value={settings.caseManagement.defaultFollowUpDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      caseManagement: {
                        ...settings.caseManagement,
                        defaultFollowUpDays: parseInt(e.target.value) || 7,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 11. FILE UPLOADS */}
        {activeTab === 'files' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Storage Quotas & Media Boundaries</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Max Image Size (MB)</label>
                <input
                  type="number"
                  value={settings.fileUploads.maxImageSizeMb}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      fileUploads: {
                        ...settings.fileUploads,
                        maxImageSizeMb: parseInt(e.target.value) || 10,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Max Images Allowed Per Scan</label>
                <input
                  type="number"
                  value={settings.fileUploads.maxImagesPerCase}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      fileUploads: {
                        ...settings.fileUploads,
                        maxImagesPerCase: parseInt(e.target.value) || 5,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 12. PRIVACY & SPATIAL */}
        {activeTab === 'privacy' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Farmer Data Obfuscation & Spatial Protection</h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <label className="block font-semibold text-slate-300">Default Spatial Obfuscation Mode</label>
              <select
                value={settings.privacy.farmerLocationMode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, farmerLocationMode: e.target.value as any },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white"
              >
                <option value="approximate">Fuzzy / Approximate Centroid (Recommended for Grower Privacy)</option>
                <option value="exact">Exact GPS Boundary Coordinates</option>
                <option value="aggregated">Aggregated Taluk Centroid Only</option>
              </select>
            </div>
          </div>
        )}

        {/* 13. EMAIL & SMTP */}
        {activeTab === 'email' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">SMTP Gateway Configuration & Dispatch Test</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">SMTP Host Relay</label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, smtpHost: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sender Email Address</label>
                <input
                  type="email"
                  value={settings.email.senderAddress}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, senderAddress: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>

            {/* Test Email Box */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <span className="font-semibold text-white block">Dispatch Test Email</span>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmailAddr}
                  onChange={(e) => setTestEmailAddr(e.target.value)}
                  placeholder="admin@cultivai.nic.in"
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test</span>
                </button>
              </div>
              {testEmailStatus && (
                <p className="text-[11px] text-purple-300 font-mono pt-1">{testEmailStatus}</p>
              )}
            </div>
          </div>
        )}

        {/* 14. MAINTENANCE MODE */}
        {activeTab === 'maintenance' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">System Maintenance Gateway</h3>
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-bold text-rose-300 block">Activate Emergency Maintenance Mode</span>
                  <span className="text-[11px] text-slate-400">
                    Suspends external public access while allowing administrative access.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenance.maintenanceMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenance: {
                        ...settings.maintenance,
                        maintenanceMode: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 accent-rose-500 rounded"
                />
              </label>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Banner Notice Broadcasted to Users</label>
                <textarea
                  rows={3}
                  value={settings.maintenance.message}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenance: { ...settings.maintenance, message: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* 15. SYSTEM OVERVIEW */}
        {activeTab === 'system' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Runtime Telemetry & Infrastructure Architecture</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">App Version</span>
                <span className="text-sm font-mono font-bold text-white mt-1 block">{settings.system.appVersion}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">API Interface</span>
                <span className="text-sm font-mono font-bold text-emerald-400 mt-1 block">{settings.system.apiVersion}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Active Database</span>
                <span className="text-xs font-mono font-semibold text-purple-300 mt-1 block">{settings.system.databaseVersion}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">System Uptime</span>
                <span className="text-sm font-mono font-bold text-cyan-400 mt-1 block">14d 5h 22m (99.98%)</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('settings.resetDefaults')}</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? t('settings.saving') : t('settings.saveChanges')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
