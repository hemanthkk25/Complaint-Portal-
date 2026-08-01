import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  departmentId: { type: String, required: true },
  basePriority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  icon: { type: String, default: 'Zap' },
}, { timestamps: true });

export const Category = mongoose.model('Category', categorySchema);
