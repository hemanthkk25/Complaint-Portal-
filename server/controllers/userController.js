import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { memoryStore, isDbConnected } from '../config/memoryStore.js';

export async function getUsers(req, res) {
  try {
    if (isDbConnected()) {
      const users = await User.find().sort({ createdAt: -1 });
      return res.json({ success: true, users });
    }
    res.json({ success: true, users: memoryStore.users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createUser(req, res) {
  try {
    const userData = req.body;
    if (!userData.phone || !userData.phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone contact number is required.' });
    }

    const userId = `usr-${Date.now()}`;

    const newUser = {
      id: userId,
      name: userData.name,
      email: userData.email,
      password: userData.password || 'password123',
      role: userData.role || 'user',
      departmentId: userData.departmentId || null,
      departmentName: userData.departmentName || null,
      department: userData.department || userData.departmentName || null,
      assignedCategory: userData.assignedCategory || null,
      phone: userData.phone.trim(),
      avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23475569'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E",
      isDeactivated: false,
    };

    if (isDbConnected()) {
      await new User(newUser).save();
    } else {
      memoryStore.users.push(newUser);
    }

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    let user = null;

    if (isDbConnected()) {
      user = await User.findOne({ id });
      if (user) {
        user.isDeactivated = !user.isDeactivated;
        await user.save();
      }
    } else {
      user = memoryStore.users.find(u => u.id === id);
      if (user) {
        user.isDeactivated = !user.isDeactivated;
      }
    }

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function assignSupervisorCategory(req, res) {
  try {
    const { id } = req.params;
    const { categoryName } = req.body;

    let user = null;
    if (isDbConnected()) {
      user = await User.findOne({ id });
      if (user) {
        user.assignedCategory = categoryName;
        user.departmentName = `${categoryName} Department`;
        user.department = `${categoryName} Department`;
        await user.save();
      }
    } else {
      user = memoryStore.users.find(u => u.id === id);
      if (user) {
        user.assignedCategory = categoryName;
        user.departmentName = `${categoryName} Department`;
        user.department = `${categoryName} Department`;
      }
    }

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
