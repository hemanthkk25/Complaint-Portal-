import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Wrench, CheckCircle2, Star, Clock, MapPin, ArrowRight } from 'lucide-react';

export function StaffDashboard({ onSelectComplaint, searchQuery }) {
  const { currentUser, complaints } = useApp();

  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'in_progress' | 'completed'

  let staffComplaints = complaints.filter(c => c.assignedTo?.id === currentUser.id);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    staffComplaints = staffComplaints.filter(c =>
      c.ticketId.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.location?.room?.toLowerCase().includes(q)
    );
  }

  const assignedList = staffComplaints.filter(c => c.status === 'assigned');
  const inProgressList = staffComplaints.filter(c => c.status === 'in_progress');
  const completedList = staffComplaints.filter(c => c.status === 'completed');

  const ratedComplaints = completedList.filter(c => c.rating);
  const avgRating = ratedComplaints.length > 0
    ? (ratedComplaints.reduce((acc, curr) => acc + curr.rating, 0) / ratedComplaints.length).toFixed(1)
    : '4.8';

  const currentDisplayList =
    activeTab === 'assigned' ? assignedList :
    activeTab === 'in_progress' ? inProgressList : completedList;

  return (
    <div className="space-y-6">
      {/* Staff Profile Banner */}
      <div className="clean-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-200 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Staff Technician
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Department: <strong className="text-slate-800">{currentUser.departmentName || currentUser.department || 'Maintenance'}</strong>
            </p>
          </div>
        </div>

        {/* Rating Score Card */}
        <div className="flex items-center gap-3.5 bg-slate-50 p-3 px-4 rounded-xl border border-slate-200">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rating Score</div>
            <div className="text-lg font-bold text-slate-900">{avgRating} / 5.0 ⭐</div>
            <div className="text-[10px] text-slate-500">{ratedComplaints.length} reviews</div>
          </div>
        </div>
      </div>

      {/* Work Order Stage Segmented Control */}
      <div className="clean-card p-1.5 flex gap-1.5 bg-slate-100/60">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'assigned'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          Assigned Queue ({assignedList.length})
        </button>

        <button
          onClick={() => setActiveTab('in_progress')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'in_progress'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4 text-blue-600" />
          In Progress ({inProgressList.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Completed ({completedList.length})
        </button>
      </div>

      {/* Task Grid */}
      {currentDisplayList.length === 0 ? (
        <div className="clean-card p-12 text-center">
          <Wrench className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No work orders in this queue</h3>
          <p className="text-xs text-slate-500 mt-1">You have no tickets currently under '{activeTab.replace('_', ' ')}'.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentDisplayList.map((complaint) => {
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                      #{complaint.ticketId}
                    </span>
                    <PriorityBadge
                      priority={complaint.priority}
                      reason={complaint.priorityReason}
                      score={complaint.priorityScore}
                    />
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{complaint.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{complaint.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 font-medium text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{complaint.location.block} • <strong>{complaint.location.room}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700">
                    Task Actions <ArrowRight className="w-3.5 h-3.5" />
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
