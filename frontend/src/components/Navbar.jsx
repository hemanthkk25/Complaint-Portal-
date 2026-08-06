import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { NotificationCenter } from './NotificationCenter';
import { Zap, Search, LogOut, Shield, Wrench, User, Menu } from 'lucide-react';

export function Navbar({ searchQuery, setSearchQuery, onLogout, onToggleMobileMenu }) {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  const getRoleHome = (role) => {
    switch (role) {
      case 'technician':
        return '/technician';
      case 'supervisor':
        return '/supervisor';
      case 'admin':
        return '/admin';
      default:
        return '/user';
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'System Admin', bg: 'bg-rose-50 text-rose-700 border-rose-200/90', icon: Shield };
      case 'supervisor':
        return { label: 'Supervisor Console', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/90', icon: Shield };
      case 'technician':
        return { label: 'Technician Workstation', bg: 'bg-amber-50 text-amber-800 border-amber-200/90', icon: Wrench };
      default:
        return { label: 'User Portal', bg: 'bg-blue-50 text-blue-700 border-blue-200/90', icon: User };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  const hasSidebar = currentUser?.role === 'admin' || currentUser?.role === 'supervisor';

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-3">
          {hasSidebar && (
            <button
              onClick={onToggleMobileMenu}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center md:hidden transition"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={getRoleHome(currentUser.role)} className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/25 ring-4 ring-blue-50">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base text-slate-900 tracking-tight">Complaint Portal</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-2xs ${roleInfo.bg}`}>
                  {roleInfo.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Institutional Maintenance Management System</p>
            </div>
          </Link>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-sm hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticket #, title, location..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100/70 hover:bg-slate-100 border border-slate-200/90 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition duration-200"
            />
          </div>
        </div>

        {/* Notifications & Profile Drawer */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <NotificationCenter />

          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200/80">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/30 shadow-2xs"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-extrabold text-slate-900 leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 font-semibold">{currentUser.departmentName || currentUser.department || 'Portal Account'}</div>
            </div>
          </div>

          {/* Logout Action Button */}
          <button
            onClick={handleLogoutClick}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-bold text-xs transition duration-200 shadow-2xs flex items-center gap-1.5"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
