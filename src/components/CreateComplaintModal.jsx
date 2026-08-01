import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_LOCATIONS } from '../data/mockData';
import { calculatePriority } from '../utils/ruleEngine';
import { X, Upload, Copy, Sparkles, ShieldAlert } from 'lucide-react';

export function CreateComplaintModal({ isOpen, onClose }) {
  const { categories, predefinedIssues, createComplaint, checkDuplicateComplaints } = useApp();

  const [category, setCategory] = useState(categories[0]?.name || 'Electrical');
  const [selectedIssuePreset, setSelectedIssuePreset] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [block, setBlock] = useState(INITIAL_LOCATIONS[0].block);
  const [floor, setFloor] = useState(INITIAL_LOCATIONS[0].floor);
  const [room, setRoom] = useState(INITIAL_LOCATIONS[0].rooms[0]);
  const [userUrgency, setUserUrgency] = useState('Standard');
  const [attachments, setAttachments] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [predictedPriority, setPredictedPriority] = useState({ priority: 'low', summary: '' });

  const selectedLoc = INITIAL_LOCATIONS.find(l => l.block === block && l.floor === floor) || INITIAL_LOCATIONS[0];
  const currentCategoryPresets = predefinedIssues[category] || [];

  // Update title & description when selecting predefined issue preset
  const handleIssuePresetChange = (preset) => {
    setSelectedIssuePreset(preset);
    if (preset && preset !== 'custom') {
      setTitle(preset);
      setDescription(`Standardized maintenance request for ${preset} at ${room}, ${block}.`);
    } else if (preset === 'custom') {
      setTitle('');
      setDescription('');
    }
  };

  useEffect(() => {
    if (title || description) {
      const pResult = calculatePriority(category, title, description, userUrgency);
      setPredictedPriority(pResult);

      const dupMatches = checkDuplicateComplaints({
        title,
        description,
        category,
        location: { block, floor, room },
      });
      setDuplicates(dupMatches);
    } else {
      setPredictedPriority({ priority: 'low', summary: 'Standard low base priority' });
      setDuplicates([]);
    }
  }, [title, description, category, block, floor, room, userUrgency]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (attachments.length + files.length > 3) {
      alert('Maximum 3 attachments allowed per complaint.');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill in both title and description.');
      return;
    }

    createComplaint({
      title,
      description,
      category,
      block,
      floor,
      room,
      userUrgency,
      attachments,
    });

    onClose();
    setTitle('');
    setDescription('');
    setAttachments([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Submit New Complaint</h3>
              <p className="text-xs text-slate-500">Automated Priority Scoring & Workload Auto-Assignment Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Module 10: Duplicate Complaint Alert Banner */}
          {duplicates.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                <Copy className="w-4 h-4 text-amber-600" />
                Module 10: Rule-Based Duplicate Complaint Alert!
              </div>
              <p className="text-xs text-slate-600">
                A similar open ticket already exists for this category and location:
              </p>
              {duplicates.map((dup, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-white border border-amber-200 text-xs flex justify-between items-center shadow-sm">
                  <div>
                    <span className="font-bold text-blue-600">#{dup.matchedTicket.ticketId}</span>: {dup.matchedTicket.title}
                    <div className="text-[10px] text-slate-500">{dup.reason}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    Similar Ticket
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Category & Predefined Issue Dropdown Preset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSelectedIssuePreset('');
                  setTitle('');
                  setDescription('');
                }}
                className="w-full px-4 py-2.5 rounded-xl light-input text-xs font-bold text-slate-900"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Predefined Issue Dropdown *
              </label>
              <select
                value={selectedIssuePreset}
                onChange={(e) => handleIssuePresetChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl light-input text-xs font-semibold text-blue-700 bg-blue-50/50 border border-blue-200"
              >
                <option value="">-- Choose Standardized Issue Dropdown --</option>
                {currentCategoryPresets.map((preset, idx) => (
                  <option key={idx} value={preset}>{preset}</option>
                ))}
                <option value="custom">✏️ Custom / Other Issue Title</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Complaint Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Electrical short circuit causing power cut in Room 204"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl light-input text-xs font-medium"
            />
          </div>

          {/* Urgency Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              User Urgency Selection *
            </label>
            <select
              value={userUrgency}
              onChange={(e) => setUserUrgency(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl light-input text-xs"
            >
              <option value="Standard">Standard / Routine</option>
              <option value="Urgent">Urgent (Requires Priority Score Boost)</option>
            </select>
          </div>

          {/* Module 3: Rule-Based Priority Prediction Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <div>
                <span className="text-xs font-bold text-slate-700">Computed Priority (Rule Engine): </span>
                <span className={`text-xs font-black uppercase ml-1 ${
                  predictedPriority.priority === 'high' ? 'text-rose-600' :
                  predictedPriority.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {predictedPriority.priority}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">Score: {predictedPriority.score || 0}</span>
          </div>

          {/* Location Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Block / Wing</label>
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                className="w-full px-3 py-2 rounded-lg light-input text-xs"
              >
                {[...new Set(INITIAL_LOCATIONS.map(l => l.block))].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Floor</label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg light-input text-xs"
              >
                {[...new Set(INITIAL_LOCATIONS.map(l => l.floor))].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Specific Room</label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg light-input text-xs"
              >
                {selectedLoc.rooms.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the issue in detail. Emergency keywords like 'leak', 'fire', 'short circuit' automatically compute High Priority..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl light-input text-xs leading-relaxed"
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Attach Images / Proof (Up to 3)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 flex items-center gap-2 transition">
                <Upload className="w-4 h-4 text-blue-600" />
                Upload Photo
                <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
              </label>
              <span className="text-xs text-slate-500">{attachments.length} / 3 attached</span>
            </div>

            {attachments.length > 0 && (
              <div className="flex gap-3 mt-3">
                {attachments.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                    <img src={img} alt="Attachment" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-0.5 right-0.5 bg-rose-600 text-white rounded-full p-0.5 text-[10px]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
