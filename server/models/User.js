import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'technician', 'supervisor', 'admin', 'staff'], 
    default: 'user' 
  },
  departmentId: { type: String, default: null },
  departmentName: { type: String, default: null },
  department: { type: String, default: null },
  assignedCategory: { type: String, default: null },
  phone: { type: String, default: '+91 99887 76655' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  activeTicketsCount: { type: Number, default: 0 },
  rating: { type: Number, default: 4.8 },
  ratingsCount: { type: Number, default: 10 },
  isDeactivated: { type: Boolean, default: false },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
