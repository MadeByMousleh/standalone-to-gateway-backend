import axios from 'axios';
import CassiaEndpoints from '../../../../thirdParty/cassia-rest-api/local/index.js';
import CassiaConnectionStateService from '../../../../services/CassiaConnectionStateService.js';

const IP = "192.168.40.1";

export const connectionSSE = (request, response, next) => {
    const connectionService = new CassiaConnectionStateService(IP);

    const headers = {
        "Content-Type": "text/event-stream",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache",
    };

    response.writeHead(200, headers);

    const sendConnectionData = (data) => {

        console.log(data);  
        response.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    connectionService.onData(sendConnectionData);

    response.on("close", () => {
        console.log("👋 Client closed connection.");
        response.end();
    });
};

export const upgradeStatusSSE = (request, response, next) => {
    
    const headers = {
        "Content-Type": "text/event-stream",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache",
    };

    response.writeHead(200, headers);
}


const receiveUpgradeData = (data) => {

    progressController[data.mac] = data.progress;

   
}


const sendConnectionData = (event, response) => {

    console.log(event);
    let data = JSON.parse(event.data)
    response.write(`data: ${JSON.stringify(data)}\n\n`);

}