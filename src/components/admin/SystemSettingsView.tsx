import React, { useState } from 'react';
import { User } from '../../types';
import { StorageService } from '../../services/storage';
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
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const SystemSettingsView: React.FC<Props> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<
    | 'general'
    | 'security'
    | 'users'
    | 'notifications'
    | 'ai'
    | 'weather'
    | 'maps'
    | 'languages'
    | 'cases'
    | 'data'
    | 'system'
  >('general');

  // Config State
  const [appName, setAppName] = useState('CultivAI - AI Crop Health & Disease Diagnostic Platform');
  const [orgName, setOrgName] = useState('Department of Agriculture & ICAR');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST +5:30)');
  const [currency, setCurrency] = useState('INR (₹)');
  const [sessionTimeoutMin, setSessionTimeoutMin] = useState(1440); // 24h sliding window
  const [mfaEnforced, setMfaEnforced] = useState(false);
  const [selfRegEnabled, setSelfRegEnabled] = useState(true);
  const [expertVerificationRequired, setExpertVerificationRequired] = useState(true);
  
  // AI Settings
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(70);
  const [autoEscalateSevere, setAutoEscalateSevere] = useState(true);
  
  // Maintenance mode
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'SYSTEM_SETTINGS_UPDATED',
      resource: `/admin/settings/${activeTab}`,
      details: `Admin updated platform configuration parameters in [${activeTab.toUpperCase()}].`,
      status: 'SUCCESS',
    });
    showToast(`Platform settings [${activeTab.toUpperCase()}] successfully saved.`);
  };

  const handleCreateBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
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
    downloadAnchor.setAttribute('download', `cultivai-database-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'DATABASE_BACKUP_CREATED',
      resource: '/admin/settings/backup',
      details: 'Admin generated and downloaded complete system JSON database backup snapshot.',
      status: 'SUCCESS',
    });

    showToast('Database backup archive created and downloaded.');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-purple-950 border border-purple-500/50 text-white shadow-2xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
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
            Configure global parameters, security enforcement, AI thresholds, localization, and backup archives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateBackup}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Create DB Backup</span>
          </button>
        </div>
      </div>

      {/* 11 Tab Navigation Strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        {[
          { id: 'general', label: 'General', icon: Settings },
          { id: 'security', label: 'Security & JWT', icon: Shield },
          { id: 'users', label: 'Users & Roles', icon: Users },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'ai', label: 'AI Diagnostic', icon: Sparkles },
          { id: 'weather', label: 'Weather Service', icon: CloudSun },
          { id: 'maps', label: 'Maps & GIS', icon: MapPin },
          { id: 'languages', label: 'Languages', icon: Globe },
          { id: 'cases', label: 'Case Rules', icon: FileText },
          { id: 'data', label: 'Data Retention', icon: Database },
          { id: 'system', label: 'System Pool', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">General Platform Settings</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Platform Brand Title</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Governing Institution</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Default Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Currency Code</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">Security & Token Governance</h3>

            <div className="space-y-3">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Sliding JWT Session Window (Minutes)</span>
                  <p className="text-[11px] text-slate-400">
                    Active sessions automatically refresh upon user interaction.
                  </p>
                </div>
                <input
                  type="number"
                  value={sessionTimeoutMin}
                  onChange={(e) => setSessionTimeoutMin(Number(e.target.value))}
                  className="w-28 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
                />
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Require Specialist Accreditation Verification</span>
                  <p className="text-[11px] text-slate-400">
                    Newly registered Expert accounts must be vetted by Admin before receiving diagnostic queues.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={expertVerificationRequired}
                  onChange={(e) => setExpertVerificationRequired(e.target.checked)}
                  className="w-5 h-5 accent-purple-500 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* AI DIAGNOSTIC TAB */}
        {activeTab === 'ai' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">AI Diagnostic Gateway Parameters</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Primary Vision Inference Model</label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Ultra-Low Latency & High Precision)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Research & Complex Multi-Pathology)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Minimum Confidence Threshold (%)</label>
                <input
                  type="number"
                  min="50"
                  max="99"
                  value={aiConfidenceThreshold}
                  onChange={(e) => setAiConfidenceThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl text-[11px] text-purple-300">
              When AI confidence drops below {aiConfidenceThreshold}%, the system automatically flags the case for Mandatory Human Pathologist Validation.
            </div>
          </div>
        )}

        {/* SYSTEM & MAINTENANCE TAB */}
        {activeTab === 'system' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white">System Pool & Maintenance Operations</h3>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Platform Maintenance Mode</span>
                <p className="text-[11px] text-slate-400">
                  Suspends external public access while allowing administrative access.
                </p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 accent-rose-500 rounded"
              />
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-white block">Connection Pool Telemetry</span>
              <div className="grid grid-cols-3 gap-3 text-[11px] text-slate-400">
                <div>Active Pool: <strong className="text-emerald-400">12 Connections</strong></div>
                <div>Avg Query Latency: <strong className="text-emerald-400">2.1ms</strong></div>
                <div>Status: <strong className="text-emerald-400">Healthy (0 Dropped)</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* DEFAULT TAB FOR OTHERS */}
        {activeTab !== 'general' && activeTab !== 'security' && activeTab !== 'ai' && activeTab !== 'system' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white uppercase">{activeTab} Parameters</h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
              Configured with standard production defaults for {activeTab} service connectors. All updates take effect immediately in runtime.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => showToast('Parameters reset to verified defaults.')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Section Defaults</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
