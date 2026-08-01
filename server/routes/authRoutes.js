import express from 'express';
import { loginUser, getMe } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/me', authMiddleware, getMe);

export default router;
