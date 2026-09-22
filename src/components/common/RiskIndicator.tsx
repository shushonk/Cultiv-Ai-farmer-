import React from 'react';
import { RiskLevel } from '../../types';
import { AlertTriangle, CloudRain, Sprout, MapPin, CheckCircle, Info } from 'lucide-react';

interface RiskFactors {
  diseaseProbabilityScore: number;
  weatherSuitabilityScore: number;
  cropSusceptibilityScore: number;
  regionalPressureScore: number;
}

interface Props {
  overallRisk: RiskLevel;
  score: number;
  factors: RiskFactors;
  explanation?: string;
  compact?: boolean;
}

export const RiskIndicator: React.FC<Props> = ({
  overallRisk,
  score,
  factors,
  explanation,
  compact = false,
}) => {
  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'LOW':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          bar: 'bg-emerald-500',
          ring: 'text-emerald-500',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          bar: 'bg-amber-500',
          ring: 'text-amber-500',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/15',
          border: 'border-orange-500/40',
          text: 'text-orange-400',
          bar: 'bg-orange-500',
          ring: 'text-orange-500',
        };
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/20',
          border: 'border-rose-500/50',
          text: 'text-rose-400',
          bar: 'bg-rose-500',
          ring: 'text-rose-500',
        };
    }
  };

  const colors = getRiskColor(overallRisk);

  if (compact) {
    return (
      <div className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Risk Score</span>
          <span className={`text-xs font-bold uppercase ${colors.text}`}>{overallRisk} ({score}/100)</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full ${colors.bar} rounded-full transition-all duration-700`} style={{ width: `${score}%` }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-xl border ${colors.bg} ${colors.border} space-y-4`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/40 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg border ${colors.bg} ${colors.border}`}>
            <AlertTriangle className={`w-6 h-6 ${colors.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Explainable Multi-Factor Risk</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${colors.bg} ${colors.text} border ${colors.border}`}>
                {overallRisk} RISK
              </span>
            </div>
            <h4 className="text-lg font-bold text-white mt-0.5">Composite Threat Score: <span className={colors.text}>{score}/100</span></h4>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-md border border-slate-800">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Calculated via 4 weighted agronomic factors</span>
        </div>
      </div>

      {/* 4 Factor Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Factor 1: Disease Probability */}
        <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
              AI Disease Prob. (35%)
            </span>
            <span className="font-bold text-white">{factors.diseaseProbabilityScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${factors.diseaseProbabilityScore}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Visual symptom confidence</span>
        </div>

        {/* Factor 2: Weather Suitability */}
        <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              Weather Suitability (25%)
            </span>
            <span className="font-bold text-white">{factors.weatherSuitabilityScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${factors.weatherSuitabilityScore}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Humidity, dew & temperature</span>
        </div>

        {/* Factor 3: Crop Susceptibility */}
        <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              Crop Phenology (20%)
            </span>
            <span className="font-bold text-white">{factors.cropSusceptibilityScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${factors.cropSusceptibilityScore}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Phenological stage vulnerability</span>
        </div>

        {/* Factor 4: Regional Pressure */}
        <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              Regional Pressure (20%)
            </span>
            <span className="font-bold text-white">{factors.regionalPressureScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${factors.regionalPressureScore}%` }}></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Surrounding cluster density</span>
        </div>
      </div>

      {explanation && (
        <div className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800 leading-relaxed">
          <strong className="text-white">Risk Synthesis: </strong>
          {explanation}
        </div>
      )}
    </div>
  );
};
