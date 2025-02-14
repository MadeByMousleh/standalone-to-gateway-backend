import express from 'express';
import { TurnLightOnOrOff } from './ControlsController.js';
import { assignLuminaryToZone, turnLightOff, turnOnLight } from './luminaryControl/LuminaryController.js';

const router = express.Router();


router.post('/:mac', turnLightOff);

router.post('/:mac/on', turnOnLight);


router.post('/:mac/zone/luminary', assignLuminaryToZone);


export default router;