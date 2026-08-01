import React from 'react';
import { Clock, UserCheck, Wrench, CheckCircle2, Calendar, User } from 'lucide-react';

export function TimelineStepper({ complaint, statusHistory = [], auditLogs = [] }) {
  const steps = [
    { key: 'submitted', label: 'Submitted', icon: Clock },
    { key: 'assigned', label: 'Assigned', icon: UserCheck },
    { key: 'in_progress', label: 'In Progress', icon: Wrench },
    { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

  const statusOrder = ['submitted', 'assigned', 'in_progress', 'completed'];
  const currentIndex = statusOrder.indexOf(complaint.status);

  // Combine status history & audit logs matching this ticket
  const statusItems = (statusHistory || []).filter(h => h.complaintId === complaint.id || h.complaintId === complaint.ticketId);
  const auditItems = (auditLogs || [])
    .filter(l => l.targetId === complaint.id || (l.details && (l.details.includes(complaint.ticketId) || l.details.includes(complaint.id))))
    .map(l => ({
      id: l.id,
      complaintId: complaint.id,
      notes: `${l.action.replace(/_/g, ' ')}: ${l.details}`,
      changedBy: `${l.userName} (${l.userRole})`,
      timestamp: l.timestamp,
    }));

  const rawHistory = [...statusItems, ...auditItems];
  if (rawHistory.length === 0) {
    rawHistory.push({
      id: `default-creation-${complaint.id}`,
      complaintId: complaint.id,
      notes: `Ticket #${complaint.ticketId} registered with ${complaint.priority.toUpperCase()} priority`,
      changedBy: `${complaint.createdBy?.name || 'User'} (User)`,
      timestamp: complaint.createdAt || new Date().toISOString(),
    });
    if (complaint.assignedTo?.name) {
      rawHistory.push({
        id: `default-assignment-${complaint.id}`,
        complaintId: complaint.id,
        notes: `Workorder assigned to technician ${complaint.assignedTo.name}`,
        changedBy: `System Dispatcher`,
        timestamp: complaint.updatedAt || complaint.createdAt || new Date().toISOString(),
      });
    }
  }

  // Remove duplicates by ID and sort descending
  const ticketHistory = Array.from(new Map(rawHistory.map(item => [item.id, item])).values())
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="space-y-6">
      {/* Visual Stepper */}
      <div className="relative flex items-center justify-between w-full py-4 px-2">
        {/* Background Track */}
        <div className="absolute top-1/2 left-6 right-6 h-1.5 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />

        {/* Active Track */}
        <div
          className="absolute top-1/2 left-6 h-1.5 stepper-line-active -translate-y-1/2 z-0 rounded-full transition-all duration-500"
          style={{
            width: currentIndex >= 0 ? `${(currentIndex / (steps.length - 1)) * 90}%` : '0%',
          }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = currentIndex >= idx;
          const isCurrent = currentIndex === idx;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-md shadow-blue-500/20 ring-4 ring-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                } ${isCurrent ? 'scale-110 ring-4 ring-blue-500/30' : ''}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`mt-2 text-xs font-bold ${
                  isDone ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Track Progress & Action Audit History */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          Track Progress & Action Audit History
        </h4>

        {ticketHistory.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No transition history logged yet.</p>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-2 pl-4 space-y-4">
            {ticketHistory.map((item) => (
              <div key={item.id} className="relative text-xs">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900">{item.notes}</span>
                  <span className="text-[10px] text-slate-500 ml-2 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {item.changedBy}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
