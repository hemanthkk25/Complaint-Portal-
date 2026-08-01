import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Plus, Trash2, FolderPlus, Layers } from 'lucide-react';

export function SuperAdminConfigView() {
  const { categories, departments, setCategories, logAuditEvent } = useApp();

  const [newCatName, setNewCatName] = useState('');
  const [newCatDeptId, setNewCatDeptId] = useState(departments[0]?.id || '');
  const [newCatPriority, setNewCatPriority] = useState('medium');

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName) return;

    const newCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName,
      departmentId: newCatDeptId,
      basePriority: newCatPriority,
      icon: 'Zap',
    };

    setCategories(prev => [...prev, newCategory]);
    logAuditEvent('SUPER_ADMIN_ADD_CATEGORY', `Created new complaint category: ${newCatName}`, 'Category', newCategory.id);

    setNewCatName('');
  };

  const handleDeleteCategory = (catId, catName) => {
    if (confirm(`Are you sure you want to delete category '${catName}'?`)) {
      setCategories(prev => prev.filter(c => c.id !== catId));
      logAuditEvent('SUPER_ADMIN_DELETE_CATEGORY', `Deleted category '${catName}'`, 'Category', catId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-rose-600" />
          Super Admin Master Configuration
        </h2>
        <p className="text-xs text-slate-500">Exclusive Super Admin rights: Category management, department mappings, and rule table thresholds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Category Form */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-blue-600" />
            Add New Complaint Category
          </h3>

          <form onSubmit={handleAddCategory} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Elevators & Lifts"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl light-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mapped Department</label>
              <select
                value={newCatDeptId}
                onChange={(e) => setNewCatDeptId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl light-input text-xs"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Base Priority Weight</label>
              <select
                value={newCatPriority}
                onChange={(e) => setNewCatPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl light-input text-xs"
              >
                <option value="low">Low (+10 pts)</option>
                <option value="medium">Medium (+25 pts)</option>
                <option value="high">High (+40 pts)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Save New Category
            </button>
          </form>
        </div>

        {/* Existing Categories Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Configured System Categories ({categories.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Department Mapping</th>
                  <th className="p-3">Base Priority Weight</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => {
                  const dept = departments.find(d => d.id === c.departmentId);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3 text-slate-600 font-semibold">{dept ? dept.name : 'Maintenance'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-blue-700 border border-slate-200">
                          {c.basePriority}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
