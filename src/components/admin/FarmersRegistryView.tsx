import React, { useState } from 'react';
import { User, Field, CaseRecord } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Sprout,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  Activity,
  History,
  Lock,
  Key,
  Ban,
  Check,
  X,
  Plus,
  ArrowRight,
} from 'lucide-react';

interface Props {
  currentUser: User;
  onNavigateCase?: (caseId: string) => void;
}

export const FarmersRegistryView: React.FC<Props> = ({ currentUser, onNavigateCase }) => {
  const [farmers, setFarmers] = useState<User[]>(
    StorageService.getUsers().filter((u) => u.role === 'FARMER')
  );
  const allFields = StorageService.getFields();
  const allCases = StorageService.getCases();
  const allAlerts = StorageService.getAlerts();

  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Farmer for Farmer Overview Modal
  const [selectedFarmer, setSelectedFarmer] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'fields' | 'cases' | 'timeline'>('overview');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshFarmers = () => {
    setFarmers(StorageService.getUsers().filter((u) => u.role === 'FARMER'));
  };

  // Helper to compute farmer's fields & cases
  const getFarmerData = (farmerId: string) => {
    const fields = allFields.filter((f) => f.farmerId === farmerId);
    const cases = allCases.filter((c) => c.farmerId === farmerId);
    const hasCritical = cases.some((c) => c.riskAssessment?.overallRisk === 'CRITICAL');
    const hasHigh = cases.some((c) => c.riskAssessment?.overallRisk === 'HIGH');
    const activeCases = cases.filter((c) => c.status !== 'Resolved').length;

    let riskStatus: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (hasCritical) riskStatus = 'CRITICAL';
    else if (hasHigh) riskStatus = 'HIGH';
    else if (activeCases > 0) riskStatus = 'MODERATE';

    return {
      fields,
      cases,
      activeCases,
      riskStatus,
      totalAcres: fields.reduce((acc, f) => acc + (f.areaAcres || 0), 0),
    };
  };

  const handleToggleStatus = (farmer: User) => {
    const newStatus = farmer.status === 'active' ? 'suspended' : 'active';
    const updated = { ...farmer, status: newStatus as 'active' | 'suspended' };
    StorageService.updateUser(updated);
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: newStatus === 'active' ? 'FARMER_ACTIVATED' : 'FARMER_SUSPENDED',
      resource: farmer.id,
      details: `Admin set status of farmer ${farmer.name} to ${newStatus.toUpperCase()}.`,
      status: 'SUCCESS',
    });
    refreshFarmers();
    if (selectedFarmer?.id === farmer.id) {
      setSelectedFarmer(updated);
    }
    showToast(`Farmer ${farmer.name} status updated to ${newStatus.toUpperCase()}`);
  };

  const handleResetPassword = () => {
    if (!selectedFarmer) return;
    const tempPin = Math.floor(100000 + Math.random() * 900000);
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'PASSWORD_RESET_TRIGGERED',
      resource: selectedFarmer.id,
      details: `Generated secure farmer OTP [${tempPin}] and sent SMS/email notification to ${selectedFarmer.phone}.`,
      status: 'SUCCESS',
    });
    setResetModalOpen(false);
    showToast(`Recovery OTP and reset link sent to farmer phone ${selectedFarmer.phone}`);
  };

  const filteredFarmers = farmers.filter((f) => {
    const { riskStatus } = getFarmerData(f.id);
    if (districtFilter !== 'ALL' && f.location?.district !== districtFilter) return false;
    if (riskFilter !== 'ALL' && riskStatus !== riskFilter) return false;
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.phone.includes(q) ||
        f.id.toLowerCase().includes(q) ||
        (f.location?.district || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uniqueDistricts = Array.from(new Set(farmers.map((f) => f.location?.district).filter(Boolean)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-purple-950 border border-purple-500/50 text-white shadow-2xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Sprout className="w-4 h-4" />
            <span>Dedicated Agricultural Producers Management Module</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Farmers Registry</h1>
          <p className="text-xs text-slate-400 mt-1">
            Inspection, field inventory, scan histories, and risk profiles for all {farmers.length} registered producers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            Total Active Growers: <strong className="text-emerald-400">{farmers.filter((f) => f.status === 'active').length}</strong>
          </span>
        </div>
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
              placeholder="Search by farmer name, phone, district..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Districts ({farmers.length})</option>
              {uniqueDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Risk Statuses</option>
              <option value="CRITICAL">Critical Threat Signals</option>
              <option value="HIGH">High Risk Outbreaks</option>
              <option value="MODERATE">Moderate / Under Review</option>
              <option value="LOW">Low / Healthy Fields</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Farmers Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Farmer ID & Name</th>
                <th className="p-3.5 font-semibold">Contact & Phone</th>
                <th className="p-3.5 font-semibold">Location</th>
                <th className="p-3.5 font-semibold">Holdings</th>
                <th className="p-3.5 font-semibold">Active Cases</th>
                <th className="p-3.5 font-semibold">Risk Status</th>
                <th className="p-3.5 font-semibold">Account Status</th>
                <th className="p-3.5 font-semibold text-right">Farmer Overview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredFarmers.map((f) => {
                const { fields, activeCases, riskStatus, totalAcres } = getFarmerData(f.id);

                return (
                  <tr key={f.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{f.name}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">{f.id}</div>
                    </td>
                    <td className="p-3.5">
                      <div>{f.phone}</div>
                      <div className="text-[10px] text-slate-500">{f.email}</div>
                    </td>
                    <td className="p-3.5">
                      <div>{f.location?.district || 'Kolar'}</div>
                      <div className="text-[10px] text-slate-500">{f.location?.state || 'Karnataka'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-white">{fields.length} Plots / Fields</div>
                      <div className="text-[10px] text-slate-400">{totalAcres.toFixed(1)} Total Acres</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-white">{activeCases} Active</span>
                      <div className="text-[10px] text-slate-500">of {allCases.filter((c) => c.farmerId === f.id).length} total</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          riskStatus === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : riskStatus === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {riskStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {f.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedFarmer(f);
                            setActiveTab('overview');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Overview</span>
                        </button>
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
      {/* COMPREHENSIVE FARMER OVERVIEW MODAL */}
      {/* --------------------------------------------------------------------- */}
      {selectedFarmer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{selectedFarmer.name}</h2>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedFarmer.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {selectedFarmer.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Farmer ID: <strong className="text-white font-mono">{selectedFarmer.id}</strong> • Registered: {new Date(selectedFarmer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button onClick={() => setSelectedFarmer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Profile & Summary
              </button>
              <button
                onClick={() => setActiveTab('fields')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'fields'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Farms & Fields ({allFields.filter((f) => f.farmerId === selectedFarmer.id).length})
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'cases'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Diagnostic Cases ({allCases.filter((c) => c.farmerId === selectedFarmer.id).length})
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'timeline'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Activity Timeline
              </button>
            </div>

            {/* TAB CONTENT: PROFILE & SUMMARY */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Phone Number</span>
                    <span className="font-semibold text-white">{selectedFarmer.phone}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Email</span>
                    <span className="font-semibold text-white">{selectedFarmer.email}</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block mb-1">Location District</span>
                    <span className="font-semibold text-white">{selectedFarmer.location?.district}, {selectedFarmer.location?.state}</span>
                  </div>
                </div>

                {/* Agricultural Observational Disclaimer Notice */}
                <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs text-purple-200">
                  <span className="font-bold block mb-1">Administrative Governance Policy</span>
                  Administrators are permitted to manage farmer credentials and account access status. Agricultural observations, foliar scans, and expert diagnoses cannot be arbitrarily modified from this view to preserve clinical integrity.
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setResetModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Reset Farmer Password</span>
                    </button>

                    <button
                      onClick={() => handleToggleStatus(selectedFarmer)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
                        selectedFarmer.status === 'active'
                          ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {selectedFarmer.status === 'active' ? (
                        <>
                          <Ban className="w-3.5 h-3.5" />
                          <span>Suspend Farmer Account</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Re-Activate Account</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedFarmer(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: FIELDS */}
            {activeTab === 'fields' && (
              <div className="space-y-3">
                {allFields.filter((f) => f.farmerId === selectedFarmer.id).map((field) => (
                  <div key={field.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{field.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                          {field.crop} ({field.variety})
                        </span>
                      </div>
                      <div className="text-slate-400 mt-1">
                        Stage: <strong className="text-slate-200">{field.cropStage}</strong> • Area: <strong className="text-slate-200">{field.areaAcres} Acres</strong> • Soil: {field.soilCondition}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Irrigation: {field.irrigationType} • Sowing Date: {field.sowingDate}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          field.healthStatus === 'High Risk'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : field.healthStatus === 'Attention Required'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {field.healthStatus}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">{field.activeCasesCount} Active Cases</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: CASES */}
            {activeTab === 'cases' && (
              <div className="space-y-3">
                {allCases.filter((c) => c.farmerId === selectedFarmer.id).map((c) => (
                  <div key={c.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="font-mono text-purple-400">{c.id}</span>
                        <span>{c.crop} - {c.aiPrediction.condition}</span>
                      </div>
                      <div className="text-slate-400 mt-1">
                        Created: {new Date(c.createdAt).toLocaleString()} • AI Confidence: {(c.aiPrediction.confidence * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: ACTIVITY TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white">Account Active on Platform</span>
                    <div className="text-slate-400 text-[11px]">{new Date(selectedFarmer.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                {allCases.filter((c) => c.farmerId === selectedFarmer.id).map((c) => (
                  <div key={c.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="font-bold text-white">Submitted Diagnostic Image: {c.crop} ({c.id})</span>
                      <div className="text-slate-400 text-[11px]">{new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetModalOpen && selectedFarmer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <Key className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Reset Farmer Password</h3>
            </div>
            <p className="text-xs text-slate-300">
              Dispatches a secure temporary OTP and password recovery SMS to <strong>{selectedFarmer.phone}</strong>.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Dispatch Reset OTP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
