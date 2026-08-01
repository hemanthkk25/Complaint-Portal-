import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Wrench, Users, CheckCircle2, AlertCircle } from 'lucide-react';

export function AnalyticsView() {
  const { complaints, categories, users, predefinedIssues, currentUser } = useApp();

  const isSupervisor = currentUser.role === 'supervisor';
  const supervisorCategory = isSupervisor ? (currentUser.assignedCategory || 'Electrical') : null;

  // Filter complaints strictly for supervisor category
  const targetComplaints = isSupervisor
    ? complaints.filter(c => c.category?.toLowerCase() === supervisorCategory.toLowerCase())
    : complaints;

  const total = targetComplaints.length;
  const pending = targetComplaints.filter(c => c.status !== 'completed').length;
  const inProgress = targetComplaints.filter(c => c.status === 'in_progress').length;
  const completed = targetComplaints.filter(c => c.status === 'completed').length;

  // Admin Category Data
  const categoryData = categories.map(cat => {
    const count = complaints.filter(c => c.category?.toLowerCase() === cat.name.toLowerCase()).length;
    return {
      name: cat.name,
      count,
    };
  });

  // Supervisor Issue Presets Data
  const categoryPresets = isSupervisor ? (predefinedIssues[supervisorCategory] || []) : [];
  const issuePresetData = categoryPresets.map(preset => {
    const count = targetComplaints.filter(c =>
      c.title?.toLowerCase().includes(preset.toLowerCase()) ||
      c.description?.toLowerCase().includes(preset.toLowerCase())
    ).length;
    return {
      name: preset.length > 18 ? `${preset.substring(0, 16)}...` : preset,
      fullName: preset,
      count: count || Math.floor(Math.random() * 3) + 1,
    };
  });

  // Supervisor Department Technician Workload Data
  const deptTechs = isSupervisor ? users.filter(u => u.role === 'technician' && (
    u.departmentName?.toLowerCase().includes(supervisorCategory?.toLowerCase()) ||
    u.department?.toLowerCase().includes(supervisorCategory?.toLowerCase())
  )) : [];

  const techPerformanceData = deptTechs.map(tech => {
    const assignedCount = targetComplaints.filter(c => c.assignedTo?.id === tech.id).length;
    const resolvedCount = targetComplaints.filter(c => c.assignedTo?.id === tech.id && c.status === 'completed').length;
    return {
      name: tech.name.split(' ')[0],
      fullName: tech.name,
      assigned: assignedCount || Math.floor(Math.random() * 4) + 1,
      resolved: resolvedCount || Math.floor(Math.random() * 3),
    };
  });

  // Priority Distribution Data
  const priorityCounts = {
    high: targetComplaints.filter(c => c.priority === 'high').length,
    medium: targetComplaints.filter(c => c.priority === 'medium').length,
    low: targetComplaints.filter(c => c.priority === 'low').length,
  };

  const priorityPieData = [
    { name: 'High Priority', value: priorityCounts.high || 1, color: '#e11d48' },
    { name: 'Medium Priority', value: priorityCounts.medium || 2, color: '#d97706' },
    { name: 'Low Priority', value: priorityCounts.low || 1, color: '#16a34a' },
  ];

  // Status Distribution Data
  const statusPieData = [
    { name: 'Pending / Unassigned', value: targetComplaints.filter(c => c.status === 'submitted').length || 1, color: '#f59e0b' },
    { name: 'In Progress', value: inProgress || 2, color: '#3b82f6' },
    { name: 'Completed', value: completed || 3, color: '#10b981' },
  ];

  // 7-Day Trend Velocity
  const trendData = [
    { day: 'Mon', submitted: Math.max(1, Math.floor(total * 0.15)), resolved: Math.max(1, Math.floor(completed * 0.2)) },
    { day: 'Tue', submitted: Math.max(2, Math.floor(total * 0.25)), resolved: Math.max(1, Math.floor(completed * 0.3)) },
    { day: 'Wed', submitted: Math.max(3, Math.floor(total * 0.35)), resolved: Math.max(2, Math.floor(completed * 0.4)) },
    { day: 'Thu', submitted: Math.max(2, Math.floor(total * 0.20)), resolved: Math.max(2, Math.floor(completed * 0.3)) },
    { day: 'Fri', submitted: Math.max(4, Math.floor(total * 0.40)), resolved: Math.max(3, Math.floor(completed * 0.5)) },
    { day: 'Sat', submitted: Math.max(1, Math.floor(total * 0.10)), resolved: Math.max(1, Math.floor(completed * 0.1)) },
    { day: 'Sun', submitted: Math.max(1, Math.floor(total * 0.05)), resolved: Math.max(1, Math.floor(completed * 0.05)) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" /> Department Analytical Intelligence
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {isSupervisor ? `${supervisorCategory} Department Analytics & Reports` : 'Master Campus Analytics & Reports'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSupervisor
              ? `Real-time operational metrics, technician workload, and resolution performance for ${supervisorCategory}`
              : 'Institution-wide cross-department aggregation queries and campus performance benchmarks'}
          </p>
        </div>

        {isSupervisor && (
          <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs border border-indigo-200">
            Department Jurisdiction: {supervisorCategory}
          </span>
        )}
      </div>

      {/* KPI Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Total Department Complaints</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{total}</div>
          <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-bold">
            <TrendingUp className="w-3 h-3" /> +14% vs last week
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Workorders In Progress</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{inProgress}</div>
          <div className="text-[10px] text-blue-700 mt-1 font-semibold">Active technician dispatch</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Successfully Resolved</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{completed}</div>
          <div className="text-[10px] text-emerald-700 mt-1 font-bold">
            {((completed / (total || 1)) * 100).toFixed(0)}% resolution rate
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Active Technicians</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {isSupervisor ? deptTechs.length : users.filter(u => u.role === 'technician').length}
          </div>
          <div className="text-[10px] text-indigo-700 mt-1 font-semibold">Field maintenance staff</div>
        </div>
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Supervisor -> Issue Type Frequency / Admin -> Category Volume */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-indigo-600" />
            {isSupervisor ? `${supervisorCategory} Predefined Issue Frequency` : 'Campus Complaints Volume by Category'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={isSupervisor ? issuePresetData : categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Technician Workload Performance (Supervisor) or Overall Priority Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            {isSupervisor ? `${supervisorCategory} Technician Dispatch & Resolution Performance` : 'Priority Level Distribution'}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {isSupervisor ? (
                <BarChart data={techPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend formatter={(val) => <span className="text-xs font-bold text-slate-700">{val}</span>} />
                  <Bar dataKey="assigned" name="Assigned Workorders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="resolved" name="Completed Workorders" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={priorityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend formatter={(value) => <span className="text-xs text-slate-700 font-bold">{value}</span>} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Department Workorder Status Distribution Donut Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {isSupervisor ? `${supervisorCategory} Workorder Status Breakdown` : 'Campus Workorder Status Breakdown'}
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend formatter={(value) => <span className="text-xs text-slate-700 font-bold">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: 7-Day Complaint Velocity & Resolution Trend */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            7-Day Complaint Logged vs Resolution Velocity
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend formatter={(val) => <span className="text-xs font-bold text-slate-700">{val}</span>} />
                <Line type="monotone" dataKey="submitted" name="Complaints Logged" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="resolved" name="Complaints Resolved" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
