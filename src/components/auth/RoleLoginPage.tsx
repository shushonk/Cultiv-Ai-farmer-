import React, { useState } from 'react';
import { UserRole } from '../../types';
import { StorageService } from '../../services/storage';
import { API } from '../../services/api';
import {
  Sprout,
  Microscope,
  Shield,
  Lock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  KeyRound,
  Sparkles,
} from 'lucide-react';

interface Props {
  role: UserRole;
  onLoginSuccess: (role: UserRole) => void;
  onNavigate: (path: string) => void;
}

export const RoleLoginPage: React.FC<Props> = ({ role, onLoginSuccess, onNavigate }) => {
  const getRoleConfig = (r: UserRole) => {
    switch (r) {
      case 'FARMER':
        return {
          title: 'Farmer Portal Login',
          tagline: 'Crop Health Surveillance & Expert Guidance',
          roleDisplay: 'Farmer',
          icon: Sprout,
          demoEmail: 'farmer@cultivai.demo',
          demoPass: 'cultivai2026',
          themeColor: 'emerald',
          borderHighlight: 'border-emerald-500/40',
          bgHighlight: 'from-emerald-950/40 to-slate-900',
          btnClass: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold',
          badgeText: 'Producers & Growers',
          hintText: 'Use your registered mobile number or email address to access your crop parcels.',
          allowRegister: true,
          registerPath: '/farmer/register',
          forgotPath: '/farmer/forgot-password',
        };
      case 'EXPERT':
        return {
          title: 'Plant Pathologist Portal',
          tagline: 'ICAR / University Diagnostic Verification Desk',
          roleDisplay: 'Plant Pathologist / Expert',
          icon: Microscope,
          demoEmail: 'expert@cultivai.demo',
          demoPass: 'cultivai2026',
          themeColor: 'amber',
          borderHighlight: 'border-amber-500/40',
          bgHighlight: 'from-amber-950/40 to-slate-900',
          btnClass: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold',
          badgeText: 'Diagnostic Authority',
          hintText: 'Accredited plant pathologists, entomologists, and ICAR agricultural researchers only.',
          allowRegister: false,
          registerPath: '',
          forgotPath: '/expert/forgot-password',
        };
      case 'OFFICER':
        return {
          title: 'Agriculture Officer Portal',
          tagline: 'Regional Surveillance, Hotspots & Extension Command',
          roleDisplay: 'Agriculture Officer',
          icon: Shield,
          demoEmail: 'officer@cultivai.demo',
          demoPass: 'cultivai2026',
          themeColor: 'blue',
          borderHighlight: 'border-blue-500/40',
          bgHighlight: 'from-blue-950/40 to-slate-900',
          btnClass: 'bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold',
          badgeText: 'Government Extension & Surveillance',
          hintText: 'State Department of Agriculture surveillance and district field officers.',
          allowRegister: false,
          registerPath: '',
          forgotPath: '/officer/forgot-password',
        };
      case 'ADMIN':
        return {
          title: 'System Administrator Console',
          tagline: 'Platform Governance, Ontologies & Security Audit',
          roleDisplay: 'Administrator',
          icon: Lock,
          demoEmail: 'admin@cultivai.demo',
          demoPass: 'cultivai2026',
          themeColor: 'purple',
          borderHighlight: 'border-purple-500/40',
          bgHighlight: 'from-purple-950/40 to-slate-900',
          btnClass: 'bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold',
          badgeText: 'Security & Platform Governance',
          hintText: 'Restricted high-privilege access for platform operations and data security audits.',
          allowRegister: false,
          registerPath: '',
          forgotPath: '/admin/forgot-password',
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wrongPortalModal, setWrongPortalModal] = useState<{
    show: boolean;
    message: string;
    detectedRole?: UserRole;
  }>({ show: false, message: '' });
  const [loading, setLoading] = useState(false);

  const fillDemo = () => {
    setEmailOrPhone(config.demoEmail);
    setPassword(config.demoPass);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      // First attempt backend authentication to establish live JWT session & sliding refresh
      try {
        const apiResult = await API.login(emailOrPhone, password, role);
        if (apiResult && apiResult.token) {
          console.log('[CultivAI Auth] Successfully acquired JWT token with sliding lifespan:', apiResult.maxSlidingHours, 'hours');
        }
      } catch (apiErr: any) {
        console.warn('[CultivAI Auth] Backend auth endpoint fallback:', apiErr.message);
      }

      const result = StorageService.login(emailOrPhone, password, role);
      setLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user.role);
      } else {
        // Check if error was a cross-portal mismatch
        const allUsers = StorageService.getUsers();
        const matched = allUsers.find(
          (u) =>
            u.email.toLowerCase() === emailOrPhone.trim().toLowerCase() ||
            u.phone.replace(/\s+/g, '') === emailOrPhone.trim().replace(/\s+/g, '')
        );

        if (matched && matched.role !== role) {
          setWrongPortalModal({
            show: true,
            message: result.error || `Access Denied: This account is registered as a ${matched.role} and does not have access to the ${config.roleDisplay} Portal.`,
            detectedRole: matched.role,
          });
        } else {
          setErrorMessage(result.error || 'Invalid credentials.');
        }
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Authentication error.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Wrong Portal Modal */}
      {wrongPortalModal.show && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Wrong Portal Access</h3>
                <span className="text-xs font-semibold text-rose-400">Strict Role Boundary Enforced</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-lg border border-slate-800">
              {wrongPortalModal.message}
            </p>

            <div className="flex flex-col gap-2 pt-2">
              {wrongPortalModal.detectedRole && (
                <button
                  onClick={() => {
                    const targetPath = `/${wrongPortalModal.detectedRole!.toLowerCase()}/login`;
                    setWrongPortalModal({ show: false, message: '' });
                    onNavigate(targetPath);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Switch to {wrongPortalModal.detectedRole} Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  setWrongPortalModal({ show: false, message: '' });
                  onNavigate('/login');
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Back to Portal Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="w-full max-w-lg">
        {/* Portal Breadcrumb / Back button */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onNavigate('/login')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>← Choose another Portal</span>
          </button>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Dedicated Role Workspace
          </span>
        </div>

        <div className={`rounded-2xl bg-gradient-to-b ${config.bgHighlight} border ${config.borderHighlight} p-6 sm:p-8 shadow-2xl`}>
          {/* Card Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-white">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{config.title}</h1>
                <p className="text-xs text-slate-400 mt-0.5">{config.tagline}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {config.badgeText}
            </span>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {role === 'FARMER' ? 'Mobile Number or Email' : 'Institutional Email Address'}
              </label>
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder={role === 'FARMER' ? '+91 98450 12345 or farmer@cultivai.demo' : config.demoEmail}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate(config.forgotPath)}
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-2"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            {/* Quick Demo Credentials Auto-Fill Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={fillDemo}
                className="w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fill 1-Click Demo Credentials ({config.demoEmail})</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${config.btnClass} ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In to {config.roleDisplay} Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration for Farmers */}
          {config.allowRegister && (
            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <span className="text-xs text-slate-400">Are you a new farmer? </span>
              <button
                onClick={() => onNavigate(config.registerPath)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2"
              >
                Create Farmer Account
              </button>
            </div>
          )}

          {/* Institutional note for expert/officer/admin */}
          {!config.allowRegister && (
            <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-400">
              <span>{config.hintText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
