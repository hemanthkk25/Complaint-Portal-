import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Tag, PlusCircle, X, ShieldCheck } from 'lucide-react';

export function IssuePresetsView() {
  const { categories, predefinedIssues, addPredefinedIssue, removePredefinedIssue, currentUser } = useApp();

  const isSupervisor = currentUser.role === 'supervisor';
  const supervisorCategory = isSupervisor ? (currentUser.assignedCategory || 'Electrical') : null;

  const [selectedCategory, setSelectedCategory] = useState(supervisorCategory || categories[0]?.name || 'Electrical');
  const [newPresetText, setNewPresetText] = useState('');

  const activeCategory = isSupervisor ? supervisorCategory : selectedCategory;
  const currentPresets = predefinedIssues[activeCategory] || [];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newPresetText.trim()) return;
    addPredefinedIssue(activeCategory, newPresetText.trim());
    setNewPresetText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="clean-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-wider mb-1">
            <Tag className="w-4 h-4" /> Category Dropdown Presets
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {isSupervisor ? `${supervisorCategory} Issue Dropdown Templates` : 'Master Issue Dropdown Templates'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure predefined complaint selection options for users to select during ticket creation
          </p>
        </div>

        {!isSupervisor && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2 rounded-xl light-input text-xs font-bold text-slate-900"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name} Category</option>
              ))}
            </select>
          </div>
        )}

        {isSupervisor && (
          <span className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-black text-xs border border-indigo-200">
            Jurisdiction: {supervisorCategory}
          </span>
        )}
      </div>

      {/* Add New Issue Preset Form */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-blue-600" />
          Add Predefined Issue Dropdown Option ({activeCategory})
        </h3>

        <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder={`Enter standard issue title for ${activeCategory} (e.g. Smart Meter Breaker Spark)...`}
            value={newPresetText}
            onChange={(e) => setNewPresetText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl light-input text-xs font-medium"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Add Preset Option
          </button>
        </form>
      </div>

      {/* Current Presets Grid */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Active Dropdown Presets for {activeCategory} ({currentPresets.length})
          </h3>
          <span className="text-xs text-slate-400 font-semibold">Users select these during ticket creation</span>
        </div>

        {currentPresets.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500">No predefined issue presets configured for {activeCategory} yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentPresets.map((preset, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    #{idx + 1}
                  </span>
                  <span className="truncate">{preset}</span>
                </div>

                <button
                  type="button"
                  onClick={() => removePredefinedIssue(activeCategory, preset)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Remove Preset Option"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
