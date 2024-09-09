import express from "express";
import { UpgradeSSEStatus, upgradeSensor } from "../UpgradeController/index.js";

const upgradeRouter = express.Router();

upgradeRouter.post('/', upgradeSensor);
upgradeRouter.get('/sse/status', UpgradeSSEStatus);


export default upgradeRouter;