import express from 'express';
import {
  getComplaints,
  createComplaint,
  checkDuplicatesHandler,
  updateStatus,
  reassignTechnician,
  addFeedback
} from '../controllers/complaintController.js';

const router = express.Router();

router.get('/', getComplaints);
router.post('/', createComplaint);
router.post('/check-duplicates', checkDuplicatesHandler);
router.patch('/:id/status', updateStatus);
router.patch('/:id/reassign', reassignTechnician);
router.post('/:id/feedback', addFeedback);

export default router;
