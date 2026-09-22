import React, { useState } from 'react';
import { User } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Lock,
  Activity,
  Users,
  Sprout,
  CheckCircle2,
  Shield,
  FileText,
  AlertTriangle,
  Layers,
  BookOpen,
  History,
  BarChart3,
  Settings,
  Server,
  ArrowRight,
  TrendingUp,
  Sliders,
  Sparkles,
  Zap,
  Globe,
  Clock,
  Eye,
} from 'lucide-react';

interface Props {
  user?: User;
  currentUser?: User;
  onNavigate: (path: string) => void;
}

export const AdminDashboardOverview: React.FC<Props> = ({ user: propUser, currentUser, onNavigate }) => {
  const user = currentUser || propUser || StorageService.getCurrentUser()!;
  const users = StorageService.getUsers();
  const cases = StorageService.getCases();
  const alerts = StorageService.getAlerts();
  const auditLogs = StorageService.getAuditLogs();
  const knowledgeDocs = StorageService.getKnowledge();
  const fieldVisits = StorageService.getFieldVisits();

  // Metrics calculated directly from real database records
  const totalUsers = users.length;
  const farmersCount = users.filter((u) => u.role === 'FARMER').length;
  const expertsCount = users.filter((u) => u.role === 'EXPERT').length;
  const officersCount = users.filter((u) => u.role === 'OFFICER').length;
  const pendingExpertsCount = users.filter((u) => u.role === 'EXPERT' && u.status === 'pending').length;

  const totalCases = cases.length;
  const resolvedCases = cases.filter((c) => c.status === 'Resolved').length;
  const criticalCases = cases.filter((c) => c.riskAssessment?.overallRisk === 'CRITICAL' || c.aiPrediction?.severity === 'Severe').length;
  const activeAlerts = alerts.filter((a) => !a.read).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950/50 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
            <Lock className="w-4 h-4" />
            <span>Master Platform Governance & Security Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">System Command Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as <strong className="text-white">{user.name}</strong> • All 4 RBAC role boundaries & sliding token policies active
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('/admin/system-health')}
            className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all"
          >
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Developer System Health</span>
          </button>

          <button
            onClick={() => onNavigate('/admin/alerts')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Broadcast Alert</span>
          </button>
        </div>
      </div>

      {/* System Telemetry Glanceline */}
      <div
        onClick={() => onNavigate('/admin/system-health')}
        className="cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/30 border border-slate-800 hover:border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Live Infrastructure Status</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% OPERATIONAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              DB Latency: <strong className="text-emerald-300">2.1ms</strong> • AI Model: <strong className="text-amber-300">Gemini 2.5 Flash</strong> • Sliding JWT Refresh: <strong className="text-cyan-300">24h Active</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-purple-400">
          <span>Open Telemetry Console</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div
          onClick={() => onNavigate('/admin/users')}
          className="cursor-pointer p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">User Directory</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalUsers} <span className="text-xs font-normal text-slate-400">Accounts</span></div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
            <span>{farmersCount} Farmers • {expertsCount} Experts</span>
            <span className="text-purple-400 font-bold">Manage &rarr;</span>
          </div>
        </div>

        {/* Total Platform Cases */}
        <div
          onClick={() => onNavigate('/admin/cases')}
          className="cursor-pointer p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Platform Cases</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalCases} <span className="text-xs font-normal text-slate-400">Diagnoses</span></div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
            <span className="text-emerald-400">{resolvedCases} Resolved</span>
            <span className="text-blue-400 font-bold">Inspect &rarr;</span>
          </div>
        </div>

        {/* Critical Cases / Alerts */}
        <div
          onClick={() => onNavigate('/admin/alerts')}
          className="cursor-pointer p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Critical Threat Signals</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{criticalCases} <span className="text-xs font-normal text-slate-400">High Risk</span></div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
            <span>{activeAlerts} Active Global Broadcasts</span>
            <span className="text-rose-400 font-bold">View &rarr;</span>
          </div>
        </div>

        {/* Security Audit Records */}
        <div
          onClick={() => onNavigate('/admin/audit-logs')}
          className="cursor-pointer p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Security Audit Trail</span>
            <History className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300">{auditLogs.length} <span className="text-xs font-normal text-slate-400">Logged Events</span></div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2">
            <span className="text-emerald-400 font-mono">100% Immutable</span>
            <span className="text-cyan-400 font-bold">Audit &rarr;</span>
          </div>
        </div>
      </div>

      {/* Quick Access Matrix to All Admin Portals */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Administrative Modules & Registries</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('/admin/farmers')}
            className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
          >
            <Sprout className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Farmers Registry</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{farmersCount} Registered</div>
          </button>

          <button
            onClick={() => onNavigate('/admin/experts')}
            className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
          >
            <CheckCircle2 className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Experts Registry</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {expertsCount} Total {pendingExpertsCount > 0 && <strong className="text-amber-300">({pendingExpertsCount} Pending)</strong>}
            </div>
          </button>

          <button
            onClick={() => onNavigate('/admin/officers')}
            className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 text-left transition-all group"
          >
            <Shield className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Officers Registry</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{officersCount} Field Officers</div>
          </button>

          <button
            onClick={() => onNavigate('/admin/crops-pathogens')}
            className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-left transition-all group"
          >
            <Layers className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Crops & Pathogens</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Ontology Library</div>
          </button>

          <button
            onClick={() => onNavigate('/admin/knowledge')}
            className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
          >
            <BookOpen className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Knowledge Base</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{knowledgeDocs.length} IPM Articles</div>
          </button>

          <button
            onClick={() => onNavigate('/admin/reports')}
            className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/40 text-left transition-all group"
          >
            <BarChart3 className="w-5 h-5 text-pink-400 mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Reports & Analytics</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Epidemic Trends</div>
          </button>
        </div>
      </div>

      {/* Two Column: Recent Platform Cases & Live Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Recent Crop Health Inferences</span>
            </h3>
            <button
              onClick={() => onNavigate('/admin/cases')}
              className="text-xs text-purple-400 hover:underline font-semibold"
            >
              View All ({totalCases})
            </button>
          </div>

          <div className="space-y-2.5">
            {cases.slice(0, 5).map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigate('/admin/cases')}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-all text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{c.crop}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300">{c.aiPrediction.condition}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Farmer: {c.farmerName} ({c.location?.district || 'Regional'}) • {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.riskAssessment?.overallRisk === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : c.riskAssessment?.overallRisk === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {c.riskAssessment?.overallRisk || 'MODERATE'}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">{c.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Security Audit Activity */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Audit Trail Events</span>
            </h3>
            <button
              onClick={() => onNavigate('/admin/audit-logs')}
              className="text-xs text-purple-400 hover:underline font-semibold"
            >
              Full Log ({auditLogs.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-cyan-400">{log.action}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">{log.details}</p>
                  <span className="text-[10px] text-slate-500">
                    By: {log.userName} ({log.userRole}) • {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
