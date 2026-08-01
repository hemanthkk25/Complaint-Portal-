import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, X, Lock, Shield } from 'lucide-react';

export function AddTechnicianModal({ isOpen, onClose }) {
  const { users, departments, categories, addUserByAdmin, currentUser } = useApp();

  const isSupervisor = currentUser.role === 'supervisor';
  const supervisorCategory = isSupervisor ? (currentUser.assignedCategory || 'Electrical') : null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('technician');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [phone, setPhone] = useState('');

  const [selectedAssignedCategory, setSelectedAssignedCategory] = useState(categories[0]?.name || 'Electrical');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const isTechOrSupervisor = isSupervisor || role === 'technician' || role === 'supervisor';

    addUserByAdmin({
      name: name.trim(),
      email: email.trim(),
      role: isSupervisor ? 'technician' : role,
      assignedCategory: isSupervisor ? supervisorCategory : (role === 'supervisor' ? selectedAssignedCategory : null),
      departmentId: isTechOrSupervisor ? (isSupervisor ? (supervisorDeptObj?.departmentId || 'dept-1') : (role === 'supervisor' ? (supervisorDeptObj?.departmentId || 'dept-1') : departmentId)) : null,
      departmentName: isTechOrSupervisor ? (isSupervisor ? `${supervisorCategory} Department` : (role === 'supervisor' ? `${selectedAssignedCategory} Department` : (deptObj?.name || 'Maintenance'))) : null,
      phone: phone.trim() || '+91 98000 88888',
    });

    setName('');
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 my-8">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            {isSupervisor ? `Add New ${supervisorCategory} Technician` : 'Create Portal Account'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sanjay Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl light-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder={isSupervisor ? `sanjay.kumar@technician.portal.edu` : 'e.g. arjun@portal.edu'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl light-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Contact</label>
            <input
              type="text"
              placeholder="+91 98000 88888"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl light-input text-xs"
            />
          </div>

          <div className={isSupervisor || role === 'technician' || role === 'supervisor' ? "grid grid-cols-2 gap-3" : "grid grid-cols-1"}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Role Jurisdiction</label>
              {isSupervisor ? (
                <div className="w-full px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold flex items-center justify-between">
                  <span>Field Technician</span>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                </div>
              ) : (
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl light-input text-xs font-semibold"
                >
                  <option value="user">User</option>
                  <option value="technician">Technician</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              )}
            </div>

            {(isSupervisor || role === 'technician' || role === 'supervisor') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {!isSupervisor && role === 'supervisor' ? 'Assigned Category' : 'Department'}
                </label>
                {isSupervisor ? (
                  <div className="w-full px-3 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-extrabold flex items-center justify-between truncate">
                    <span className="truncate">{supervisorCategory} Dept</span>
                    <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  </div>
                ) : role === 'supervisor' ? (
                  <select
                    value={selectedAssignedCategory}
                    onChange={(e) => setSelectedAssignedCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 font-extrabold text-indigo-950 text-xs"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name} Category</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl light-input text-xs"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition"
            >
              Save Technician
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
