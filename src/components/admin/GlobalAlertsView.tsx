import React, { useState } from 'react';
import { User, AlertItem } from '../../types';
import { StorageService } from '../../services/storage';
import {
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Eye,
  Radio,
  Clock,
  Archive,
  CheckCircle2,
  X,
  Send,
  Users,
  Shield,
  Sprout,
  Check,
  Calendar,
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const GlobalAlertsView: React.FC<Props> = ({ currentUser }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>(StorageService.getAlerts());
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [targetFilter, setTargetFilter] = useState('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewStep, setPreviewStep] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [targetRole, setTargetRole] = useState<'ALL' | 'FARMER' | 'EXPERT' | 'OFFICER'>('ALL');
  const [alertLevel, setAlertLevel] = useState<'info' | 'warning' | 'critical' | 'success'>('warning');
  const [actionRequired, setActionRequired] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshAlerts = () => {
    setAlerts(StorageService.getAlerts());
  };

  // Publish Global Alert Workflow
  const handlePublishAlert = () => {
    const newAlert = StorageService.addAlert({
      targetRole,
      type: 'REGIONAL_OUTBREAK',
      title: alertTitle,
      message: alertMessage,
      actionRequired: actionRequired || 'Immediate preventive surveillance recommended.',
      level: alertLevel,
    });

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'GLOBAL_ALERT_BROADCAST',
      resource: newAlert.id,
      details: `Broadcasted ${alertLevel.toUpperCase()} priority global alert to [${targetRole}]: "${alertTitle}".`,
      status: 'SUCCESS',
    });

    refreshAlerts();
    setCreateModalOpen(false);
    setPreviewStep(false);
    setAlertTitle('');
    setAlertMessage('');
    setActionRequired('');
    showToast(`Global advisory broadcast dispatched successfully.`);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.level !== severityFilter) return false;
    if (targetFilter !== 'ALL' && a.targetRole !== targetFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
            <Radio className="w-4 h-4" />
            <span>Emergency Broadcast & Threat Warning Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Global Alerts & Advisories</h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish, schedule, and broadcast epidemic outbreak warnings and weather advisories to all registered stakeholders.
          </p>
        </div>

        <button
          onClick={() => {
            setAlertTitle('');
            setAlertMessage('');
            setActionRequired('');
            setPreviewStep(false);
            setCreateModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Draft Broadcast Alert</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by broadcast title or message..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Threat Severities</option>
              <option value="critical">Critical Outbreaks</option>
              <option value="warning">Warning Level</option>
              <option value="info">Informational Advisory</option>
              <option value="success">Resolution Notice</option>
            </select>
          </div>

          <div>
            <select
              value={targetFilter}
              onChange={(e) => setTargetFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Target Audiences ({alerts.length})</option>
              <option value="FARMER">Farmers Only</option>
              <option value="EXPERT">Plant Pathologists</option>
              <option value="OFFICER">Surveillance Officers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Alert ID & Title</th>
                <th className="p-3.5 font-semibold">Target Audience</th>
                <th className="p-3.5 font-semibold">Severity</th>
                <th className="p-3.5 font-semibold">Recommended Action</th>
                <th className="p-3.5 font-semibold">Broadcast Timestamp</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredAlerts.map((alt) => (
                <tr key={alt.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <AlertTriangle
                        className={`w-3.5 h-3.5 ${
                          alt.level === 'critical'
                            ? 'text-rose-400'
                            : alt.level === 'warning'
                            ? 'text-amber-400'
                            : 'text-blue-400'
                        }`}
                      />
                      <span>{alt.title}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">{alt.id}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-purple-300">
                      {alt.targetRole}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alt.level === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : alt.level === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {alt.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300 max-w-xs text-[11px] truncate">
                    {alt.actionRequired}
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px]">
                    {new Date(alt.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedAlert(alt)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / PREVIEW GLOBAL ALERT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {previewStep ? 'Preview & Confirm Broadcast' : 'Draft Global Warning Broadcast'}
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!previewStep ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPreviewStep(true);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Broadcast Headline / Title *</label>
                  <input
                    type="text"
                    required
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                    placeholder="e.g. Epidemic Alert: High Risk of Late Blight in Kolar District"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Threat Severity</label>
                    <select
                      value={alertLevel}
                      onChange={(e) => setAlertLevel(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    >
                      <option value="warning">Warning Level</option>
                      <option value="critical">Critical Threat</option>
                      <option value="info">Informational</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Target Audience</label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    >
                      <option value="ALL">All Users (Universal Broadcast)</option>
                      <option value="FARMER">Farmers Only</option>
                      <option value="EXPERT">Plant Pathologists</option>
                      <option value="OFFICER">Surveillance Officers</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Advisory Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                    placeholder="Provide actionable epidemiological guidance, weather triggers, and containment protocols..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Immediate Action Required *</label>
                  <input
                    type="text"
                    required
                    value={actionRequired}
                    onChange={(e) => setActionRequired(e.target.value)}
                    placeholder="e.g. Inspect foliage underside; apply prophylactic bio-formulations."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs"
                  >
                    Proceed to Preview &rarr;
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950 rounded-xl border border-rose-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alertLevel === 'critical'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {alertLevel.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">Target: {targetRole}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{alertTitle}</h4>
                  <p className="text-slate-300 text-[11px]">{alertMessage}</p>
                  <div className="p-2 bg-slate-900 rounded-lg text-[10px] text-amber-300">
                    <strong>Action Required:</strong> {actionRequired}
                  </div>
                </div>

                <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-[11px] text-purple-200">
                  Broadcast will immediately appear in real-time notification feeds across the targeted portal workspaces.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPreviewStep(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    &larr; Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishAlert}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm & Broadcast Live</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Broadcast Details</h3>
              <button onClick={() => setSelectedAlert(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Headline</span>
                <span className="font-bold text-white">{selectedAlert.title}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Message Body</span>
                <span className="text-slate-300">{selectedAlert.message}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Action Prescribed</span>
                <span className="text-amber-300 font-semibold">{selectedAlert.actionRequired}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
