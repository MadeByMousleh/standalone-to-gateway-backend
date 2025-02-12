import DaliDeviceControl from '../../../../../telegrams/v1/DaliDeviceControl/index.js';
import CassiaNotificationService from '../../../../services/CassiaNotificationService.js';
import CassiaEndpoints from '../../../../thirdParty/cassia-rest-api/local/index.js';

const IP = '192.168.40.1';

const cassiaListener = new CassiaNotificationService(IP);

export const turnLightOff = (request, response) => {
  console.log('Hello');

  const { mac } = request.params;
  const { shortAddress } = request.body;

  console.log(shortAddress);

  const telegram = new DaliDeviceControl(`${shortAddress}00`).create();

  CassiaEndpoints.writeBleMessage(IP, mac, 19, telegram, '?noresponse=1')
    .then((writeResponse) => {
      
      if (writeResponse.status === 200) {
        response.send('OK');
      }
    });
};
