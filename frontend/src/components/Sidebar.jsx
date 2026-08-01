import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Wrench, BarChart3, Users, ShieldAlert, Settings, PlusCircle,
  Ticket, Tag, Zap, LogOut, FolderPlus, X, User as UserIcon
} from 'lucide-react';

export function Sidebar({ onOpenCreateModal, onLogout, isOpenMobile, onCloseMobile }) {
  const { currentUser, complaints } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const role = currentUser.role;
  const supervisorCategory = currentUser.assignedCategory || 'Electrical';

  const technicianQueueCount = complaints.filter(c => c.assignedTo?.id === currentUser.id && c.status !== 'completed').length;
  const adminPendingCount = complaints.filter(c => c.status !== 'completed').length;
  const supervisorPendingCount = complaints.filter(c => c.category?.toLowerCase() === supervisorCategory.toLowerCase() && c.status !== 'completed').length;
  const userOpenCount = complaints.filter(c => c.createdBy?.id === currentUser.id && c.status !== 'completed').length;

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    if (onCloseMobile) onCloseMobile();
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const renderNavContent = () => (
    <>
      {/* Sidebar Header Brand Logo */}
      <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-50">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">Complaint Portal</h1>
            <p className="text-[10px] text-slate-500 font-semibold">Facility Management System</p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Body */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Section: Main Navigation */}
        <div className="space-y-1.5">
          <div className="px-3 text-[10px] font-black tracking-wider text-slate-400 uppercase font-mono">
            Navigation Menu
          </div>

          <nav className="space-y-1">
            {/* User Links */}
            {role === 'user' && (
              <>
                <NavLink
                  to="/user"
                  end
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    My Complaints Portal
                  </div>
                  {userOpenCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                      {userOpenCount}
                    </span>
                  )}
                </NavLink>

                {onOpenCreateModal && (
                  <button
                    onClick={() => {
                      onOpenCreateModal();
                      handleLinkClick();
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 hover:opacity-95 transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Raise New Complaint
                  </button>
                )}
              </>
            )}

            {/* Technician Workstation Links */}
            {role === 'technician' && (
              <NavLink
                to="/technician"
                end
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Wrench className="w-4 h-4 text-amber-600" />
                      Work Order Queue
                    </div>
                    {technicianQueueCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {technicianQueueCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )}

            {/* Supervisor & Admin Options */}
            {(role === 'supervisor' || role === 'admin') && (
              <>
                <NavLink
                  to={role === 'admin' ? '/admin' : '/supervisor'}
                  end
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <LayoutDashboard className="w-4 h-4" />
                        {role === 'supervisor' ? `${supervisorCategory} Workstation` : 'Master Dashboard'}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {role === 'supervisor' ? supervisorPendingCount : adminPendingCount}
                      </span>
                    </>
                  )}
                </NavLink>

                {/* Manage Users */}
                <NavLink
                  to={role === 'admin' ? '/admin/users' : '/supervisor/users'}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    {role === 'supervisor' ? 'Manage Technicians' : 'Manage Users & Roles'}
                  </div>
                </NavLink>

                {/* Categories & Departments (Admin only) */}
                {role === 'admin' && (
                  <NavLink
                    to="/admin/categories"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                      `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderPlus className="w-4 h-4 text-indigo-600" />
                      Categories & Departments
                    </div>
                  </NavLink>
                )}

                {/* Issue Dropdown Templates */}
                <NavLink
                  to={role === 'admin' ? '/admin/issue-presets' : '/supervisor/issue-presets'}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4 text-indigo-600" />
                    Issue Dropdown Templates
                  </div>
                </NavLink>

                {/* Analytics & Reports */}
                <NavLink
                  to={role === 'admin' ? '/admin/analytics' : '/supervisor/analytics'}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    Analytics & Reports
                  </div>
                </NavLink>

                {/* Audit Security Logs */}
                <NavLink
                  to={role === 'admin' ? '/admin/audit-logs' : '/supervisor/audit-logs'}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Audit Security Logs
                  </div>
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer User Profile */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-200"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-extrabold text-slate-900 truncate">{currentUser.name}</div>
            <div className="text-[10px] text-slate-500 font-semibold truncate capitalize">
              {role === 'supervisor' ? `${supervisorCategory} Supervisor` : role}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogoutClick}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on md screens and up) */}
      <aside className="w-64 shrink-0 hidden md:flex flex-col bg-white text-slate-900 border-r border-slate-200/80 min-h-screen z-40 select-none shadow-xs">
        {renderNavContent()}
      </aside>

      {/* Mobile Sliding Overlay Drawer (visible on mobile when toggled) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Mobile Drawer Panel */}
          <aside className="relative w-72 max-w-[85vw] bg-white text-slate-900 h-full flex flex-col shadow-2xl z-10 overflow-hidden">
            {renderNavContent()}
          </aside>
        </div>
      )}
    </>
  );
}
