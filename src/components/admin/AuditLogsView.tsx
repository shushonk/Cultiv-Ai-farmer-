import React, { useState } from 'react';
import { User, AuditLog } from '../../types';
import { StorageService } from '../../services/storage';
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Lock,
  X,
  Shield,
  Clock,
  Server,
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const AuditLogsView: React.FC<Props> = ({ currentUser }) => {
  const [logs, setLogs] = useState<AuditLog[]>(StorageService.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'User Name', 'User ID', 'Role', 'Action', 'Resource', 'IP Address', 'Status', 'Details'];
    const rows = logs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.userName}"`,
      l.userId,
      l.userRole,
      l.action,
      `"${l.resource}"`,
      `"${l.ipAddress || '127.0.0.1'}"`,
      l.status,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cultivai-audit-trail-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'AUDIT_TRAIL_EXPORTED',
      resource: '/admin/audit-logs',
      details: `Admin exported ${logs.length} immutable security audit events to CSV.`,
      status: 'SUCCESS',
    });

    showToast(`Exported ${logs.length} audit trail records`);
  };

  const filteredLogs = logs.filter((l) => {
    if (roleFilter !== 'ALL' && l.userRole !== roleFilter) return false;
    if (actionFilter !== 'ALL' && l.action !== actionFilter) return false;
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.id.toLowerCase().includes(q) ||
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.resource.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-purple-950 border border-purple-500/50 text-white shadow-2xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <Lock className="w-4 h-4" />
            <span>Immutable Cryptographic Security & Governance Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Security Audit Logs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident record of all administrative operations, diagnostic reviews, password resets, and session events.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all shrink-0"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Audit Trail</span>
        </button>
      </div>

      {/* Security Immutability Notice */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <span className="font-bold text-white">Immutable Audit Enforcement Active</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              In accordance with security standards, audit logs cannot be edited or deleted via the UI.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px] shrink-0">
          READ-ONLY
        </span>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, action, resource, details..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Roles ({logs.length})</option>
              <option value="ADMIN">ADMIN</option>
              <option value="EXPERT">EXPERT</option>
              <option value="OFFICER">OFFICER</option>
              <option value="FARMER">FARMER</option>
            </select>
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Action Types ({uniqueActions.length})</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILED">FAILED / DENIED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Timestamp & Log ID</th>
                <th className="p-3.5 font-semibold">User & Role</th>
                <th className="p-3.5 font-semibold">Action Type</th>
                <th className="p-3.5 font-semibold">Target Resource</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Details</th>
                <th className="p-3.5 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5">
                    <div className="text-white font-medium">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    <div className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</div>
                    <div className="text-[9px] font-mono text-slate-600">{log.id}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-white">{log.userName}</div>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        log.userRole === 'ADMIN'
                          ? 'text-purple-400'
                          : log.userRole === 'EXPERT'
                          ? 'text-amber-400'
                          : log.userRole === 'OFFICER'
                          ? 'text-blue-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {log.userRole}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono text-cyan-300 font-bold text-[11px]">{log.action}</span>
                  </td>
                  <td className="p-3.5 font-mono text-[10px] text-slate-400 max-w-xs truncate">
                    {log.resource}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300 max-w-xs text-[11px] truncate" title={log.details}>
                    {log.details}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG INSPECTION MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Audit Trail Event Record</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Event Timestamp</span>
                <span className="font-mono text-white">{selectedLog.timestamp}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Actor</span>
                  <span className="font-bold text-white">{selectedLog.userName} ({selectedLog.userRole})</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">IP Address</span>
                  <span className="font-mono text-slate-300">{selectedLog.ipAddress || '127.0.0.1 (Direct Secure)'}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Action & Resource</span>
                <div className="font-mono text-cyan-300 font-bold">{selectedLog.action}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">{selectedLog.resource}</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Event Description & Parameters</span>
                <p className="text-slate-200">{selectedLog.details}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
