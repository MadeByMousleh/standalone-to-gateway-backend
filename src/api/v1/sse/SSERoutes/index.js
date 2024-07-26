import express from 'express';
import { connectionSSE } from '../SSEController/index.js';


const sseRouter = new express.Router();


sseRouter.get('/connection-status', connectionSSE)


export default sseRouter;