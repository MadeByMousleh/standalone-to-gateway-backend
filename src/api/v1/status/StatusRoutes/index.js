import express from "express";

const statusRouter = express.Router();

loginRouter.post('/detector/status/:mac');

export default statusRouter;