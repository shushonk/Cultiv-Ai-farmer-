import React, { useState } from 'react';
import { User, CaseRecord, Field } from '../../types';
import { StorageService } from '../../services/storage';
import { StatusBadge, SeverityBadge, RiskBadge } from '../common/StatusBadge';
import {
  Shield,
  MapPin,
  AlertTriangle,
  Send,
  Calendar,
  BarChart3,
  CheckCircle2,
  Users,
  Search,
  Radio,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface Props {
  user: User;
  subPath: string;
  onNavigate: (path: string) => void;
}

export const OfficerViews: React.FC<Props> = ({ user, subPath, onNavigate }) => {
  const cases = StorageService.getCases();
  const allFields = StorageService.getFields();
  const alerts = StorageService.getAlerts('OFFICER');

  // Broadcast modal / state
  const [broadcastTarget, setBroadcastTarget] = useState('Kolar District (All Taluks)');
  const [broadcastCrop, setBroadcastCrop] = useState('Solanaceous (Tomato/Chilli/Capsicum)');
  const [broadcastMessage, setBroadcastMessage] = useState(
    'URGENT ADVISORY: High humidity (>80% RH) has triggered Early Blight spore alerts. Inspect lower leaves and apply recommended bio-antagonist or Mancozeb spray.'
  );
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Inspection Scheduler state
  const [inspections, setInspections] = useState([
    {
      id: 'insp-1',
      date: '2026-09-23',
      farmer: 'Rajesh Patel',
      parcel: 'North Tomato Parcel',
      location: 'Mulbagal Taluk, Kolar',
      status: 'Scheduled',
      assignedTo: 'Officer Ananya Sharma',
      notes: 'Verify Alternaria containment and check spray compliance.',
    },
    {
      id: 'insp-2',
      date: '2026-09-24',
      farmer: 'Kiran Gowda',
      parcel: 'Paddy Field Block 3',
      location: 'Bailhongal, Belagavi',
      status: 'Pending Assignment',
      assignedTo: 'Unassigned',
      notes: 'Cluster blast check across 4 contiguous farms.',
    },
  ]);

  const [newInspFarmer, setNewInspFarmer] = useState('Rajesh Patel');
  const [newInspDate, setNewInspDate] = useState('2026-09-25');
  const [newInspNotes, setNewInspNotes] = useState('');

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    setInspections([
      ...inspections,
      {
        id: `insp-${Date.now()}`,
        date: newInspDate,
        farmer: newInspFarmer,
        parcel: 'Inspected Parcel',
        location: `${user.location?.district || 'Kolar'} District`,
        status: 'Scheduled',
        assignedTo: user.name,
        notes: newInspNotes || 'Routine extension verification.',
      },
    ]);
    setNewInspNotes('');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.addAlert({
      targetRole: 'FARMER',
      type: 'REGIONAL_OUTBREAK',
      title: `District Agricultural Advisory: ${broadcastTarget}`,
      message: broadcastMessage,
      actionRequired: 'Inspect fields immediately and review IPM protocols in CultivAI portal.',
      level: 'critical',
    });
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  // ----------------------------------------------------
  // SUB-VIEW: DASHBOARD
  // ----------------------------------------------------
  if (subPath === 'dashboard' || subPath === '') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <Shield className="w-4 h-4" />
              <span>District Agricultural Extension & Surveillance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Welcome, {user.name}</h1>
            <p className="text-xs text-slate-300 mt-1">
              Jurisdiction: <strong className="text-white">{user.location?.district || 'Kolar'} District</strong> • {user.organization || 'Department of Agriculture, Govt of Karnataka'}
            </p>
          </div>

          <button
            onClick={() => onNavigate('/officer/broadcasts')}
            className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 shrink-0"
          >
            <Radio className="w-4 h-4" />
            <span>Broadcast Regional Advisory</span>
          </button>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Monitored Acreage</span>
            <div className="text-2xl font-bold text-white">712.5 Acres</div>
            <span className="text-[10px] text-blue-400">Across 4 sub-divisions</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Active Outbreak Clusters</span>
            <div className="text-2xl font-bold text-rose-400">2 Hotspots</div>
            <span className="text-[10px] text-rose-300">Tomato Early Blight in Mulbagal</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Verified Cases</span>
            <div className="text-2xl font-bold text-emerald-400">{cases.length} Logged</div>
            <span className="text-[10px] text-emerald-400">94% Expert validation rate</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Field Inspections</span>
            <div className="text-2xl font-bold text-amber-400">{inspections.length} Scheduled</div>
            <span className="text-[10px] text-amber-300">Extension officers deployed</span>
          </div>
        </div>

        {/* Cluster map teaser & recent cases */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Active Epidemiological Clusters</h2>
              <button
                onClick={() => onNavigate('/officer/surveillance')}
                className="text-xs text-blue-400 hover:underline"
              >
                Full Geospatial Surveillance →
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
                    Hotspot #1: Mulbagal Tomato Cluster
                  </span>
                  <p className="text-xs text-slate-300 mt-1">
                    4 confirmed Alternaria cases across 18 contiguous acres. Humidity: 84%.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/officer/broadcasts')}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs shrink-0"
                >
                  Alert Farmers
                </button>
              </div>

              <div className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    Hotspot #2: Bailhongal Paddy Blast Corridor
                  </span>
                  <p className="text-xs text-slate-300 mt-1">
                    2 confirmed Magnaporthe cases. Rainfall suitability 72%.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/officer/inspections')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0"
                >
                  Schedule Visit
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Upcoming Field Visits</h2>
            <div className="space-y-2">
              {inspections.map((insp) => (
                <div key={insp.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{insp.farmer}</span>
                    <span className="text-emerald-400 font-semibold">{insp.date}</span>
                  </div>
                  <p className="text-slate-400">{insp.location} • {insp.parcel}</p>
                  <p className="text-[11px] text-slate-300 italic pt-1">{insp.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: GEOSPATIAL SURVEILLANCE & HOTSPOT MAP
  // ----------------------------------------------------
  if (subPath === 'surveillance') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Geospatial Surveillance & Cluster Heatmap</h1>
          <p className="text-xs text-slate-400">Interactive district epidemiology and farm parcel distribution</p>
        </div>

        {/* Visual Map Simulator */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="relative h-96 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]"></div>

            {/* Simulated Geospatial Pins */}
            <div className="relative z-10 w-full h-full p-8 flex flex-col justify-between">
              {/* Cluster 1: Kolar */}
              <div className="absolute top-1/4 left-1/3 p-3 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-300 animate-pulse flex items-center gap-2 shadow-2xl">
                <MapPin className="w-5 h-5 text-rose-400" />
                <div>
                  <div className="font-bold text-xs text-white">Kolar Hotspot (4 Cases)</div>
                  <div className="text-[10px] text-rose-300">Tomato Early Blight (High RH)</div>
                </div>
              </div>

              {/* Cluster 2: Belagavi */}
              <div className="absolute bottom-1/3 right-1/4 p-3 rounded-2xl bg-amber-500/20 border-2 border-amber-500 text-amber-300 flex items-center gap-2 shadow-2xl">
                <MapPin className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="font-bold text-xs text-white">Belagavi Cluster (2 Cases)</div>
                  <div className="text-[10px] text-amber-300">Paddy Blast Corridor</div>
                </div>
              </div>

              {/* Healthy Parcel Pin */}
              <div className="absolute top-1/2 right-1/2 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-semibold text-white">Nashik Vineyards (Healthy)</span>
              </div>
            </div>

            <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-[11px] text-slate-300 flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> High Outbreak</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Moderate</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Healthy</span>
            </div>
          </div>

          {/* Regional Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Surveillance by Taluk / Zone</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-white">Mulbagal Taluk (Kolar)</div>
                <div className="text-rose-400 font-semibold mt-1">Status: Active Outbreak (84% RH)</div>
                <p className="text-slate-400 text-[11px] mt-2">12 Farm parcels under mandatory containment advisory.</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-white">Bailhongal (Belagavi)</div>
                <div className="text-amber-400 font-semibold mt-1">Status: Moderate Blast Watch</div>
                <p className="text-slate-400 text-[11px] mt-2">Extension officers conducting weekly foliage surveys.</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="font-bold text-white">Dindori (Nashik)</div>
                <div className="text-emerald-400 font-semibold mt-1">Status: Low Risk / Stable</div>
                <p className="text-slate-400 text-[11px] mt-2">Preventive bio-antagonistic application compliant.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: BROADCAST REGIONAL ADVISORY
  // ----------------------------------------------------
  if (subPath === 'broadcasts') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Regional Emergency Broadcast System</h1>
          <p className="text-xs text-slate-400">
            Dispatch instantaneous containment warnings and IPM advisories to registered growers across taluks
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          {broadcastSent && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Broadcast dispatched successfully! 412 registered farmers in {broadcastTarget} alerted.</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Target Zone / Jurisdiction *
              </label>
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
              >
                <option value="Kolar District (All Taluks)">Kolar District (All Taluks - 412 Farmers)</option>
                <option value="Mulbagal Taluk (High Risk Cluster)">Mulbagal Taluk (High Risk Cluster - 148 Farmers)</option>
                <option value="Belagavi District (Bailhongal)">Belagavi District (Bailhongal - 230 Farmers)</option>
                <option value="All Monitored Agro-Climatic Zones">All Monitored Agro-Climatic Zones</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Applicable Crop Category *
              </label>
              <input
                type="text"
                required
                value={broadcastCrop}
                onChange={(e) => setBroadcastCrop(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Advisory Message Content (App & SMS Gateway) *
              </label>
              <textarea
                rows={4}
                required
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs leading-relaxed"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Radio className="w-4 h-4" />
              <span>Broadcast Emergency Warning</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: INSPECTIONS SCHEDULER
  // ----------------------------------------------------
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Field Inspections & Ground Truth Verification</h1>
          <p className="text-xs text-slate-400">Coordinate on-site extension visits and verify containment measures</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" /> Schedule Field Visit
          </h3>

          <form onSubmit={handleCreateInspection} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Farmer</label>
              <input
                type="text"
                required
                value={newInspFarmer}
                onChange={(e) => setNewInspFarmer(e.target.value)}
                placeholder="Farmer Name"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Visit Date</label>
              <input
                type="date"
                required
                value={newInspDate}
                onChange={(e) => setNewInspDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Inspection Objectives</label>
              <textarea
                rows={3}
                value={newInspNotes}
                onChange={(e) => setNewInspNotes(e.target.value)}
                placeholder="Verify foliar containment and sample soil pH..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold"
            >
              Add Inspection
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-white">Scheduled Field Operations ({inspections.length})</h3>
          <div className="space-y-3">
            {inspections.map((insp) => (
              <div key={insp.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{insp.farmer}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                      {insp.status}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono">{insp.date}</span>
                </div>
                <p className="text-slate-400">{insp.location} • {insp.parcel}</p>
                <p className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {insp.notes}
                </p>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Assigned Officer: {insp.assignedTo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
