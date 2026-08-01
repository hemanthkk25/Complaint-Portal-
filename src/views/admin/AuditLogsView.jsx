import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Search, Terminal } from 'lucide-react';

export function AuditLogsView() {
  const { auditLogs, currentUser, users } = useApp();
  const [search, setSearch] = useState('');

  const isSupervisor = currentUser.role === 'supervisor';
  const supervisorCategory = isSupervisor ? (currentUser.assignedCategory || 'Electrical') : null;

  // Filter technician IDs belonging to supervisor category
  const supervisorTechNames = users
    .filter(u => u.role === 'technician' && (
      u.departmentName?.toLowerCase().includes(supervisorCategory?.toLowerCase()) ||
      u.department?.toLowerCase().includes(supervisorCategory?.toLowerCase())
    ))
    .map(u => u.name.toLowerCase());

  let filteredLogs = [...auditLogs];

  if (isSupervisor) {
    filteredLogs = filteredLogs.filter(l =>
      l.details.toLowerCase().includes(supervisorCategory.toLowerCase()) ||
      supervisorTechNames.some(techName => l.userName.toLowerCase().includes(techName) || l.details.toLowerCase().includes(techName)) ||
      l.action.toLowerCase().includes('staff') ||
      l.action.toLowerCase().includes('status') ||
      l.action.toLowerCase().includes('preset')
    );
  }

  if (search) {
    const q = search.toLowerCase();
    filteredLogs = filteredLogs.filter(l =>
      l.action.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.ipAddress.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            {isSupervisor ? `${supervisorCategory} Department Security & Action Logs` : 'Security Audit & Traceability Logs'}
          </h2>
          <p className="text-xs text-slate-500">
            {isSupervisor
              ? `Chronological audit stream of technician dispatches, ticket updates, and actions for ${supervisorCategory}`
              : 'Immutable chronological record of logins, priority overrides, reassignments, and user modifications'}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter audit log by action, user, or IP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl light-input text-xs"
        />
      </div>

      {/* Terminal Audit Log Table */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 overflow-hidden font-mono shadow-xl">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Terminal className="w-4 h-4 text-emerald-400" />
            System Audit Stream (audit_logs collection)
          </div>
          <span className="text-[10px] text-slate-400">{filteredLogs.length} total events logged</span>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-[11px] text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action Event</th>
                <th className="p-3">Actor / User</th>
                <th className="p-3">Audit Details</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/60 transition">
                  <td className="p-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                  </td>
                  <td className="p-3 whitespace-nowrap font-bold text-emerald-400">
                    {log.action}
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-200">
                    {log.userName} <span className="text-[9px] text-slate-400 uppercase">({log.userRole})</span>
                  </td>
                  <td className="p-3 text-slate-300">
                    {log.details}
                  </td>
                  <td className="p-3 text-slate-400 whitespace-nowrap font-mono text-[10px]">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
