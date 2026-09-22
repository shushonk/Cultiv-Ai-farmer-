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
