import React, { useState } from 'react';
import { User, CaseRecord } from '../../types';
import { StorageService } from '../../services/storage';
import {
  CheckCircle2,
  Search,
  Filter,
  Eye,
  Plus,
  Ban,
  Check,
  X,
  Microscope,
  Shield,
  Clock,
  AlertTriangle,
  FileText,
  MapPin,
  Building,
  Award,
  Edit2,
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const ExpertsRegistryView: React.FC<Props> = ({ currentUser }) => {
  const [experts, setExperts] = useState<User[]>(
    StorageService.getUsers().filter((u) => u.role === 'EXPERT')
  );
  const allCases = StorageService.getCases();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [specializationFilter, setSpecializationFilter] = useState('ALL');

  // Selected Expert for Profile & Decision modal
  const [selectedExpert, setSelectedExpert] = useState<User | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionType, setDecisionType] = useState<'approve' | 'reject'>('approve');

  // Edit Specialization & Region Modal
  const [editExpertModal, setEditExpertModal] = useState(false);
  const [editSpecialization, setEditSpecialization] = useState('');
  const [editRegion, setEditRegion] = useState('');

  // Create Expert Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('Horticultural Pathology');
  const [newOrg, setNewOrg] = useState('ICAR - Indian Agricultural Research Institute');
  const [newRegion, setNewRegion] = useState('Karnataka');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshExperts = () => {
    setExperts(StorageService.getUsers().filter((u) => u.role === 'EXPERT'));
  };

  // Metrics for an expert
  const getExpertMetrics = (expert: User) => {
    const reviewed = allCases.filter((c) => c.expertReview?.expertId === expert.id);
    const confirmed = reviewed.filter((c) => c.expertReview?.action === 'Confirm Diagnosis').length;
    const pending = allCases.filter((c) => c.status === 'Under Review' || c.status === 'New').length;
    return {
      totalReviewed: reviewed.length,
      confirmed,
      pending,
    };
  };

  // Verification Decision (Approve / Reject) with Audit Logging
  const handleVerificationDecision = () => {
    if (!selectedExpert) return;

    const isApprove = decisionType === 'approve';
    const updatedUser: User = {
      ...selectedExpert,
      status: isApprove ? 'active' : 'suspended',
    };

    StorageService.updateUser(updatedUser);
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: isApprove ? 'EXPERT_VERIFICATION_APPROVED' : 'EXPERT_VERIFICATION_REJECTED',
      resource: selectedExpert.id,
      details: `Admin ${currentUser.name} evaluated expert credentials for ${selectedExpert.name}. Decision: ${isApprove ? 'APPROVED' : 'REJECTED'}. Reason: "${decisionReason || 'Institutional credentials and pathology certification verified.'}".`,
      status: 'SUCCESS',
    });

    refreshExperts();
    setSelectedExpert(updatedUser);
    setVerificationModalOpen(false);
    setDecisionReason('');
    showToast(`Expert verification decision recorded: ${isApprove ? 'APPROVED' : 'REJECTED'}`);
  };

  // Toggle Account Status
  const handleToggleStatus = (expert: User) => {
    const newStatus = expert.status === 'active' ? 'suspended' : 'active';
    const updated = { ...expert, status: newStatus as 'active' | 'suspended' };
    StorageService.updateUser(updated);
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: newStatus === 'active' ? 'EXPERT_ACTIVATED' : 'EXPERT_SUSPENDED',
      resource: expert.id,
      details: `Admin changed expert status of ${expert.name} to ${newStatus.toUpperCase()}.`,
      status: 'SUCCESS',
    });
    refreshExperts();
    if (selectedExpert?.id === expert.id) setSelectedExpert(updated);
    showToast(`Expert ${expert.name} status updated to ${newStatus.toUpperCase()}`);
  };

  // Save Region & Specialization
  const handleSaveExpertDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpert) return;

    const updated: User = {
      ...selectedExpert,
      specialization: editSpecialization,
      location: {
        ...selectedExpert.location,
        state: editRegion,
        district: selectedExpert.location?.district || 'Bangalore',
      },
    };

    StorageService.updateUser(updated);
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'EXPERT_METADATA_UPDATED',
      resource: selectedExpert.id,
      details: `Admin updated specialization to "${editSpecialization}" and assigned region to "${editRegion}".`,
      status: 'SUCCESS',
    });

    refreshExperts();
    setSelectedExpert(updated);
    setEditExpertModal(false);
    showToast(`Updated profile for ${selectedExpert.name}`);
  };

  // Provision New Expert
  const handleCreateExpert = (e: React.FormEvent) => {
    e.preventDefault();
    const created = StorageService.createUser({
      name: newName,
      email: newEmail,
      phone: newPhone,
      role: 'EXPERT',
      organization: newOrg,
      specialization: newSpecialization,
      location: {
        state: newRegion,
        district: 'Bangalore Urban',
      },
    });

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'EXPERT_PROVISIONED',
      resource: created.id,
      details: `Admin created Plant Pathologist profile for ${created.name} (${newSpecialization}).`,
      status: 'SUCCESS',
    });

    refreshExperts();
    setCreateModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    showToast(`Provisioned Expert profile for ${created.name}`);
  };

  const filteredExperts = experts.filter((e) => {
    if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
    if (specializationFilter !== 'ALL' && e.specialization !== specializationFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.specialization || '').toLowerCase().includes(q) ||
        (e.organization || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uniqueSpecializations = Array.from(new Set(experts.map((e) => e.specialization).filter(Boolean)));

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
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Pathologist Accreditation & Verification Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Experts Registry</h1>
          <p className="text-xs text-slate-400 mt-1">
            Verification status, specialization coverage, regional assignment, and diagnostic review audit history.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Accredit New Specialist</span>
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
              placeholder="Search by name, organization, specialization..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Specializations ({experts.length})</option>
              {uniqueSpecializations.map((s) => (
                <option key={s} value={s}>
                  {s}
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
              <option value="ALL">All Accreditation Statuses</option>
              <option value="active">Active & Verified</option>
              <option value="pending">Pending Verification</option>
              <option value="suspended">Suspended / Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Specialist & ID</th>
                <th className="p-3.5 font-semibold">Specialization</th>
                <th className="p-3.5 font-semibold">Assigned Region / Org</th>
                <th className="p-3.5 font-semibold">Accreditation</th>
                <th className="p-3.5 font-semibold">Reviewed Cases</th>
                <th className="p-3.5 font-semibold">Account Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredExperts.map((exp) => {
                const { totalReviewed, confirmed } = getExpertMetrics(exp);

                return (
                  <tr key={exp.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Microscope className="w-3.5 h-3.5 text-amber-400" />
                        <span>{exp.name}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">{exp.id}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-amber-300">{exp.specialization || 'Plant Pathology'}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="text-white">{exp.organization || 'ICAR Institute'}</div>
                      <div className="text-[10px] text-slate-500">{exp.location?.state || 'National'}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          exp.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : exp.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {exp.status === 'active' ? 'VERIFIED' : exp.status === 'pending' ? 'PENDING AUDIT' : 'REJECTED'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{totalReviewed} Reviews</div>
                      <div className="text-[10px] text-emerald-400">{confirmed} Confirmed Diagnoses</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          exp.status === 'active' ? 'text-emerald-300' : 'text-rose-300'
                        }`}
                      >
                        {exp.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedExpert(exp);
                            setVerificationModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold"
                        >
                          Evaluate
                        </button>

                        <button
                          onClick={() => {
                            setSelectedExpert(exp);
                            setEditSpecialization(exp.specialization || 'Plant Pathology');
                            setEditRegion(exp.location?.state || 'Karnataka');
                            setEditExpertModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Edit Region & Specialization"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {exp.status === 'active' ? (
                          <button
                            onClick={() => handleToggleStatus(exp)}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                            title="Suspend"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(exp)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300"
                            title="Activate"
                          >
                            <Check className="w-3.5 h-3.5" />
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
      {/* VERIFICATION & ACCREDITATION EVALUATION MODAL */}
      {/* --------------------------------------------------------------------- */}
      {verificationModalOpen && selectedExpert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Expert Accreditation Evaluation</h3>
                <span className="text-xs text-amber-400 font-semibold">{selectedExpert.name}</span>
              </div>
              <button onClick={() => setVerificationModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Institutional Organization:</span>
                <span className="font-semibold text-white">{selectedExpert.organization || 'Independent'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Scientific Specialization:</span>
                <span className="font-semibold text-amber-300">{selectedExpert.specialization || 'General Pathology'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned State Jurisdiction:</span>
                <span className="font-semibold text-white">{selectedExpert.location?.state || 'National'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verified Email & Phone:</span>
                <span className="text-slate-200">{selectedExpert.email} • {selectedExpert.phone}</span>
              </div>
            </div>

            {/* Decision Radio & Form */}
            <div className="space-y-3 text-xs">
              <label className="block text-slate-300 font-semibold">Administrative Decision *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecisionType('approve')}
                  className={`p-3 rounded-xl border text-left font-bold flex items-center gap-2 ${
                    decisionType === 'approve'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Approve & Accredit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDecisionType('reject')}
                  className={`p-3 rounded-xl border text-left font-bold flex items-center gap-2 ${
                    decisionType === 'reject'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Ban className="w-4 h-4 text-rose-400" />
                  <span>Reject Accreditation</span>
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Decision Justification / Reason *</label>
                <textarea
                  rows={3}
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="e.g. Verified ICAR credentials, verified state pathology certification, and validated university tenure."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                Audited Reviewer: <strong className="text-white">{currentUser.name}</strong> • Timestamp: <strong className="text-slate-200">{new Date().toLocaleString()}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setVerificationModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleVerificationDecision}
                className={`px-4 py-2 rounded-xl font-bold text-xs ${
                  decisionType === 'approve'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-rose-500 hover:bg-rose-400 text-white'
                }`}
              >
                Commit Decision to Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SPECIALIZATION MODAL */}
      {editExpertModal && selectedExpert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Update Specialization & Region</h3>
              <button onClick={() => setEditExpertModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpertDetails} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pathology Specialization</label>
                <input
                  type="text"
                  required
                  value={editSpecialization}
                  onChange={(e) => setEditSpecialization(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned State Jurisdiction</label>
                <input
                  type="text"
                  required
                  value={editRegion}
                  onChange={(e) => setEditRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditExpertModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EXPERT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Accredit New Plant Pathologist</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpert} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Gupta"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Institutional Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. ramesh@icar.gov.in"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Specialization Area</label>
                <input
                  type="text"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="e.g. Solanaceous Viral & Fungal Pathologies"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Research Organization / University</label>
                <input
                  type="text"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  placeholder="e.g. ICAR-IIHR Vegetable Division"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned State Jurisdiction</label>
                <input
                  type="text"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
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
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Provision Specialist Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
