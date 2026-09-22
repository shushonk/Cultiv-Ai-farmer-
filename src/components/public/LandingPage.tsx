import React from 'react';
import {
  Sprout,
  Shield,
  Microscope,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  CloudRain,
  MapPin,
  TrendingUp,
  Cpu,
  Eye,
  Activity,
} from 'lucide-react';

interface Props {
  onOpenPortalDirectory: () => void;
  onNavigateRoleLogin: (rolePath: string) => void;
  onNavigatePage: (page: string) => void;
}

export const LandingPage: React.FC<Props> = ({
  onOpenPortalDirectory,
  onNavigateRoleLogin,
  onNavigatePage,
}) => {
  const steps = [
    { num: '01', title: 'OBSERVE', desc: 'Farmers scan foliage or log pest symptoms with instant on-device quality verification.' },
    { num: '02', title: 'INVESTIGATE', desc: 'Multi-modal Vision AI analyzes lesions, fungal acervuli, or chlorosis against 80+ crop disease ontologies.' },
    { num: '03', title: 'VERIFY', desc: 'ICAR-certified plant pathologists and entomologists review edge cases and confirm diagnoses.' },
    { num: '04', title: 'ASSESS', desc: 'Multi-factor risk engine combines disease probability (35%), weather suitability (25%), phenology (20%), and regional pressure (20%).' },
    { num: '05', title: 'PRIORITIZE', desc: 'Cases are ranked by economic impact and containment urgency with real-time escalation alerts.' },
    { num: '06', title: 'ACT', desc: 'Context-specific IPM protocols provide cultural, biological, and approved chemical recommendations with PHI intervals.' },
    { num: '07', title: 'MONITOR', desc: 'Farmers upload 48-hour follow-up images; surveillance officers track cluster containment across taluks.' },
    { num: '08', title: 'LEARN', desc: 'Validated diagnoses feed localized disease pressure matrices for predictive pre-symptom alerts.' },
  ];

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8 pb-12">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI-Driven Agricultural Disease Surveillance Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Detect Crop Diseases Earlier.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Protect Every Acre.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CultivAI bridges on-field smartphone imagery, hyper-local weather intelligence, and certified plant pathology expertise into explainable, farm-level IPM decisions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenPortalDirectory}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <span>Access Role Portals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigatePage('/how-it-works')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>Explore 8-Stage Workflow</span>
            </button>
          </div>

          {/* Quick Portal Switcher Pills */}
          <div className="pt-8 flex items-center justify-center flex-wrap gap-2 text-xs">
            <span className="text-slate-400 mr-2">Quick Sign-in:</span>
            <button
              onClick={() => onNavigateRoleLogin('/farmer/login')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 transition-colors flex items-center gap-1.5"
            >
              <Sprout className="w-3.5 h-3.5" /> Farmer Portal
            </button>
            <button
              onClick={() => onNavigateRoleLogin('/expert/login')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-950/60 border border-amber-500/30 text-amber-300 transition-colors flex items-center gap-1.5"
            >
              <Microscope className="w-3.5 h-3.5" /> Expert Portal
            </button>
            <button
              onClick={() => onNavigateRoleLogin('/officer/login')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-950/60 border border-blue-500/30 text-blue-300 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" /> Officer Portal
            </button>
          </div>
        </div>

        {/* Live Interactive Surveillance Preview Card */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
              <div>
                <h3 className="text-base font-bold text-white">Live Regional Surveillance Feed</h3>
                <p className="text-xs text-slate-400">Monitoring 4 Agro-climatic Zones • Kolar, Belagavi, Nashik, Varanasi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> 2 Active Outbreak Clusters
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> 94% Expert Verification Rate
              </span>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Crop Diagnostic Speed</span>
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">&lt; 1.2 seconds</div>
              <p className="text-[11px] text-emerald-400 mt-1">Multi-modal leaf symptom classification</p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Weather Risk Correlation</span>
                <CloudRain className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">84% Relative Humidity</div>
              <p className="text-[11px] text-cyan-400 mt-1">Alternaria & Blast spore alert triggered</p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Active Surveillance Area</span>
                <MapPin className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">710+ Acres Managed</div>
              <p className="text-[11px] text-purple-400 mt-1">Across 10 registered farm parcels</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8-Stage Workflow Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            End-to-End Decision Loop
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
            From Early Foliar Signal to Regional Containment
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            The closed-loop agricultural intelligence cycle designed for smallholder farmers and district extension systems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl relative group hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-300"
            >
              <div className="text-3xl font-black text-slate-700 group-hover:text-emerald-400/30 transition-colors mb-2 font-mono">
                {step.num}
              </div>
              <h3 className="text-base font-bold text-white tracking-wide">{step.title}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Stakeholder Workspaces */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
            Multi-Stakeholder Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight">
            Dedicated Workspaces for Every Role
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl bg-gradient-to-b from-emerald-950/30 to-slate-900 border border-emerald-500/30 p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Farmers & Growers</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Scan plant leaves with camera, receive instant preliminary AI diagnosis, get weather risk warnings, and consult verified plant pathologists.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">✓ Smart image quality validator</li>
                <li className="flex items-center gap-2">✓ 5-step IPM recommendations</li>
                <li className="flex items-center gap-2">✓ Kannada, Hindi & English support</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigateRoleLogin('/farmer/login')}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>Launch Farmer Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-amber-950/30 to-slate-900 border border-amber-500/30 p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                <Microscope className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Plant Pathologists</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Review submitted cases in priority queues, inspect deep-zoom foliar imagery, prescribe chemical & biological IPM protocols, and request samples.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">✓ High-res symptom inspection</li>
                <li className="flex items-center gap-2">✓ CIBRC dosage validation</li>
                <li className="flex items-center gap-2">✓ Direct farmer communication</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigateRoleLogin('/expert/login')}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>Launch Expert Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-blue-950/30 to-slate-900 border border-blue-500/30 p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Agriculture Officers</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Track geospatial outbreak clusters, schedule field inspection visits, prepare block-level reports, and broadcast emergency advisories.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">✓ Live geospatial hotspot map</li>
                <li className="flex items-center gap-2">✓ Field operations scheduler</li>
                <li className="flex items-center gap-2">✓ District outbreak analytics</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigateRoleLogin('/officer/login')}
              className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>Launch Officer Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-200">CultivAI Platform</span>
            <span>— Precision Agricultural Intelligence & Early Surveillance</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigatePage('/technology')} className="hover:text-white">
              Technology
            </button>
            <button onClick={() => onNavigatePage('/about')} className="hover:text-white">
              About
            </button>
            <button onClick={() => onNavigatePage('/contact')} className="hover:text-white">
              Contact
            </button>
            <button onClick={onOpenPortalDirectory} className="text-emerald-400 hover:underline">
              Portal Directory
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
