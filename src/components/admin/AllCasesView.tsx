import React, { useState } from 'react';
import { User, CaseRecord, CaseStatus, RiskLevel, SeverityLevel } from '../../types';
import { StorageService } from '../../services/storage';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Archive,
  RotateCcw,
  X,
  Calendar,
  Layers,
  Activity,
  Check,
  Zap,
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const AllCasesView: React.FC<Props> = ({ currentUser }) => {
  const [cases, setCases] = useState<CaseRecord[]>(StorageService.getCases());
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Case for Timeline Modal
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshCases = () => {
    setCases(StorageService.getCases());
  };

  // Helper to calculate dynamic Priority and Priority Reason
  const calculatePriority = (c: CaseRecord) => {
    const risk = c.riskAssessment?.overallRisk || c.aiPrediction?.risk || 'MODERATE';
    const severity = c.aiPrediction?.severity || 'Moderate';
    const rainProb = c.weatherSnapshot?.rainProbability || 0;

    let priority: RiskLevel = 'MODERATE';
    let reason = 'Standard observational scan';

    if (risk === 'CRITICAL' || severity === 'Severe') {
      priority = 'CRITICAL';
      reason = `${c.aiPrediction?.condition || 'Outbreak'} exhibiting severe foliar destruction with high epidemic potential`;
    } else if (risk === 'HIGH' || severity === 'High' || rainProb > 60) {
      priority = 'HIGH';
      reason = `High humidity / rainfall conditions (${rainProb}%) accelerating ${c.aiPrediction?.condition || 'pathogen'} sporulation`;
    } else if (severity === 'Moderate') {
      priority = 'MODERATE';
      reason = 'Local focal infection under active farm containment';
    } else {
      priority = 'LOW';
      reason = 'Minimal risk or benign physiological leaf condition';
    }

    return { priority, reason };
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Case ID', 'Farmer Name', 'Crop', 'Condition', 'Severity', 'Risk', 'Status', 'Created Date'];
    const rows = cases.map((c) => [
      c.id,
      `"${c.farmerName}"`,
      c.crop,
      `"${c.aiPrediction?.condition || 'Unspecified'}"`,
      c.aiPrediction?.severity || 'Moderate',
      c.riskAssessment?.overallRisk || 'MODERATE',
      c.status,
      c.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cultivai-cases-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'DATA_EXPORT',
      resource: '/admin/cases',
      details: `Exported ${cases.length} diagnostic case records to CSV.`,
      status: 'SUCCESS',
    });

    showToast(`Exported ${cases.length} case records to CSV`);
  };

  // Escalate Case
  const handleEscalateCase = (c: CaseRecord) => {
    const updated: CaseRecord = {
      ...c,
      status: 'Escalated',
    };
    StorageService.updateCase(updated);
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'CASE_ESCALATED',
      resource: c.id,
      details: `Admin marked case ${c.id} (${c.crop}) as ESCALATED for rapid regional intervention.`,
      status: 'SUCCESS',
    });
    refreshCases();
    if (selectedCase?.id === c.id) setSelectedCase(updated);
    showToast(`Case ${c.id} escalated successfully.`);
  };

  const filteredCases = cases.filter((c) => {
    if (cropFilter !== 'ALL' && c.crop !== cropFilter) return false;
    if (severityFilter !== 'ALL' && (c.aiPrediction?.severity !== severityFilter)) return false;
    if (riskFilter !== 'ALL' && c.riskAssessment?.overallRisk !== riskFilter) return false;
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.farmerName.toLowerCase().includes(q) ||
        c.crop.toLowerCase().includes(q) ||
        (c.aiPrediction?.condition || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uniqueCrops = Array.from(new Set(cases.map((c) => c.crop)));

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
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <FileText className="w-4 h-4" />
            <span>Master Multi-Crop Diagnostic & Epidemiological Inferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Platform Cases</h1>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end audit, automated threat prioritization, full diagnostic timelines, and escalation protocols for all {cases.length} cases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all shrink-0"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case ID, farmer, disease..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Crops ({cases.length})</option>
              {uniqueCrops.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="Severe">Severe Foliar Damage</option>
              <option value="High">High Severity</option>
              <option value="Moderate">Moderate Severity</option>
              <option value="Low">Low Severity</option>
            </select>
          </div>

          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MODERATE">Moderate Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Case Statuses</option>
              <option value="New">New Scan</option>
              <option value="AI Analysed">AI Analysed</option>
              <option value="Under Review">Under Review</option>
              <option value="Expert Confirmed">Expert Confirmed</option>
              <option value="Action Recommended">Action Recommended</option>
              <option value="Follow-up Required">Follow-up Required</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Case ID & Date</th>
                <th className="p-3.5 font-semibold">Farmer & District</th>
                <th className="p-3.5 font-semibold">Crop & Suspected Condition</th>
                <th className="p-3.5 font-semibold">AI Confidence & Severity</th>
                <th className="p-3.5 font-semibold">Automated Priority</th>
                <th className="p-3.5 font-semibold">Workflow Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredCases.map((c) => {
                const { priority, reason } = calculatePriority(c);

                return (
                  <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-white">{c.id}</div>
                      <div className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{c.farmerName}</div>
                      <div className="text-[10px] text-slate-500">{c.location?.district || 'Kolar'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{c.crop}</div>
                      <div className="text-[11px] text-purple-300">{c.aiPrediction?.condition}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-200">
                        {((c.aiPrediction?.confidence || 0.85) * 100).toFixed(0)}%
                      </div>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          c.aiPrediction?.severity === 'Severe'
                            ? 'bg-rose-500/20 text-rose-300'
                            : c.aiPrediction?.severity === 'High'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {c.aiPrediction?.severity || 'Moderate'} Severity
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                          priority === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        <Zap className="w-3 h-3" />
                        {priority}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1" title={reason}>
                        {reason}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : c.status === 'Escalated'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {c.status}
                      </span>
                      {c.expertReview && (
                        <div className="text-[10px] text-emerald-400 mt-0.5">Expert: {c.expertReview.expertName}</div>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedCase(c);
                            setTimelineModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[11px] font-semibold"
                        >
                          Timeline
                        </button>

                        {c.status !== 'Escalated' && c.status !== 'Resolved' && (
                          <button
                            onClick={() => handleEscalateCase(c)}
                            className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-semibold"
                            title="Escalate Case"
                          >
                            Escalate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TIMELINE MODAL */}
      {/* --------------------------------------------------------------------- */}
      {timelineModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Case Lifecycle Timeline: {selectedCase.id}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                    {selectedCase.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Crop: <strong className="text-white">{selectedCase.crop}</strong> • Farmer: <strong className="text-white">{selectedCase.farmerName}</strong>
                </p>
              </div>

              <button onClick={() => setTimelineModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diagnostic Snapshot */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">AI Inference Diagnosis:</span>
                <span className="font-bold text-purple-300">{selectedCase.aiPrediction?.condition}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Scientific Name:</span>
                <span className="font-mono text-slate-300 italic">{selectedCase.aiPrediction?.scientificName}</span>
              </div>
            </div>

            {/* Chronological Lifecycle Stages */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Chronological Progression</h4>

              <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {/* 1. Created */}
                <div className="flex items-start gap-4 text-xs pl-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold z-10">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-white">Case Created & Image Uploaded</span>
                    <p className="text-[11px] text-slate-400">Captured high-resolution foliar image with GPS tagging.</p>
                    <span className="text-[10px] text-slate-500">{new Date(selectedCase.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* 2. AI Inference */}
                <div className="flex items-start gap-4 text-xs pl-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold z-10">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-white">AI Vision & Disease Analysis Completed</span>
                    <p className="text-[11px] text-slate-400">
                      Detected {selectedCase.aiPrediction?.condition} ({((selectedCase.aiPrediction?.confidence || 0.85) * 100).toFixed(0)}% confidence).
                    </p>
                  </div>
                </div>

                {/* 3. Expert Review (if exists) */}
                {selectedCase.expertReview && (
                  <div className="flex items-start gap-4 text-xs pl-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold z-10">
                      3
                    </div>
                    <div>
                      <span className="font-bold text-white">Expert Diagnostic Confirmation</span>
                      <p className="text-[11px] text-slate-300">
                        Specialist <strong>{selectedCase.expertReview.expertName}</strong>: "{selectedCase.expertReview.action}"
                      </p>
                      <p className="text-[10px] text-slate-400 italic mt-0.5">
                        "{selectedCase.expertReview.advisoryText.slice(0, 100)}..."
                      </p>
                      <span className="text-[10px] text-slate-500">{new Date(selectedCase.expertReview.reviewedAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* 4. Timeline Events Array from Database */}
                {selectedCase.timeline?.map((ev, idx) => (
                  <div key={ev.id || idx} className="flex items-start gap-4 text-xs pl-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold z-10">
                      {idx + 4}
                    </div>
                    <div>
                      <span className="font-bold text-white">{ev.action}</span>
                      <p className="text-[11px] text-slate-300">{ev.description}</p>
                      <span className="text-[10px] text-slate-500">
                        By {ev.actor} ({ev.actorRole}) • {new Date(ev.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setTimelineModalOpen(false)}
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
