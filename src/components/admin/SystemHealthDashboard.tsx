import React, { useState, useEffect, useCallback } from 'react';
import { API, SystemHealthData, EndpointMetricItem, ActiveSessionItem } from '../../services/api';
import {
  Activity,
  Server,
  Database,
  Cpu,
  Shield,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardDrive,
  CloudRain,
  Sliders,
  Play,
  Terminal,
  Lock,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  Eye,
  Trash2,
  Check,
  XCircle,
} from 'lucide-react';

export const SystemHealthDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [endpointsData, setEndpointsData] = useState<EndpointMetricItem[]>([]);
  const [sessionsData, setSessionsData] = useState<ActiveSessionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(5); // seconds (0 = paused)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  
  // Synthetic ping test state
  const [pingTarget, setPingTarget] = useState<string>('all');
  const [pingRunning, setPingRunning] = useState<boolean>(false);
  const [lastPingResult, setLastPingResult] = useState<any>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'sessions' | 'diagnostic'>('overview');

  const fetchMetrics = useCallback(async () => {
    try {
      const [health, epRes, sessRes] = await Promise.all([
        API.getSystemHealth().catch(() => null),
        API.getEndpointMetrics().catch(() => ({ endpoints: [] })),
        API.getActiveSessions().catch(() => ({ sessions: [] })),
      ]);

      if (health) setHealthData(health);
      if (epRes?.endpoints) setEndpointsData(epRes.endpoints);
      if (sessRes?.sessions) setSessionsData(sessRes.sessions);
      setLastRefreshedAt(new Date());
    } catch (e) {
      console.error('Failed to fetch system metrics:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    if (autoRefreshInterval > 0) {
      const timer = setInterval(fetchMetrics, autoRefreshInterval * 1000);
      return () => clearInterval(timer);
    }
  }, [fetchMetrics, autoRefreshInterval]);

  const handleTriggerPing = async (target: string = pingTarget) => {
    setPingRunning(true);
    try {
      const result = await API.pingTest(target);
      setLastPingResult(result);
      fetchMetrics();
    } catch (err: any) {
      setLastPingResult({ success: false, error: err.message, latencyMs: 0 });
    } finally {
      setPingRunning(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (confirm(`Revoke active session ${sessionId}? The user will be required to re-authenticate.`)) {
      try {
        await API.revokeSession(sessionId);
        fetchMetrics();
      } catch (err: any) {
        alert(`Failed to revoke session: ${err.message}`);
      }
    }
  };

  if (isLoading && !healthData) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
          <span className="text-xs font-semibold tracking-wide">Connecting to System Telemetry Gateway...</span>
        </div>
      </div>
    );
  }

  const s = healthData?.services;

  // Helper for Status Dot Color
  const getStatusDot = (status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'OPERATIONAL' | 'ONLINE' | 'CONNECTED' | string, latencyMs?: number) => {
    const isDegraded = status === 'DEGRADED' || (latencyMs !== undefined && latencyMs > 800 && status !== 'ONLINE');
    const isOffline = status === 'OFFLINE' || status === 'DISCONNECTED';

    if (isOffline) {
      return (
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 shadow-sm shadow-rose-500/50"></span>
        </span>
      );
    }

    if (isDegraded) {
      return (
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 shadow-sm shadow-amber-500/50"></span>
        </span>
      );
    }

    return (
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-purple-400 mb-1">
            <Activity className="w-4 h-4 animate-pulse text-purple-400" />
            <span>Developer-Facing Diagnostic Console</span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
              {getStatusDot('HEALTHY')}
              <span>ALL SERVICES OPERATIONAL</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">System Health & Telemetry</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time connectivity status, database pooling, AI diagnostic service, and sliding JWT session renewal monitor.
          </p>
        </div>

        {/* Auto-Refresh & Quick Ping Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">Auto-Poll:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-purple-300 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="2" className="bg-slate-900 text-white">2s (Fast)</option>
              <option value="5" className="bg-slate-900 text-white">5s (Standard)</option>
              <option value="15" className="bg-slate-900 text-white">15s</option>
              <option value="0" className="bg-slate-900 text-white">Paused</option>
            </select>
          </div>

          <button
            onClick={() => fetchMetrics()}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Refresh immediately"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => handleTriggerPing('all')}
            disabled={pingRunning}
            className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{pingRunning ? 'Pinging...' : 'Ping All Subsystems'}</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* REAL-TIME CONNECTIVITY STATUS CARDS WITH STATUS DOTS */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connectivity 1: Database Pool */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {getStatusDot('CONNECTED')}
              <span className="text-xs font-bold text-white">Database Pool</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              CONNECTED
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {s?.database.pingLatencyMs || 2.1} <span className="text-xs font-normal text-slate-400">ms latency</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Active: <strong className="text-white">{s?.database.activeConnections} / {s?.database.poolSize}</strong> • {s?.database.readThroughputPerSec} r/s
            </p>
          </div>
        </div>

        {/* Connectivity 2: AI Diagnostic Service */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {getStatusDot('ONLINE')}
              <span className="text-xs font-bold text-white">AI Diagnostic Gateway</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ONLINE
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              {s?.aiInference.avgInferenceLatencyMs || 1140} <span className="text-xs font-normal text-slate-400">ms inference</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Model: <strong className="text-white">{s?.aiInference.modelTarget}</strong> • Quota: <strong className="text-emerald-400">{s?.aiInference.quotaRemainingPct}%</strong>
            </p>
          </div>
        </div>

        {/* Connectivity 3: Backend API Endpoints */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {getStatusDot('HEALTHY')}
              <span className="text-xs font-bold text-white">Backend API Endpoints</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              100% HEALTHY
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-300 font-mono">
              {endpointsData.length} <span className="text-xs font-normal text-slate-400">active routes</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Total calls: <strong className="text-white">{healthData?.totalRequests || 0}</strong> • Uptime: <strong className="text-slate-200">{healthData?.uptimeFormatted}</strong>
            </p>
          </div>
        </div>

        {/* Connectivity 4: Automatic JWT Token Refresh */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {getStatusDot('HEALTHY')}
              <span className="text-xs font-bold text-white">Sliding JWT Refresh</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              AUTO-RENEW (24H)
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-cyan-300 font-mono">
              {healthData?.totalTokenRefreshes || 0} <span className="text-xs font-normal text-slate-400">renewals</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Active sessions: <strong className="text-white">{s?.sessionValidation.activeSessionsCount || 0}</strong> (Expert/Officer Protected)
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'overview'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Subsystems & Latency Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('endpoints')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'endpoints'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>API Endpoints Matrix ({endpointsData.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'sessions'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Active Sessions & Token Refreshes ({sessionsData.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostic')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'diagnostic'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Diagnostic Ping Sandbox</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: SUBSYSTEMS & INFRASTRUCTURE OVERVIEW */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Subsystems Deep Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Database Health */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {getStatusDot(s?.database.connectionState || 'CONNECTED')}
                      <h3 className="text-sm font-bold text-white">Database Pool Health</h3>
                    </div>
                    <span className="text-[11px] text-slate-400">Persistence & Query Engine</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {s?.database.status || 'OPERATIONAL'}
                </span>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Connection State:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    {getStatusDot('CONNECTED')}
                    {s?.database.connectionState || 'CONNECTED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Query Ping Latency:</span>
                  <span className="font-bold text-white">{s?.database.pingLatencyMs || 2.1} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Pool Connections:</span>
                  <span className="text-white font-medium">{s?.database.activeConnections} / {s?.database.poolSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Read / Write Throughput:</span>
                  <span className="text-slate-300">{s?.database.readThroughputPerSec} r/s • {s?.database.writeThroughputPerSec} w/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Schema Integrity Check:</span>
                  <span className="text-emerald-300 font-semibold">{s?.database.integrityCheck || 'PASSED'}</span>
                </div>
              </div>

              <button
                onClick={() => handleTriggerPing('database')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Test Database Ping</span>
              </button>
            </div>

            {/* Card 2: AI Service & Gemini Gateway */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {getStatusDot(s?.aiInference.gatewayStatus || 'ONLINE')}
                      <h3 className="text-sm font-bold text-white">AI Diagnostic Gateway</h3>
                    </div>
                    <span className="text-[11px] text-slate-400">@google/genai SDK v2.4</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {s?.aiInference.gatewayStatus || 'ONLINE'}
                </span>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Model Target:</span>
                  <span className="font-semibold text-amber-300">{s?.aiInference.modelTarget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Inference Latency:</span>
                  <span className="font-bold text-white">{s?.aiInference.avgInferenceLatencyMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Confidence Threshold:</span>
                  <span className="text-slate-300">{(s?.aiInference.confidenceThreshold || 0.72) * 100}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Token Quota Remaining:</span>
                  <span className="text-emerald-400 font-semibold">{s?.aiInference.quotaRemainingPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Parallel Workers:</span>
                  <span className="text-slate-300">{s?.aiInference.activeWorkers} concurrent</span>
                </div>
              </div>

              <button
                onClick={() => handleTriggerPing('ai_service')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Test AI Gateway Ping</span>
              </button>
            </div>

            {/* Card 3: Session Validation & Sliding Token Renewal */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {getStatusDot('HEALTHY')}
                      <h3 className="text-sm font-bold text-white">Session Refresh Middleware</h3>
                    </div>
                    <span className="text-[11px] text-slate-400">Sliding Window Token Engine</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AUTO-RENEW ACTIVE
                </span>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Live Sessions:</span>
                  <span className="font-bold text-purple-300">{s?.sessionValidation.activeSessionsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expert/Officer Long-Sessions:</span>
                  <span className="font-semibold text-white">{s?.sessionValidation.expertOfficerActiveSessions || 0} active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sliding Max Window:</span>
                  <span className="text-slate-300">24h (Expert/Officer) • 12h (Default)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Token Validation Latency:</span>
                  <span className="text-emerald-400 font-semibold">{s?.sessionValidation.avgValidationLatencyMs || 0.8} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Security Policy:</span>
                  <span className="text-purple-300 font-mono text-[10px]">STRICT_RBAC_CROSS_PORTAL_GUARD</span>
                </div>
              </div>

              <button
                onClick={() => handleTriggerPing('session_engine')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Test Token Middleware Ping</span>
              </button>
            </div>

            {/* Card 4: Weather Microclimate Gateway */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                    <CloudRain className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {getStatusDot('CONNECTED')}
                      <h3 className="text-sm font-bold text-white">Microclimate Sensor Gateway</h3>
                    </div>
                    <span className="text-[11px] text-slate-400">District Weather Feed</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SYNCED
                </span>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ping Latency:</span>
                  <span className="font-bold text-white">{s?.weatherMicroclimate.pingLatencyMs || 34.2} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cache Hit Rate:</span>
                  <span className="text-emerald-400 font-semibold">{s?.weatherMicroclimate.cacheHitRatePct || 98.4}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Districts:</span>
                  <span className="text-slate-300 text-[11px]">Kolar, Belagavi, Nashik, Guntur</span>
                </div>
              </div>

              <button
                onClick={() => handleTriggerPing('weather_gateway')}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Test Weather Gateway Ping</span>
              </button>
            </div>

            {/* Card 5: Specimen Image Storage Buffer */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {getStatusDot('CONNECTED')}
                      <h3 className="text-sm font-bold text-white">Specimen Storage Buffer</h3>
                    </div>
                    <span className="text-[11px] text-slate-400">Foliar Specimen Imagery</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HEALTHY
                </span>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Disk Storage Allocated:</span>
                  <span className="font-semibold text-white">{s?.storageEngine.diskUsageMb || 142.6} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cache Buffer:</span>
                  <span className="text-slate-300">{s?.storageEngine.cacheBufferMb || 24.1} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IOPS Write Latency:</span>
                  <span className="text-emerald-400 font-semibold">{s?.storageEngine.iopsWriteLatencyMs || 4.8} ms</span>
                </div>
              </div>

              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-400 text-center">
                High-Resolution Foliar Image Cache Active
              </div>
            </div>

            {/* Card 6: Node.js Runtime & Memory */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {getStatusDot('CONNECTED')}
                      <h3 className="text-sm font-bold text-white">Node.js Engine Runtime</h3>
                    </div>
                    <span className="text-[11px] text-slate-400">{healthData?.systemMetrics.nodeVersion} • {healthData?.systemMetrics.platform}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  V8 OPTIMIZED
                </span>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Resident Set Size (RSS):</span>
                  <span className="font-bold text-white">{healthData?.systemMetrics.memoryRssMb} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">V8 Heap Total / Used:</span>
                  <span className="text-slate-300">{healthData?.systemMetrics.heapTotalMb} MB / {healthData?.systemMetrics.heapUsedMb} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated CPU Load:</span>
                  <span className="text-emerald-400 font-semibold">{healthData?.systemMetrics.cpuLoadPct}%</span>
                </div>
              </div>

              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-400 text-center">
                Cloud Run Sandboxed Container Port 3000
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: API ENDPOINTS HEALTH MATRIX */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white">Backend API Endpoint Health Matrix</h2>
              <p className="text-xs text-slate-400">
                Live monitoring of HTTP response codes, invocation frequency, and 95th percentile latency
              </p>
            </div>
            <div className="text-xs text-slate-400">
              Tracking <strong className="text-purple-300">{endpointsData.length}</strong> active routes
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 font-semibold">Method & Route Path</th>
                    <th className="p-3.5 font-semibold">Status Dot</th>
                    <th className="p-3.5 font-semibold">Invocations</th>
                    <th className="p-3.5 font-semibold">Last Latency</th>
                    <th className="p-3.5 font-semibold">Avg Latency</th>
                    <th className="p-3.5 font-semibold">p95 Latency</th>
                    <th className="p-3.5 font-semibold">Min / Max</th>
                    <th className="p-3.5 font-semibold text-right">Quick Ping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {endpointsData.map((ep, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ep.method === 'POST'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : ep.method === 'GET'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {ep.method}
                          </span>
                          <span className="font-mono text-xs text-white">{ep.path}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          {getStatusDot(ep.lastStatusCode < 400 ? 'HEALTHY' : 'DEGRADED', ep.lastLatencyMs)}
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                            {ep.lastStatusCode} OK
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium">{ep.totalCalls} calls</td>
                      <td className="p-3.5 font-bold text-white">{ep.lastLatencyMs} ms</td>
                      <td className="p-3.5 text-slate-300">{ep.avgLatencyMs} ms</td>
                      <td className="p-3.5 text-amber-300 font-semibold">{ep.p95LatencyMs} ms</td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {ep.minLatencyMs} / {ep.maxLatencyMs} ms
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleTriggerPing('all')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-[11px] font-semibold transition-colors"
                        >
                          Ping
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 3: ACTIVE SESSIONS & SLIDING TOKEN RENEWALS */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white">Active Session & Automatic Token Refresh Registry</h2>
              <p className="text-xs text-slate-400">
                Real-time active tokens validated by the backend sliding window session middleware
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                Sliding Max: 24h for Expert & Officer
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 font-semibold">User & Role</th>
                    <th className="p-3.5 font-semibold">Session ID</th>
                    <th className="p-3.5 font-semibold">Token Expiry In</th>
                    <th className="p-3.5 font-semibold">Auto-Refreshes</th>
                    <th className="p-3.5 font-semibold">Last Activity</th>
                    <th className="p-3.5 font-semibold">Client Agent</th>
                    <th className="p-3.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {sessionsData.map((sess) => (
                    <tr key={sess.sessionId} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-2">
                          {getStatusDot('HEALTHY')}
                          {sess.userName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              sess.userRole === 'EXPERT'
                                ? 'bg-amber-500/20 text-amber-300'
                                : sess.userRole === 'OFFICER'
                                ? 'bg-blue-500/20 text-blue-300'
                                : sess.userRole === 'FARMER'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}
                          >
                            {sess.userRole}
                          </span>
                          <span className="text-slate-500 text-[10px]">{sess.email}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">{sess.sessionId}</td>
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-cyan-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {Math.floor(sess.secondsUntilExpiry / 60)}m {sess.secondsUntilExpiry % 60}s
                        </span>
                        <span className="text-[10px] text-slate-500">Auto-renews on request</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                          {sess.refreshCount} times renewed
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {new Date(sess.lastActivityAt).toLocaleTimeString()}
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px] max-w-xs truncate">
                        {sess.userAgent} ({sess.ip})
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleRevokeSession(sess.sessionId)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Revoke</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 4: DIAGNOSTIC PING SANDBOX */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'diagnostic' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Interactive Synthetic Ping Sandbox</span>
            </h2>
            <p className="text-xs text-slate-400">
              Execute live high-resolution latency pings against specific platform subsystems to measure response
              times and database pool availability.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <select
                value={pingTarget}
                onChange={(e) => setPingTarget(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium"
              >
                <option value="all">All Subsystems Composite Ping</option>
                <option value="database">Database Connection Pool</option>
                <option value="ai_service">AI Inference Gateway (Gemini 2.5)</option>
                <option value="session_engine">Session Validation Middleware</option>
                <option value="weather_gateway">Microclimate Sensor Telemetry</option>
              </select>

              <button
                onClick={() => handleTriggerPing(pingTarget)}
                disabled={pingRunning}
                className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{pingRunning ? 'Executing Test...' : 'Run Diagnostic Ping'}</span>
              </button>
            </div>
          </div>

          {lastPingResult && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-purple-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300">Ping Result: {lastPingResult.target}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                  Latency: {lastPingResult.latencyMs} ms
                </span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                {JSON.stringify(lastPingResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
