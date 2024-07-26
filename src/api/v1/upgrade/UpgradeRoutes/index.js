import express from "express";
import { upgradeFirmware } from "../UpgradeController/index.js";

const upgradeRouter = express.Router();

upgradeRouter.post('/', upgradeFirmware);


export default upgradeRouter;