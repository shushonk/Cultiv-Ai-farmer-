import React from 'react';
import { User, UserRole } from '../../types';
import { useI18n } from '../../i18n';
import {
  LayoutDashboard,
  Sprout,
  Camera,
  FileText,
  AlertTriangle,
  MessageSquare,
  Bot,
  User as UserIcon,
  CheckCircle2,
  FlaskConical,
  Microscope,
  BookOpen,
  MapPin,
  Flame,
  Calendar,
  BarChart3,
  Users,
  Shield,
  Layers,
  History,
  Settings,
  X,
  Sparkles,
  Activity,
} from 'lucide-react';

interface Props {
  user: User;
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const Sidebar: React.FC<Props> = ({ user, currentPath, onNavigate, isOpen, onClose }) => {
  const { t } = useI18n();

  const getNavItems = (role: UserRole): NavItem[] => {
    switch (role) {
      case 'FARMER':
        return [
          { label: t('nav.dashboard'), path: '/farmer/dashboard', icon: LayoutDashboard },
          { label: t('nav.fields'), path: '/farmer/fields', icon: Sprout },
          { label: t('nav.scan'), path: '/farmer/scan', icon: Camera, badge: 'AI' },
          { label: t('nav.cases'), path: '/farmer/cases', icon: FileText },
          { label: t('nav.alerts'), path: '/farmer/alerts', icon: AlertTriangle },
          { label: t('nav.messages'), path: '/farmer/messages', icon: MessageSquare },
          { label: t('nav.assistant'), path: '/farmer/assistant', icon: Bot, badge: 'Live' },
          { label: t('nav.profile'), path: '/farmer/profile', icon: UserIcon },
          { label: t('nav.settings'), path: '/farmer/settings', icon: Settings },
        ];

      case 'EXPERT':
        return [
          { label: t('nav.dashboard'), path: '/expert/dashboard', icon: LayoutDashboard },
          { label: t('nav.verification'), path: '/expert/verification', icon: CheckCircle2, badge: 'Review' },
          { label: t('nav.investigations'), path: '/expert/investigations', icon: Microscope },
          { label: t('nav.cases'), path: '/expert/cases', icon: FileText },
          { label: t('nav.samples'), path: '/expert/samples', icon: FlaskConical },
          { label: t('nav.messages'), path: '/expert/messages', icon: MessageSquare },
          { label: t('nav.knowledge'), path: '/expert/knowledge', icon: BookOpen },
          { label: t('nav.assistant'), path: '/expert/assistant', icon: Bot },
          { label: t('nav.profile'), path: '/expert/profile', icon: UserIcon },
          { label: t('nav.settings'), path: '/expert/settings', icon: Settings },
        ];

      case 'OFFICER':
        return [
          { label: t('nav.dashboard'), path: '/officer/dashboard', icon: LayoutDashboard },
          { label: t('nav.map'), path: '/officer/map', icon: MapPin, badge: 'Live' },
          { label: t('nav.hotspots'), path: '/officer/hotspots', icon: Flame },
          { label: t('nav.cases'), path: '/officer/cases', icon: FileText },
          { label: t('nav.fieldOperations'), path: '/officer/field-operations', icon: Calendar },
          { label: t('nav.alerts'), path: '/officer/alerts', icon: AlertTriangle },
          { label: t('nav.reports'), path: '/officer/reports', icon: BarChart3 },
          { label: t('nav.messages'), path: '/officer/messages', icon: MessageSquare },
          { label: t('nav.assistant'), path: '/officer/assistant', icon: Bot },
          { label: t('nav.profile'), path: '/officer/profile', icon: UserIcon },
          { label: t('nav.settings'), path: '/officer/settings', icon: Settings },
        ];

      case 'ADMIN':
        return [
          { label: t('nav.dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
          { label: t('nav.health'), path: '/admin/system-health', icon: Activity, badge: 'Live' },
          { label: t('nav.users'), path: '/admin/users', icon: Users },
          { label: t('admin.surveillanceMap'), path: '/admin/map', icon: MapPin },
          { label: t('nav.cases'), path: '/admin/cases', icon: FileText },
          { label: t('nav.knowledge'), path: '/admin/knowledge', icon: BookOpen },
          { label: t('nav.alerts'), path: '/admin/alerts', icon: AlertTriangle },
          { label: t('nav.auditLogs'), path: '/admin/audit-logs', icon: History, badge: 'Sec' },
          { label: t('nav.reports'), path: '/admin/reports', icon: BarChart3 },
          { label: t('nav.settings'), path: '/admin/settings', icon: Settings },
        ];
    }
  };

  const navItems = getNavItems(user.role);

  const getRoleHeaderStyle = (role: UserRole) => {
    switch (role) {
      case 'FARMER':
        return {
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          title: 'Farmer Workspace',
          desc: user.location?.district ? `${user.location.district}, ${user.location.state}` : 'Kolar, Karnataka',
        };
      case 'EXPERT':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          title: 'Expert Portal',
          desc: user.specialization || 'Vegetable Pathology',
        };
      case 'OFFICER':
        return {
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          title: 'Surveillance Portal',
          desc: user.organization || 'Dept. of Agriculture',
        };
      case 'ADMIN':
        return {
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          title: 'Admin Console',
          desc: 'Security & User Governance',
        };
    }
  };

  const roleMeta = getRoleHeaderStyle(user.role);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0b1324] border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Role Banner / Workspace header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">{roleMeta.title}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${roleMeta.badge}`}>
                {user.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-[180px]">{roleMeta.desc}</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);

            return (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      item.badge === 'Live' || item.badge === 'AI'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom AI engine status widget */}
        <div className="p-3 m-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-white">CultivAI Engine v2.6</span>
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            Active models: Multi-modal Vision Classifier + Microclimate Epidemiology Matrix
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Surveillance Node Online</span>
          </div>
        </div>
      </aside>
    </>
  );
};
