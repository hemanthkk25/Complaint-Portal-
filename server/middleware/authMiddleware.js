import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'complaint_portal_secret_key_2026';

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Optional auth - fallback to request headers or mock user if passed
    req.user = req.headers['x-user-id'] ? { id: req.headers['x-user-id'], role: req.headers['x-user-role'] || 'user' } : null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
