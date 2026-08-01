import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  userId: { type: String, default: '' },
  userName: { type: String, default: 'System' },
  userRole: { type: String, default: 'system' },
  action: { type: String, required: true },
  details: { type: String, required: true },
  targetType: { type: String, default: 'General' },
  targetId: { type: String, default: '' },
  ipAddress: { type: String, default: '127.0.0.1' },
}, { timestamps: true });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
