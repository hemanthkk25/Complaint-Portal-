import React from 'react';
import { AlertOctagon, AlertTriangle, ArrowDown } from 'lucide-react';

export function PriorityBadge({ priority, reason, score }) {
  const configs = {
    high: {
      label: 'HIGH PRIORITY',
      className: 'badge-priority-high font-bold',
      icon: AlertOctagon,
    },
    medium: {
      label: 'MEDIUM',
      className: 'badge-priority-medium font-semibold',
      icon: AlertTriangle,
    },
    low: {
      label: 'LOW',
      className: 'badge-priority-low font-semibold',
      icon: ArrowDown,
    },
  };

  const config = configs[priority] || configs.low;
  const Icon = config.icon;

  return (
    <div className="relative group inline-block">
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs tracking-wide border cursor-help shadow-sm ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
      {reason && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl z-50 pointer-events-none">
          <div className="font-semibold text-sky-400 mb-1 border-b border-slate-700 pb-1 flex justify-between">
            <span>Rule-Based Rationale</span>
            {score && <span>Score: {score}</span>}
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">{reason}</p>
        </div>
      )}
    </div>
  );
}
