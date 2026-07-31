import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Wrench, BarChart3, Users, ShieldAlert, Settings, PlusCircle, Ticket, CheckCircle2, Shield
} from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab, onOpenCreateModal }) {
  const { currentUser, complaints } = useApp();

  const role = currentUser.role;

  const userOpenTickets = complaints.filter(c => c.createdBy?.id === currentUser.id && c.status !== 'completed').length;
  const staffAssignedCount = complaints.filter(c => c.assignedTo?.id === currentUser.id && c.status !== 'completed').length;
  const adminPendingCount = complaints.filter(c => c.status !== 'completed').length;

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block">
      <div className="sticky top-20 space-y-5 p-4 rounded-2xl premium-card shadow-sm">
        {/* Quick Action Button for User */}
        {role === 'user' && (
          <button
            onClick={onOpenCreateModal}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            Raise New Complaint
          </button>
        )}

        {/* Menu Navigation Group */}
        <nav className="space-y-1.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1">
            Navigation Menu
          </div>

          {/* User View Options */}
          {role === 'user' && (
            <button
              onClick={() => setActiveTab('my_complaints')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'my_complaints'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Ticket className="w-4 h-4" />
                My Complaints
              </div>
              {userOpenTickets > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'my_complaints' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                }`}>
                  {userOpenTickets}
                </span>
              )}
            </button>
          )}

          {/* Staff Workstation Options */}
          {role === 'staff' && (
            <button
              onClick={() => setActiveTab('staff_queue')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'staff_queue'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4" />
                Work Order Queue
              </div>
              {staffAssignedCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'staff_queue' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-100 text-amber-800'
                }`}>
                  {staffAssignedCount}
                </span>
              )}
            </button>
          )}

          {/* Admin & Super Admin Options */}
          {(role === 'admin' || role === 'superadmin') && (
            <>
              <button
                onClick={() => setActiveTab('admin_master')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'admin_master'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  Master Complaints
                </div>
                {adminPendingCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    activeTab === 'admin_master' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {adminPendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  Module 9: Analytics
                </div>
              </button>

              <button
                onClick={() => setActiveTab('user_mgmt')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'user_mgmt'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  Manage Users & Staff
                </div>
              </button>

              <button
                onClick={() => setActiveTab('audit_logs')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'audit_logs'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Module 14: Audit Logs
                </div>
              </button>
            </>
          )}

          {role === 'superadmin' && (
            <button
              onClick={() => setActiveTab('super_config')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'super_config'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-rose-600" />
                Super Admin Config
              </div>
            </button>
          )}
        </nav>

        {/* SLA & Rule Info Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> SLA Target: &lt; 24h
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Deterministic rule engines compute priority score & auto-balance workload per department.
          </p>
        </div>
      </div>
    </aside>
  );
}
