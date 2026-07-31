import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

export function AnalyticsView() {
  const { complaints, categories } = useApp();

  const total = complaints.length;
  const pending = complaints.filter(c => c.status !== 'completed').length;
  const completed = complaints.filter(c => c.status === 'completed').length;

  const categoryData = categories.map(cat => {
    const count = complaints.filter(c => c.category.toLowerCase() === cat.name.toLowerCase()).length;
    return {
      name: cat.name,
      count,
    };
  });

  const priorityCounts = {
    high: complaints.filter(c => c.priority === 'high').length,
    medium: complaints.filter(c => c.priority === 'medium').length,
    low: complaints.filter(c => c.priority === 'low').length,
  };

  const pieData = [
    { name: 'High Priority', value: priorityCounts.high, color: '#e11d48' },
    { name: 'Medium Priority', value: priorityCounts.medium, color: '#d97706' },
    { name: 'Low Priority', value: priorityCounts.low, color: '#16a34a' },
  ];

  const trendData = [
    { day: 'Mon', submitted: 4, resolved: 3 },
    { day: 'Tue', submitted: 6, resolved: 5 },
    { day: 'Wed', submitted: 8, resolved: 6 },
    { day: 'Thu', submitted: 5, resolved: 7 },
    { day: 'Fri', submitted: 9, resolved: 8 },
    { day: 'Sat', submitted: 3, resolved: 4 },
    { day: 'Sun', submitted: 2, resolved: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          Module 9: Real-Time Analytics Dashboard
        </h2>
        <p className="text-xs text-slate-500">Database Aggregation Queries (Deterministic Aggregates - No Predictive AI)</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Total Tickets Logged</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{total}</div>
          <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-bold">
            <TrendingUp className="w-3 h-3" /> +14% vs last week
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Pending Resolution</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{pending}</div>
          <div className="text-[10px] text-amber-700 mt-1 font-semibold">Active staff workload</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Successfully Closed</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{completed}</div>
          <div className="text-[10px] text-emerald-700 mt-1 font-bold">{((completed / (total || 1)) * 100).toFixed(0)}% resolution rate</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase">Avg Resolution Time</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">14.2 Hours</div>
          <div className="text-[10px] text-indigo-700 mt-1 font-semibold">Target SLA &lt; 24h</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Complaints Volume by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Rule-Based Priority Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend formatter={(value) => <span className="text-xs text-slate-700 font-bold">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Trend Line Chart */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900">7-Day Complaint Velocity & Resolution Velocity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="submitted" stroke="#d97706" strokeWidth={3} name="Tickets Submitted" />
                <Line type="monotone" dataKey="resolved" stroke="#16a34a" strokeWidth={3} name="Tickets Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
