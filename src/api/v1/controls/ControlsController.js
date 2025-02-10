import TurnLightOnOrOffTelegram from "../../../../telegrams/v1/TurnLightOnOrOff/index.js";
import CassiaNotificationService from "../../../services/CassiaNotificationService.js";
import CassiaEndpoints from "../../../thirdParty/cassia-rest-api/local/index.js";

const IP = "192.168.40.1";

const cassiaListener = new CassiaNotificationService(IP);

export const TurnLightOnOrOff = (request, response, next) => {

    const { mac } = request.params;


    const turnLightsOnOrOff = new TurnLightOnOrOffTelegram("000000010201000000").create();

    CassiaEndpoints.connectToBleDevice(IP, mac)
        .then(res => {
            if (res.status === 200) {

                CassiaEndpoints.writeBleMessage(IP, mac, 19, turnLightsOnOrOff, '?noresponse=1')
                .then(writeResponse => {
                    if(writeResponse.status === 200)
                    { 
                        response.send('OK');
                    }
                })
            }
        })


}

export const multipleTurnOnOff = (request, response, next) => {

    const { macs } = request.body;

    const turnLightsOnOrOff = new TurnLightOnOrOffTelegram("000000010202000000").create();

    CassiaEndpoints.connectToBleDevice(IP, mac)
        .then(res => {
            if (res.status === 200) {

                CassiaEndpoints.writeBleMessage(IP, mac, 19, turnLightsOnOrOff, '?noresponse=1')
                .then(writeResponse => {
                    if(writeResponse.status === 200)
                    { 
                        response.send('OK');
                    }
                })
            }
        })


}

