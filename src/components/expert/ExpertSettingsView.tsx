import React, { useState } from 'react';
import { User, Language } from '../../types';
import { StorageService } from '../../services/storage';
import { API } from '../../services/api';
import { useI18n } from '../../i18n';
import {
  UserSettings,
  NotificationPreferences,
  PrivacyPreferences,
  SecuritySessionItem,
  ExpertPreferences,
} from '../../types/settings';
import {
  User as UserIcon,
  Globe,
  Bell,
  Lock,
  Shield,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Clock,
  Microscope,
  Briefcase,
  Bot,
  Sliders,
  Calendar,
  Layers,
} from 'lucide-react';

interface Props {
  user: User;
  onNavigate: (path: string) => void;
}

export const ExpertSettingsView: React.FC<Props> = ({ user, onNavigate }) => {
  const { language: currentLang, setLanguage, t } = useI18n();

  const [activeTab, setActiveTab] = useState<
    | 'profile'
    | 'workflow'
    | 'availability'
    | 'notifications'
    | 'copilot'
    | 'display'
    | 'security'
  >('profile');

  // State slices
  const [userSettings, setUserSettings] = useState<UserSettings>(() =>
    StorageService.getUserSettings(user.id)
  );
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(() =>
    StorageService.getNotificationPreferences(user.id)
  );
  const [expertPrefs, setExpertPrefs] = useState<ExpertPreferences>(() =>
    StorageService.getExpertPreferences(user.id)
  );
  const [sessions, setSessions] = useState<SecuritySessionItem[]>(() =>
    StorageService.getSecuritySessions(user.id)
  );

  // Profile fields
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [specialization, setSpecialization] = useState(user.specialization || 'Vegetable Pathology & Virological Diagnostics');
  const [organization, setOrganization] = useState(user.organization || 'ICAR - Indian Institute of Horticultural Research');
  const [title, setTitle] = useState('Senior Plant Pathologist / Extension Specialist');

  // Security password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  // Status flags
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
          specialization,
          organization,
        };
        StorageService.updateUser(updated);
        StorageService.setCurrentUser(updated);
      } else if (activeTab === 'workflow' || activeTab === 'availability' || activeTab === 'copilot') {
        StorageService.updateExpertPreferences(user.id, expertPrefs);
        await API.updateExpertPreferences(expertPrefs);
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
    if (activeTab === 'workflow' || activeTab === 'availability' || activeTab === 'copilot') {
      setExpertPrefs(StorageService.getExpertPreferences(user.id));
    } else if (activeTab === 'notifications') {
      setNotifPrefs(StorageService.getNotificationPreferences(user.id));
    } else if (activeTab === 'display') {
      setUserSettings(StorageService.getUserSettings(user.id));
    }
    showFeedback('success', 'Reset to saved preferences.');
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
    { id: 'profile', label: 'Professional Profile', icon: UserIcon },
    { id: 'workflow', label: 'Verification Workflow', icon: Briefcase },
    { id: 'availability', label: 'Availability & Capacity', icon: Calendar },
    { id: 'copilot', label: 'Diagnostic Copilot', icon: Bot },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
    { id: 'display', label: 'Display & Language', icon: Globe },
    { id: 'security', label: 'Security & Sessions', icon: Lock },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{t('settings.title')}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Expert Specialist Portal
            </span>
          </h1>
          <p className="text-xs text-slate-400">
            Configure case triage queues, diagnostic copilot synthesis depth, and clinical verification throughput limits.
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
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
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

      {/* Grid Tabs + Content */}
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
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
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
            {/* 1. PROFESSIONAL PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Plant Pathologist Credentials</h3>
                  <p className="text-xs text-slate-400">Institutional affiliation, scientific specialization, and verified signature.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Full Name & Degree</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Official Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Specialization & Pathogen Focus</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Research Institution / KVK Center</label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Institutional Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Contact Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. CASE WORKFLOW */}
            {activeTab === 'workflow' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Review Queue & Sorting Defaults</h3>
                  <p className="text-xs text-slate-400">Configure triage order and automated evidence panels during diagnosis validation.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Default Landing View</label>
                    <select
                      value={expertPrefs.defaultCaseView}
                      onChange={(e) => setExpertPrefs({ ...expertPrefs, defaultCaseView: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="queue">Pending Verification Queue</option>
                      <option value="investigations">Active In-Depth Investigations</option>
                      <option value="cases">Full Case History Directory</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Default Case Sorting</label>
                    <select
                      value={expertPrefs.defaultSort}
                      onChange={(e) => setExpertPrefs({ ...expertPrefs, defaultSort: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="risk">Severity Risk (Highest Priority First)</option>
                      <option value="date">Submission Recency (Newest First)</option>
                      <option value="confidence">Lowest AI Confidence (Needs Urgent Review)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Automatic Review Panels
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expertPrefs.reviewPreferences.showAiAlternatives}
                        onChange={(e) =>
                          setExpertPrefs({
                            ...expertPrefs,
                            reviewPreferences: {
                              ...expertPrefs.reviewPreferences,
                              showAiAlternatives: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span>Show AI Alternative Differential Diagnoses</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expertPrefs.reviewPreferences.showWeatherAutomatically}
                        onChange={(e) =>
                          setExpertPrefs({
                            ...expertPrefs,
                            reviewPreferences: {
                              ...expertPrefs.reviewPreferences,
                              showWeatherAutomatically: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span>Auto-fetch microclimate weather at scan time</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expertPrefs.reviewPreferences.showRegionalCases}
                        onChange={(e) =>
                          setExpertPrefs({
                            ...expertPrefs,
                            reviewPreferences: {
                              ...expertPrefs.reviewPreferences,
                              showRegionalCases: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span>Display regional outbreaks in same Taluk</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={expertPrefs.reviewPreferences.showKnowledgeSuggestions}
                        onChange={(e) =>
                          setExpertPrefs({
                            ...expertPrefs,
                            reviewPreferences: {
                              ...expertPrefs.reviewPreferences,
                              showKnowledgeSuggestions: e.target.checked,
                            },
                          })
                        }
                        className="rounded border-slate-700 text-amber-500 focus:ring-0"
                      />
                      <span>Link matching ICAR/IIHR Knowledge Library guides</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 3. AVAILABILITY & CAPACITY */}
            {activeTab === 'availability' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Availability & Caseload Capacity</h3>
                  <p className="text-xs text-slate-400">Control system automated case dispatching and workload balancing.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Live Status</label>
                    <select
                      value={expertPrefs.availabilityStatus}
                      onChange={(e) => setExpertPrefs({ ...expertPrefs, availabilityStatus: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="Available">Available (Receiving Auto-Assignments)</option>
                      <option value="Away">Away (Field Visit / Conference)</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Max Active Caseload</label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={expertPrefs.maxActiveAssignments}
                      onChange={(e) => setExpertPrefs({ ...expertPrefs, maxActiveAssignments: parseInt(e.target.value) || 25 })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-[10px] text-slate-500 block">Routing engine stops assigns when exceeded</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. COPILOT */}
            {activeTab === 'copilot' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Pathology AI Copilot Configuration</h3>
                  <p className="text-xs text-slate-400">Customize AI suggestion generation for rapid agronomic differential review.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Copilot Output Detail</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(['concise', 'standard', 'detailed'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setExpertPrefs({ ...expertPrefs, copilotExplanationLevel: lvl })}
                          className={`p-3 rounded-xl border text-left text-xs transition-all ${
                            expertPrefs.copilotExplanationLevel === lvl
                              ? 'bg-amber-500/10 border-amber-500 text-amber-400 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="capitalize block mb-0.5">{lvl}</span>
                          <span className="text-[10px] text-slate-500 block">
                            {lvl === 'concise' && 'Key pathogen & quick active ingredient'}
                            {lvl === 'standard' && 'Differential diagnosis & chemical PHI'}
                            {lvl === 'detailed' && 'Host resistance, biology & references'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Auto-Generated Copilot Actions
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={expertPrefs.copilotSuggestedActions.advisoryDraft}
                          onChange={(e) =>
                            setExpertPrefs({
                              ...expertPrefs,
                              copilotSuggestedActions: {
                                ...expertPrefs.copilotSuggestedActions,
                                advisoryDraft: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-slate-700 text-amber-500 focus:ring-0"
                        />
                        <span>Auto-draft grower advisory with safety cautions</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={expertPrefs.copilotSuggestedActions.suggestedQuestions}
                          onChange={(e) =>
                            setExpertPrefs({
                              ...expertPrefs,
                              copilotSuggestedActions: {
                                ...expertPrefs.copilotSuggestedActions,
                                suggestedQuestions: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-slate-700 text-amber-500 focus:ring-0"
                        />
                        <span>Suggest follow-up questions for the grower</span>
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={expertPrefs.copilotSuggestedActions.evidenceChecklist}
                          onChange={(e) =>
                            setExpertPrefs({
                              ...expertPrefs,
                              copilotSuggestedActions: {
                                ...expertPrefs.copilotSuggestedActions,
                                evidenceChecklist: e.target.checked,
                              },
                            })
                          }
                          className="rounded border-slate-700 text-amber-500 focus:ring-0"
                        />
                        <span>Diagnostic evidence checklist</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Review Alerts & Casework Escalations</h3>
                  <p className="text-xs text-slate-400">Never miss critical pathogen outbreaks requiring urgent quarantine containment.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Urgent Case Assigned (Risk Score &gt; 80%)</span>
                    <input
                      type="checkbox"
                      checked={notifPrefs.caseCreated}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, caseCreated: e.target.checked })}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0"
                    />
                  </label>
                  <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Follow-up Assessment Due from Grower</span>
                    <input
                      type="checkbox"
                      checked={notifPrefs.followUpDue}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, followUpDue: e.target.checked })}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0"
                    />
                  </label>
                  <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">District Extension Officer Inquiries</span>
                    <input
                      type="checkbox"
                      checked={notifPrefs.officerMessages}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, officerMessages: e.target.checked })}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0"
                    />
                  </label>
                  <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
                    <span className="text-slate-300">Regional Disease Surge Alert</span>
                    <input
                      type="checkbox"
                      checked={notifPrefs.regionalOutbreak}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, regionalOutbreak: e.target.checked })}
                      className="rounded border-slate-700 text-amber-500 focus:ring-0"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* 6. DISPLAY & LANGUAGE */}
            {activeTab === 'display' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Language & Regional Presentation</h3>
                  <p className="text-xs text-slate-400">Configure technical scientific nomenclature vs vernacular farmer translation modes.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Workstation Language</label>
                    <select
                      value={userSettings.language}
                      onChange={(e) => {
                        const l = e.target.value as Language;
                        setUserSettings({ ...userSettings, language: l });
                        setLanguage(l);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="en">English (Scientific Taxonomy)</option>
                      <option value="kn">ಕನ್ನಡ (Kannada Extension)</option>
                      <option value="hi">हिन्दी (Hindi Extension)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Visual Density</label>
                    <select
                      value={userSettings.density}
                      onChange={(e) => setUserSettings({ ...userSettings, density: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="compact">Compact (Maximum Cases Per Screen)</option>
                      <option value="comfortable">Comfortable</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 7. SECURITY & SESSIONS */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Security & Authenticated Sessions</h3>
                  <p className="text-xs text-slate-400">Manage digital password and audit authenticated laboratory terminals.</p>
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
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">New Password (Min 8 chars)</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                    >
                      Update Password
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Authorized Lab Sessions</h4>
                  {sessions.map((sess) => (
                    <div key={sess.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{sess.device}</div>
                        <div className="text-slate-400 text-[11px]">{sess.browser} • {sess.locationApprox} • IP: {sess.ipAddress}</div>
                      </div>
                      {sess.isCurrent ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active Lab Workstation
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
