import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FolderPlus, Shield, PlusCircle, CheckCircle2, UserCheck } from 'lucide-react';

export function CategoryManagerView() {
  const { categories, users, addCategory, assignSupervisorToCategory } = useApp();

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Get all supervisor user accounts
  const supervisors = users.filter(u => u.role === 'supervisor');

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatDesc.trim());
    setNewCatName('');
    setNewCatDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="clean-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-wider mb-1">
            <FolderPlus className="w-4 h-4" /> Category & Department Management
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Category / Department & Supervisor Governance
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add new institutional complaint categories (departments) and assign category supervisors
          </p>
        </div>
      </div>

      {/* Add New Category Form */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-blue-600" />
          Create New Category / Department
        </h3>

        <form onSubmit={handleAddCategorySubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category / Department Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Carpentry & Furniture Maintenance"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl light-input text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category Description
              </label>
              <input
                type="text"
                placeholder="e.g. Handles wooden fixtures, desks, door locks, and furniture repairs"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl light-input text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add Category / Department
            </button>
          </div>
        </form>
      </div>

      {/* Category / Department Roster with Assigned Supervisor Controls */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Active Categories & Assigned Supervisors ({categories.length})
          </h3>
          <span className="text-xs text-slate-400 font-semibold">Each category maps to a department jurisdiction</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const assignedSupervisor = supervisors.find(
              s => s.assignedCategory?.toLowerCase() === cat.name.toLowerCase()
            );

            return (
              <div key={cat.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 hover:bg-slate-100/70 transition">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{cat.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider border border-indigo-200/60">
                    Dept ID: {cat.departmentId}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-700">Supervisor:</span>
                    {assignedSupervisor ? (
                      <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {assignedSupervisor.name}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Unassigned
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <select
                      value={assignedSupervisor?.id || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          assignSupervisorToCategory(e.target.value, cat.name);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:border-indigo-600"
                    >
                      <option value="">-- Assign Supervisor --</option>
                      {supervisors.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.assignedCategory || 'Unassigned'})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
