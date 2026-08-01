import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  block: { type: String, default: '' },
  floor: { type: String, default: '' },
  room: { type: String, default: '' },
  building: { type: String, default: '' },
}, { _id: false });

const createdBySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
}, { _id: false });

const assignedToSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  department: { type: String, default: '' },
  email: { type: String, default: '' },
  avatar: { type: String, default: '' },
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ticketId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  departmentId: { type: String, default: '' },
  location: locationSchema,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  priorityReason: { type: String, default: '' },
  priorityScore: { type: Number, default: 0 },
  status: { type: String, enum: ['submitted', 'assigned', 'in_progress', 'completed', 'closed'], default: 'submitted' },
  userUrgency: { type: String, default: 'Standard' },
  createdBy: createdBySchema,
  assignedTo: { type: assignedToSchema, default: null },
  attachments: [{ type: String }],
  beforeImageUrl: { type: String, default: null },
  afterImageUrl: { type: String, default: null },
  resolvedAt: { type: Date, default: null },
  rating: { type: Number, default: null },
  feedback: { type: String, default: null },
  duplicateOf: { type: String, default: null },
}, { timestamps: true });

export const Complaint = mongoose.model('Complaint', complaintSchema);
