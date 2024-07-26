import CassiaEndpoints from "../../../../thirdParty/cassia-rest-api/local/index.js";

import productNumberHelper from "../../../../../helpers/extractProductNrInfo.js";

import EventEmitter from "events";

import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Writable } from 'stream';
import { promisify } from 'util';
import { finished } from 'stream/promises';
import UpgradeService from "../../../../services/UpgradeService/index.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IP = "192.168.40.1";


const upgradeService = new UpgradeService();


export const upgradeFirmware = (request, response, next) => {

    const {macAddress, version} = request.body;

    upgradeService.start(macAddress);

    // console.log(macAddress, version);


};
