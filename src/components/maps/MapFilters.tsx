import React from 'react';
import { MapFiltersState } from './CultivAIMap';
import { Filter, Layers, RefreshCw } from 'lucide-react';
import { useI18n } from '../../i18n';

interface Props {
  filters: MapFiltersState;
  onChange: (filters: MapFiltersState) => void;
  availableDistricts?: string[];
  availableCrops?: string[];
}

export const MapFilters: React.FC<Props> = ({
  filters,
  onChange,
  availableDistricts = ['Kolar', 'Belagavi', 'Hassan', 'Dharwad', 'Mandya'],
  availableCrops = ['Tomato', 'Rice / Paddy', 'Chilli', 'Bt Cotton', 'Capsicum', 'Table Grapes'],
}) => {
  const { t } = useI18n();

  const handleToggle = (key: keyof MapFiltersState) => {
    onChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  const handleSelect = (key: keyof MapFiltersState, val: string) => {
    onChange({
      ...filters,
      [key]: val,
    });
  };

  const handleReset = () => {
    onChange({
      crop: 'ALL',
      condition: 'ALL',
      risk: 'ALL',
      severity: 'ALL',
      district: 'ALL',
      status: 'ALL',
      showCases: true,
      showHotspots: true,
      showVisits: true,
      showWeather: true,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Surveillance & Layer Filters
          </h3>
        </div>
        <button
          onClick={handleReset}
          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Select Dropdowns */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-[11px] text-slate-400 font-semibold mb-1">Target Crop</label>
          <select
            value={filters.crop}
            onChange={(e) => handleSelect('crop', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
          >
            <option value="ALL">All Crops</option>
            {availableCrops.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 font-semibold mb-1">Risk Severity</label>
          <select
            value={filters.risk}
            onChange={(e) => handleSelect('risk', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 font-semibold mb-1">District Zone</label>
          <select
            value={filters.district}
            onChange={(e) => handleSelect('district', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
          >
            <option value="ALL">All Districts</option>
            {availableDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 font-semibold mb-1">Case Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleSelect('status', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="AI Analysed">AI Analysed</option>
            <option value="Under Review">Under Review</option>
            <option value="Confirmed by Expert">Confirmed by Expert</option>
          </select>
        </div>
      </div>

      {/* Layer Visibility Toggles */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Active Layers:</span>
        </span>

        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={filters.showCases}
            onChange={() => handleToggle('showCases')}
            className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
          />
          <span>Foliar Cases Layer</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={filters.showHotspots}
            onChange={() => handleToggle('showHotspots')}
            className="rounded border-slate-700 text-rose-500 focus:ring-0 bg-slate-950"
          />
          <span>Epidemic Hotspots Layer</span>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={filters.showVisits}
            onChange={() => handleToggle('showVisits')}
            className="rounded border-slate-700 text-blue-500 focus:ring-0 bg-slate-950"
          />
          <span>Extension Visits Layer</span>
        </label>
      </div>
    </div>
  );
};
