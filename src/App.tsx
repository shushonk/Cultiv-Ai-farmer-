import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { PortalSelectHub } from './components/auth/PortalSelectHub';
import { RoleLoginPage } from './components/auth/RoleLoginPage';
import { FarmerRegisterPage } from './components/auth/FarmerRegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { LandingPage } from './components/public/LandingPage';
import { PublicViews } from './components/public/PublicViews';
import { FarmerViews } from './components/farmer/FarmerViews';
import { ExpertViews } from './components/expert/ExpertViews';
import { OfficerViews } from './components/officer/OfficerViews';
import { AdminViews } from './components/admin/AdminViews';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(StorageService.getCurrentUser());
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync state when URL changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleLoginSuccess = (role: UserRole) => {
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
    const dashboardPath = `/${role.toLowerCase()}/dashboard`;
    navigate(dashboardPath);
  };

  const handleLogout = () => {
    const prevRole = currentUser?.role;
    StorageService.logout();
    setCurrentUser(null);
    if (prevRole) {
      navigate(`/${prevRole.toLowerCase()}/login`);
    } else {
      navigate('/login');
    }
  };

  // Helper to extract role prefix and subPath
  const parsePath = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    const prefix = segments[0] || '';
    const sub = segments[1] || '';
    return { prefix, sub, segments };
  };

  const { prefix, sub } = parsePath(currentPath);

  // Unread alerts count
  const unreadAlertsCount = currentUser
    ? StorageService.getAlerts(currentUser.role, currentUser.id).filter((a) => !a.read).length
    : 0;

  // ----------------------------------------------------
  // ROUTE RESOLVER
  // ----------------------------------------------------

  const renderContent = () => {
    // 1. PUBLIC MARKETING & INFORMATIONAL PAGES
    if (currentPath === '/' || currentPath === '/home') {
      return (
        <LandingPage
          onOpenPortalDirectory={() => navigate('/login')}
          onNavigateRoleLogin={(rolePath) => navigate(rolePath)}
          onNavigatePage={(p) => navigate(p)}
        />
      );
    }

    if (['features', 'how-it-works', 'technology', 'about', 'contact'].includes(prefix)) {
      return (
        <PublicViews
          view={prefix as any}
          onOpenPortalHub={() => navigate('/login')}
        />
      );
    }

    // 2. PORTAL DIRECTORY / SELECTION HUB
    if (currentPath === '/login' || currentPath === '/portals') {
      return (
        <PortalSelectHub
          onSelectPortal={(rolePath: string) => {
            navigate(rolePath);
          }}
          onNavigateHome={() => navigate('/')}
        />
      );
    }

    // 3. AUTHENTICATION PAGES
    // A. Farmer Registration
    if (currentPath === '/farmer/register') {
      return (
        <FarmerRegisterPage
          onRegisterSuccess={() => {
            const user = StorageService.getCurrentUser();
            setCurrentUser(user);
            navigate('/farmer/dashboard');
          }}
          onNavigateLogin={() => navigate('/farmer/login')}
        />
      );
    }

    // B. Forgot Password
    if (sub === 'forgot-password' && ['farmer', 'expert', 'officer', 'admin'].includes(prefix)) {
      const role = prefix.toUpperCase() as UserRole;
      return (
        <ForgotPasswordPage
          role={role}
          onNavigateLogin={() => navigate(`/${prefix}/login`)}
        />
      );
    }

    // C. Dedicated Role Login Pages
    if (sub === 'login' && ['farmer', 'expert', 'officer', 'admin'].includes(prefix)) {
      const role = prefix.toUpperCase() as UserRole;
      return (
        <RoleLoginPage
          role={role}
          onLoginSuccess={handleLoginSuccess}
          onNavigate={navigate}
        />
      );
    }

    // 4. AUTHENTICATED WORKSPACES WITH STRICT RBAC ENFORCEMENT
    if (['farmer', 'expert', 'officer', 'admin'].includes(prefix)) {
      const requestedRole = prefix.toUpperCase() as UserRole;

      // If not logged in at all, redirect to this portal's login
      if (!currentUser) {
        return (
          <RoleLoginPage
            role={requestedRole}
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigate}
          />
        );
      }

      // If logged in with the wrong role, show strict boundary rejection
      if (currentUser.role !== requestedRole) {
        return (
          <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-slate-900 border border-rose-500/50 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Access Denied (Role Mismatch)</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                You are currently authenticated as a <strong className="text-white">{currentUser.role}</strong>. You cannot access the{' '}
                <strong className="text-rose-400">{requestedRole} Portal</strong>.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => navigate(`/${currentUser.role.toLowerCase()}/dashboard`)}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <span>Return to Your {currentUser.role} Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Sign Out of Current Account
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Logged in with correct role -> Render role workspace
      switch (currentUser.role) {
        case 'FARMER':
          return <FarmerViews user={currentUser} subPath={sub} onNavigate={navigate} />;
        case 'EXPERT':
          return <ExpertViews user={currentUser} subPath={sub} onNavigate={navigate} />;
        case 'OFFICER':
          return <OfficerViews user={currentUser} subPath={sub} onNavigate={navigate} />;
        case 'ADMIN':
          return <AdminViews user={currentUser} subPath={sub} onNavigate={navigate} />;
      }
    }

    // Fallback: 404 / Home
    return (
      <LandingPage
        onOpenPortalDirectory={() => navigate('/login')}
        onNavigateRoleLogin={(rolePath) => navigate(rolePath)}
        onNavigatePage={(p) => navigate(p)}
      />
    );
  };

  // Determine if sidebar should be shown (only when user is logged in inside their portal)
  const showSidebar =
    currentUser &&
    ['farmer', 'expert', 'officer', 'admin'].includes(prefix) &&
    currentUser.role === prefix.toUpperCase() &&
    sub !== 'login' &&
    sub !== 'register' &&
    sub !== 'forgot-password';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Global Header */}
      <Header
        user={currentUser}
        currentPath={currentPath}
        onNavigate={navigate}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <Sidebar
            user={currentUser}
            currentPath={currentPath}
            onNavigate={navigate}
            isOpen={!sidebarCollapsed}
            onClose={() => setSidebarCollapsed(true)}
          />
        )}

        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;

