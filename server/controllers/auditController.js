import { AuditLog } from '../models/AuditLog.js';
import { memoryStore, isDbConnected } from '../config/memoryStore.js';

export async function getAuditLogs(req, res) {
  try {
    if (isDbConnected()) {
      const auditLogs = await AuditLog.find().sort({ timestamp: -1 });
      return res.json({ success: true, auditLogs });
    }
    res.json({ success: true, auditLogs: memoryStore.auditLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
