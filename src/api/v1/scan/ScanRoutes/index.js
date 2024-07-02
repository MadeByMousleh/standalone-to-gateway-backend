import express from "express";
import { ScanForBleDevices } from '../ScanController/index.js';

const scanRouter = express.Router();

scanRouter.get('/', ScanForBleDevices);


export default scanRouter;