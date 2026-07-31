import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Zap, Lock, Mail, ArrowRight } from 'lucide-react';

export function LoginView({ onLoginSuccess }) {
  const { loginUser } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('alex.johnson@user.portal.edu');
  const [password, setPassword] = useState('password123');
  const [errorMessage, setErrorMessage] = useState('');

  const redirectUser = (user) => {
    if (user.role === 'user') {
      navigate('/user');
    } else if (user.role === 'staff') {
      navigate('/staff');
    } else if (user.role === 'supervisor') {
      navigate('/supervisor');
    } else if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    const res = loginUser(email, password);
    if (res.success) {
      onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.message || 'Login failed.');
    }
  };

  const handleQuickDemoClick = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    const res = loginUser(demoEmail, 'password123');
    if (res.success) {
      onLoginSuccess(res.user);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-950 font-sans">
      {/* LEFT HALF: Perfectly Centered Brand Panel */}
      <div className="relative hidden lg:flex flex-col items-center justify-center p-16 bg-gradient-to-br from-blue-600 via-indigo-900 to-slate-950 text-white text-center overflow-hidden border-r border-indigo-900/40">
        {/* Subtle Ambient Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-md mx-auto flex flex-col items-center justify-center">
          {/* Centered Logo */}
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>

          {/* Centered Title & Short Content */}
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Complaint Portal
            </h1>
            <p className="text-base text-slate-300 font-normal leading-relaxed max-w-sm mx-auto">
              Institutional Complaint & Maintenance Management System. Log, track, and resolve maintenance requests efficiently.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT HALF: Clean Minimal Sign In Form */}
      <div className="bg-white flex flex-col justify-center p-6 sm:p-12 lg:p-16">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <h1 className="font-extrabold text-xl text-slate-900">Complaint Portal</h1>
        </div>

        <div className="max-w-md w-full mx-auto space-y-8">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign In
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Enter your institutional email address and password to access the portal.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@user.portal.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl clean-input text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl clean-input text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
              Institutional Demo Accounts
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoClick('alex.johnson@user.portal.edu')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-left font-medium transition"
              >
                <div className="font-bold text-slate-900 truncate">alex.johnson@user.portal.edu</div>
                <div className="text-[10px] text-slate-400">Alex Johnson (User)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoClick('marcus.vance@technician.portal.edu')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 text-left font-medium transition"
              >
                <div className="font-bold text-slate-900 truncate">marcus.vance@technician.portal.edu</div>
                <div className="text-[10px] text-slate-400">Marcus Vance (Technician)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoClick('robert.sterling@supervisor.portal.edu')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-left font-medium transition"
              >
                <div className="font-bold text-slate-900 truncate">robert.sterling@supervisor.portal.edu</div>
                <div className="text-[10px] text-slate-400">Robert Sterling (Electrical Supervisor)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoClick('sarah.jenkins@supervisor.portal.edu')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-left font-medium transition"
              >
                <div className="font-bold text-slate-900 truncate">sarah.jenkins@supervisor.portal.edu</div>
                <div className="text-[10px] text-slate-400">Sarah Jenkins (Plumbing Supervisor)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoClick('dr.evelyn@admin.portal.edu')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-left font-medium transition"
              >
                <div className="font-bold text-slate-900 truncate">dr.evelyn@admin.portal.edu</div>
                <div className="text-[10px] text-slate-400">Dr. Evelyn Vance (Admin)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
