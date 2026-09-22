import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  CloudRain,
  Microscope,
  MapPin,
  Shield,
  Layers,
  CheckCircle2,
  Cpu,
  BookOpen,
  ArrowRight,
  Send,
  Mail,
  Phone,
} from 'lucide-react';

interface Props {
  view: 'features' | 'how-it-works' | 'technology' | 'about' | 'contact';
  onOpenPortalHub: () => void;
}

export const PublicViews: React.FC<Props> = ({ view, onOpenPortalHub }) => {
  const [contactSent, setContactSent] = useState(false);

  if (view === 'features') {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Platform Capabilities</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Engineered for Agricultural Decision Precision</h1>
          <p className="text-sm text-slate-400 mt-3">From real-time foliar diagnostics to regional epidemic containment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Smart Image Quality Validator</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Analyzes edge sharpness, lighting histogram, and region-of-interest leaf presence before submission to prevent blurred or false diagnoses.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <CloudRain className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Microclimate Weather Fungal Matrix</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculates dew point, relative humidity duration, and incubation suitability to warn farmers prior to visible spore sporulation.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Microscope className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Expert Verification Queue</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Equips university plant pathologists with deep-zoom image inspection tools, symptom annotators, and CIBRC chemical label checks.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Geospatial Hotspot Clustering</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Identifies emerging epidemic corridors across contiguous agricultural holdings, enabling agricultural officers to dispatch rapid containment squads.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Integrated Pest Management (IPM)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Provides tiered cultural sanitation, biological antagonistics, and responsible chemical advisories with Pre-Harvest Intervals (PHI).
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Strict Role-Based Multi-Portal</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dedicated interfaces with custom workflows for Farmers, Plant Pathologists, Extension Officers, and System Administrators.
            </p>
          </div>
        </div>

        <div className="text-center pt-8">
          <button
            onClick={onOpenPortalHub}
            className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Access Platform Portals
          </button>
        </div>
      </div>
    );
  }

  if (view === 'how-it-works') {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">System Architecture</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">The 8-Stage Closed-Loop Process</h1>
          <p className="text-sm text-slate-400 mt-3">How CultivAI transforms raw field observations into validated containment.</p>
        </div>

        <div className="space-y-6 max-w-4xl mx-auto">
          {[
            { stage: '1. OBSERVE', title: 'On-Field Image Capture & Specimen Sensing', desc: 'Farmers photograph infected leaves or fruits. Instant edge validation confirms image sharpness, illumination, and leaf ROI before diagnostic processing.' },
            { stage: '2. INVESTIGATE', title: 'Computer Vision & Deep Feature Classification', desc: 'Multi-modal Vision AI analyzes chlorosis, necrotic concentric rings, water-soaked lesions, or pest frass against extensive pathogen libraries.' },
            { stage: '3. VERIFY', title: 'Plant Pathology Expert Review', desc: 'Certified ICAR and agricultural extension pathologists inspect preliminary results, adjust diagnosis if necessary, and approve customized IPM advisories.' },
            { stage: '4. ASSESS', title: 'Explainable Multi-Factor Risk Calculation', desc: 'Synthesizes Disease Likelihood (35%), Microclimate Weather Suitability (25%), Crop Phenological Vulnerability (20%), and Regional Cluster Density (20%).' },
            { stage: '5. PRIORITIZE', title: 'Dynamic Severity Triage', desc: 'Cases are categorized into Low, Moderate, High, or Critical threat tiers with automatic escalation to block-level surveillance officers.' },
            { stage: '6. ACT', title: 'Prescriptive IPM Action Execution', desc: 'Farmers execute tailored non-chemical cultural sanitation, biological agents (Trichoderma/Pseudomonas), and dosage-checked chemical sprays.' },
            { stage: '7. MONITOR', title: '48-Hour Follow-Up & Progression Tracking', desc: 'Farmers submit progress images. The platform logs whether symptoms have halted, improved, or require secondary escalation.' },
            { stage: '8. LEARN', title: 'Regional Predictive Feedback Loop', desc: 'Validated cases enrich epidemiological hotspot tracking, enabling proactive alert broadcasts to neighboring growers before spores spread.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex items-start gap-4">
              <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs shrink-0">
                {item.stage}
              </span>
              <div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'technology') {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Scientific Foundation</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Agronomic Intelligence & Risk Modeling</h1>
          <p className="text-sm text-slate-400 mt-3">Combining empirical plant pathology with modern machine learning.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-emerald-400">Multi-Factor Risk Formula</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unlike simplistic image classifiers that output an isolated label, CultivAI computes an explainable composite threat score:
            </p>
            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-800">
              Risk Score = (0.35 × AI_Prob) + (0.25 × Weather_Suitability) + (0.20 × Crop_Susceptibility) + (0.20 × Regional_Pressure)
            </div>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>• <strong>Weather Suitability:</strong> Evaluates hourly dew duration, temperature curves, and rainfall.</li>
              <li>• <strong>Crop Susceptibility:</strong> Flowering and fruit-setting stages receive higher vulnerability weighting.</li>
              <li>• <strong>Regional Pressure:</strong> Active cases within a 15 km radius amplify containment priority.</li>
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-cyan-400">Integrated Pest Management (IPM) Standard</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              CultivAI prioritizes sustainable agronomic interventions before recommending synthetic inputs:
            </p>
            <ul className="text-xs text-slate-300 space-y-3">
              <li className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <strong className="text-white">1. Cultural Management:</strong> Crop rotation, sanitary pruning of lower senescent leaves, balanced nitrogen scheduling, and wide row aeration.
              </li>
              <li className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <strong className="text-white">2. Biological Antagonists:</strong> Bio-priming seeds with <em>Trichoderma viride</em> and foliar application of <em>Pseudomonas fluorescens</em>.
              </li>
              <li className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <strong className="text-white">3. Rational Chemical Controls:</strong> Label-checked CIBRC dosages with strict adherence to Pre-Harvest Intervals (PHI) and pollinator safety.
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'about') {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Our Mission</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Democratizing Early Crop Protection</h1>
          <p className="text-sm text-slate-400">
            Empowering smallholders, agricultural extension officers, and diagnostic scientists across India and global farming communities.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            Delayed detection of crop diseases causes up to 40% of preventable harvest losses each season. Traditional scouting relies on infrequent physical visits by agricultural officers covering vast territorial sub-divisions.
          </p>
          <p>
            CultivAI transforms every smartphone into a smart diagnostic sensor. By uniting on-device visual AI, local meteorological sensor feeds, and certified plant pathologists, we deliver verified diagnostic clarity in minutes instead of weeks.
          </p>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-2xl font-bold text-emerald-400">10+</div>
              <div className="text-xs text-slate-400 mt-1">Farm Parcels Under Active Surveillance</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-2xl font-bold text-cyan-400">&lt; 3 hrs</div>
              <div className="text-xs text-slate-400 mt-1">Average Expert Review Turnaround</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-2xl font-bold text-amber-400">100%</div>
              <div className="text-xs text-slate-400 mt-1">IPM & Pre-Harvest Safety Compliant</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Get In Touch</span>
        <h1 className="text-3xl font-extrabold text-white">Contact CultivAI Support</h1>
        <p className="text-xs text-slate-400">Reach out for extension partnerships, institutional access, or technical inquiries.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
        {contactSent ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Message Dispatched</h3>
            <p className="text-xs text-slate-300">Thank you. An agricultural extension coordinator will respond within 24 hours.</p>
            <button
              onClick={() => setContactSent(false)}
              className="mt-3 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setContactSent(true);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Your Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Rajesh Kumar"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Email or Phone</label>
              <input
                type="text"
                required
                placeholder="rajesh@agri.gov.in"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Organization / Farm Location</label>
              <input
                type="text"
                placeholder="District Agriculture Office, Kolar"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Message</label>
              <textarea
                rows={4}
                required
                placeholder="Inquiry about regional surveillance integration or farmer onboarding..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-400"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Inquiry</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
