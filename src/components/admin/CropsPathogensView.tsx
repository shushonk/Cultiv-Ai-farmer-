import React, { useState } from 'react';
import { User } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  Bug,
  Sprout,
  Activity,
  AlertTriangle,
  FileText,
  Shield,
} from 'lucide-react';

interface Props {
  currentUser: User;
}

// Initial seed ontology records
const INITIAL_CROPS = [
  { id: 'crop-1', name: 'Tomato', scientificName: 'Solanum lycopersicum', category: 'Vegetables', season: 'Kharif / Rabi', diseases: ['Early Blight', 'Late Blight', 'Leaf Curl Virus', 'Bacterial Spot'], pests: ['Whiteflies', 'Fruit Borer', 'Thrips'] },
  { id: 'crop-2', name: 'Chilli', scientificName: 'Capsicum annuum', category: 'Spices & Vegetables', season: 'Kharif', diseases: ['Anthracnose', 'Powdery Mildew', 'Chilli Leaf Curl Virus'], pests: ['Thrips', 'Mites', 'Aphids'] },
  { id: 'crop-3', name: 'Paddy (Rice)', scientificName: 'Oryza sativa', category: 'Cereals', season: 'Kharif', diseases: ['Blast (Magnaporthe oryzae)', 'Bacterial Leaf Blight', 'Sheath Blight'], pests: ['Stem Borer', 'Brown Plant Hopper'] },
  { id: 'crop-4', name: 'Cotton', scientificName: 'Gossypium hirsutum', category: 'Fiber', season: 'Kharif', diseases: ['Bacterial Blight', 'Grey Mildew', 'Leaf Spot'], pests: ['Pink Bollworm', 'Aphids', 'Whitefly'] },
  { id: 'crop-5', name: 'Maize', scientificName: 'Zea mays', category: 'Cereals', season: 'Kharif / Rabi', diseases: ['Maydis Leaf Blight', 'Turcicum Leaf Blight', 'Common Rust'], pests: ['Fall Armyworm (Spodoptera frugiperda)', 'Stem Borer'] },
  { id: 'crop-6', name: 'Potato', scientificName: 'Solanum tuberosum', category: 'Tubers', season: 'Rabi', diseases: ['Late Blight (Phytophthora infestans)', 'Early Blight', 'Black Scurf'], pests: ['Potato Tuber Moth', 'Aphids'] },
];

const INITIAL_DISEASES = [
  { id: 'dis-1', name: 'Late Blight', scientificName: 'Phytophthora infestans', type: 'Oomycete / Fungal-like', hostCrops: ['Tomato', 'Potato'], severity: 'Severe', spreadRisk: 'CRITICAL', symptoms: ['Water-soaked foliar lesions', 'White mildew on leaf underside', 'Brown fruit rot'], favorableWeather: 'High humidity (>85%), temp 15-22°C with persistent drizzle' },
  { id: 'dis-2', name: 'Early Blight', scientificName: 'Alternaria solani', type: 'Fungal', hostCrops: ['Tomato', 'Potato', 'Eggplant'], severity: 'Moderate', spreadRisk: 'HIGH', symptoms: ['Concentric bullseye rings on older leaves', 'Yellow chlorotic halos', 'Stem collar rot'], favorableWeather: 'Warm temperatures 24-30°C and intermittent rain' },
  { id: 'dis-3', name: 'Chilli Anthracnose (Dieback)', scientificName: 'Colletotrichum capsici', type: 'Fungal', hostCrops: ['Chilli', 'Capsicum'], severity: 'Severe', spreadRisk: 'HIGH', symptoms: ['Circular sunken necrotic spots on ripe pods', 'Black acervuli rings', 'Tip dieback'], favorableWeather: 'High humidity (80-90%) and temperatures around 28°C' },
  { id: 'dis-4', name: 'Tomato Leaf Curl Virus (ToLCV)', scientificName: 'Begomovirus', type: 'Viral (Whitefly Vectored)', hostCrops: ['Tomato'], severity: 'High', spreadRisk: 'HIGH', symptoms: ['Severe upward curling of leaf margins', 'Stunted internodes', 'Flower drop'], favorableWeather: 'Warm dry weather favorable for vector Bemisia tabaci breeding' },
  { id: 'dis-5', name: 'Bacterial Leaf Blight', scientificName: 'Xanthomonas oryzae pv. oryzae', type: 'Bacterial', hostCrops: ['Paddy'], severity: 'Severe', spreadRisk: 'CRITICAL', symptoms: ['Water-soaked stripes along leaf margins', 'Milky bacterial ooze beads', 'Kresek seedling wilt'], favorableWeather: 'Monsoon storms, heavy winds and temperatures 25-34°C' },
];

const INITIAL_PESTS = [
  { id: 'pest-1', name: 'Fall Armyworm', scientificName: 'Spodoptera frugiperda', type: 'Lepidopteran', affectedCrops: ['Maize', 'Sorghum'], lifeStages: ['Egg', 'Larva (destructive)', 'Pupa', 'Adult Moth'], symptoms: ['Shot-hole defoliation', 'Sawdust-like frass in whorl', 'Cob tunneling'], riskFactors: 'Late sowing, prolonged dry spells followed by rain' },
  { id: 'pest-2', name: 'Whitefly', scientificName: 'Bemisia tabaci', type: 'Hemipteran Vector', affectedCrops: ['Tomato', 'Cotton', 'Chilli', 'Okra'], lifeStages: ['Egg', 'Nymph', 'Puparium', 'Adult'], symptoms: ['Sap drainage', 'Sooty mold on honeydew', 'Viral disease vectoring'], riskFactors: 'Excessive synthetic pyrethroid usage killing natural predators' },
  { id: 'pest-3', name: 'Yellow & Black Thrips', scientificName: 'Thrips parvispinus', type: 'Thysanoptera', affectedCrops: ['Chilli', 'Capsicum', 'Tomato'], lifeStages: ['Egg', 'Larvae I & II', 'Pupae', 'Adult'], symptoms: ['Silvering on lower leaf surfaces', 'Upward curling of chilli leaves', 'Flower drop'], riskFactors: 'Dry warm weather, high nitrogenous fertilizer application' },
  { id: 'pest-4', name: 'Pink Bollworm', scientificName: 'Pectinophora gossypiella', type: 'Lepidopteran', affectedCrops: ['Cotton'], lifeStages: ['Egg', 'Caterpillar', 'Pupa', 'Moth'], symptoms: ['Rosetted flowers', 'Interrupted locule development', 'Stained lint'], riskFactors: 'Monocropping, non-adherence to refuge crops' },
];

const INITIAL_SYMPTOMS = [
  { id: 'sym-1', name: 'Concentric Target Rings', category: 'Foliar Necrosis', plantPart: 'Leaves / Stems', associatedConditions: ['Early Blight (Alternaria solani)'] },
  { id: 'sym-2', name: 'Water-soaked Dark Lesions', category: 'Foliar Lesion', plantPart: 'Leaves / Fruit', associatedConditions: ['Late Blight (Phytophthora infestans)', 'Bacterial Blight'] },
  { id: 'sym-3', name: 'Upward Leaf Margin Curling', category: 'Morphological Distortion', plantPart: 'Terminal Shoot', associatedConditions: ['Tomato Leaf Curl Virus', 'Thrips Infestation'] },
  { id: 'sym-4', name: 'Sawdust-like Frass in Leaf Whorl', category: 'Pest Excreta / Damage', plantPart: 'Central Whorl', associatedConditions: ['Fall Armyworm (Spodoptera frugiperda)'] },
  { id: 'sym-5', name: 'Sunken Pod Spots with Black Rings', category: 'Fruit Lesion', plantPart: 'Fruit / Pods', associatedConditions: ['Chilli Anthracnose (Colletotrichum capsici)'] },
];

const INITIAL_RISK_FACTORS = [
  { id: 'rf-1', name: 'Persistent Canopy Wetness > 8 Hours', category: 'Microclimate', affectedCrops: ['Tomato', 'Potato', 'Chilli'], associatedPathogens: ['Late Blight', 'Anthracnose'], description: 'Continuous liquid moisture on leaf surface enables rapid spore germination within 4-6 hours.' },
  { id: 'rf-2', name: 'Excessive Free Nitrogen Application', category: 'Agronomic Practice', affectedCrops: ['Paddy', 'Chilli', 'Cotton'], associatedPathogens: ['Bacterial Blight', 'Blast', 'Thrips'], description: 'Succulent lush growth with reduced cell wall silicon density enhances mechanical pathogen entry and sap feeding.' },
  { id: 'rf-3', name: 'High Vector Population Index (Bemisia)', category: 'Biological Vector', affectedCrops: ['Tomato', 'Okra'], associatedPathogens: ['Tomato Leaf Curl Virus', 'Yellow Vein Mosaic'], description: 'Trap counts exceeding 5 whiteflies per sticky card indicate imminent viral inoculation.' },
];

export const CropsPathogensView: React.FC<Props> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'crops' | 'diseases' | 'pests' | 'symptoms' | 'risks'>('crops');
  const [searchQuery, setSearchQuery] = useState('');

  // States for dynamic entities
  const [crops, setCrops] = useState(INITIAL_CROPS);
  const [diseases, setDiseases] = useState(INITIAL_DISEASES);
  const [pests, setPests] = useState(INITIAL_PESTS);
  const [symptoms, setSymptoms] = useState(INITIAL_SYMPTOMS);
  const [riskFactors, setRiskFactors] = useState(INITIAL_RISK_FACTORS);

  // Modal State for Creating / Editing
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [entityName, setEntityName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [categoryField, setCategoryField] = useState('');
  const [detailsField, setDetailsField] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateEntity = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `${activeTab}-${Date.now()}`;

    if (activeTab === 'crops') {
      const newCrop = {
        id,
        name: entityName,
        scientificName: scientificName || 'Botanical sp.',
        category: categoryField || 'Crops',
        season: detailsField || 'All Season',
        diseases: ['Early Blight', 'Leaf Spot'],
        pests: ['Aphids', 'Fruit Borer'],
      };
      setCrops([...crops, newCrop]);
    } else if (activeTab === 'diseases') {
      const newDisease = {
        id,
        name: entityName,
        scientificName: scientificName || 'Pathogen sp.',
        type: categoryField || 'Fungal',
        hostCrops: ['Tomato', 'Chilli'],
        severity: 'Moderate',
        spreadRisk: 'HIGH',
        symptoms: [detailsField || 'Foliar discoloration'],
        favorableWeather: 'High humidity',
      };
      setDiseases([...diseases, newDisease]);
    } else if (activeTab === 'pests') {
      const newPest = {
        id,
        name: entityName,
        scientificName: scientificName || 'Insecta sp.',
        type: categoryField || 'Lepidopteran',
        affectedCrops: ['Cotton', 'Tomato'],
        lifeStages: ['Larva', 'Adult'],
        symptoms: [detailsField || 'Foliar damage'],
        riskFactors: 'Warm temperatures',
      };
      setPests([...pests, newPest]);
    } else if (activeTab === 'symptoms') {
      const newSym = {
        id,
        name: entityName,
        category: categoryField || 'Leaf Symptom',
        plantPart: scientificName || 'Leaves',
        associatedConditions: [detailsField || 'Fungal Pathogens'],
      };
      setSymptoms([...symptoms, newSym]);
    } else {
      const newRf = {
        id,
        name: entityName,
        category: categoryField || 'Microclimate',
        affectedCrops: ['Tomato', 'Chilli'],
        associatedPathogens: [scientificName || 'Foliar Diseases'],
        description: detailsField || 'Environmental threshold condition.',
      };
      setRiskFactors([...riskFactors, newRf]);
    }

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'ONTOLOGY_ENTITY_CREATED',
      resource: `/admin/crops-pathogens/${activeTab}/${id}`,
      details: `Admin added new ${activeTab.toUpperCase()} entry: "${entityName}" (${scientificName}).`,
      status: 'SUCCESS',
    });

    setCreateModalOpen(false);
    setEntityName('');
    setScientificName('');
    setCategoryField('');
    setDetailsField('');
    showToast(`Added new ${activeTab} record: "${entityName}"`);
  };

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
            <Layers className="w-4 h-4" />
            <span>Master Agronomic Ontology & Diagnostic Knowledge Graph</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Crops & Pathogens Library</h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized multi-entity taxonomies for crops, phytopathogens, pest vectors, symptom signatures, and epidemiological risk drivers.
          </p>
        </div>

        <button
          onClick={() => {
            setEntityName('');
            setScientificName('');
            setCategoryField('');
            setDetailsField('');
            setCreateModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {activeTab.slice(0, -1).toUpperCase()}</span>
        </button>
      </div>

      {/* 5 Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <button
          onClick={() => setActiveTab('crops')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'crops'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Crops ({crops.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('diseases')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'diseases'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4 text-rose-400" />
          <span>Diseases & Pathogens ({diseases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pests')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'pests'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Bug className="w-4 h-4 text-amber-400" />
          <span>Pests & Vectors ({pests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('symptoms')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'symptoms'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>Symptom Signatures ({symptoms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('risks')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === 'risks'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Risk Factors ({riskFactors.length})</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative text-xs">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search across ${activeTab} names, scientific classifications, symptoms...`}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Dynamic Content Views */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {/* TAB 1: CROPS */}
        {activeTab === 'crops' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Crop Name</th>
                  <th className="p-3.5 font-semibold">Botanical / Scientific Name</th>
                  <th className="p-3.5 font-semibold">Category</th>
                  <th className="p-3.5 font-semibold">Growing Season</th>
                  <th className="p-3.5 font-semibold">Tracked Pathogens</th>
                  <th className="p-3.5 font-semibold">Tracked Pests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {crops
                  .filter((c) => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.scientificName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((crop) => (
                    <tr key={crop.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-bold text-white flex items-center gap-1.5">
                        <Sprout className="w-4 h-4 text-emerald-400" />
                        <span>{crop.name}</span>
                      </td>
                      <td className="p-3.5 font-mono italic text-purple-300">{crop.scientificName}</td>
                      <td className="p-3.5 text-slate-300">{crop.category}</td>
                      <td className="p-3.5 text-slate-400">{crop.season}</td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {crop.diseases.slice(0, 3).map((d) => (
                            <span key={d} className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300">
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {crop.pests.slice(0, 2).map((p) => (
                            <span key={p} className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: DISEASES */}
        {activeTab === 'diseases' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Disease Name</th>
                  <th className="p-3.5 font-semibold">Pathogen Scientific Classification</th>
                  <th className="p-3.5 font-semibold">Pathogen Type</th>
                  <th className="p-3.5 font-semibold">Host Crops</th>
                  <th className="p-3.5 font-semibold">Severity & Spread Risk</th>
                  <th className="p-3.5 font-semibold">Primary Symptoms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {diseases
                  .filter((d) => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.scientificName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((dis) => (
                    <tr key={dis.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-bold text-white flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-rose-400" />
                        <span>{dis.name}</span>
                      </td>
                      <td className="p-3.5 font-mono italic text-purple-300">{dis.scientificName}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {dis.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300">{dis.hostCrops.join(', ')}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {dis.severity} • {dis.spreadRisk}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px] max-w-xs">
                        {dis.symptoms.join('; ')}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: PESTS */}
        {activeTab === 'pests' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Pest Name</th>
                  <th className="p-3.5 font-semibold">Scientific Classification</th>
                  <th className="p-3.5 font-semibold">Pest Category</th>
                  <th className="p-3.5 font-semibold">Affected Crops</th>
                  <th className="p-3.5 font-semibold">Life Stages</th>
                  <th className="p-3.5 font-semibold">Damage Symptoms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {pests
                  .filter((p) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.scientificName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((pest) => (
                    <tr key={pest.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-bold text-white flex items-center gap-1.5">
                        <Bug className="w-4 h-4 text-amber-400" />
                        <span>{pest.name}</span>
                      </td>
                      <td className="p-3.5 font-mono italic text-purple-300">{pest.scientificName}</td>
                      <td className="p-3.5 text-slate-300">{pest.type}</td>
                      <td className="p-3.5 text-slate-300">{pest.affectedCrops.join(', ')}</td>
                      <td className="p-3.5 text-slate-400 text-[11px]">{pest.lifeStages.join(' &rarr; ')}</td>
                      <td className="p-3.5 text-slate-400 text-[11px] max-w-xs">{pest.symptoms.join('; ')}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: SYMPTOMS */}
        {activeTab === 'symptoms' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Symptom Descriptor</th>
                  <th className="p-3.5 font-semibold">Diagnostic Category</th>
                  <th className="p-3.5 font-semibold">Affected Anatomical Part</th>
                  <th className="p-3.5 font-semibold">Associated Phytopathologies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {symptoms
                  .filter((s) => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((sym) => (
                    <tr key={sym.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-bold text-white flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span>{sym.name}</span>
                      </td>
                      <td className="p-3.5 text-slate-300">{sym.category}</td>
                      <td className="p-3.5 text-purple-300 font-semibold">{sym.plantPart}</td>
                      <td className="p-3.5 text-slate-400 text-[11px]">{sym.associatedConditions.join(', ')}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: RISKS */}
        {activeTab === 'risks' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-semibold">Epidemiological Risk Factor</th>
                  <th className="p-3.5 font-semibold">Domain Category</th>
                  <th className="p-3.5 font-semibold">Vulnerable Crops</th>
                  <th className="p-3.5 font-semibold">Pathogen Proliferation Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {riskFactors
                  .filter((r) => !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((rf) => (
                    <tr key={rf.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-bold text-white flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>{rf.name}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          {rf.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-300">{rf.affectedCrops.join(', ')}</td>
                      <td className="p-3.5 text-slate-400 text-[11px] max-w-sm">{rf.description}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New {activeTab.slice(0, -1).toUpperCase()} Record</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntity} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Common Name / Identifier *</label>
                <input
                  type="text"
                  required
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="e.g. Groundnut / Tikka Leaf Spot"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Scientific / Botanical Name</label>
                <input
                  type="text"
                  value={scientificName}
                  onChange={(e) => setScientificName(e.target.value)}
                  placeholder="e.g. Arachis hypogaea / Cercospora personata"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category / Domain</label>
                <input
                  type="text"
                  value={categoryField}
                  onChange={(e) => setCategoryField(e.target.value)}
                  placeholder="e.g. Oilseeds / Fungal Ascomycete"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Clinical Notes & Symptoms</label>
                <textarea
                  rows={3}
                  value={detailsField}
                  onChange={(e) => setDetailsField(e.target.value)}
                  placeholder="Key foliar symptoms, sporulation markers, or growing parameters..."
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
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs"
                >
                  Save to Ontology
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
