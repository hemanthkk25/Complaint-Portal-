import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  complaintId: { type: String, required: true },
  oldStatus: { type: String, default: null },
  newStatus: { type: String, required: true },
  changedBy: { type: String, default: 'System' },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
}, { timestamps: true });

export const StatusHistory = mongoose.model('StatusHistory', statusHistorySchema);
