import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { exportToCSV, printPDFReport } from '../utils/exportUtils';
import {
  Download, Printer, Filter, Clock, CheckCircle2, AlertOctagon, Ticket
} from 'lucide-react';

export function AdminDashboard({ onSelectComplaint, searchQuery }) {
  const { complaints, categories } = useApp();

  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
  const highPriorityCount = complaints.filter(c => c.priority === 'high').length;

  const handleExportCSV = () => {
    exportToCSV(filteredComplaints, `admin_complaint_report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handlePrintPDF = () => {
    printPDFReport(filteredComplaints, {
      total: totalCount,
      pending: pendingCount,
      completed: completedCount,
      avgResolutionTime: '14.5 Hours',
    });
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Complaints</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCount}</h3>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Resolution</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Completed</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical / High Priority</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{highPriorityCount}</h3>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Controls Bar & Module 13 Report Exports */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-700 uppercase">Filters:</span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl light-input"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
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
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl light-input"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Module 13 Report Exports */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Export CSV
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Module 13: Printable PDF Report
          </button>
        </div>
      </div>

      {/* Master Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Ticket ID</th>
                <th className="p-4">Title & Location</th>
                <th className="p-4">Category</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assigned Staff</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    No complaints match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      #{c.ticketId}
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{c.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {c.location.block} • {c.location.room}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">{c.category}</td>
                    <td className="p-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} reason={c.priorityReason} score={c.priorityScore} />
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="p-4 whitespace-nowrap font-semibold">
                      {c.assignedTo ? (
                        <span className="text-slate-900">{c.assignedTo.name}</span>
                      ) : (
                        <span className="text-rose-600 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectComplaint(c)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs transition"
                      >
                        Inspect Ticket
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
