import express from 'express';
import { TurnLightOnOrOff } from './ControlsController.js';
import { assignLuminaryToZone, turnLightOff } from './luminaryControl/LuminaryController.js';

const router = express.Router();

router.get('/:mac', TurnLightOnOrOff)
router.post('/:mac', turnLightOff);

router.post('/:mac/zone/luminary', assignLuminaryToZone);


export default router;