import express from 'express';
import { TurnLightOnOrOff } from './ControlsController.js';

const router = express.Router();

router.get('/:mac', TurnLightOnOrOff)


export default router;