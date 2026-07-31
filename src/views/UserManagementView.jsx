import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AddTechnicianModal } from '../components/AddTechnicianModal';
import { Users, UserPlus, Lock, Unlock, Search } from 'lucide-react';

export function UserManagementView() {
  const { users, departments, categories, toggleUserStatus, assignSupervisorToCategory, currentUser } = useApp();

  const isSupervisor = currentUser.role === 'supervisor';
  const supervisorCategory = isSupervisor ? (currentUser.assignedCategory || 'Electrical') : null;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  let filteredUsers = [...users];

  if (isSupervisor) {
    filteredUsers = filteredUsers.filter(u =>
      u.role === 'technician' && (
        u.departmentName?.toLowerCase().includes(supervisorCategory.toLowerCase()) ||
        u.department?.toLowerCase().includes(supervisorCategory.toLowerCase())
      )
    );
  }

  if (search) {
    const q = search.toLowerCase();
    filteredUsers = filteredUsers.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) || 
      u.role.toLowerCase().includes(q)
    );
  }

  if (roleFilter !== 'all') {
    filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
  }

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    const deptObj = departments.find(d => d.id === departmentId);
    const supervisorDeptObj = categories.find(c => c.name.toLowerCase() === supervisorCategory?.toLowerCase());

    addUserByAdmin({
      name,
      email,
      role: isSupervisor ? 'technician' : role,
      departmentId: isSupervisor ? (supervisorDeptObj?.departmentId || 'dept-1') : departmentId,
      departmentName: isSupervisor ? `${supervisorCategory} Department` : (deptObj?.name || 'General'),
      phone: phone || '+91 98000 00000',
    });

    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="clean-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> {isSupervisor ? `Manage ${supervisorCategory} Technicians` : 'User & Supervisor Category Governance'}
          </h2>
          <p className="text-xs text-slate-500">
            {isSupervisor
              ? `Department Jurisdiction: Manage field technicians assigned to ${supervisorCategory}`
              : 'Manage account permissions and assign Category Jurisdiction to Supervisors'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> {isSupervisor ? 'Add Technician' : 'Add System User'}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="clean-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search users by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl light-input text-xs"
          />
        </div>

        {!isSupervisor && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-bold text-slate-500 uppercase">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl light-input text-xs"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="technician">Technician</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Department / Assigned Category</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Account Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200" />
                    <div>
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </div>
                  </td>
                  <td className="p-4 uppercase font-extrabold text-[11px]">
                    <span className={`px-2.5 py-1 rounded-full border ${
                      u.role === 'admin' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      u.role === 'supervisor' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      u.role === 'technician' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {u.role === 'admin' ? 'Admin' : u.role === 'supervisor' ? 'Supervisor' : u.role === 'technician' ? 'Technician' : u.role}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    {u.role === 'supervisor' ? (
                      <div className="flex items-center gap-1.5">
                        {!isSupervisor ? (
                          <select
                            value={u.assignedCategory || (categories.length > 0 ? categories[0].name : 'Electrical')}
                            onChange={(e) => assignSupervisorToCategory(u.id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-900 text-xs font-black focus:bg-white"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.name}>{c.name} Category</option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-bold text-indigo-800">{u.assignedCategory || supervisorCategory}</span>
                        )}
                      </div>
                    ) : (
                      u.departmentName || u.department || 'N/A'
                    )}
                  </td>
                  <td className="p-4 text-slate-600 font-mono text-[11px]">{u.phone}</td>
                  <td className="p-4">
                    {u.isDeactivated ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                        Deactivated
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ml-auto transition ${
                        u.isDeactivated
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                      }`}
                    >
                      {u.isDeactivated ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      {u.isDeactivated ? 'Activate' : 'Deactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Add Technician / User Modal */}
      <AddTechnicianModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
