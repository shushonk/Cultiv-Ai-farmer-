import React from 'react';
import { Sprout, Microscope, Shield, UserCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

interface Props {
  onSelectPortal: (rolePath: string) => void;
  onNavigateHome: () => void;
}

export const PortalSelectHub: React.FC<Props> = ({ onSelectPortal, onNavigateHome }) => {
  const portals = [
    {
      role: 'FARMER',
      title: 'Farmer Portal',
      subtitle: 'Crop Health, Field Scanning & Direct Advisories',
      description:
        'For agricultural producers, growers, and farm managers. Scan crops with AI, monitor weather fungal risk, submit cases to plant pathologists, and receive integrated pest management protocols.',
      path: '/farmer/login',
      icon: Sprout,
      color: 'emerald',
      badge: 'Producers & Growers',
      demoUser: 'farmer@cultivai.demo',
      features: ['AI Leaf Specimen Scanner', 'Microclimate Fungal Risk Index', 'Expert Review Queue', 'Interactive Case Timeline'],
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500/70',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold',
    },
    {
      role: 'EXPERT',
      title: 'Expert Portal',
      subtitle: 'Plant Pathologists, Entomologists & Agronomists',
      description:
        'For accredited university researchers, ICAR pathologists, and agricultural extension specialists. Inspect high-resolution specimen imagery, validate or modify AI diagnoses, and prescribe IPM chemical/cultural advisories.',
      path: '/expert/login',
      icon: Microscope,
      color: 'amber',
      badge: 'Diagnostic Authority',
      demoUser: 'expert@cultivai.demo',
      features: ['Specimen Verification Queue', 'Deep Zoom & Symptom Annotation', 'Multi-Protocol Advisory Builder', 'Direct Farmer Messaging'],
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/30 hover:border-amber-500/70',
      iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      btnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
    },
    {
      role: 'OFFICER',
      title: 'Agriculture Officer Portal',
      subtitle: 'Surveillance, Epidemic Containment & Extension',
      description:
        'For District Agriculture Officers (DAO/ADA), extension agents, and regional surveillance squads. Monitor geospatial outbreak clusters, schedule on-field verification visits, and broadcast community alerts.',
      path: '/officer/login',
      icon: Shield,
      color: 'blue',
      badge: 'Surveillance & Extension',
      demoUser: 'officer@cultivai.demo',
      features: ['Geospatial Hotspot Map & Clusters', 'Field Operations Scheduler', 'Broadcast Advisory Generator', 'District Acreage Analytics'],
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      borderColor: 'border-blue-500/30 hover:border-blue-500/70',
      iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      btnBg: 'bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold',
    },
    {
      role: 'ADMIN',
      title: 'Administrator Console',
      subtitle: 'Governance, Knowledge Ontology & Security Logs',
      description:
        'For platform administrators, enterprise governance, and system auditors. Manage user credentials, update crop & disease ontologies, monitor security audit logs, and configure platform settings.',
      path: '/admin/login',
      icon: Lock,
      color: 'purple',
      badge: 'System Governance',
      demoUser: 'admin@cultivai.demo',
      features: ['User RBAC & Suspension Controls', 'Disease & Pest Knowledge Base', 'Immutable Audit Trails', 'System Health Telemetry'],
      bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/30 hover:border-purple-500/70',
      iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      btnBg: 'bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center">
      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Strict Role-Based Multi-Portal Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Access Cultiv<span className="text-emerald-400">AI</span> Portals
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
          CultivAI enforces dedicated, role-segregated workspaces for each agricultural stakeholder. Select your authorized portal to sign in with your credentials.
        </p>
      </div>

      {/* 4 Portals Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {portals.map((portal) => {
          const Icon = portal.icon;

          return (
            <div
              key={portal.role}
              className={`relative rounded-2xl bg-gradient-to-br ${portal.bgGradient} bg-slate-900/90 border ${portal.borderColor} p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}
            >
              <div>
                {/* Header within card */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className={`p-3.5 rounded-xl border ${portal.iconBg}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    {portal.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight">{portal.title}</h3>
                <p className="text-xs font-semibold text-emerald-400/90 mt-0.5">{portal.subtitle}</p>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">{portal.description}</p>

                {/* Key capabilities list */}
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Portal Capabilities:
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {portal.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button and Demo Tag */}
              <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-[11px] text-slate-400 font-mono">
                  Demo login: <span className="text-white font-medium">{portal.demoUser}</span>
                </div>
                <button
                  onClick={() => onSelectPortal(portal.path)}
                  className={`px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md ${portal.btnBg}`}
                >
                  <span>Open {portal.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom return link */}
      <div className="text-center mt-10">
        <button
          onClick={onNavigateHome}
          className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
        >
          ← Return to CultivAI Public Overview
        </button>
      </div>
    </div>
  );
};
