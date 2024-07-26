import express from "express";

import { 
    login, 
    connect, 
    disconnect, 
    connectMultiple, 
    disconnectMultiple, 
    getConnectionList
} from "../LoginConroller/index.js";


const loginRouter = express.Router();

loginRouter.get('/connection-list', getConnectionList);

loginRouter.post('/connect', connect);

loginRouter.post('/connect-multiple', connectMultiple);

loginRouter.post('/login', login);

loginRouter.post('/disconnect', disconnect);

loginRouter.post('/disconnect-multiple', disconnectMultiple);


export default loginRouter;