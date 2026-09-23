import React, { useState, useEffect } from 'react';
import { User, CaseRecord, Field, Hotspot, FieldVisit, AlertItem } from '../../types';
import { API } from '../../services/api';
import { StatusBadge, SeverityBadge, RiskBadge } from '../common/StatusBadge';
import { CultivAIMap, MapFiltersState } from '../maps/CultivAIMap';
import { MapFilters } from '../maps/MapFilters';
import { OfficerSettingsView } from './OfficerSettingsView';
import { useI18n } from '../../i18n';
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
  Filter,
  Layers,
  Sparkles,
  Bot,
  RefreshCw,
  Eye,
  Download,
  Printer,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';

interface Props {
  user: User;
  subPath: string;
  onNavigate: (path: string) => void;
}

export const OfficerViews: React.FC<Props> = ({ user, subPath, onNavigate }) => {
  const { t, tStatus, tRisk, tSeverity } = useI18n();

  // State
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [inspections, setInspections] = useState<FieldVisit[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [weatherStations, setWeatherStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Map filters state
  const [mapFilters, setMapFilters] = useState<MapFiltersState>({
    crop: 'ALL',
    condition: 'ALL',
    risk: 'ALL',
    severity: 'ALL',
    district: 'ALL',
    status: 'ALL',
    showCases: true,
    showHotspots: true,
    showVisits: true,
    showWeather: true,
  });

  // Selected case for detailed modal
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);

  // Broadcast state
  const [broadcastTarget, setBroadcastTarget] = useState('Kolar District');
  const [broadcastCrop, setBroadcastCrop] = useState('Tomato');
  const [broadcastSeverity, setBroadcastSeverity] = useState<'moderate' | 'high' | 'critical'>('high');
  const [broadcastMessage, setBroadcastMessage] = useState(
    'URGENT EPIDEMIOLOGICAL ADVISORY: Elevated canopy wetness (>7 hrs) and nocturnal humidity (>85% RH) have triggered an Early Blight outbreak warning. Inspect lower foliage immediately and apply bio-antagonist or certified Mancozeb.'
  );
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);

  // Inspection form state
  const [newInspFarmer, setNewInspFarmer] = useState('');
  const [newInspCrop, setNewInspCrop] = useState('Tomato');
  const [newInspDate, setNewInspDate] = useState(new Date().toISOString().split('T')[0]);
  const [newInspNotes, setNewInspNotes] = useState('');
  const [schedulingVisit, setSchedulingVisit] = useState(false);

  // Surveillance copilot state
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: `Welcome Officer ${user.name}. I am the CultivAI Surveillance Copilot. You can query regional epidemic risks, microclimate suitability, ICAR containment protocols, or quarantine advisory templates.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Load Data from real API
  const loadData = async () => {
    setLoading(true);
    try {
      const [casesRes, hotspotsRes, inspRes, alertsRes, weatherRes] = await Promise.all([
        API.getCases(),
        API.getHotspots(),
        API.getInspections(),
        API.getAlerts('OFFICER'),
        API.getWeather(),
      ]);

      if (casesRes.cases) setCases(casesRes.cases);
      if (hotspotsRes.hotspots) setHotspots(hotspotsRes.hotspots);
      if (inspRes.visits) setInspections(inspRes.visits);
      if (alertsRes.alerts) setAlerts(alertsRes.alerts);
      if (weatherRes.stations) setWeatherStations(weatherRes.stations);
    } catch (err) {
      console.warn('Failed to load officer data from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Broadcast Submit Handler
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcasting(true);
    try {
      await API.broadcastAlert({
        title: `Containment Advisory: ${broadcastCrop} (${broadcastTarget})`,
        message: broadcastMessage,
        level: broadcastSeverity,
        targetRole: 'ALL',
        targetTaluk: broadcastTarget,
        targetCrop: broadcastCrop,
        senderName: user.name,
      });
      setBroadcastSuccess(true);
      await loadData();
      setTimeout(() => setBroadcastSuccess(false), 6000);
    } catch (err: any) {
      alert(`Broadcast failed: ${err.message}`);
    } finally {
      setBroadcasting(false);
    }
  };

  // Schedule Inspection Handler
  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSchedulingVisit(true);
    try {
      await API.scheduleInspection({
        farmerName: newInspFarmer || 'Registered Grower',
        crop: newInspCrop,
        date: newInspDate,
        assignedOfficerId: user.id,
        assignedOfficerName: user.name,
        notes: newInspNotes || 'Ground truth phytosanitary verification and spray compliance check.',
      });
      setNewInspFarmer('');
      setNewInspNotes('');
      await loadData();
    } catch (err: any) {
      alert(`Failed to schedule inspection: ${err.message}`);
    } finally {
      setSchedulingVisit(false);
    }
  };

  // Copilot Ask Handler
  const handleAskCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuestion.trim() || copilotLoading) return;

    const q = copilotQuestion;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCopilotMessages((prev) => [...prev, { role: 'user', text: q, time: now }]);
    setCopilotQuestion('');
    setCopilotLoading(true);

    try {
      const res = await API.askCopilot(q, 'OFFICER', 'Multiple Crops', 'Kolar & Belagavi, Karnataka');
      setCopilotMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setCopilotMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Epidemiology Copilot temporarily unavailable: ${err.message}. Please consult the ICAR manual.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setCopilotLoading(false);
    }
  };

  // ----------------------------------------------------
  // SUB-VIEW: GEOSPATIAL MAP (`/officer/map` or `/officer/surveillance`)
  // ----------------------------------------------------
  if (subPath === 'map' || subPath === 'surveillance') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <MapPin className="w-4 h-4" />
              <span>Real-Time Geospatial Epidemiology Layer</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">Geospatial Surveillance Map</h1>
            <p className="text-xs text-slate-400 mt-1">
              Interactive Leaflet GIS showing foliar disease incidence, microclimate hotspots, and extension visits
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Pins</span>
            </button>
            <button
              onClick={() => onNavigate('/officer/broadcasts')}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Issue Alert</span>
            </button>
          </div>
        </div>

        {/* Map Filters */}
        <MapFilters
          filters={mapFilters}
          onChange={setMapFilters}
        />

        {/* Real Leaflet Map */}
        <CultivAIMap
          cases={cases}
          hotspots={hotspots}
          fieldVisits={inspections}
          height="540px"
          filters={mapFilters}
          onSelectCase={(c) => setSelectedCase(c)}
        />

        {/* Selected Case Inspection Drawer / Modal */}
        {selectedCase && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-blue-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                  {selectedCase.id}
                </span>
                <span className="text-sm font-bold text-white">{selectedCase.crop}</span>
                <span className="text-xs text-slate-400">({selectedCase.aiPrediction.condition})</span>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Location</span>
                <span className="font-semibold text-white">{selectedCase.location.district}, {selectedCase.location.state}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Risk Severity</span>
                <RiskBadge risk={selectedCase.riskAssessment.overallRisk} />
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Status</span>
                <StatusBadge status={selectedCase.status} />
              </div>
            </div>
            <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <strong>Farmer Symptoms:</strong> {selectedCase.symptomsReported}
            </div>
          </div>
        )}

        {/* Regional Zone Weather Stations */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Microclimate Stations & Spore Dispersal Pressures</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {weatherStations.map((ws) => (
              <div key={ws.stationId} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{ws.taluk}, {ws.district}</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">{ws.stationId}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Temp: {ws.temperatureC}°C</span>
                  <span className="font-semibold text-blue-400">RH: {ws.relativeHumidityPct}%</span>
                </div>
                <div className="text-[11px] text-amber-400 font-medium">
                  Canopy Leaf Wetness: {ws.canopyLeafWetnessHours} hrs • Risk: {ws.sporeDispersalRisk}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-1.5">
                  {ws.forecastSummary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: EPIDEMIC HOTSPOTS (`/officer/hotspots`)
  // ----------------------------------------------------
  if (subPath === 'hotspots') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Cluster Epidemiology & Containment Boundaries</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">Epidemic Hotspots & Outbreak Zones</h1>
            <p className="text-xs text-slate-400 mt-1">
              Active epidemiological clusters identified via spatial proximity and environmental risk factors
            </p>
          </div>

          <button
            onClick={() => onNavigate('/officer/map')}
            className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>View All on Geospatial Map</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hotspots.map((hs) => (
            <div
              key={hs.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 space-y-4 shadow-xl transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                    <h3 className="font-bold text-white text-base">{hs.areaName || hs.district} Cluster</h3>
                    <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {hs.district}
                    </span>
                  </div>
                  <p className="text-xs text-rose-400 font-semibold mt-1">
                    Pathogen: {hs.majorCondition || 'Unclassified Foliar Infection'}
                  </p>
                </div>
                <RiskBadge risk={hs.riskLevel} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Affected Area</span>
                  <span className="font-bold text-white">{hs.affectedAcres} Acres</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Active Cases</span>
                  <span className="font-bold text-white">{hs.caseCount} Verified</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Radius</span>
                  <span className="font-bold text-white">{hs.radiusKm} km</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="text-slate-300 font-medium">Environmental Factor:</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">High humidity (&gt;80% RH) and persistent nocturnal leaf wetness</p>
                <div className="pt-1 text-[11px] text-emerald-400 font-semibold">
                  Trajectory: {hs.trend || 'Stable'}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setBroadcastTarget(`${hs.areaName || hs.district}`);
                    setBroadcastCrop('Tomato');
                    onNavigate('/officer/broadcasts');
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold text-center"
                >
                  Issue Emergency Alert
                </button>
                <button
                  onClick={() => onNavigate('/officer/inspections')}
                  className="flex-1 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold text-center"
                >
                  Schedule Field Visit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: REGIONAL CASES (`/officer/cases`)
  // ----------------------------------------------------
  if (subPath === 'cases') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <FileText className="w-4 h-4" />
              <span>Surveillance Registry</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">Regional Case Surveillance Registry</h1>
            <p className="text-xs text-slate-400 mt-1">
              Review, filter, and track all reported foliar infections across agricultural parcels in your district
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Total Monitored: <strong className="text-white">{cases.length}</strong>
            </span>
          </div>
        </div>

        {/* Cases Table */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Case ID</th>
                  <th className="p-3.5">Crop</th>
                  <th className="p-3.5">Condition</th>
                  <th className="p-3.5">District / Taluk</th>
                  <th className="p-3.5">Risk Level</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-blue-400 font-semibold">{c.id}</td>
                    <td className="p-3.5 font-bold text-white">{c.crop}</td>
                    <td className="p-3.5 text-slate-300">{c.aiPrediction.condition}</td>
                    <td className="p-3.5 text-slate-400">{c.location.district}, {c.location.state}</td>
                    <td className="p-3.5">
                      <RiskBadge risk={c.riskAssessment.overallRisk} />
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedCase(c)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
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

        {/* Modal Inspector */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-2xl w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-mono text-blue-400">{selectedCase.id}</span>
                  <h3 className="text-lg font-bold text-white">{selectedCase.crop} - {selectedCase.aiPrediction.condition}</h3>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-300">Symptoms Described by Grower:</div>
                  <p className="text-slate-400">{selectedCase.symptomsReported}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">AI Confidence</span>
                    <span className="font-bold text-white text-sm">{Math.round(selectedCase.aiPrediction.confidence * 100)}%</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Scientific Binomial</span>
                    <span className="font-mono text-emerald-400">{selectedCase.aiPrediction.scientificName}</span>
                  </div>
                </div>

                {selectedCase.expertReview && (
                  <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1">
                    <div className="font-bold text-emerald-300">Certified by: {selectedCase.expertReview.expertName}</div>
                    <p className="text-slate-300">{selectedCase.expertReview.advisoryText}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  onClick={() => {
                    setSelectedCase(null);
                    onNavigate('/officer/map');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold"
                >
                  Pin on Map
                </button>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: BROADCAST ALERTS (`/officer/alerts` or `/officer/broadcasts`)
  // ----------------------------------------------------
  if (subPath === 'alerts' || subPath === 'broadcasts') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
            <Radio className="w-4 h-4" />
            <span>Emergency Warning & Containment System</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Regional Emergency Broadcast System</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch instantaneous containment warnings and IPM advisories to registered growers across your jurisdiction
          </p>
        </div>

        {broadcastSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Broadcast dispatched successfully! Growers and extension field teams alerted.</span>
          </div>
        )}

        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Target Jurisdiction *
                </label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="Kolar District">Kolar District (All Taluks)</option>
                  <option value="Mulbagal Taluk">Mulbagal Taluk (High Risk Zone)</option>
                  <option value="Belagavi District">Belagavi District</option>
                  <option value="Hassan District">Hassan District</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Applicable Crop *
                </label>
                <input
                  type="text"
                  required
                  value={broadcastCrop}
                  onChange={(e) => setBroadcastCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Threat Level *
                </label>
                <select
                  value={broadcastSeverity}
                  onChange={(e) => setBroadcastSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="moderate">Moderate Advisory</option>
                  <option value="high">High Alert</option>
                  <option value="critical">Critical Epidemic Containment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Advisory Message Content (In-App Push & SMS Gateway) *
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
              disabled={broadcasting}
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Radio className="w-4 h-4" />
              <span>{broadcasting ? 'Broadcasting Advisory...' : 'Broadcast Emergency Advisory'}</span>
            </button>
          </form>
        </div>

        {/* Past Broadcast History */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white">Broadcast Alert History</h3>
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-start justify-between">
                <div>
                  <div className="font-bold text-white">{a.title}</div>
                  <p className="text-slate-400 mt-0.5">{a.message}</p>
                </div>
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-4">
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: FIELD OPERATIONS (`/officer/field-operations` or `/officer/inspections`)
  // ----------------------------------------------------
  if (subPath === 'field-operations' || subPath === 'inspections') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <Calendar className="w-4 h-4" />
            <span>On-Site Ground Truth & Verification</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Field Operations & Extension Visits</h1>
          <p className="text-xs text-slate-400 mt-1">
            Coordinate ground-truth phytosanitary surveys, verify IPM compliance, and track containment efficacy
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scheduling Form */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Schedule Extension Visit</span>
            </h3>

            <form onSubmit={handleCreateInspection} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Farmer Name</label>
                <input
                  type="text"
                  required
                  value={newInspFarmer}
                  onChange={(e) => setNewInspFarmer(e.target.value)}
                  placeholder="e.g. Nagaraj Gowda"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Crop</label>
                <select
                  value={newInspCrop}
                  onChange={(e) => setNewInspCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Rice / Paddy">Rice / Paddy</option>
                  <option value="Chilli">Chilli</option>
                  <option value="Bt Cotton">Bt Cotton</option>
                </select>
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
                  placeholder="Verify foliar containment and check bio-fungicide spray schedule..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={schedulingVisit}
                className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-slate-950 font-bold"
              >
                {schedulingVisit ? 'Scheduling...' : 'Schedule Field Operation'}
              </button>
            </form>
          </div>

          {/* Scheduled Operations List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-white">
              Scheduled Field Operations ({inspections.length})
            </h3>
            <div className="space-y-3">
              {inspections.map((insp) => (
                <div key={insp.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{insp.farmerName}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                        {insp.status}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono">{insp.scheduledDate || (insp as any).date}</span>
                  </div>
                  <p className="text-slate-400">Reason: <strong className="text-white">{insp.reason || 'Inspection'}</strong> • Assigned: {insp.assignedOfficerName}</p>
                  <p className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {insp.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: SURVEILLANCE COPILOT (`/officer/assistant`)
  // ----------------------------------------------------
  if (subPath === 'assistant') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
            <Bot className="w-4 h-4" />
            <span>Epidemiological Decision Support Assistant</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Surveillance Intelligence Copilot</h1>
          <p className="text-xs text-slate-400 mt-1">
            Query containment rules, microclimate correlation algorithms, and official ICAR/KVK plant quarantine advisories
          </p>
        </div>

        {/* Chat Stream */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 h-[480px] flex flex-col overflow-hidden shadow-2xl">
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {copilotMessages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                    m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                  }`}
                >
                  {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600/20 border border-blue-500/30 text-white'
                      : 'bg-slate-950 border border-slate-800 text-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span className="block text-[10px] text-slate-500 mt-1 text-right">{m.time}</span>
                </div>
              </div>
            ))}
            {copilotLoading && (
              <div className="flex gap-2 items-center text-xs text-purple-400 pl-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Copilot synthesizing ICAR epidemiology literature...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleAskCopilot} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={copilotQuestion}
              onChange={(e) => setCopilotQuestion(e.target.value)}
              placeholder="Ask about spore dispersal rates, recommended containment radii, or quarantine protocols..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={copilotLoading || !copilotQuestion.trim()}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: MESSAGES & FARMER CONSULTATIONS (`/officer/messages`)
  // ----------------------------------------------------
  if (subPath === 'messages') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <Send className="w-4 h-4" />
            <span>Direct Extension Communication Channel</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Field Consultations & Messaging</h1>
          <p className="text-xs text-slate-400 mt-1">
            Exchange real-time advice with registered farmers regarding containment schedules and chemical safety
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">Nagaraj Gowda (Avani, Kolar)</span>
                <span className="text-[10px] text-slate-500">Today, 09:45 AM</span>
              </div>
              <p className="text-slate-300">
                "Officer, we have removed lower diseased leaves as advised. Should we apply the Trichoderma spray today or wait for tomorrow morning?"
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-blue-400">
                Officer Reply: "Apply strictly tomorrow morning between 6:30 AM and 8:30 AM to prevent UV inactivation of fungal spores."
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">Basavaraj Gowda (Srinivaspur)</span>
                <span className="text-[10px] text-slate-500">Yesterday, 04:15 PM</span>
              </div>
              <p className="text-slate-300">
                "We received the regional emergency broadcast. Will an extension officer visit our village this week?"
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-blue-400">
                Officer Reply: "Yes, an inspection is scheduled for Thursday to monitor contiguous tomato parcels."
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: SURVEILLANCE REPORTS (`/officer/reports`)
  // ----------------------------------------------------
  if (subPath === 'reports') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <BarChart3 className="w-4 h-4" />
              <span>Aggregated Epidemiological Analytics</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">Disease Surveillance & Containment Reports</h1>
            <p className="text-xs text-slate-400 mt-1">
              Official district-level metrics for agricultural departments and extension leadership
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-semibold">Total Verified Cases</span>
            <div className="text-2xl font-bold text-white mt-1">{cases.length}</div>
            <span className="text-[10px] text-emerald-400 mt-1 block">Across 3 agro-climatic zones</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-semibold">Active Containment Zones</span>
            <div className="text-2xl font-bold text-rose-400 mt-1">{hotspots.length}</div>
            <span className="text-[10px] text-rose-300 mt-1 block">Radius: 8.5 km max</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-semibold">Extension Field Visits</span>
            <div className="text-2xl font-bold text-blue-400 mt-1">{inspections.length}</div>
            <span className="text-[10px] text-blue-300 mt-1 block">Ground-truth verified</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-semibold">Advisories Broadcast</span>
            <div className="text-2xl font-bold text-purple-400 mt-1">{alerts.length}</div>
            <span className="text-[10px] text-purple-300 mt-1 block">To 400+ growers</span>
          </div>
        </div>

        {/* Breakdown by District */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Incidence Breakdown by District</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white font-semibold">Kolar (Tomato Early Blight)</span>
                <span className="text-slate-400">65% of Total Inquiries</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white font-semibold">Belagavi (Rice Bacterial Blight)</span>
                <span className="text-slate-400">25% of Total Inquiries</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white font-semibold">Hassan & Mandya (Chilli Anthracnose)</span>
                <span className="text-slate-400">10% of Total Inquiries</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: OFFICER PROFILE & SETTINGS (`/officer/profile` or `/officer/settings`)
  // ----------------------------------------------------
  if (subPath === 'settings' || subPath === 'profile') {
    return <OfficerSettingsView user={user} onNavigate={onNavigate} />;
  }

  // ----------------------------------------------------
  // DEFAULT: OFFICER DASHBOARD (`/officer/dashboard`)
  // ----------------------------------------------------
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <Shield className="w-4 h-4" />
            <span>District Agricultural Surveillance Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Epidemiology & Extension Workspace</h1>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as <strong className="text-white">{user.name}</strong> • Active real-time Leaflet map & alert dispatch online
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('/officer/map')}
            className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <MapPin className="w-4 h-4" />
            <span>Launch Geospatial Map</span>
          </button>
          <button
            onClick={() => onNavigate('/officer/broadcasts')}
            className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20"
          >
            <Radio className="w-4 h-4" />
            <span>Emergency Broadcast</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('/officer/cases')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all"
        >
          <span className="text-[11px] font-semibold text-slate-400">Monitored Cases</span>
          <div className="text-2xl font-bold text-white mt-1">{cases.length}</div>
          <span className="text-[10px] text-blue-400">Across your district</span>
        </div>

        <div
          onClick={() => onNavigate('/officer/hotspots')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-all"
        >
          <span className="text-[11px] font-semibold text-slate-400">Epidemic Hotspots</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{hotspots.length}</div>
          <span className="text-[10px] text-rose-300">Under active watch</span>
        </div>

        <div
          onClick={() => onNavigate('/officer/inspections')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all"
        >
          <span className="text-[11px] font-semibold text-slate-400">Field Inspections</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{inspections.length} Scheduled</div>
          <span className="text-[10px] text-amber-300">Extension teams deployed</span>
        </div>

        <div
          onClick={() => onNavigate('/officer/alerts')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all"
        >
          <span className="text-[11px] font-semibold text-slate-400">Broadcast Alerts</span>
          <div className="text-2xl font-bold text-purple-400 mt-1">{alerts.length} Dispatched</div>
          <span className="text-[10px] text-purple-300">Automated SMS & App push</span>
        </div>
      </div>

      {/* Embedded Real Geospatial Map Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Interactive Surveillance Map Overview</span>
          </h2>
          <button
            onClick={() => onNavigate('/officer/map')}
            className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Full GIS Interface</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <CultivAIMap
          cases={cases}
          hotspots={hotspots}
          fieldVisits={inspections}
          height="380px"
          onSelectCase={(c) => setSelectedCase(c)}
        />
      </div>

      {/* Hotspots & Scheduled Inspections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotspots list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Active Contagion Hotspots</h2>
            <button
              onClick={() => onNavigate('/officer/hotspots')}
              className="text-xs text-rose-400 hover:underline"
            >
              View Hotspots →
            </button>
          </div>

          <div className="space-y-3">
            {hotspots.map((hs) => (
              <div
                key={hs.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm">{hs.areaName || hs.district} Cluster ({hs.district})</div>
                  <div className="text-rose-400 font-semibold mt-0.5">{hs.majorCondition}</div>
                  <div className="text-slate-400 text-[11px] mt-1">{hs.affectedAcres} Acres • {hs.caseCount} Cases</div>
                </div>
                <button
                  onClick={() => {
                    setBroadcastTarget(`${hs.areaName || hs.district}`);
                    onNavigate('/officer/broadcasts');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold"
                >
                  Alert
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Inspections */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Upcoming Field Inspections</h2>
            <button
              onClick={() => onNavigate('/officer/inspections')}
              className="text-xs text-blue-400 hover:underline"
            >
              View Operations →
            </button>
          </div>

          <div className="space-y-2">
            {inspections.map((insp) => (
              <div key={insp.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{insp.farmerName || 'Registered Grower'}</span>
                  <span className="text-emerald-400 font-semibold">{insp.scheduledDate || (insp as any).date}</span>
                </div>
                <p className="text-slate-400">Reason: {insp.reason || 'Verification'} • Officer: {insp.assignedOfficerName}</p>
                <p className="text-[11px] text-slate-300 italic pt-1">{insp.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
