import React, { useState } from 'react';
import { User, CaseRecord } from '../../types';
import { StorageService } from '../../services/storage';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Sprout,
  Activity,
  CheckCircle2,
  Shield,
  FileText,
  Printer,
  Zap,
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const ReportsAnalyticsView: React.FC<Props> = ({ currentUser }) => {
  const users = StorageService.getUsers();
  const cases = StorageService.getCases();
  const visits = StorageService.getFieldVisits();
  const hotspots = StorageService.getHotspots();

  const [cropFilter, setCropFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  // Filter cases based on current selection
  const filteredCases = cases.filter((c) => {
    if (cropFilter !== 'ALL' && c.crop !== cropFilter) return false;
    if (districtFilter !== 'ALL' && c.location?.district !== districtFilter) return false;
    return true;
  });

  // Calculate REAL LIVE METRICS directly from database records
  const totalCases = filteredCases.length;
  const resolvedCases = filteredCases.filter((c) => c.status === 'Resolved').length;
  const resolutionRate = totalCases > 0 ? ((resolvedCases / totalCases) * 100).toFixed(1) : '0';
  const criticalCases = filteredCases.filter((c) => c.riskAssessment?.overallRisk === 'CRITICAL' || c.aiPrediction?.severity === 'Severe').length;

  // Breakdown by Crop
  const cropMap: Record<string, number> = {};
  filteredCases.forEach((c) => {
    cropMap[c.crop] = (cropMap[c.crop] || 0) + 1;
  });

  // Breakdown by Disease
  const diseaseMap: Record<string, number> = {};
  filteredCases.forEach((c) => {
    const condition = c.aiPrediction?.condition || 'Unknown';
    diseaseMap[condition] = (diseaseMap[condition] || 0) + 1;
  });

  // Expert Performance Metrics
  const expertReviewedCases = filteredCases.filter((c) => c.expertReview);
  const confirmedByExpert = expertReviewedCases.filter((c) => c.expertReview?.action === 'Confirm Diagnosis').length;
  const expertConfirmationRate = expertReviewedCases.length > 0 ? ((confirmedByExpert / expertReviewedCases.length) * 100).toFixed(1) : '100';

  // Officer Surveillance Metrics
  const completedVisits = visits.filter((v) => v.status === 'Completed').length;
  const visitCompletionRate = visits.length > 0 ? ((completedVisits / visits.length) * 100).toFixed(1) : '0';

  const handleExportCSV = () => {
    const headers = ['Crop', 'Case Count', 'Resolution Rate %', 'Critical Cases'];
    const rows = Object.entries(cropMap).map(([crop, count]) => {
      const cropCases = filteredCases.filter((c) => c.crop === crop);
      const res = cropCases.filter((c) => c.status === 'Resolved').length;
      const crit = cropCases.filter((c) => c.riskAssessment?.overallRisk === 'CRITICAL' || c.aiPrediction?.severity === 'Severe').length;
      return [crop, count, ((res / count) * 100).toFixed(1), crit];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cultivai-analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    StorageService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'ADMIN',
      action: 'DATA_EXPORT',
      resource: '/admin/reports',
      details: 'Admin exported aggregated analytics report to CSV.',
      status: 'SUCCESS',
    });
  };

  const uniqueCrops = Array.from(new Set(cases.map((c) => c.crop)));
  const uniqueDistricts = Array.from(new Set(cases.map((c) => c.location?.district).filter(Boolean)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-pink-400">
            <BarChart3 className="w-4 h-4" />
            <span>Epidemiological & Operational Performance Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time calculations derived directly from active field cases, expert reviews, and surveillance records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-pink-500/20 transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-purple-400" />
          Filter Cohort:
        </span>

        <select
          value={cropFilter}
          onChange={(e) => setCropFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Crops ({cases.length} cases)</option>
          {uniqueCrops.map((c) => (
            <option key={c} value={c}>
              Crop: {c}
            </option>
          ))}
        </select>

        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Districts</option>
          {uniqueDistricts.map((d) => (
            <option key={d} value={d}>
              District: {d}
            </option>
          ))}
        </select>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Total Analyzed Cases</span>
          <div className="text-2xl font-black text-white">{totalCases}</div>
          <div className="text-[11px] text-emerald-400">{resolvedCases} Successfully Resolved</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Platform Resolution Rate</span>
          <div className="text-2xl font-black text-emerald-400">{resolutionRate}%</div>
          <div className="text-[11px] text-slate-400">Target SLA: &gt;80.0%</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Expert Diagnostic Agreement</span>
          <div className="text-2xl font-black text-amber-300">{expertConfirmationRate}%</div>
          <div className="text-[11px] text-slate-400">{expertReviewedCases.length} Specialist Reviews</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">Officer Inspection SLA</span>
          <div className="text-2xl font-black text-blue-400">{visitCompletionRate}%</div>
          <div className="text-[11px] text-slate-400">{completedVisits} of {visits.length} Dispatched</div>
        </div>
      </div>

      {/* Two Column Visual Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Crop */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>Disease Incidents by Crop Commodity</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(cropMap).map(([crop, count]) => {
              const pct = totalCases > 0 ? ((count / totalCases) * 100).toFixed(0) : '0';
              return (
                <div key={crop} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">{crop}</span>
                    <span className="text-slate-400 font-mono">{count} cases ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Detected Pathogens */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <span>Prevalent Phytopathogens & Infestations</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(diseaseMap).map(([condition, count]) => {
              const pct = totalCases > 0 ? ((count / totalCases) * 100).toFixed(0) : '0';
              return (
                <div key={condition} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">{condition}</span>
                    <span className="text-slate-400 font-mono">{count} cases ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
