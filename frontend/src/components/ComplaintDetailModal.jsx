import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { TimelineStepper } from './TimelineStepper';
import { BeforeAfterViewer } from './BeforeAfterViewer';
import { ReassignModal } from './ReassignModal';
import { FeedbackModal } from './FeedbackModal';
import {
  X, MapPin, User, Calendar, ShieldAlert, ArrowRightLeft,
  Wrench, CheckCircle2, Star, Upload, Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function ComplaintDetailModal({ complaint, isOpen, onClose }) {
  const { currentUser, updateComplaintStatus, statusHistory, auditLogs } = useApp();

  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  if (!isOpen || !complaint) return null;

  const isStaff = currentUser.role === 'technician';
  const isAdmin = currentUser.role === 'supervisor' || currentUser.role === 'admin';
  const isCreator = currentUser.id === complaint.createdBy?.id;

  const handleBeforePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBeforeFile(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAfterPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAfterFile(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMarkInProgress = () => {
    updateComplaintStatus(complaint.id, 'in_progress', {
      beforeImageUrl: beforeFile || complaint.beforeImageUrl,
      notes: 'Staff marked ticket In Progress' + (beforeFile ? ' with Before-Repair photo' : ''),
    });
    onClose();
  };

  const handleMarkCompleted = () => {
    if (!afterFile && !complaint.afterImageUrl) {
      alert('Module 8 Requirement: You must upload an After-Repair photo before marking a ticket Completed!');
      return;
    }

    updateComplaintStatus(complaint.id, 'completed', {
      afterImageUrl: afterFile || complaint.afterImageUrl,
      notes: 'Staff marked ticket Completed. ' + (resolutionNotes ? `Resolution Notes: ${resolutionNotes}` : ''),
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                #{complaint.ticketId}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge
                priority={complaint.priority}
                reason={complaint.priorityReason}
                score={complaint.priorityScore}
              />
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Title & Meta Info */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 leading-snug">{complaint.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>{complaint.location.block} • {complaint.location.floor} • <strong>{complaint.location.room}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Raised by: <strong className="text-slate-900">{complaint.createdBy.name}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{new Date(complaint.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">{complaint.description}</p>
            </div>

            {/* Rule Engine Priority Rationale Box */}
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                Rule-Based Priority Score Details
              </div>
              <p className="text-indigo-950 leading-relaxed">{complaint.priorityReason}</p>
            </div>

            {/* Timeline & Track Progress */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Ticket Timeline & Track Progress</h4>
              <TimelineStepper complaint={complaint} statusHistory={statusHistory} auditLogs={auditLogs} />
            </div>

            {/* Before & After Proof */}
            <BeforeAfterViewer
              beforeImageUrl={beforeFile || complaint.beforeImageUrl || (complaint.attachments && complaint.attachments.length > 0 ? complaint.attachments[0] : null)}
              afterImageUrl={afterFile || complaint.afterImageUrl}
            />

            {/* Staff Work Actions Box */}
            {isStaff && complaint.status !== 'completed' && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-blue-200 space-y-4 shadow-sm">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Staff Resolution Control Panel
                </h4>

                {/* Stage 1: Mark In Progress */}
                {complaint.status === 'assigned' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-700">Upload optional Before-Repair inspection image before starting work:</p>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-800 border border-slate-300 flex items-center gap-2 shadow-sm">
                        <ImageIcon className="w-4 h-4 text-amber-600" />
                        Select Before Image
                        <input type="file" accept="image/*" onChange={handleBeforePhotoChange} className="hidden" />
                      </label>
                      {beforeFile && <span className="text-xs text-emerald-700 font-bold">✓ Image Selected</span>}
                    </div>
                    <button
                      onClick={handleMarkInProgress}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md"
                    >
                      Start Repair Work (Mark In Progress)
                    </button>
                  </div>
                )}

                {/* Stage 2: Upload After Photo & Complete */}
                {complaint.status === 'in_progress' && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-rose-600">
                      * Module 8 Requirement: Upload mandatory After-Repair image to mark completed.
                    </p>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 border border-emerald-300 flex items-center gap-2 shadow-sm">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        Upload After-Repair Proof Image *
                        <input type="file" accept="image/*" onChange={handleAfterPhotoChange} className="hidden" />
                      </label>
                      {(afterFile || complaint.afterImageUrl) && (
                        <span className="text-xs text-emerald-700 font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Proof Attached
                        </span>
                      )}
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Add brief resolution summary notes..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl light-input text-xs"
                    />

                    <button
                      onClick={handleMarkCompleted}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Submit After-Repair Proof & Mark Completed
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Rating & Feedback Section (Completed Tickets) */}
            {complaint.status === 'completed' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    Module 11: User Rating & Feedback
                  </h4>
                  {isCreator && !complaint.rating && (
                    <button
                      onClick={() => setIsFeedbackOpen(true)}
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow"
                    >
                      Leave Feedback
                    </button>
                  )}
                </div>

                {complaint.rating ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < complaint.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-900 ml-2">{complaint.rating} / 5 Stars</span>
                    </div>
                    {complaint.feedback && (
                      <p className="text-xs text-slate-700 italic">"{complaint.feedback}"</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No rating submitted yet.</p>
                )}
              </div>
            )}

            {/* Admin Override Action Bar */}
            {isAdmin && (
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs text-slate-600">
                  Assigned Staff: <strong className="text-slate-900">{complaint.assignedTo?.name || 'Unassigned'}</strong>
                </span>
                <button
                  onClick={() => setIsReassignOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Override Staff Assignment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <ReassignModal
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        complaint={complaint}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        complaint={complaint}
      />
    </>
  );
}
