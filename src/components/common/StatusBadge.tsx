import React from 'react';
import { CaseStatus, SeverityLevel, RiskLevel } from '../../types';

export const StatusBadge: React.FC<{ status: CaseStatus | string; className?: string }> = ({
  status,
  className = '',
}) => {
  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  switch (status) {
    case 'New':
      style = 'bg-blue-950/80 text-blue-300 border-blue-700/50';
      break;
    case 'AI Analysed':
      style = 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50';
      break;
    case 'Under Review':
      style = 'bg-amber-950/80 text-amber-300 border-amber-700/50 animate-pulse';
      break;
    case 'Expert Confirmed':
      style = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50';
      break;
    case 'Expert Rejected':
      style = 'bg-red-950/80 text-red-300 border-red-700/50';
      break;
    case 'Action Recommended':
      style = 'bg-violet-950/80 text-violet-300 border-violet-700/50';
      break;
    case 'Follow-up Required':
      style = 'bg-orange-950/80 text-orange-300 border-orange-700/50';
      break;
    case 'Resolved':
      style = 'bg-teal-950/80 text-teal-300 border-teal-700/50';
      break;
    case 'Escalated':
      style = 'bg-rose-950/80 text-rose-300 border-rose-700/50';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: SeverityLevel | string }> = ({ severity }) => {
  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  switch (severity) {
    case 'Low':
      style = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40';
      break;
    case 'Moderate':
      style = 'bg-amber-950/60 text-amber-400 border-amber-800/40';
      break;
    case 'High':
      style = 'bg-orange-950/60 text-orange-400 border-orange-800/40';
      break;
    case 'Severe':
      style = 'bg-red-950/70 text-red-400 border-red-800/50 font-bold';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${style}`}>
      {severity} Severity
    </span>
  );
};

export const RiskBadge: React.FC<{ risk: RiskLevel | string; showScore?: number }> = ({
  risk,
  showScore,
}) => {
  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  switch (risk) {
    case 'LOW':
      style = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      break;
    case 'MODERATE':
      style = 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      break;
    case 'HIGH':
      style = 'bg-orange-950/80 text-orange-300 border-orange-700/60';
      break;
    case 'CRITICAL':
      style = 'bg-red-950/90 text-red-300 border-red-600/70 animate-pulse font-bold';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs tracking-wide uppercase font-semibold border ${style}`}>
      <span className="w-2 h-2 rounded-full bg-current"></span>
      {risk} RISK {showScore !== undefined && `(${showScore}/100)`}
    </span>
  );
};
