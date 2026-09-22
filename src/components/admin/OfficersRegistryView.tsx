import React, { useState } from 'react';
import { User, FieldVisit } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Shield,
  Search,
  Filter,
  Plus,
  Ban,
  Check,
  X,
  MapPin,
  Calendar,
  Building,
  Edit2,
  CheckCircle2,
  Clock,
  Eye,
  Activity,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const OfficersRegistryView: React.FC<Props> = ({ currentUser }) => {
  const [officers, setOfficers] = useState<User[]>(
    StorageService.getUsers().filter((u) => u.role === 'OFFICER')
  );
  const allVisits = StorageService.getFieldVisits();
  const allHotspots = StorageService.getHotspots();

  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [selectedOfficer, setSelectedOfficer] = useState<User | null>(null);
  const [editOfficerModal, setEditOfficerModal] = useState(false);
  const [editDistrict, setEditDistrict] = useState('');
  const [editOrg, setEditOrg] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Officer Form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newOrg, setNewOrg] = useState('Department of Agriculture, Govt. of Karnataka');
  const [newDistrict, setNewDistrict] = useState('Kolar');
  const [newState, setNewState] = useState('Karnataka');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshOfficers = () => {
    setOfficers(StorageService.getUsers().filter((u) => u.role === 'OFFICER'));
  };

  const getOfficerStats = (officer: User) => {
    const visits = allVisits.filter((v) => v.assignedOfficerId === officer.id);
    const completedVisits = visits.filter((v) => v.status === 'Completed').length;
    const scheduledVisits = visits.filter((v) => v.status === 'Planned' || v.status === 'Assigned').length;
    return {
      totalVisits: visits.length,
      completedVisits,
      scheduledVisits,
    };
  };

  const handleToggleStatus = (officer: User) => {
    const newStatus = officer.status === 'active' ? 'suspended' : 'active';
    const updated = { ...officer, status: newStatus as 'active' | 'suspended' };
    StorageService.updateUser(updated);
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: newStatus === 'active' ? 'OFFICER_ACTIVATED' : 'OFFICER_SUSPENDED',
      resource: officer.id,
      details: `Admin set status of Officer ${officer.name} to ${newStatus.toUpperCase()}.`,
      status: 'SUCCESS',
    });
    refreshOfficers();
    if (selectedOfficer?.id === officer.id) setSelectedOfficer(updated);
    showToast(`Officer ${officer.name} status updated to ${newStatus.toUpperCase()}`);
  };

  const handleSaveOfficerDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficer) return;

    const updated: User = {
      ...selectedOfficer,
      organization: editOrg,
      location: {
        state: selectedOfficer.location?.state || 'Karnataka',
        district: editDistrict,
        taluk: selectedOfficer.location?.taluk,
        village: selectedOfficer.location?.village,
        lat: selectedOfficer.location?.lat,
        lng: selectedOfficer.location?.lng,
      },
    };

    StorageService.updateUser(updated);
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'OFFICER_REGION_REASSIGNED',
      resource: selectedOfficer.id,
      details: `Admin updated jurisdiction of ${selectedOfficer.name} to District: ${editDistrict}, Dept: ${editOrg}.`,
      status: 'SUCCESS',
    });

    refreshOfficers();
    setSelectedOfficer(updated);
    setEditOfficerModal(false);
    showToast(`Officer jurisdiction updated successfully.`);
  };

  const handleCreateOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    const created = StorageService.createUser({
      name: newName,
      email: newEmail,
      phone: newPhone,
      role: 'OFFICER',
      organization: newOrg,
      location: {
        state: newState,
        district: newDistrict,
      },
    });

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'OFFICER_PROVISIONED',
      resource: created.id,
      details: `Admin provisioned Field Agriculture Officer account for ${created.name} (${newDistrict} District).`,
      status: 'SUCCESS',
    });

    refreshOfficers();
    setCreateModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    showToast(`Provisioned Officer account for ${created.name}`);
  };

  const filteredOfficers = officers.filter((off) => {
    if (districtFilter !== 'ALL' && off.location?.district !== districtFilter) return false;
    if (statusFilter !== 'ALL' && off.status !== statusFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        off.name.toLowerCase().includes(q) ||
        off.email.toLowerCase().includes(q) ||
        (off.organization || '').toLowerCase().includes(q) ||
        (off.location?.district || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uniqueDistricts = Array.from(new Set(officers.map((o) => o.location?.district).filter(Boolean)));

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
            <Shield className="w-4 h-4" />
            <span>Field Surveillance & Extension Officer Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Officers Registry</h1>
          <p className="text-xs text-slate-400 mt-1">
            Jurisdiction coverage, inspection dispatch records, and containment operations for all {officers.length} field officers.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Field Officer</span>
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
              placeholder="Search by officer name, district, dept..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Districts ({officers.length})</option>
              {uniqueDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
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
              <option value="ALL">All Account Statuses</option>
              <option value="active">Active & Deployed</option>
              <option value="suspended">Suspended / Inactive</option>
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
                <th className="p-3.5 font-semibold">Officer & ID</th>
                <th className="p-3.5 font-semibold">Department / Designation</th>
                <th className="p-3.5 font-semibold">Assigned Jurisdiction</th>
                <th className="p-3.5 font-semibold">Field Inspections</th>
                <th className="p-3.5 font-semibold">Account Status</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredOfficers.map((off) => {
                const { totalVisits, completedVisits } = getOfficerStats(off);

                return (
                  <tr key={off.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-400" />
                        <span>{off.name}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">{off.id}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-white">{off.organization || 'Govt. Agricultural Dept'}</div>
                      <div className="text-[10px] text-slate-500">Assistant Director of Agriculture</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-blue-300">
                        {off.location?.district || 'Kolar'} District
                      </span>
                      <div className="text-[10px] text-slate-500">{off.location?.state || 'Karnataka'}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{totalVisits} Dispatched</div>
                      <div className="text-[10px] text-emerald-400">{completedVisits} Verified & Closed</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          off.status === 'active' ? 'text-emerald-300' : 'text-rose-300'
                        }`}
                      >
                        {off.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedOfficer(off);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[11px] font-semibold"
                        >
                          Surveillance
                        </button>

                        <button
                          onClick={() => {
                            setSelectedOfficer(off);
                            setEditDistrict(off.location?.district || 'Kolar');
                            setEditOrg(off.organization || 'Dept of Agriculture');
                            setEditOfficerModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Reassign Jurisdiction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {off.status === 'active' ? (
                          <button
                            onClick={() => handleToggleStatus(off)}
                            className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                            title="Suspend"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(off)}
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

      {/* SURVEILLANCE & PROFILE MODAL */}
      {selectedOfficer && !editOfficerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedOfficer.name}</h3>
                <span className="text-xs text-blue-400 font-semibold">{selectedOfficer.organization}</span>
              </div>
              <button onClick={() => setSelectedOfficer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Assigned District</span>
                <span className="font-bold text-white">{selectedOfficer.location?.district}, {selectedOfficer.location?.state}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Official Mobile & Contact</span>
                <span className="font-bold text-white">{selectedOfficer.phone}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Field Inspection Operations</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allVisits.filter((v) => v.assignedOfficerId === selectedOfficer.id).length === 0 ? (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                    No field inspections dispatched for this officer yet.
                  </div>
                ) : (
                  allVisits.filter((v) => v.assignedOfficerId === selectedOfficer.id).map((visit) => (
                    <div key={visit.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{visit.location}</div>
                        <div className="text-[11px] text-slate-400">Scheduled: {visit.scheduledDate} • {visit.reason}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                        {visit.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedOfficer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REASSIGN JURISDICTION MODAL */}
      {editOfficerModal && selectedOfficer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Reassign Officer Jurisdiction</h3>
              <button onClick={() => setEditOfficerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOfficerDetails} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department / Organization</label>
                <input
                  type="text"
                  required
                  value={editOrg}
                  onChange={(e) => setEditOrg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned District Jurisdiction</label>
                <input
                  type="text"
                  required
                  value={editDistrict}
                  onChange={(e) => setEditDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditOfficerModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs"
                >
                  Update Jurisdiction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE OFFICER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Provision New Agriculture Officer</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOfficer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Officer Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Smt. Suma Devi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Govt. Official Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. suma.devi@karnataka.gov.in"
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
                  placeholder="+91 98450 44556"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned District</label>
                <input
                  type="text"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department / Organization</label>
                <input
                  type="text"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
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
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
