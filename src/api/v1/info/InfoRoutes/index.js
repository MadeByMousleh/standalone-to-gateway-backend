import express from 'express';
import { getData } from '../../scan/ScanController/index.js';

const infoRouter = express.Router();


infoRouter.get('/:mac', getData)


export default infoRouter;