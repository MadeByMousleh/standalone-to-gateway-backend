import express from 'express';
import { TurnLightOnOrOff } from './ControlsController.js';
import { turnLightOff } from './luminaryControl/LuminaryController.js';

const router = express.Router();

router.get('/:mac', TurnLightOnOrOff)
router.post('/:mac', turnLightOff);

export default router;