import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Users,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Key,
  Eye,
  Edit2,
  X,
  Shield,
  Sprout,
  Check,
  Ban,
  Clock,
  RefreshCw,
  FileText,
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const UserDirectoryView: React.FC<Props> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewProfileModal, setViewProfileModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [createUserModal, setCreateUserModal] = useState(false);
  
  // Feedback notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for creating / editing user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'FARMER' as UserRole,
    organization: '',
    specialization: '',
    state: 'Karnataka',
    district: 'Kolar',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshData = () => {
    setUsers(StorageService.getUsers());
  };

  // Status Action (Activate / Suspend / Deactivate)
  const handleToggleStatus = (targetUser: User, newStatus: 'active' | 'suspended' | 'pending') => {
    if (targetUser.id === currentUser.id) {
      alert('You cannot modify your own administrative access status.');
      return;
    }

    const updatedUser = { ...targetUser, status: newStatus };
    StorageService.updateUser(updatedUser);
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: newStatus === 'active' ? 'USER_ACTIVATED' : newStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_STATUS_CHANGED',
      resource: targetUser.id,
      details: `Admin changed status of ${targetUser.name} (${targetUser.role}) to "${newStatus.toUpperCase()}".`,
      status: 'SUCCESS',
    });

    refreshData();
    if (selectedUser?.id === targetUser.id) {
      setSelectedUser(updatedUser);
    }
    showToast(`User ${targetUser.name} status updated to ${newStatus.toUpperCase()}`);
  };

  // Secure Password Reset Workflow
  const handleResetPassword = () => {
    if (!selectedUser) return;
    
    // Simulate generation of secure temporary one-time credential ticket
    const tempPin = Math.floor(100000 + Math.random() * 900000);
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'PASSWORD_RESET_TRIGGERED',
      resource: selectedUser.id,
      details: `Generated secure temporary OTP/pin [${tempPin}] and dispatched recovery link to ${selectedUser.email}.`,
      status: 'SUCCESS',
    });

    setResetPasswordModal(false);
    showToast(`Password recovery link & temporary credential dispatched to ${selectedUser.email}`);
  };

  // Edit Permitted Information
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const updated: User = {
      ...selectedUser,
      name: formData.name,
      phone: formData.phone,
      organization: formData.organization,
      specialization: formData.specialization,
      location: {
        ...selectedUser.location,
        state: formData.state,
        district: formData.district,
      },
    };

    StorageService.updateUser(updated);
    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'USER_PROFILE_UPDATED',
      resource: updated.id,
      details: `Admin updated profile metadata for ${updated.name}.`,
      status: 'SUCCESS',
    });

    refreshData();
    setSelectedUser(updated);
    setEditUserModal(false);
    showToast(`User profile for ${updated.name} updated successfully.`);
  };

  // Create User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const created = StorageService.createUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      organization: formData.organization,
      specialization: formData.specialization,
      location: {
        state: formData.state,
        district: formData.district,
      },
    });

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'USER_CREATED',
      resource: created.id,
      details: `Admin created new account for ${created.name} (${created.role}).`,
      status: 'SUCCESS',
    });

    refreshData();
    setCreateUserModal(false);
    showToast(`Created new account for ${created.name} (${created.role})`);
  };

  // Filtered List
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
    if (regionFilter !== 'ALL' && u.location?.state !== regionFilter && u.location?.district !== regionFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone.toLowerCase().includes(q);
      const matchId = u.id.toLowerCase().includes(q);
      const matchOrg = (u.organization || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchId || matchOrg;
    }
    return true;
  });

  const uniqueDistricts = Array.from(new Set(users.map((u) => u.location?.district).filter(Boolean)));

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
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
            <Users className="w-4 h-4" />
            <span>Central Identity & Access Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">User Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global governance of all {users.length} registered farmer, expert, officer, and administrator credentials.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              phone: '',
              role: 'FARMER',
              organization: '',
              specialization: '',
              state: 'Karnataka',
              district: 'Kolar',
            });
            setCreateUserModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Account</span>
        </button>
      </div>

      {/* Search & Multi-Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Roles ({users.length})</option>
              <option value="FARMER">Farmers ({users.filter((u) => u.role === 'FARMER').length})</option>
              <option value="EXPERT">Plant Pathologists ({users.filter((u) => u.role === 'EXPERT').length})</option>
              <option value="OFFICER">Agriculture Officers ({users.filter((u) => u.role === 'OFFICER').length})</option>
              <option value="ADMIN">Administrators ({users.filter((u) => u.role === 'ADMIN').length})</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active Accounts</option>
              <option value="suspended">Suspended Accounts</option>
              <option value="pending">Pending Verification</option>
            </select>
          </div>

          <div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Regions / Districts</option>
              {uniqueDistricts.map((d) => (
                <option key={d} value={d}>
                  District: {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
          <span>Showing <strong className="text-white">{filteredUsers.length}</strong> of {users.length} accounts</span>
          {(roleFilter !== 'ALL' || statusFilter !== 'ALL' || regionFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setRoleFilter('ALL');
                setStatusFilter('ALL');
                setRegionFilter('ALL');
                setSearchQuery('');
              }}
              className="text-purple-400 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">User ID & Name</th>
                <th className="p-3.5 font-semibold">Role</th>
                <th className="p-3.5 font-semibold">Email & Phone</th>
                <th className="p-3.5 font-semibold">Region</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Created Date</th>
                <th className="p-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{u.id}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'FARMER'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : u.role === 'EXPERT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : u.role === 'OFFICER'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div>{u.email}</div>
                    <div className="text-slate-500 text-[10px]">{u.phone}</div>
                  </td>
                  <td className="p-3.5">
                    <div>{u.location?.district || 'Not Set'}</div>
                    <div className="text-slate-500 text-[10px]">{u.location?.state || 'India'}</div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                        u.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : u.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {u.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                      {u.status === 'pending' && <Clock className="w-3 h-3" />}
                      {u.status === 'suspended' && <Ban className="w-3 h-3" />}
                      {u.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setViewProfileModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-[11px] font-semibold transition-colors"
                        title="View Full Profile"
                      >
                        Profile
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setFormData({
                            name: u.name,
                            email: u.email,
                            phone: u.phone,
                            role: u.role,
                            organization: u.organization || '',
                            specialization: u.specialization || '',
                            state: u.location?.state || 'Karnataka',
                            district: u.location?.district || 'Kolar',
                          });
                          setEditUserModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {u.status === 'active' ? (
                        <button
                          onClick={() => handleToggleStatus(u, 'suspended')}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] transition-colors"
                          title="Suspend Access"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(u, 'active')}
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] transition-colors"
                          title="Activate Account"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 1: VIEW USER PROFILE & ACTIVITY */}
      {/* ----------------------------------------------------------------- */}
      {viewProfileModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedUser.name}</h3>
                <span className="text-[10px] font-mono text-slate-400">ID: {selectedUser.id}</span>
              </div>
              <button onClick={() => setViewProfileModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Assigned Portal Role</span>
                <span className="font-bold text-purple-300">{selectedUser.role}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Account Status</span>
                <span className="font-bold text-emerald-400">{selectedUser.status.toUpperCase()}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Email Address</span>
                <span className="font-medium text-white">{selectedUser.email}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Mobile Phone</span>
                <span className="font-medium text-white">{selectedUser.phone}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Geographic Region</span>
                <span className="font-medium text-white">{selectedUser.location?.district}, {selectedUser.location?.state}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Organization / Dept</span>
                <span className="font-medium text-white">{selectedUser.organization || 'Independent'}</span>
              </div>
            </div>

            {selectedUser.specialization && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-0.5">Scientific Specialization</span>
                <span className="font-semibold text-amber-300">{selectedUser.specialization}</span>
              </div>
            )}

            {/* Admin Actions */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                onClick={() => {
                  setViewProfileModal(false);
                  setResetPasswordModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Reset Access / Password</span>
              </button>

              <button
                onClick={() => setViewProfileModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 2: RESET PASSWORD / ACCESS WORKFLOW */}
      {/* ----------------------------------------------------------------- */}
      {resetPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <Key className="w-6 h-6" />
              <div>
                <h3 className="text-base font-bold text-white">Reset User Access Credentials</h3>
                <p className="text-[11px] text-slate-400">Target: {selectedUser.name} ({selectedUser.email})</p>
              </div>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 space-y-2">
              <p>
                In accordance with CultivAI Security Policy, administrators do not change passwords directly.
              </p>
              <p className="text-[11px] text-slate-300">
                Clicking confirm will generate an immutable security audit event and dispatch an encrypted password reset link with a 15-minute temporary OTP to the user's verified address: <strong>{selectedUser.email}</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setResetPasswordModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Confirm & Dispatch Recovery</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 3: EDIT PERMITTED USER METADATA */}
      {/* ----------------------------------------------------------------- */}
      {editUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Permitted User Details</h3>
              <button onClick={() => setEditUserModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organization / Affiliation</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              {selectedUser.role === 'EXPERT' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pathology Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 4: PROVISION NEW USER */}
      {/* ----------------------------------------------------------------- */}
      {createUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Provision New Platform Account</h3>
              <button onClick={() => setCreateUserModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Priya Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. priya.sharma@icar.gov.in"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98450 11223"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Portal Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="FARMER">FARMER (Farmer Mobile & Web Workspace)</option>
                  <option value="EXPERT">EXPERT (Plant Pathologist Diagnostic Desk)</option>
                  <option value="OFFICER">OFFICER (Agriculture Surveillance Officer)</option>
                  <option value="ADMIN">ADMIN (System Administrator)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Organization / Department</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. Dept of Agriculture, Karnataka"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
