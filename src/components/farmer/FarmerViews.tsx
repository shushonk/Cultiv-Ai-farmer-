import React, { useState } from 'react';
import { User, Field, CaseRecord, AlertItem, MessageItem } from '../../types';
import { StorageService } from '../../services/storage';
import { AIEngine } from '../../services/aiEngine';
import { AIAssistantService, ChatMessage } from '../../services/aiAssistantService';
import { StatusBadge, SeverityBadge, RiskBadge } from '../common/StatusBadge';
import { RiskIndicator } from '../common/RiskIndicator';
import { CaseTimeline } from '../common/CaseTimeline';
import { FarmerSettingsView } from './FarmerSettingsView';
import { useI18n } from '../../i18n';
import {
  Sprout,
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CloudRain,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Send,
  MessageSquare,
  Bot,
  User as UserIcon,
  Search,
  Eye,
  RefreshCw,
  Sliders,
  Settings,
  X,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  user: User;
  subPath: string;
  onNavigate: (path: string) => void;
}

export const FarmerViews: React.FC<Props> = ({ user, subPath, onNavigate }) => {
  const { t } = useI18n();
  const fields = StorageService.getFields(user.id);
  const cases = StorageService.getCases({ farmerId: user.id });
  const alerts = StorageService.getAlerts('FARMER', user.id);
  const messages = StorageService.getMessages(user.id);

  // States
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields[0]?.id || '');
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [addFieldModalOpen, setAddFieldModalOpen] = useState(false);

  // Field creation form state
  const [newFieldName, setNewFieldName] = useState('');
  const [newCrop, setNewCrop] = useState('Tomato');
  const [newVariety, setNewVariety] = useState('Abhinav F1');
  const [newStage, setNewStage] = useState('Flowering & Early Fruiting (Day 45)');
  const [newArea, setNewArea] = useState('2.0');
  const [newSoil, setNewSoil] = useState('Red Sandy Loam, pH 6.8');
  const [newIrrigation, setNewIrrigation] = useState('Drip Irrigation');

  // Scanner States
  const [scanStep, setScanStep] = useState<'upload' | 'validating' | 'analyzing' | 'result'>('upload');
  const [scanImage, setScanImage] = useState<string>(
    'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=1200&q=80'
  );
  const [scanCrop, setScanCrop] = useState<string>(fields[0]?.crop || 'Tomato');
  const [scanStage, setScanStage] = useState<string>(fields[0]?.cropStage || 'Flowering Stage (Day 48)');
  const [scanSymptoms, setScanSymptoms] = useState('Concentric brown target rings on lower leaves with yellow halo.');
  const [scanResult, setScanResult] = useState<CaseRecord | null>(null);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);

  // Follow-up submission state
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [followUpStatus, setFollowUpStatus] = useState<'Slightly Improved' | 'Significantly Improved' | 'No Change' | 'Worsened'>('Slightly Improved');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // AI Chat Assistant state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    AIAssistantService.getInitialWelcomeMessage(user, fields[0], cases),
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Direct Expert Message state
  const [expertMsgInput, setExpertMsgInput] = useState('');

  // 1. Add Field Handler
  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault();
    const created = StorageService.addField({
      farmId: `farm-${Date.now()}`,
      farmerId: user.id,
      name: newFieldName || 'New Plot',
      crop: newCrop,
      variety: newVariety,
      cropStage: newStage,
      areaAcres: parseFloat(newArea) || 1.5,
      sowingDate: new Date().toISOString().split('T')[0],
      soilCondition: newSoil,
      irrigationType: newIrrigation,
      healthStatus: 'Healthy',
      lat: user.location?.lat || 13.1367,
      lng: user.location?.lng || 78.1291,
      activeCasesCount: 0,
    });
    setSelectedFieldId(created.id);
    setAddFieldModalOpen(false);
    setNewFieldName('');
  };

  // 2. Scan Execution Handler
  const handleExecuteScan = async () => {
    setScanStep('validating');
    await AIEngine.validateImageQuality(scanImage);

    setScanStep('analyzing');
    const prediction = await AIEngine.analyzeCrop(scanCrop, scanStage, scanSymptoms);

    // Get current weather
    const weather = {
      temperature: 27.5,
      humidity: 84,
      rainProbability: 65,
      rainfallMm: 12.4,
      windSpeedKmh: 9,
      uvIndex: 5,
      conditionDescription: 'Intermittent Light Rain & Humid Overcast',
      forecast: [],
      fungalRisk: 'HIGH' as const,
      pestRisk: 'MODERATE' as const,
      riskExplanation: 'Dew duration >6.5 hours creates ideal conditions for Alternaria spore germination.',
    };

    const risk = AIEngine.calculateRisk(Math.round(prediction.confidence * 100), weather, scanStage, 38);

    const newCase = StorageService.addCase({
      farmerId: user.id,
      farmerName: user.name,
      farmerPhone: user.phone,
      fieldId: selectedFieldId || fields[0]?.id || 'field-1',
      fieldName: fields.find((f) => f.id === selectedFieldId)?.name || 'Main Tomato Parcel',
      crop: scanCrop,
      variety: 'Abhinav Hybrid',
      cropStage: scanStage,
      location: {
        district: user.location?.district || 'Kolar',
        state: user.location?.state || 'Karnataka',
        lat: user.location?.lat || 13.1367,
        lng: user.location?.lng || 78.1291,
      },
      symptomsReported: scanSymptoms,
      images: [
        {
          id: `img-${Date.now()}`,
          url: scanImage,
          uploadedAt: new Date().toISOString(),
          qualityPassed: true,
          qualityDetails: {
            blurScore: 91,
            exposureScore: 88,
            resolution: '1080x1440 HD',
            isPlantDetected: true,
          },
        },
      ],
      aiPrediction: prediction,
      riskAssessment: risk,
      weatherSnapshot: weather,
      status: 'AI Analysed',
      priority: risk.overallRisk === 'CRITICAL' ? 'Emergency' : risk.overallRisk === 'HIGH' ? 'High' : 'Moderate',
      followUps: [],
      timeline: [
        {
          id: `tl-new-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: user.name,
          actorRole: 'FARMER',
          action: 'Specimen Scanned & Submitted',
          description: `Uploaded foliar image for ${scanCrop} in ${scanStage}.`,
          statusBadge: 'New',
        },
        {
          id: `tl-ai-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'CultivAI Vision Engine',
          actorRole: 'AI Engine',
          action: 'AI Diagnosis & Multi-Factor Risk Synthesized',
          description: `Identified ${prediction.condition} (${Math.round(prediction.confidence * 100)}% confidence). Composite risk computed as ${risk.overallRisk} (${risk.score}/100).`,
          statusBadge: 'AI Analysed',
        },
      ],
    });

    setScanResult(newCase);
    setScanStep('result');
  };

  // 3. Request Expert Review Handler
  const handleRequestReview = (caseItem: CaseRecord) => {
    caseItem.status = 'Under Review';
    caseItem.timeline.push({
      id: `tl-req-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: user.name,
      actorRole: 'FARMER',
      action: 'Expert Review Requested',
      description: 'Dispatched case to Dr. Sunita Rao (Vegetable Pathology Panel).',
      statusBadge: 'Under Review',
    });
    StorageService.updateCase(caseItem);
    StorageService.addAlert({
      targetRole: 'EXPERT',
      type: 'HIGH_RISK_WEATHER',
      title: `New Verification Request: ${caseItem.crop} (${caseItem.farmerName})`,
      message: `${caseItem.farmerName} from ${caseItem.location.district} requested validation for ${caseItem.aiPrediction.condition}.`,
      actionRequired: 'Review case in Verification Queue.',
      level: 'warning',
      linkedCaseId: caseItem.id,
    });
    setSelectedCase({ ...caseItem });
    if (scanResult) setScanResult({ ...caseItem });
  };

  // 4. Follow-Up Submission Handler
  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    StorageService.addFollowUp(selectedCase.id, {
      id: `fu-${Date.now()}`,
      date: new Date().toISOString(),
      symptomProgression: followUpStatus,
      farmerNotes: followUpNotes || 'Applied initial pruning and bio-antagonistic spray.',
    });

    const updated = StorageService.getCaseById(selectedCase.id);
    if (updated) setSelectedCase(updated);
    setFollowUpModalOpen(false);
    setFollowUpNotes('');
  };

  // 5. Send Direct Message to Expert
  const handleSendExpertMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expertMsgInput.trim()) return;

    StorageService.sendMessage({
      senderId: user.id,
      senderName: user.name,
      senderRole: 'FARMER',
      recipientId: 'user-expert-1',
      recipientName: 'Dr. Sunita Rao, Ph.D.',
      recipientRole: 'EXPERT',
      caseId: cases[0]?.id,
      content: expertMsgInput.trim(),
    });

    setExpertMsgInput('');
  };

  // 6. AI Assistant Chat Submission
  const handleSendChat = async (textToSend?: string) => {
    const q = textToSend || chatInput;
    if (!q.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    const activeField = fields.find((f) => f.id === selectedFieldId) || fields[0];
    const aiResp = await AIAssistantService.askAssistant(q, user, activeField, cases);

    setChatMessages((prev) => [...prev, aiResp]);
    setChatLoading(false);
  };

  // ----------------------------------------------------
  // RENDER SUB-VIEWS
  // ----------------------------------------------------

  // CASE DETAIL MODAL
  const renderCaseDetailModal = () => {
    if (!selectedCase) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">{selectedCase.crop} Diagnosis</h3>
                  <span className="text-xs text-slate-400 font-mono">({selectedCase.id})</span>
                  <StatusBadge status={selectedCase.status} />
                </div>
                <p className="text-xs text-slate-400">
                  {selectedCase.fieldName} • {selectedCase.location.district}, {selectedCase.location.state}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCase(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* Top row: Image & Diagnosis Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Preview with Bounding Box */}
              <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
                <img
                  src={selectedCase.images[0]?.url}
                  alt="Scanned specimen"
                  referrerPolicy="no-referrer"
                  className="w-full h-64 object-cover"
                />
                {selectedCase.aiPrediction.boundingBoxes?.map((bb, idx) => (
                  <div
                    key={idx}
                    className="absolute border-2 border-amber-400 bg-amber-400/20 rounded shadow-md pointer-events-none"
                    style={{
                      left: `${bb.x}%`,
                      top: `${bb.y}%`,
                      width: `${bb.width}%`,
                      height: `${bb.height}%`,
                    }}
                  >
                    <span className="absolute -top-5 left-0 bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded shadow">
                      {bb.label} ({Math.round(bb.confidence * 100)}%)
                    </span>
                  </div>
                ))}
              </div>

              {/* Diagnosis Details */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase font-semibold">AI Detection</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {Math.round(selectedCase.aiPrediction.confidence * 100)}% Confidence
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white">{selectedCase.aiPrediction.condition}</h4>
                  <p className="text-xs text-slate-400 italic">{selectedCase.aiPrediction.scientificName}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <SeverityBadge severity={selectedCase.aiPrediction.severity} />
                    <RiskBadge risk={selectedCase.riskAssessment.overallRisk} />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Observed Visual Indicators
                  </span>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {selectedCase.aiPrediction.observedIndicators.map((ind, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Explainable Multi-factor Risk Component */}
            <RiskIndicator
              overallRisk={selectedCase.riskAssessment.overallRisk}
              score={selectedCase.riskAssessment.score}
              factors={selectedCase.riskAssessment.factors}
              explanation={selectedCase.riskAssessment.explanation}
            />

            {/* Expert Review Section if completed */}
            {selectedCase.expertReview ? (
              <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Verified by {selectedCase.expertReview.expertName}
                      </h4>
                      <p className="text-[11px] text-amber-300">{selectedCase.expertReview.expertSpecialization}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(selectedCase.expertReview.reviewedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-xs text-slate-200 bg-slate-950/60 p-3.5 rounded-lg border border-amber-500/30 leading-relaxed">
                  <strong className="text-amber-300">Expert Advisory: </strong>
                  {selectedCase.expertReview.advisoryText}
                </div>

                {/* Protocols */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase block mb-1">1. Cultural IPM</span>
                    <ul className="text-[11px] text-slate-300 space-y-1">
                      {selectedCase.expertReview.managementProtocols.cultural.map((p, i) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase block mb-1">2. Biological Control</span>
                    <ul className="text-[11px] text-slate-300 space-y-1">
                      {selectedCase.expertReview.managementProtocols.biological.map((p, i) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] font-bold text-amber-400 uppercase block mb-1">3. Chemical Protection</span>
                    <ul className="text-[11px] text-slate-300 space-y-1">
                      {selectedCase.expertReview.managementProtocols.chemical.map((p, i) => (
                        <li key={i}>• {p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : selectedCase.status === 'Under Review' ? (
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-400 animate-spin" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Under Active Expert Pathology Review</h5>
                    <p className="text-[11px] text-slate-400">
                      Dispatched to ICAR / Department of Agriculture panel. Typical turnaround &lt; 3 hours.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-white">Need Official Diagnosis Confirmation?</h5>
                  <p className="text-[11px] text-slate-400">
                    Submit this AI result to plant pathologists for certified IPM spray advisories.
                  </p>
                </div>
                <button
                  onClick={() => handleRequestReview(selectedCase)}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 shadow-md"
                >
                  Request Expert Verification
                </button>
              </div>
            )}

            {/* Follow-up Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  48-Hour Follow-Up Monitoring ({selectedCase.followUps.length})
                </h4>
                <button
                  onClick={() => setFollowUpModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Log Follow-Up Progress</span>
                </button>
              </div>

              {selectedCase.followUps.length === 0 ? (
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                  No follow-up log recorded yet. Submit a progress check in 48 hours to confirm symptom cessation.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedCase.followUps.map((fu) => (
                    <div key={fu.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-emerald-400">{fu.symptomProgression}</span>
                        <span className="text-slate-500 text-[10px]">{new Date(fu.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-300">{fu.farmerNotes}</p>
                      {fu.expertFeedback && (
                        <p className="text-amber-300/90 mt-1 pl-2 border-l border-amber-500/40 text-[11px]">
                          Expert: {fu.expertFeedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Complete Case Timeline */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Case Investigation Audit Trail
              </h4>
              <CaseTimeline timeline={selectedCase.timeline} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // SUB-VIEW: DASHBOARD
  // ----------------------------------------------------
  if (subPath === 'dashboard' || subPath === '') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {renderCaseDetailModal()}

        {/* Top greeting & Quick Scan button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 rounded-2xl shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Sprout className="w-4 h-4" />
              <span>Farmer Dashboard • {user.location?.district || 'Kolar'}, Karnataka</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Welcome, {user.name}</h1>
            <p className="text-xs text-slate-300 mt-1">
              Active Monitoring: <strong className="text-white">{fields.length} Crop Parcels</strong> (
              {fields.reduce((acc, f) => acc + f.areaAcres, 0).toFixed(1)} Total Acres)
            </p>
          </div>

          <button
            onClick={() => onNavigate('/farmer/scan')}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 shrink-0"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Crop Specimen</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Farm Health Status</span>
              <Sprout className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-white">82% Good</div>
            <span className="text-[10px] text-emerald-400">1 parcel needs attention</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Active Diagnoses</span>
              <FileCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-white">{cases.length} Cases</div>
            <span className="text-[10px] text-cyan-400">1 confirmed by Dr. Sunita Rao</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Weather Fungal Risk</span>
              <CloudRain className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400">HIGH (84% RH)</div>
            <span className="text-[10px] text-amber-300">Alternaria risk advisory active</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Expert Support</span>
              <ShieldAlert className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-white">Online</div>
            <span className="text-[10px] text-purple-300">ICAR Pathology Panel connected</span>
          </div>
        </div>

        {/* Fields list and Quick Scan banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: My Fields */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">My Monitored Fields ({fields.length})</h2>
              <button
                onClick={() => onNavigate('/farmer/fields')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                View All Fields →
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((f) => (
                <div
                  key={f.id}
                  onClick={() => {
                    setSelectedFieldId(f.id);
                    onNavigate('/farmer/fields');
                  }}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{f.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            f.healthStatus === 'Healthy'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {f.healthStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {f.crop} ({f.variety}) • {f.areaAcres} Acres • {f.cropStage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs text-slate-400">
                      Active Cases: <strong className="text-white">{f.activeCasesCount}</strong>
                    </span>
                    <button className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200">
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Recent Weather Alert & Agronomy Copilot Snippet */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Weather Advisory</h2>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Fungal Risk Alert
                </span>
                <span className="text-[10px] text-slate-400">Kolar District</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Persistent 84% relative humidity forecast for the next 48 hours. Spore germination probability is elevated for Early Blight on Solanaceous crops.
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Action: Inspect lower canopy</span>
                <button
                  onClick={() => onNavigate('/farmer/assistant')}
                  className="text-xs text-emerald-400 font-semibold hover:underline"
                >
                  Ask AI Copilot →
                </button>
              </div>
            </div>

            {/* Quick Diagnostic Case Widget */}
            {cases[0] && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Latest Case</span>
                  <StatusBadge status={cases[0].status} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">{cases[0].aiPrediction.condition}</h5>
                  <p className="text-[11px] text-slate-400">{cases[0].crop} • {cases[0].fieldName}</p>
                </div>
                <button
                  onClick={() => setSelectedCase(cases[0])}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium"
                >
                  View Case Details & Advisory
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: SCAN CROP (AI VISION SCANNER)
  // ----------------------------------------------------
  if (subPath === 'scan') {
    const sampleLeaves = [
      {
        name: 'Tomato Early Blight (Sample)',
        crop: 'Tomato',
        stage: 'Flowering Stage (Day 48)',
        symptoms: 'Concentric dark target-board rings on lower leaves with yellow halos.',
        url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Rice / Paddy Blast (Sample)',
        crop: 'Rice / Paddy',
        stage: 'Tillering Stage (Day 42)',
        symptoms: 'Spindle/diamond-shaped lesions with grey center and reddish-brown borders.',
        url: 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Chilli Anthracnose Rot (Sample)',
        crop: 'Chilli',
        stage: 'Fruit Setting (Day 52)',
        symptoms: 'Sunken necrotic spots on fruit and tip die-back on upper branches.',
        url: 'https://images.unsplash.com/photo-1588879460618-9244037d45e4?auto=format&fit=crop&w=1200&q=80',
      },
    ];

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        {renderCaseDetailModal()}

        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Crop Health Scanner</h1>
          <p className="text-xs text-slate-400 mt-1">
            Capture or upload a clear leaf image for multi-modal diagnosis and explainable risk analysis
          </p>
        </div>

        {scanStep === 'upload' && (
          <div className="space-y-6">
            {/* Field & Crop selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Target Field
                </label>
                <select
                  value={selectedFieldId}
                  onChange={(e) => {
                    setSelectedFieldId(e.target.value);
                    const f = fields.find((item) => item.id === e.target.value);
                    if (f) {
                      setScanCrop(f.crop);
                      setScanStage(f.cropStage);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.crop})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Crop Stage
                </label>
                <input
                  type="text"
                  value={scanStage}
                  onChange={(e) => setScanStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Observed Symptoms
                </label>
                <input
                  type="text"
                  value={scanSymptoms}
                  onChange={(e) => setScanSymptoms(e.target.value)}
                  placeholder="e.g. leaf spots, yellowing"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            {/* Upload Area */}
            <div className="p-8 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/60 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Upload Plant Foliage Specimen</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Supports high-resolution JPG/PNG images. Edge sharpness and leaf ROI will be checked automatically.
                </p>
              </div>

              {/* Sample Presets */}
              <div className="pt-4 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                  Or select a standard diagnostic test specimen:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sampleLeaves.map((spl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setScanImage(spl.url);
                        setScanCrop(spl.crop);
                        setScanStage(spl.stage);
                        setScanSymptoms(spl.symptoms);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        scanImage === spl.url
                          ? 'bg-emerald-500/10 border-emerald-500/60 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold truncate text-white">{spl.name}</div>
                      <div className="text-[10px] text-emerald-400">{spl.crop}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Preview */}
              <div className="pt-4 max-w-sm mx-auto">
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-black">
                  <img
                    src={scanImage}
                    alt="Selected leaf preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>

              <button
                onClick={handleExecuteScan}
                className="mt-4 px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run AI Diagnostic Engine</span>
              </button>
            </div>
          </div>
        )}

        {(scanStep === 'validating' || scanStep === 'analyzing') && (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-white">
              {scanStep === 'validating'
                ? 'Validating Specimen Quality (Sharpness & Lighting Check)...'
                : 'Deep-Learning Feature Classification in Progress...'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Analyzing leaf lesion morphology, spatial spread, and microclimate risk matrix...
            </p>
          </div>
        )}

        {scanStep === 'result' && scanResult && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Preliminary Diagnostic Assessment</h2>
              <button
                onClick={() => setScanStep('upload')}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                ← Scan another specimen
              </button>
            </div>

            {/* Result Overview Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image with Bounding Boxes */}
                <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800">
                  <img
                    src={scanResult.images[0]?.url}
                    alt="Scanned specimen"
                    referrerPolicy="no-referrer"
                    className="w-full h-64 object-cover"
                  />
                  {showBoundingBoxes &&
                    scanResult.aiPrediction.boundingBoxes?.map((bb, idx) => (
                      <div
                        key={idx}
                        className="absolute border-2 border-amber-400 bg-amber-400/20 rounded shadow-md pointer-events-none"
                        style={{
                          left: `${bb.x}%`,
                          top: `${bb.y}%`,
                          width: `${bb.width}%`,
                          height: `${bb.height}%`,
                        }}
                      >
                        <span className="absolute -top-5 left-0 bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded shadow">
                          {bb.label}
                        </span>
                      </div>
                    ))}
                  <button
                    onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                    className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-slate-900/90 text-[10px] text-slate-300 font-medium border border-slate-700"
                  >
                    {showBoundingBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
                  </button>
                </div>

                {/* Classification result */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">AI Diagnosis</span>
                    <h3 className="text-xl font-bold text-white">{scanResult.aiPrediction.condition}</h3>
                    <p className="text-xs text-slate-400 italic">{scanResult.aiPrediction.scientificName}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs font-bold text-emerald-400">
                        {Math.round(scanResult.aiPrediction.confidence * 100)}% Confidence
                      </span>
                      <SeverityBadge severity={scanResult.aiPrediction.severity} />
                      <RiskBadge risk={scanResult.riskAssessment.overallRisk} />
                    </div>
                  </div>

                  {/* Observed symptoms */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Visual Indicators Detected
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {scanResult.aiPrediction.observedIndicators.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Explainable Multi-factor Risk Component */}
              <RiskIndicator
                overallRisk={scanResult.riskAssessment.overallRisk}
                score={scanResult.riskAssessment.score}
                factors={scanResult.riskAssessment.factors}
                explanation={scanResult.riskAssessment.explanation}
              />

              {/* 5-Step IPM Action Plan */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Recommended Integrated Pest Management (IPM) Action Steps
                </span>
                <ol className="space-y-2 text-xs text-slate-300">
                  {scanResult.aiPrediction.recommendedSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="mt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                  * {scanResult.aiPrediction.disclaimer}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <button
                  onClick={() => onNavigate('/farmer/cases')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                >
                  View in Cases Repository
                </button>

                <button
                  onClick={() => handleRequestReview(scanResult)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Request Plant Pathologist Verification</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: MY FIELDS
  // ----------------------------------------------------
  if (subPath === 'fields') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Add Field Modal */}
        {addFieldModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Add New Crop Parcel</h3>
                <button onClick={() => setAddFieldModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateField} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Parcel / Field Name</label>
                  <input
                    type="text"
                    required
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="e.g. South Paddy Parcel 2"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Crop</label>
                    <select
                      value={newCrop}
                      onChange={(e) => setNewCrop(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                    >
                      <option value="Tomato">Tomato</option>
                      <option value="Rice / Paddy">Rice / Paddy</option>
                      <option value="Chilli">Chilli</option>
                      <option value="Bt Cotton">Bt Cotton</option>
                      <option value="Capsicum">Capsicum</option>
                      <option value="Table Grapes">Table Grapes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Variety / Hybrid</label>
                    <input
                      type="text"
                      value={newVariety}
                      onChange={(e) => setNewVariety(e.target.value)}
                      placeholder="e.g. Abhinav F1"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Area (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Irrigation Method</label>
                    <input
                      type="text"
                      value={newIrrigation}
                      onChange={(e) => setNewIrrigation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Save Field Parcel
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Monitored Fields</h1>
            <p className="text-xs text-slate-400">Total {fields.length} active parcels under continuous surveillance</p>
          </div>
          <button
            onClick={() => setAddFieldModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Field Parcel</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((f) => (
            <div key={f.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">{f.name}</h3>
                  <p className="text-xs text-emerald-400">{f.crop} • {f.variety}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    f.healthStatus === 'Healthy'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {f.healthStatus}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Area:</span>
                  <span className="font-semibold">{f.areaAcres} Acres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Crop Stage:</span>
                  <span>{f.cropStage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Soil Condition:</span>
                  <span className="truncate max-w-[160px]">{f.soilCondition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Irrigation:</span>
                  <span>{f.irrigationType}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedFieldId(f.id);
                    onNavigate('/farmer/scan');
                  }}
                  className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" /> Scan Specimen
                </button>
                <span className="text-[11px] text-slate-400">{f.activeCasesCount} Active Cases</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: CASES & DIAGNOSES
  // ----------------------------------------------------
  if (subPath === 'cases') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {renderCaseDetailModal()}

        {/* Follow-up submission modal */}
        {followUpModalOpen && selectedCase && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Submit 48-Hour Follow-Up</h3>
                <button onClick={() => setFollowUpModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFollowUpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Symptom Progression Status
                  </label>
                  <select
                    value={followUpStatus}
                    onChange={(e) => setFollowUpStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                  >
                    <option value="Significantly Improved">Significantly Improved (Symptoms Halted)</option>
                    <option value="Slightly Improved">Slightly Improved</option>
                    <option value="No Change">No Change</option>
                    <option value="Worsened">Worsened (Spreading to Upper Canopy)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Field Notes & Actions Taken
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder="e.g. Pruned lower 3 leaves on affected rows and applied Pseudomonas bio-fungicide..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Submit Follow-Up Entry
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('farmer.casesTitle')}</h1>
            <p className="text-xs text-slate-400">{t('farmer.casesSubtitle')}</p>
          </div>
          <button
            onClick={() => onNavigate('/farmer/scan')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4" />
            <span>{t('farmer.newScan')}</span>
          </button>
        </div>

        <div className="space-y-3">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={c.images[0]?.url}
                  alt={c.crop}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{c.aiPrediction.condition}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {c.crop} • {c.fieldName} • {t('farmer.logged')}: {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <RiskBadge risk={c.riskAssessment.overallRisk} showScore={c.riskAssessment.score} />
                    <SeverityBadge severity={c.aiPrediction.severity} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                {c.expertReview ? (
                  <span className="text-xs text-amber-300 font-semibold">✓ {t('farmer.expertVerified')}</span>
                ) : (
                  <span className="text-xs text-slate-400">{t('farmer.aiPreliminary')}</span>
                )}
                <button className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white">
                  {t('farmer.inspectCase')} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: ALERTS & WEATHER
  // ----------------------------------------------------
  if (subPath === 'alerts') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Microclimate Intelligence & Alerts</h1>

        {/* Weather Forecast Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/30 to-slate-900 border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Kolar District Agro-Meteorological Station</h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
              Live Sensor Feed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Temperature</span>
              <div className="text-xl font-bold text-white">27.5 °C</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Relative Humidity</span>
              <div className="text-xl font-bold text-cyan-400">84% (High)</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Rain Probability</span>
              <div className="text-xl font-bold text-white">65%</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Dew Duration</span>
              <div className="text-xl font-bold text-amber-400">6.8 hrs/day</div>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white">Active Advisories & Warnings</h2>
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                a.level === 'critical'
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  {a.level === 'critical' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  {a.title}
                </span>
                <span className="text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{a.message}</p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 font-medium text-emerald-400">
                Action: {a.actionRequired}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: EXPERT CHAT (DIRECT MESSAGES)
  // ----------------------------------------------------
  if (subPath === 'messages') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Expert Consultation Desk</h1>
          <p className="text-xs text-slate-400">Direct Case-linked communication with Dr. Sunita Rao, Ph.D. (ICAR-IIHR)</p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 flex flex-col h-[520px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                SR
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Dr. Sunita Rao, Ph.D.</h4>
                <span className="text-[10px] text-emerald-400">● Online • Principal Plant Pathologist</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Linked: CASE-2026-0982 (Tomato)</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => {
              const isMe = m.senderRole === 'FARMER';
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                    }`}
                  >
                    <div className="text-[10px] opacity-75 font-semibold">{m.senderName}</div>
                    <p className="leading-relaxed">{m.content}</p>
                    <div className="text-[9px] opacity-60 text-right">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendExpertMessage} className="p-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={expertMsgInput}
              onChange={(e) => setExpertMsgInput(e.target.value)}
              placeholder="Ask Dr. Sunita Rao regarding spray dosage, timing, or symptoms..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: AI AGRONOMY ASSISTANT
  // ----------------------------------------------------
  if (subPath === 'assistant') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">CultivAI Agronomy Assistant</h1>
          <p className="text-xs text-slate-400">
            Real-time advisory grounded in your field crops, local weather sensors, and certified IPM ontologies
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 flex flex-col h-[560px]">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <Bot className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-xs font-bold text-white">AI Agronomy Copilot</h4>
                <span className="text-[10px] text-slate-400">Context: {fields[0]?.name || 'Main Parcel'} • 84% RH</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Active Context Matrix
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div key={msg.id} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-xl p-4 rounded-2xl text-xs space-y-2 ${
                      isAssistant
                        ? 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                        : 'bg-emerald-600 text-white rounded-br-none'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="pt-3 mt-2 border-t border-slate-800/80 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Suggested Prompts:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestions.map((sug, i) => (
                            <button
                              key={i}
                              onClick={() => handleSendChat(sug)}
                              className="text-left px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 text-[11px] transition-colors"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Synthesizing agronomic response...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="p-3 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about pest symptoms, spray intervals, fertilizer balancing..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              disabled={chatLoading}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUB-VIEW: FARM PROFILE & SETTINGS
  // ----------------------------------------------------
  if (subPath === 'settings' || subPath === 'profile') {
    return <FarmerSettingsView user={user} onNavigate={onNavigate} />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Farm Profile & Preferences</h1>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user.name}</h3>
            <p className="text-xs text-slate-400">
              {user.location?.village}, {user.location?.taluk}, {user.location?.district} District
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Mobile Number</span>
            <span className="font-semibold text-white">{user.phone}</span>
          </div>
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Email Address</span>
            <span className="font-semibold text-white">{user.email}</span>
          </div>
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">State & Agro-Zone</span>
            <span className="font-semibold text-white">{user.location?.state} (Eastern Dry Zone)</span>
          </div>
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-0.5">Monitored Acreage</span>
            <span className="font-semibold text-white">
              {fields.reduce((acc, f) => acc + f.areaAcres, 0).toFixed(1)} Acres
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => onNavigate('/farmer/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
