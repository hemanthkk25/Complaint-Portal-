import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { Ticket, PlusCircle, Clock, CheckCircle2, AlertOctagon, Filter, ArrowRight, MapPin, Sparkles, Search } from 'lucide-react';

export function UserDashboard({ onOpenCreateModal, onSelectComplaint, searchQuery }) {
  const { currentUser, complaints } = useApp();

  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  let userComplaints = complaints.filter(c => c.createdBy?.id === currentUser.id);

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    userComplaints = userComplaints.filter(c =>
      c.ticketId.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.location?.room?.toLowerCase().includes(query)
    );
  }

  if (statusFilter !== 'all') {
    userComplaints = userComplaints.filter(c => c.status === statusFilter);
  }

  if (priorityFilter !== 'all') {
    userComplaints = userComplaints.filter(c => c.priority === priorityFilter);
  }

  const totalCount = userComplaints.length;
  const pendingCount = userComplaints.filter(c => c.status !== 'completed').length;
  const completedCount = userComplaints.filter(c => c.status === 'completed').length;
  const highPriorityCount = userComplaints.filter(c => c.priority === 'high').length;

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> User Portal Workspace
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Welcome back, {currentUser.name}! 👋
          </h2>
          <p className="text-xs text-blue-100/80 max-w-lg">
            Track your open maintenance requests, submit new complaints, and inspect resolution progress in real-time.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-blue-700 font-extrabold text-xs shadow-md flex items-center gap-2 transition duration-200"
        >
          <PlusCircle className="w-4 h-4 text-blue-600" />
          Raise New Complaint
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clean-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Complaints</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCount}</h3>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Ticket className="w-5 h-5" />
          </div>
        </div>

        <div className="clean-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Resolution</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="clean-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved & Closed</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{completedCount}</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="clean-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">High Priority Flagged</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">{highPriorityCount}</h3>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Segment Toolbar */}
      <div className="clean-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" /> Filter Status:
          </span>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({totalCount})
          </button>

          <button
            onClick={() => setStatusFilter('submitted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'submitted'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Submitted
          </button>

          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'in_progress'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            In Progress
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Priority Filter Dropdown */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg clean-input text-xs font-semibold"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      {/* Complaints List */}
      {userComplaints.length === 0 ? (
        <div className="clean-card p-12 text-center space-y-3">
          <Ticket className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No complaint tickets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">You haven't submitted any complaints matching the selected filter criteria.</p>
          <button
            onClick={onOpenCreateModal}
            className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm"
          >
            Raise New Complaint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userComplaints.map((complaint) => {
            const borderAccent =
              complaint.priority === 'high' ? 'border-l-4 border-l-rose-500' :
              complaint.priority === 'medium' ? 'border-l-4 border-l-amber-500' :
              'border-l-4 border-l-emerald-500';

            return (
              <div
                key={complaint.id}
                onClick={() => onSelectComplaint(complaint)}
                className={`clean-card clean-card-hover ${borderAccent} p-5 cursor-pointer flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      #{complaint.ticketId}
                    </span>
                    <div className="flex items-center gap-2">
                      <PriorityBadge
                        priority={complaint.priority}
                        reason={complaint.priorityReason}
                        score={complaint.priorityScore}
                      />
                      <StatusBadge status={complaint.status} />
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{complaint.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{complaint.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{complaint.location.block} • <strong>{complaint.location.room}</strong></span>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700">
                    Track Progress <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
