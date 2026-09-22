import React, { useState } from 'react';
import { User, CaseRecord, UserRole } from '../../types';
import { StorageService } from '../../services/storage';
import { StatusBadge, SeverityBadge, RiskBadge } from '../common/StatusBadge';
import { RiskIndicator } from '../common/RiskIndicator';
import { CaseTimeline } from '../common/CaseTimeline';
import {
  Microscope,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  Search,
  Filter,
  Eye,
  Sliders,
  Sparkles,
  BookOpen,
  ArrowRight,
  X,
  FileCheck,
  Building,
  RefreshCw,
} from 'lucide-react';

interface Props {
  user: User;
  subPath: string;
  onNavigate: (path: string) => void;
}

export const ExpertViews: React.FC<Props> = ({ user, subPath, onNavigate }) => {
  const cases = StorageService.getCases();
  const messages = StorageService.getMessages(user.id);

  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(cases[0] || null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Form state
  const [confirmedCondition, setConfirmedCondition] = useState('');
  const [confirmedSeverity, setConfirmedSeverity] = useState<'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [advisoryNotes, setAdvisoryNotes] = useState('');
  const [culturalNotes, setCulturalNotes] = useState('');
  const [bioNotes, setBioNotes] = useState('');
  const [chemNotes, setChemNotes] = useState('');
  const [phiDays, setPhiDays] = useState(7);
  const [requiresSample, setRequiresSample] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);

  // When selectedCase changes, populate form defaults
  const handleSelectCase = (c: CaseRecord) => {
    setSelectedCase(c);
    setConfirmedCondition(c.expertReview?.confirmedCondition || c.aiPrediction.condition);
    setConfirmedSeverity(
      (c.expertReview?.severity as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL') ||
        (c.aiPrediction.severity.toUpperCase() as any)
    );
    setAdvisoryNotes(
      c.expertReview?.advisoryText ||
        `Confirmed ${c.aiPrediction.condition} in ${c.cropStage}. Initiate lower foliage sanitation immediately.`
    );
    setCulturalNotes(
      c.expertReview?.managementProtocols.cultural.join(', ') ||
        'Strip and burn lower senescent infected leaves; avoid overhead irrigation.'
    );
    setBioNotes(
      c.expertReview?.managementProtocols.biological.join(', ') ||
        'Foliar spray of Pseudomonas fluorescens @ 5g/L.'
    );
    setChemNotes(
      c.expertReview?.managementProtocols.chemical.join(', ') ||
        'Mancozeb 75% WP @ 2.0g/L or Azoxystrobin 23% SC @ 1.0ml/L.'
    );
    setPhiDays(c.expertReview?.followUpDays || 7);
    setRequiresSample(c.expertReview?.sampleRequested || false);
    setReviewSuccessMsg(false);
  };

  // Submit Expert Verification
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    const updatedCase = StorageService.addExpertReview(selectedCase.id, {
      id: `rev-${Date.now()}`,
      expertId: user.id,
      expertName: user.name,
      expertSpecialization: user.organization || 'ICAR-IIHR Plant Pathology',
      reviewedAt: new Date().toISOString(),
      action: 'Confirm Diagnosis',
      confirmedCondition: confirmedCondition || selectedCase.aiPrediction.condition,
      severity: confirmedSeverity as any,
      confidence: 0.96,
      advisoryText: advisoryNotes,
      managementProtocols: {
        cultural: culturalNotes.split(',').map((s) => s.trim()).filter(Boolean),
        biological: bioNotes.split(',').map((s) => s.trim()).filter(Boolean),
        chemical: chemNotes.split(',').map((s) => s.trim()).filter(Boolean),
        safetyPrecautions: ['Use PPE and protective masks', 'Spray during calm morning hours'],
      },
      sampleRequested: requiresSample,
      followUpDays: phiDays,
    });

    if (updatedCase) {
      setSelectedCase(updatedCase);
      setReviewSuccessMsg(true);
      setTimeout(() => setReviewSuccessMsg(false), 4000);
    }
  };

  const filteredCases = cases.filter((c) => {
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.farmerName.toLowerCase().includes(q) ||
        c.crop.toLowerCase().includes(q) ||
        c.aiPrediction.condition.toLowerCase().includes(q) ||
        c.location.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ----------------------------------------------------
  // SUB-VIEW: DASHBOARD
  // ----------------------------------------------------
  if (subPath === 'dashboard' || subPath === '') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <Microscope className="w-4 h-4" />
              <span>Plant Pathology Diagnostic Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Welcome, {user.name}</h1>
            <p className="text-xs text-slate-300 mt-1">
              Affiliation: <strong className="text-white">{user.organization || 'ICAR Research Institute'}</strong> • Vegetable & Cash Crops Division
            </p>
          </div>

          <button
            onClick={() => onNavigate('/expert/queue')}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 shrink-0"
          >
            <Microscope className="w-4 h-4" />
            <span>Open Verification Queue ({cases.filter((c) => c.status !== 'Expert Confirmed').length})</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Awaiting Review</span>
            <div className="text-2xl font-bold text-amber-400">
              {cases.filter((c) => c.status === 'Under Review' || c.status === 'AI Analysed').length} Cases
            </div>
            <span className="text-[10px] text-slate-400">Average triage latency &lt; 2.4 hrs</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Validated Diagnoses</span>
            <div className="text-2xl font-bold text-emerald-400">
              {cases.filter((c) => c.status === 'Expert Confirmed').length} Confirmed
            </div>
            <span className="text-[10px] text-emerald-400">98.2% Agronomic concurrence</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">High/Critical Hotspots</span>
            <div className="text-2xl font-bold text-rose-400">
              {cases.filter((c) => c.riskAssessment.overallRisk === 'CRITICAL' || c.riskAssessment.overallRisk === 'HIGH').length} Active
            </div>
            <span className="text-[10px] text-rose-300">Kolar & Belagavi alert triggered</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Farmer Follow-ups</span>
            <div className="text-2xl font-bold text-cyan-400">
              {cases.reduce((acc, c) => acc + c.followUps.length, 0)} Logged
            </div>
            <span className="text-[10px] text-cyan-300">48-hr symptom recovery tracked</span>
          </div>
        </div>

        {/* Priority Review Cases List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Priority Verification Desk</h2>
            <button
              onClick={() => onNavigate('/expert/queue')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Full Verification Queue →
            </button>
          </div>

          <div className="space-y-3">
            {cases.slice(0, 3).map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  handleSelectCase(c);
                  onNavigate('/expert/queue');
                }}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={c.images[0]?.url}
                    alt={c.crop}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{c.aiPrediction.condition}</h3>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {c.crop} ({c.variety}) • Farmer: <strong className="text-slate-200">{c.farmerName}</strong> ({c.location.district})
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <RiskBadge risk={c.riskAssessment.overallRisk} showScore={c.riskAssessment.score} />
                      <SeverityBadge severity={c.aiPrediction.severity} />
                    </div>
                  </div>
                </div>

                <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 self-end sm:self-center">
                  Review & Prescribe →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: VERIFICATION QUEUE & CASE REVIEW
  // ----------------------------------------------------
  if (subPath === 'queue') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Diagnostic Verification Queue</h1>
            <p className="text-xs text-slate-400">
              Review AI foliar detections, inspect symptom morphology, and issue certified IPM advisories
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="AI Analysed">AI Analysed</option>
              <option value="Under Review">Under Review</option>
              <option value="Confirmed by Expert">Confirmed by Expert</option>
            </select>
          </div>
        </div>

        {/* 2-Column Layout: Left Case List (1/3), Right Review Desk (2/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Queue List */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crop, farmer, or disease..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {filteredCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCase(c)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedCase?.id === c.id
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{c.aiPrediction.condition}</h4>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{c.id.slice(-4)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {c.crop} • {c.farmerName} ({c.location.district})
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <StatusBadge status={c.status} />
                    <RiskBadge risk={c.riskAssessment.overallRisk} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Case Review Workbench */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCase ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                {reviewSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Expert advisory verified and dispatched to farmer mobile & district record!</span>
                  </div>
                )}

                {/* Case Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">{selectedCase.crop} Investigation</h2>
                      <StatusBadge status={selectedCase.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Case ID: <span className="font-mono text-slate-200">{selectedCase.id}</span> • Farmer: {selectedCase.farmerName} ({selectedCase.farmerPhone})
                    </p>
                  </div>
                  <RiskBadge risk={selectedCase.riskAssessment.overallRisk} showScore={selectedCase.riskAssessment.score} />
                </div>

                {/* Top Section: Deep Image Inspection & Field Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* High-res Image Preview */}
                  <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
                    <img
                      src={selectedCase.images[0]?.url}
                      alt="Crop specimen"
                      referrerPolicy="no-referrer"
                      className="w-full h-56 object-cover"
                    />
                    {selectedCase.aiPrediction.boundingBoxes?.map((bb, idx) => (
                      <div
                        key={idx}
                        className="absolute border-2 border-amber-400 bg-amber-400/20 rounded pointer-events-none"
                        style={{
                          left: `${bb.x}%`,
                          top: `${bb.y}%`,
                          width: `${bb.width}%`,
                          height: `${bb.height}%`,
                        }}
                      >
                        <span className="absolute -top-5 left-0 bg-amber-500 text-slate-950 font-bold text-[9px] px-1 py-0.5 rounded">
                          {bb.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">AI Prediction</span>
                      <div className="font-bold text-white text-sm">{selectedCase.aiPrediction.condition}</div>
                      <div className="text-[11px] text-slate-400 italic">{selectedCase.aiPrediction.scientificName}</div>
                      <div className="text-[11px] text-emerald-400 font-semibold">
                        {Math.round(selectedCase.aiPrediction.confidence * 100)}% Model Confidence
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Farmer Observations</span>
                      <p className="text-slate-300 italic">{selectedCase.symptomsReported}</p>
                      <div className="text-[10px] text-slate-400 pt-1">
                        Stage: {selectedCase.cropStage} • Variety: {selectedCase.variety}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explainable Risk Overview */}
                <RiskIndicator
                  overallRisk={selectedCase.riskAssessment.overallRisk}
                  score={selectedCase.riskAssessment.score}
                  factors={selectedCase.riskAssessment.factors}
                  explanation={selectedCase.riskAssessment.explanation}
                />

                {/* Verification & Prescription Form */}
                <form onSubmit={handleSubmitReview} className="space-y-4 pt-2 border-t border-slate-800">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Microscope className="w-4 h-4" /> Plant Pathology Validation & Prescription Desk
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Final Confirmed Diagnosis *
                      </label>
                      <input
                        type="text"
                        required
                        value={confirmedCondition}
                        onChange={(e) => setConfirmedCondition(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Assessed Field Severity *
                      </label>
                      <select
                        value={confirmedSeverity}
                        onChange={(e) => setConfirmedSeverity(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                      >
                        <option value="LOW">LOW (Mild Localized)</option>
                        <option value="MODERATE">MODERATE (Canopy Spread)</option>
                        <option value="HIGH">HIGH (Defoliation / Yield Loss Risk)</option>
                        <option value="CRITICAL">CRITICAL (Rapid Regional Epidemic)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Certified Agronomic Advisory & Farmer Instructions *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={advisoryNotes}
                      onChange={(e) => setAdvisoryNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-400 mb-1">1. Cultural Protocol</label>
                      <input
                        type="text"
                        value={culturalNotes}
                        onChange={(e) => setCulturalNotes(e.target.value)}
                        placeholder="Sanitation, leaf pruning..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-cyan-400 mb-1">2. Biological Control</label>
                      <input
                        type="text"
                        value={bioNotes}
                        onChange={(e) => setBioNotes(e.target.value)}
                        placeholder="Trichoderma, Pseudomonas..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-amber-400 mb-1">3. Chemical Protection</label>
                      <input
                        type="text"
                        value={chemNotes}
                        onChange={(e) => setChemNotes(e.target.value)}
                        placeholder="Mancozeb, Azoxystrobin..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 text-slate-300">
                        <span className="text-slate-400">Pre-Harvest Interval:</span>
                        <input
                          type="number"
                          value={phiDays}
                          onChange={(e) => setPhiDays(parseInt(e.target.value) || 7)}
                          className="w-14 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-white"
                        />
                        <span>Days</span>
                      </label>

                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requiresSample}
                          onChange={(e) => setRequiresSample(e.target.checked)}
                          className="rounded text-amber-500 focus:ring-0"
                        />
                        <span>Require Physical Lab Sample</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Approve & Dispatch Advisory</span>
                    </button>
                  </div>
                </form>

                {/* Timeline */}
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Case History</h4>
                  <CaseTimeline timeline={selectedCase.timeline} />
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400">
                Select a diagnostic case from the queue on the left to begin verification.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: DIAGNOSTIC ONTOLOGY LIBRARY
  // ----------------------------------------------------
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">ICAR / CIBRC Diagnostic Reference Library</h1>
        <p className="text-xs text-slate-400">Comprehensive crop disease ontologies, symptom keys, and approved dosages</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Tomato Early Blight</h3>
            <span className="text-xs font-mono text-emerald-400">Alternaria solani</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Fungal pathogen causing concentric target-board rings surrounded by chlorotic halo. Favored by 24–30°C and &gt;80% relative humidity.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
            <strong className="text-amber-400">CIBRC Approved: </strong>
            <span>Mancozeb 75% WP @ 2.0g/L or Azoxystrobin 23% SC @ 1.0ml/L. PHI: 5–7 days.</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Rice / Paddy Blast</h3>
            <span className="text-xs font-mono text-cyan-400">Magnaporthe oryzae</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Spindle-shaped lesions on leaves and neck rot on panicles. Spores rapidly spread via wind during humid drizzle.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
            <strong className="text-amber-400">CIBRC Approved: </strong>
            <span>Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L. PHI: 14 days.</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Chilli Anthracnose / Dieback</h3>
            <span className="text-xs font-mono text-amber-400">Colletotrichum capsici</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sunken circular spots on fruits with black acervuli rings; tip drying of branches.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
            <strong className="text-amber-400">CIBRC Approved: </strong>
            <span>Copper Oxychloride 50% WP @ 3.0g/L or Difenoconazole 25% EC @ 0.5ml/L. PHI: 7 days.</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Cotton Bacterial Blight</h3>
            <span className="text-xs font-mono text-purple-400">Xanthomonas citri pv. malvacearum</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Angular water-soaked leaf spots bounded by veinlets; black arm symptom on stems.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
            <strong className="text-amber-400">CIBRC Approved: </strong>
            <span>Streptocycline @ 0.1g/L + Copper Oxychloride @ 2.5g/L. PHI: 15 days.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
