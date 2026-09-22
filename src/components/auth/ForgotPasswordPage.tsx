import React, { useState } from 'react';
import { UserRole } from '../../types';
import { KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  role: UserRole;
  onNavigateLogin: () => void;
}

export const ForgotPasswordPage: React.FC<Props> = ({ role, onNavigateLogin }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const roleName = {
    FARMER: 'Farmer',
    EXPERT: 'Plant Pathologist',
    OFFICER: 'Agriculture Officer',
    ADMIN: 'Administrator',
  }[role];

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <button
            onClick={onNavigateLogin}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>← Back to {roleName} Login</span>
          </button>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Password Recovery</h1>
              <p className="text-xs text-slate-400">{roleName} Portal Access</p>
            </div>
          </div>

          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                If an account with <strong className="text-white">{email}</strong> exists, a temporary password reset code has been sent.
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                (For demo purposes, you can still sign in with password: <code className="text-emerald-400">cultivai2026</code>)
              </p>
              <button
                onClick={onNavigateLogin}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Enter your registered email address or mobile number. We will send a secure verification token to reset your password.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@cultivai.demo"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Send Password Reset Instructions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
