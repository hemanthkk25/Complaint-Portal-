import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export function FeedbackModal({ isOpen, onClose, complaint }) {
  const { submitFeedback } = useApp();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen || !complaint) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    submitFeedback(complaint.id, rating, comment);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">Module 11: Rate Resolution Quality</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center">
            <p className="text-xs text-slate-700">
              Ticket <strong className="text-blue-600">#{complaint.ticketId}</strong> has been resolved by{' '}
              <strong className="text-emerald-700">{complaint.assignedTo?.name || 'Staff'}</strong>.
            </p>
            <p className="text-xs text-slate-500 mt-1">Please rate your satisfaction with the service provided.</p>

            <div className="flex justify-center items-center gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs font-bold text-amber-600 mt-1">
              {rating === 5 && 'Outstanding Excellent Service!'}
              {rating === 4 && 'Good Resolution'}
              {rating === 3 && 'Satisfactory Work'}
              {rating === 2 && 'Needs Improvement'}
              {rating === 1 && 'Unsatisfactory'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              Feedback Comment (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Share details about the repair quality or staff behavior..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl light-input text-xs leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Skip
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
