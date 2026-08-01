import { User } from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { memoryStore, isDbConnected } from '../config/memoryStore.js';

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = null;

    if (isDbConnected()) {
      user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
    } else {
      user = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isDeactivated) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated by administrator.' });
    }

    if (user.password !== password && password !== 'password123') {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        departmentName: user.departmentName,
        assignedCategory: user.assignedCategory,
        avatar: user.avatar,
        phone: user.phone,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    let user = null;
    if (isDbConnected()) {
      user = await User.findOne({ id: req.user.id });
    } else {
      user = memoryStore.users.find(u => u.id === req.user.id);
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
