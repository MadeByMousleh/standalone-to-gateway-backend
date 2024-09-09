import express from 'express';
import { connectionSSE } from '../SSEController/index.js';


const sseRouter = new express.Router();


sseRouter.get('/connection-status', connectionSSE)
sseRouter.get('/upgrade-status', connectionSSE)


export default sseRouter;