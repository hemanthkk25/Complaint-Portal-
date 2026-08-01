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
  avatar: { type: String, default: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23475569'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E" },
  activeTicketsCount: { type: Number, default: 0 },
  rating: { type: Number, default: 4.8 },
  ratingsCount: { type: Number, default: 10 },
  isDeactivated: { type: Boolean, default: false },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
