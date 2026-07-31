import React from 'react';
import { Clock, UserCheck, Wrench, CheckCircle2, RotateCcw } from 'lucide-react';

export function StatusBadge({ status }) {
  const configs = {
    submitted: {
      label: 'Submitted',
      bg: 'bg-sky-50 text-sky-700 border-sky-200',
      icon: Clock,
    },
    assigned: {
      label: 'Assigned',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: UserCheck,
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: Wrench,
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
    },
    reopened: {
      label: 'Reopened',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: RotateCcw,
    },
  };

  const config = configs[status] || configs.submitted;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
