import express from 'express';
import { getUsers, createUser, toggleUserStatus, assignSupervisorCategory } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id/toggle-status', toggleUserStatus);
router.patch('/:id/assign-category', assignSupervisorCategory);

export default router;
