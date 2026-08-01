import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { AddTechnicianModal } from '../../components/AddTechnicianModal';
import { exportToCSV, printPDFReport } from '../../utils/exportUtils';
import {
  ShieldCheck, Users, Ticket, CheckCircle2, Download, Printer,
  Filter, FolderPlus, Wrench, AlertTriangle, ArrowRight, UserPlus, Eye
} from 'lucide-react';

export function AdminDashboard({ onSelectComplaint, searchQuery }) {
  const { complaints, categories, users } = useApp();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  let filteredComplaints = [...complaints];

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredComplaints = filteredComplaints.filter(c =>
      c.ticketId.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.createdBy?.name?.toLowerCase().includes(q) ||
      c.assignedTo?.name?.toLowerCase().includes(q) ||
      c.location?.room?.toLowerCase().includes(q)
    );
  }

  if (statusFilter !== 'all') {
    filteredComplaints = filteredComplaints.filter(c => c.status === statusFilter);
  }
  if (priorityFilter !== 'all') {
    filteredComplaints = filteredComplaints.filter(c => c.priority === priorityFilter);
  }
  if (categoryFilter !== 'all') {
    filteredComplaints = filteredComplaints.filter(c => c.category === categoryFilter);
  }

  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status !== 'completed').length;
  const completedCount = complaints.filter(c => c.status === 'completed').length;
  const supervisorCount = users.filter(u => u.role === 'supervisor').length;
  const technicianCount = users.filter(u => u.role === 'technician').length;

  const handleExportCSV = () => {
    exportToCSV(filteredComplaints, `campus_master_report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handlePrintPDF = () => {
    printPDFReport(filteredComplaints, {
      total: totalCount,
      pending: pendingCount,
      completed: completedCount,
      avgResolutionTime: '12.4 Hours',
    });
  };

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Action Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Executive Master Governance
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Campus Maintenance Control Console
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Institution-wide facility oversight, department category governance, supervisor assignments, and master ticket operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/admin/categories')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            + Add Department / Category
          </button>

          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 font-extrabold text-xs transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            + Add System User
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Campus Tickets</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCount}</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Logged across all departments</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Workorders</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</h3>
            <p className="text-[11px] text-amber-700/70 font-semibold mt-1">Pending dispatch & resolution</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved Tickets</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</h3>
            <p className="text-[11px] text-emerald-700/70 font-semibold mt-1">Closed successfully</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departments & Staff</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{categories.length} Depts</h3>
            <p className="text-[11px] text-indigo-700/70 font-semibold mt-1">
              {supervisorCount} Supervisors | {technicianCount} Techs
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Department Operational Overview Grid */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-indigo-600" />
              Department Operational Status Roster
            </h3>
            <p className="text-xs text-slate-500">Live operational status, supervisor assignments, and technician workforce per category</p>
          </div>
          <button
            onClick={() => navigate('/admin/categories')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
          >
            Manage Departments <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const catComplaints = complaints.filter(c => c.category?.toLowerCase() === cat.name.toLowerCase());
            const activeTickets = catComplaints.filter(c => c.status !== 'completed').length;
            const assignedSupervisor = users.find(u => u.role === 'supervisor' && u.assignedCategory?.toLowerCase() === cat.name.toLowerCase());
            const catTechs = users.filter(u => u.role === 'technician' && (
              u.departmentName?.toLowerCase().includes(cat.name.toLowerCase()) ||
              u.department?.toLowerCase().includes(cat.name.toLowerCase())
            ));

            return (
              <div key={cat.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3 hover:bg-slate-100/80 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{cat.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{cat.description || 'Facility Maintenance'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTickets > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                    {activeTickets} active
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Supervisor</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {assignedSupervisor ? assignedSupervisor.name : 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Workforce</span>
                    <span className="font-bold text-slate-800 block">
                      {catTechs.length} Technicians
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Master Ticket Control Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        {/* Filters Header */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-indigo-600" />
              Master Complaint Records ({filteredComplaints.length})
            </h3>
            <p className="text-xs text-slate-500">Institution-wide master ticket log with instant audit detail inspection</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl light-input text-xs font-semibold"
            >
              <option value="all">All Departments</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl light-input text-xs font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl light-input text-xs font-semibold"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Export Buttons */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
              title="Print PDF"
            >
              <Printer className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>

        {/* Master Ticket Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Ticket #</th>
                <th className="p-4">Department & Issue</th>
                <th className="p-4">Raised By / Location</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Assigned Technician</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No complaints matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-indigo-700">
                      #{c.ticketId}
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="font-extrabold text-slate-900 truncate">{c.title}</div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-block mt-0.5">
                        {c.category}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{c.createdBy?.name || 'Anonymous User'}</div>
                      <div className="text-[11px] text-slate-500 truncate">{c.location?.building} - {c.location?.room}</div>
                    </td>

                    <td className="p-4">
                      <PriorityBadge priority={c.priority} />
                    </td>

                    <td className="p-4">
                      {c.assignedTo?.name ? (
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <img src={c.assignedTo.avatar} alt={c.assignedTo.name} className="w-5 h-5 rounded-full object-cover" />
                          <span>{c.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => onSelectComplaint(c)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs transition flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Account Creation Modal */}
      <AddTechnicianModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      />
    </div>
  );
}
