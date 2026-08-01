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
      phone: userData.phone || '+91 99887 76655',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
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
