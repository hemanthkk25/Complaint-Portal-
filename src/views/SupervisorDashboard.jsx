import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { AddTechnicianModal } from '../components/AddTechnicianModal';
import { exportToCSV, printPDFReport } from '../utils/exportUtils';
import {
  Wrench, Users, Clock, AlertTriangle, CheckCircle2, Ticket,
  UserCheck, ArrowRightLeft, Download, Printer, Filter, ShieldAlert,
  PlusCircle, Trash2, Tag, UserPlus, X
} from 'lucide-react';

export function SupervisorDashboard({ onSelectComplaint, searchQuery }) {
  const {
    complaints, users, categories, predefinedIssues,
    reassignStaffManually, currentUser
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modal state for Technician Management
  const [isAddTechModalOpen, setIsAddTechModalOpen] = useState(false);

  // Supervisor Jurisdiction Scope
  const supervisorCategory = currentUser.assignedCategory || 'Electrical';
  const supervisorDept = categories.find(c => c.name.toLowerCase() === supervisorCategory.toLowerCase());

  // Filter complaints STRICTLY belonging to this Supervisor's assigned Category
  let supervisorComplaints = complaints.filter(c =>
    c.category?.toLowerCase() === supervisorCategory.toLowerCase()
  );

  // Filter technicians belonging to this Supervisor's Department
  const staffMembers = users.filter(u =>
    u.role === 'technician' && !u.isDeactivated && (
      u.departmentName?.toLowerCase().includes(supervisorCategory.toLowerCase()) ||
      u.department?.toLowerCase().includes(supervisorCategory.toLowerCase()) ||
      u.assignedCategory?.toLowerCase() === supervisorCategory.toLowerCase() ||
      (supervisorDept && u.departmentId === supervisorDept.departmentId)
    )
  );

  let filteredComplaints = [...supervisorComplaints];

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

  const unassignedTickets = supervisorComplaints.filter(c => !c.assignedTo || !c.assignedTo.name);
  const pendingTickets = supervisorComplaints.filter(c => c.status !== 'completed');
  const inProgressTickets = supervisorComplaints.filter(c => c.status === 'in_progress');
  const criticalTickets = supervisorComplaints.filter(c => c.priority === 'high' && c.status !== 'completed');

  const handleQuickAssign = (complaintId, staffId) => {
    reassignStaffManually(complaintId, staffId);
  };

  const handleAddTechSubmit = (e) => {
    e.preventDefault();
    if (!techName || !techEmail) return;

    addUserByAdmin({
      name: techName,
      email: techEmail,
      role: 'technician',
      departmentId: selectedDeptId,
      departmentName: 'Electrical & Maintenance',
      phone: techPhone || '+1 (555) 000-1234',
    });

    setIsAddTechModalOpen(false);
    setTechName('');
    setTechEmail('');
    setTechPhone('');
  };

  const handleAddPresetSubmit = (e) => {
    e.preventDefault();
    if (!newPresetText.trim()) return;
    addPredefinedIssue(supervisorCategory, newPresetText.trim());
    setNewPresetText('');
  };

  const handleExportCSV = () => {
    exportToCSV(filteredComplaints, `supervisor_workstation_report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handlePrintPDF = () => {
    printPDFReport(filteredComplaints, {
      total: complaints.length,
      pending: pendingTickets.length,
      completed: complaints.length - pendingTickets.length,
      avgResolutionTime: '12.4 Hours',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-extrabold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" /> Operational Supervisor Workstation
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            {supervisorCategory} Department Workstation
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Isolated Category Scope: Managing <strong>{supervisorCategory}</strong> tickets, technician workload dispatch, and issue presets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddTechModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Technician
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold transition flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            CSV Export
          </button>
        </div>
      </div>

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unassigned Orders</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{unassignedTickets.length}</h3>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Work In Progress</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{inProgressTickets.length}</h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical SLA Tickets</p>
            <h3 className="text-2xl font-black text-indigo-600 mt-1">{criticalTickets.length}</h3>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Technicians</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{staffMembers.length}</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Wrench className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Roster & Quick Dispatch Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Department Technician Workload Roster & Management
            </h3>
            <p className="text-xs text-slate-500">Supervisors manage active technicians and dispatch workload</p>
          </div>
          <button
            onClick={() => setIsAddTechModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs transition flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Technician
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {staffMembers.map(staff => {
            const assignedCount = complaints.filter(c => c.assignedTo?.id === staff.id && c.status !== 'completed').length;
            return (
              <div key={staff.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src={staff.avatar} alt={staff.name} className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-200" />
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-slate-900 truncate">{staff.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{staff.departmentName || 'Technician'}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  assignedCount > 2 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {assignedCount} active
                </span>
              </div>
            );
          })}
        </div>
      </div>



      {/* Complaint Filters & Dispatch Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-slate-500" />
            <span>Filter Workstation Queue:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl light-input"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Unassigned / Submitted</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl light-input"
            >
              <option value="all">All Priorities</option>
              <option value="high">High / Critical</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Complaints List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Ticket</th>
                <th className="p-4">Title & Location</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assigned Technician Dispatch</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium text-xs">
                    No complaints matching current supervisor filter criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-slate-900 text-[11px]">
                      #{c.ticketId}
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-slate-900 text-xs line-clamp-1">{c.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {c.location?.block} • {c.location?.room}
                      </div>
                    </td>
                    <td className="p-4">
                      <PriorityBadge priority={c.priority} reason={c.priorityReason} score={c.priorityScore} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={c.assignedTo?.id || ''}
                          onChange={(e) => handleQuickAssign(c.id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600"
                        >
                          <option value="">-- Unassigned --</option>
                          {staffMembers.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.departmentName || 'Technician'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onSelectComplaint(c)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs transition"
                      >
                        Inspect & Direct
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Add Technician Modal */}
      <AddTechnicianModal
        isOpen={isAddTechModalOpen}
        onClose={() => setIsAddTechModalOpen(false)}
      />
    </div>
  );
}
