import React, { useState } from 'react';
import { User, KnowledgeDocument } from '../../types';
import { StorageService } from '../../services/storage';
import {
  BookOpen,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  History,
  X,
  GitBranch,
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const KnowledgeArticlesView: React.FC<Props> = ({ currentUser }) => {
  const [docs, setDocs] = useState<KnowledgeDocument[]>(StorageService.getKnowledge());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [viewDocModal, setViewDocModal] = useState(false);
  const [createDocModal, setCreateDocModal] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [crop, setCrop] = useState('Tomato');
  const [condition, setCondition] = useState('Early Blight');
  const [category, setCategory] = useState<KnowledgeDocument['category']>('Diseases');
  const [symptoms, setSymptoms] = useState('Concentric dark target rings on older foliage, yellow halo.');
  const [cultural, setCultural] = useState('Crop rotation with non-solanaceous crops; drip irrigation to avoid foliar wetting.');
  const [biological, setBiological] = useState('Foliar spray of Trichoderma harzianum or Bacillus subtilis @ 5g/L.');
  const [chemical, setChemical] = useState('Mancozeb 75% WP @ 2.5g/L or Azoxystrobin 23% SC @ 1ml/L.');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshDocs = () => {
    setDocs(StorageService.getKnowledge());
  };

  // Create or Publish Document
  const handleSaveDoc = (publishDirectly: boolean) => {
    const newDoc = StorageService.addKnowledgeDocument({
      title,
      crop,
      condition,
      category,
      scientificName: `${crop} ${condition} Pathogen`,
      symptoms: symptoms.split(';').map((s) => s.trim()),
      riskFactors: ['High relative humidity (>80%)', 'Persistent leaf wetness'],
      culturalManagement: cultural.split(';').map((s) => s.trim()),
      biologicalControl: biological.split(';').map((s) => s.trim()),
      chemicalGuidance: {
        activeIngredients: chemical.split(';').map((s) => s.trim()),
        safetyPrecautions: ['Use PPE during spray', 'Avoid spraying during strong winds'],
        preHarvestIntervalDays: 14,
        disclaimer: 'Adhere strictly to CIBRC approved dosages.',
      },
      prevention: ['Use certified disease-free seeds', 'Proper row spacing'],
      sources: ['ICAR National IPM Guidelines 2026', 'State Agri University Bulletin'],
      author: publishDirectly ? `${currentUser.name} (Admin Approval)` : 'ICAR Scientific Advisory Panel',
    });

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: publishDirectly ? 'KNOWLEDGE_ARTICLE_PUBLISHED' : 'KNOWLEDGE_ARTICLE_CREATED',
      resource: newDoc.id,
      details: `Admin published advisory knowledge article: "${title}" for ${crop} (${condition}).`,
      status: 'SUCCESS',
    });

    refreshDocs();
    setCreateDocModal(false);
    setTitle('');
    showToast(`Published IPM knowledge article: "${title}"`);
  };

  const filteredDocs = docs.filter((d) => {
    if (categoryFilter !== 'All' && d.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.crop.toLowerCase().includes(q) ||
        d.condition.toLowerCase().includes(q) ||
        d.symptoms.some((s) => s.toLowerCase().includes(q))
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
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <BookOpen className="w-4 h-4" />
            <span>Standardized IPM Advisory Knowledge Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Knowledge Base Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Publishing workflows, peer-review approvals, version tracking, and clinical treatment protocols for all {docs.length} articles.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setCreateDocModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Knowledge Article</span>
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
              placeholder="Search by title, crop, pathogen, chemical..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="All">All Categories ({docs.length})</option>
              <option value="Diseases">Diseases</option>
              <option value="Pests">Pests</option>
              <option value="Symptoms">Symptoms</option>
              <option value="Crops">Crops</option>
              <option value="Integrated Pest Management">Integrated Pest Management</option>
              <option value="Weather Risk">Weather Risk</option>
              <option value="Safe Input Guidance">Safe Input Guidance</option>
              <option value="Extension Guidance">Extension Guidance</option>
            </select>
          </div>

          <div className="flex items-center justify-end text-slate-400 text-xs">
            Showing <strong className="text-white mx-1">{filteredDocs.length}</strong> published guidelines
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {doc.category}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  PUBLISHED v1.2
                </span>
              </div>

              <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                {doc.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Crop: <strong className="text-slate-200">{doc.crop}</strong> • Condition: <strong className="text-slate-200">{doc.condition}</strong>
              </p>

              <div className="mt-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="font-semibold text-slate-400 text-[10px] uppercase">Primary Symptoms:</div>
                <div className="line-clamp-2 text-slate-300">{doc.symptoms?.join('; ') || 'Foliar diagnostic markers'}</div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
              <span className="text-[10px] text-slate-500">Updated: {doc.lastUpdated}</span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSelectedDoc(doc);
                    setVersionModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="Version History & Diffs"
                >
                  <History className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setSelectedDoc(doc);
                    setViewDocModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* VIEW ARTICLE MODAL */}
      {/* --------------------------------------------------------------------- */}
      {viewDocModal && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 mb-1 inline-block">
                  {selectedDoc.category}
                </span>
                <h2 className="text-lg font-bold text-white">{selectedDoc.title}</h2>
                <span className="text-xs text-slate-400">
                  Target Crop: {selectedDoc.crop} • Author: {selectedDoc.author || 'ICAR Panel'}
                </span>
              </div>
              <button onClick={() => setViewDocModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-cyan-400 uppercase text-[10px] mb-1">Diagnostic Symptoms</h4>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {selectedDoc.symptoms?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-emerald-400 uppercase text-[10px] mb-1">Cultural & Preventive Practices</h4>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {selectedDoc.culturalManagement?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 uppercase text-[10px] mb-1">Biological & Biopesticide Measures</h4>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {selectedDoc.biologicalControl?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-purple-400 uppercase text-[10px] mb-1">Chemical Control (Restricted & Approved)</h4>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {selectedDoc.chemicalGuidance?.activeIngredients?.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setViewDocModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERSION HISTORY & COMPARE MODAL */}
      {versionModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Version History & Peer Review Trail</h3>
              </div>
              <button onClick={() => setVersionModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-cyan-500/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Version 1.2 (Current Active)</span>
                  <span className="px-2 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold">
                    APPROVED & LIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Approved by: {selectedDoc.author || 'ICAR Panel'} on {selectedDoc.lastUpdated}
                </p>
                <p className="text-slate-300 text-[11px] mt-1">
                  Change Note: Updated dosage threshold for biopesticide applications following 2026 ICAR trials.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setVersionModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close Version Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ARTICLE MODAL */}
      {createDocModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Author Knowledge Document</h3>
              <button onClick={() => setCreateDocModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveDoc(true);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Integrated Management of Chilli Anthracnose"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Crop *</label>
                  <input
                    type="text"
                    required
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Condition / Pest *</label>
                  <input
                    type="text"
                    required
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Domain Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="Diseases">Diseases</option>
                  <option value="Pests">Pests</option>
                  <option value="Symptoms">Symptoms</option>
                  <option value="Crops">Crops</option>
                  <option value="Integrated Pest Management">Integrated Pest Management</option>
                  <option value="Weather Risk">Weather Risk</option>
                  <option value="Safe Input Guidance">Safe Input Guidance</option>
                  <option value="Extension Guidance">Extension Guidance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Diagnostic Symptoms (semicolon separated)</label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cultural Protocols (semicolon separated)</label>
                <textarea
                  rows={2}
                  value={cultural}
                  onChange={(e) => setCultural(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Biological Protocols (semicolon separated)</label>
                <textarea
                  rows={2}
                  value={biological}
                  onChange={(e) => setBiological(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chemical Formulations (semicolon separated)</label>
                <textarea
                  rows={2}
                  value={chemical}
                  onChange={(e) => setChemical(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateDocModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Approve & Publish to Platform
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
