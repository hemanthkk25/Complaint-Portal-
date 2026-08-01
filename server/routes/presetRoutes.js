import express from 'express';
import { getPresets, addPreset, removePreset } from '../controllers/presetController.js';

const router = express.Router();

router.get('/', getPresets);
router.post('/', addPreset);
router.delete('/', removePreset);

export default router;
