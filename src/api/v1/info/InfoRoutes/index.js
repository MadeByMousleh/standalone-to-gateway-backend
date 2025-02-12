import express from 'express';
import { daliCommission, get102PowerOnEndpoint, getAmountOf102Devices, getLuminariesInfo } from './LuminaryInfo/LuminaryInfoController.js';

const router = express.Router();


router.post('/:mac/luminaries/commission', daliCommission)

router.get('/:mac/luminaries/count', getAmountOf102Devices)

router.get('/:mac/luminaries/info', getLuminariesInfo)

router.get('/:mac/luminary/powerOn/:shortAddress', get102PowerOnEndpoint)



export default router;


