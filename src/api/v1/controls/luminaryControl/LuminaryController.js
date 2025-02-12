import DaliAssignDeviceToZone from '../../../../../telegrams/v1/DaliAssignDeviceToZone/index.js';
import DaliAssignDeviceToZoneReply from '../../../../../telegrams/v1/DaliAssignDeviceToZone/reply.js';
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

export const assignLuminaryToZone = async (req, res) => {

  const macAddress = req.params.mac;

  const { shortAddress, zone, multiZone } = req.body;

  try {

    const telegram = new DaliAssignDeviceToZone(shortAddress, zone, multiZone);

    const hexCommand = telegram.create();

    // Send BLE message
    const result = await CassiaEndpoints.writeBleMessage(IP, macAddress, 19, hexCommand, "?noresponse=1");

    // Handler for incoming data
    const handler = (data) => {

      console.log(`Received data for ${macAddress}:`, data, 'DALI ASSIGN DEVIVE TO ZONE');

      const reply = new DaliAssignDeviceToZoneReply(data)

      // Remove listener after receiving data
      cassiaListener.eventEmitter.removeListener(macAddress, handler);

      res.send(createResponseWithMessage(macAddress, result, reply.toJSON(), { status: reply.toJSON().status.ack }));

    };

    // Add a one-time listener for this specific MAC address
    cassiaListener.eventEmitter.addListener(macAddress, handler);
  } catch (error) {
  }



}

function createResponseWithMessage(macAddress, result, msg, other) {

  return {
    macAddress,
    data: msg,
    time: new Date().getTime(),
    retires: result.retries,
    status: result.status,
    ...other,
  };
}

