import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldAlert, ArrowRightLeft } from 'lucide-react';

export function ReassignModal({ isOpen, onClose, complaint }) {
  const { users, reassignStaffManually } = useApp();
  const [selectedStaffId, setSelectedStaffId] = useState('');

  if (!isOpen || !complaint) return null;

  const staffMembers = users.filter(u => u.role === 'staff');

  const handleReassign = (e) => {
    e.preventDefault();
    if (!selectedStaffId) return;

    reassignStaffManually(complaint.id, selectedStaffId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">Manual Staff Reassignment</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleReassign} className="p-6 space-y-4">
          <div>
            <p className="text-xs text-slate-700 mb-1">
              Ticket: <strong className="text-blue-600">#{complaint.ticketId}</strong>
            </p>
            <p className="text-xs text-slate-500">
              Current Staff: <strong className="text-slate-900">{complaint.assignedTo?.name || 'Unassigned'}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select New Staff Member
            </label>
            <select
              required
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl light-input text-xs"
            >
              <option value="" className="text-slate-400">Select Staff Member...</option>
              {staffMembers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.departmentName || s.department || 'Maintenance'})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            Admin override will update the ticket log and send a notification to the newly assigned staff member.
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedStaffId}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow disabled:opacity-50"
            >
              Confirm Reassignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
