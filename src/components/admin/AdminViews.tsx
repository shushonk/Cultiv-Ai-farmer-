import React from 'react';
import { User } from '../../types';
import { SystemHealthDashboard } from './SystemHealthDashboard';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { UserDirectoryView } from './UserDirectoryView';
import { FarmersRegistryView } from './FarmersRegistryView';
import { ExpertsRegistryView } from './ExpertsRegistryView';
import { OfficersRegistryView } from './OfficersRegistryView';
import { AllCasesView } from './AllCasesView';
import { CropsPathogensView } from './CropsPathogensView';
import { KnowledgeArticlesView } from './KnowledgeArticlesView';
import { GlobalAlertsView } from './GlobalAlertsView';
import { AuditLogsView } from './AuditLogsView';
import { ReportsAnalyticsView } from './ReportsAnalyticsView';
import { SystemSettingsView } from './SystemSettingsView';
import { CultivAIMap } from '../maps/CultivAIMap';

interface Props {
  user: User;
  subPath: string;
  onNavigate: (path: string) => void;
}

export const AdminViews: React.FC<Props> = ({ user, subPath, onNavigate }) => {
  switch (subPath) {
    case 'system-health':
    case 'health':
    case 'telemetry':
      return <SystemHealthDashboard />;

    case 'map':
    case 'surveillance-map':
      return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Central GIS Surveillance Console</h1>
              <p className="text-xs text-slate-400">Master geospatial overlay of epidemic hot zones, parcels, and field verifications</p>
            </div>
          </div>
          <CultivAIMap height="600px" />
        </div>
      );

    case 'users':
      return <UserDirectoryView currentUser={user} />;

    case 'farmers':
      return <FarmersRegistryView currentUser={user} />;

    case 'experts':
      return <ExpertsRegistryView currentUser={user} />;

    case 'officers':
      return <OfficersRegistryView currentUser={user} />;

    case 'cases':
      return <AllCasesView currentUser={user} />;

    case 'crops-pathogens':
    case 'ontologies':
      return <CropsPathogensView currentUser={user} />;

    case 'knowledge':
      return <KnowledgeArticlesView currentUser={user} />;

    case 'alerts':
      return <GlobalAlertsView currentUser={user} />;

    case 'audit-logs':
    case 'audit':
      return <AuditLogsView currentUser={user} />;

    case 'reports':
    case 'analytics':
      return <ReportsAnalyticsView currentUser={user} />;

    case 'settings':
      return <SystemSettingsView currentUser={user} />;

    case 'dashboard':
    case '':
    default:
      return <AdminDashboardOverview currentUser={user} onNavigate={onNavigate} />;
  }
};
