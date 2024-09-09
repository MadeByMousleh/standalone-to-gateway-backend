import axios from 'axios';
import CassiaEndpoints from '../../../../thirdParty/cassia-rest-api/local/index.js';


const IP = "192.168.40.1";

export const connectionSSE = (request, response, next) => {

    CassiaEndpoints.listenForConnections(IP, request, response, (event) => sendConnectionData(event, response));

    const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
    };

    response.writeHead(200, headers);
}


export const upgradeStatusSSE = (request, response, next) => {
    
    const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
    };

    response.writeHead(200, headers);
}


const receiveUpgradeData = (data) => {

    progressController[data.mac] = data.progress;

   
}


const sendConnectionData = (event, response) => {

    let data = JSON.parse(event.data)
    response.write(`data: ${JSON.stringify(data)}\n\n`);

}