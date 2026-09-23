import React from 'react';
import { CaseStatus, SeverityLevel, RiskLevel } from '../../types';
import { useI18n } from '../../i18n';

export const StatusBadge: React.FC<{ status: CaseStatus | string; className?: string }> = ({
  status,
  className = '',
}) => {
  const { t } = useI18n();
  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  const getTranslatedStatus = (s: string) => {
    switch (s) {
      case 'New':
        return t('status.pending');
      case 'AI Analysed':
        return t('status.aiAnalysed');
      case 'Under Review':
        return t('status.underReview');
      case 'Expert Confirmed':
        return t('status.confirmed');
      case 'Expert Rejected':
        return t('status.rejected');
      case 'Action Recommended':
      case 'Advisory Dispatched':
        return t('status.advisoryDispatched');
      case 'Follow-up Required':
        return t('status.attention');
      case 'Resolved':
        return t('status.resolved');
      case 'Escalated':
        return t('status.escalated');
      default:
        return s;
    }
  };

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
      {getTranslatedStatus(status)}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: SeverityLevel | string }> = ({ severity }) => {
  const { t } = useI18n();
  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  const getTranslatedSeverity = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'low':
      case 'mild':
        return t('severity.low');
      case 'moderate':
        return t('severity.moderate');
      case 'high':
      case 'severe':
        return t('severity.high');
      case 'critical':
        return t('severity.critical');
      default:
        return sev;
    }
  };

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
    case 'Critical':
      style = 'bg-red-950/70 text-red-400 border-red-800/50 font-bold';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${style}`}>
      {getTranslatedSeverity(severity)}
    </span>
  );
};

export const RiskBadge: React.FC<{ risk: RiskLevel | string; showScore?: number }> = ({
  risk,
  showScore,
}) => {
  const { t } = useI18n();
  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  const getTranslatedRisk = (r: string) => {
    switch (r.toUpperCase()) {
      case 'LOW':
        return t('risk.low');
      case 'MODERATE':
        return t('risk.moderate');
      case 'HIGH':
        return t('risk.high');
      case 'CRITICAL':
        return t('risk.critical');
      default:
        return r;
    }
  };

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
      {getTranslatedRisk(risk)} {showScore !== undefined && `(${showScore}/100)`}
    </span>
  );
};
