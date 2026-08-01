import { Complaint } from '../models/Complaint.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';
import { StatusHistory } from '../models/StatusHistory.js';
import { AuditLog } from '../models/AuditLog.js';
import { memoryStore, isDbConnected } from '../config/memoryStore.js';
import { calculatePriority, findBestStaffAssignment, detectDuplicates } from '../utils/ruleEngine.js';

export async function getComplaints(req, res) {
  try {
    const { category, status, priority, userId, technicianId, search } = req.query;

    if (isDbConnected()) {
      const query = {};
      if (category && category !== 'all') query.category = new RegExp(category, 'i');
      if (status && status !== 'all') query.status = status;
      if (priority && priority !== 'all') query.priority = priority;
      if (userId) query['createdBy.id'] = userId;
      if (technicianId) query['assignedTo.id'] = technicianId;

      if (search) {
        const reg = new RegExp(search, 'i');
        query.$or = [
          { ticketId: reg },
          { title: reg },
          { description: reg },
          { 'location.room': reg },
          { 'location.block': reg },
        ];
      }

      const complaints = await Complaint.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, complaints });
    }

    // In-Memory Mode
    let list = [...memoryStore.complaints];
    if (category && category !== 'all') list = list.filter(c => c.category?.toLowerCase() === category.toLowerCase());
    if (status && status !== 'all') list = list.filter(c => c.status === status);
    if (priority && priority !== 'all') list = list.filter(c => c.priority === priority);
    if (userId) list = list.filter(c => c.createdBy?.id === userId);
    if (technicianId) list = list.filter(c => c.assignedTo?.id === technicianId);

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.ticketId.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.location?.room?.toLowerCase().includes(q) ||
        c.location?.block?.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, complaints: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function checkDuplicatesHandler(req, res) {
  try {
    const draftComplaint = req.body;
    let existingComplaints = [];

    if (isDbConnected()) {
      existingComplaints = await Complaint.find({ status: { $ne: 'completed' } });
    } else {
      existingComplaints = memoryStore.complaints.filter(c => c.status !== 'completed');
    }

    const duplicateMatches = detectDuplicates(draftComplaint, existingComplaints);
    res.json({ success: true, duplicates: duplicateMatches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createComplaint(req, res) {
  try {
    const { title, description, category, block, floor, room, userUrgency, attachments, createdBy } = req.body;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randId = Math.floor(100 + Math.random() * 900);
    const ticketId = `TICK-${dateStr}-${randId}`;
    const complaintId = `cmp-${Date.now()}`;

    // Module 3: Priority Engine
    const priorityResult = calculatePriority(category, title, description, userUrgency);

    let categoriesList = [];
    let usersList = [];
    let existingComplaints = [];

    if (isDbConnected()) {
      categoriesList = await Category.find();
      usersList = await User.find({ isDeactivated: false });
      existingComplaints = await Complaint.find({ status: { $ne: 'completed' } });
    } else {
      categoriesList = memoryStore.categories;
      usersList = memoryStore.users.filter(u => !u.isDeactivated);
      existingComplaints = memoryStore.complaints.filter(c => c.status !== 'completed');
    }

    const categoryObj = categoriesList.find(c => c.name.toLowerCase() === (category || '').toLowerCase()) || categoriesList[0] || { departmentId: 'dept-1', name: category };
    const assignedStaff = findBestStaffAssignment(categoryObj, usersList, existingComplaints);
    const initialStatus = assignedStaff ? 'assigned' : 'submitted';

    const complaintData = {
      id: complaintId,
      ticketId,
      title,
      description,
      category,
      departmentId: categoryObj.departmentId || 'dept-1',
      location: { block, floor, room },
      priority: priorityResult.priority,
      priorityReason: priorityResult.summary,
      priorityScore: priorityResult.score,
      status: initialStatus,
      userUrgency: userUrgency || 'Standard',
      createdBy: createdBy || { id: 'usr-1', name: 'User', email: 'user@portal.edu' },
      assignedTo: assignedStaff ? {
        id: assignedStaff.id,
        name: assignedStaff.name,
        email: assignedStaff.email,
        avatar: assignedStaff.avatar,
        department: assignedStaff.departmentName || assignedStaff.department || 'Maintenance',
      } : null,
      attachments: attachments || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isDbConnected()) {
      const newComplaint = new Complaint(complaintData);
      await newComplaint.save();
    } else {
      memoryStore.complaints.unshift(complaintData);
      memoryStore.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        timestamp: new Date(),
        userId: createdBy?.id || 'usr-1',
        userName: createdBy?.name || 'User',
        userRole: 'user',
        action: 'TICKET_CREATED',
        details: `Created complaint #${ticketId} in category ${category} at ${room}, ${block}`,
        targetType: 'Complaint',
        targetId: complaintId,
      });
    }

    res.status(201).json({ success: true, complaint: complaintData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { newStatus, note, afterImageUrl, changedBy } = req.body;

    let complaint = null;
    if (isDbConnected()) {
      complaint = await Complaint.findOne({ id });
      if (complaint) {
        complaint.status = newStatus;
        complaint.updatedAt = new Date();
        if (newStatus === 'completed') {
          complaint.resolvedAt = new Date();
          if (afterImageUrl) complaint.afterImageUrl = afterImageUrl;
        }
        await complaint.save();
      }
    } else {
      complaint = memoryStore.complaints.find(c => c.id === id);
      if (complaint) {
        complaint.status = newStatus;
        complaint.updatedAt = new Date();
        if (newStatus === 'completed') {
          complaint.resolvedAt = new Date();
          if (afterImageUrl) complaint.afterImageUrl = afterImageUrl;
        }
      }
    }

    if (!complaint) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function reassignTechnician(req, res) {
  try {
    const { id } = req.params;
    const { newStaffId, changedBy } = req.body;

    let complaint = null;
    let staffMember = null;

    if (isDbConnected()) {
      complaint = await Complaint.findOne({ id });
      if (!complaint) return res.status(404).json({ success: false, message: 'Ticket not found' });

      if (!newStaffId) {
        complaint.assignedTo = null;
        if (complaint.status === 'in_progress') complaint.status = 'submitted';
      } else {
        staffMember = await User.findOne({ id: newStaffId });
        if (staffMember) {
          complaint.assignedTo = {
            id: staffMember.id,
            name: staffMember.name,
            email: staffMember.email,
            avatar: staffMember.avatar,
            department: staffMember.departmentName || staffMember.department || 'Maintenance',
          };
          if (complaint.status === 'submitted') complaint.status = 'in_progress';
        }
      }
      complaint.updatedAt = new Date();
      await complaint.save();
    } else {
      complaint = memoryStore.complaints.find(c => c.id === id);
      if (!complaint) return res.status(404).json({ success: false, message: 'Ticket not found' });

      if (!newStaffId) {
        complaint.assignedTo = null;
        if (complaint.status === 'in_progress') complaint.status = 'submitted';
      } else {
        staffMember = memoryStore.users.find(u => u.id === newStaffId);
        if (staffMember) {
          complaint.assignedTo = {
            id: staffMember.id,
            name: staffMember.name,
            email: staffMember.email,
            avatar: staffMember.avatar,
            department: staffMember.departmentName || staffMember.department || 'Maintenance',
          };
          if (complaint.status === 'submitted') complaint.status = 'in_progress';
        }
      }
      complaint.updatedAt = new Date();
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function addFeedback(req, res) {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    let complaint = null;
    if (isDbConnected()) {
      complaint = await Complaint.findOne({ id });
      if (complaint) {
        complaint.rating = rating;
        complaint.feedback = feedback;
        await complaint.save();
      }
    } else {
      complaint = memoryStore.complaints.find(c => c.id === id);
      if (complaint) {
        complaint.rating = rating;
        complaint.feedback = feedback;
      }
    }

    if (!complaint) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
