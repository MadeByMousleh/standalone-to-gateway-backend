import DaliAssignDeviceToZone from '../../../../../telegrams/v1/DaliAssignDeviceToZone/index.js';
import DaliAssignDeviceToZoneReply from '../../../../../telegrams/v1/DaliAssignDeviceToZone/reply.js';
import DaliDeviceControl from '../../../../../telegrams/v1/DaliDeviceControl/index.js';
import DaliDeviceControlReply from '../../../../../telegrams/v1/DaliDeviceControl/reply.js';
import DaliGet102DeviceCount from '../../../../../telegrams/v1/DaliGet102DeviceCount/index.js';
import CassiaNotificationService from '../../../../services/CassiaNotificationService.js';
import CassiaEndpoints from '../../../../thirdParty/cassia-rest-api/local/index.js';

const IP = '192.168.40.1';

const cassiaListener = new CassiaNotificationService(IP);



const controlDaliDevice = (macAddress, shortAddress, command = DaliDeviceControl.DaliDeviceControlCommand.DALI_ON, directLevel = 0) => {

  return new Promise(async (resolve, reject) => {

    try {
      const telegram = new DaliDeviceControl(shortAddress, command, directLevel).create();

      // Send BLE message
      const result = await CassiaEndpoints.writeBleMessage(IP, macAddress, 19, telegram, "?noresponse=1");

      // Handler for incoming data
      const handler = (data) => {

        console.log(`Received data for ${macAddress}:`, data, 'DALI control device');

        const reply = new DaliDeviceControlReply(data)

        cassiaListener.eventEmitter.removeListener(`${macAddress}-${DaliDeviceControlReply.replyTelegram}`, handler);

        resolve(createResponseWithMessage(macAddress, result, reply.toJSON()));

      };

      cassiaListener.eventEmitter.addListener(`${macAddress}-${DaliDeviceControlReply.replyTelegram}`, handler);

    } catch (error) {
      reject(error);
    }
  });
}

export const turnLightOff = async (request, response) => {

  const { mac } = request.params;
  const { shortAddress } = request.body;

  const controlDeviceResponse = await controlDaliDevice(mac, +shortAddress, DaliDeviceControl.DaliDeviceControlCommand.DALI_OFF);

  const { data } = controlDeviceResponse;;

  if (data.status.ack) {
    response.send({ message: 'Light turned off successfully', status: 'success', shortAddress: +shortAddress });
  }
  else {
    response.send({ message: 'Failed to turn off the light', status: 'failed', shortAddress: +shortAddress });
  }


};

export const turnOnLight = async (request, response) => {

  const { mac } = request.params;
  const { shortAddress } = request.body;

  const controlDeviceResponse = await controlDaliDevice(mac, +shortAddress, DaliDeviceControl.DaliDeviceControlCommand.DALI_ON);

  const { data } = controlDeviceResponse;;

  if (data.status.ack) {
    response.send({ message: 'Light turned ON successfully', status: 'success', shortAddress: +shortAddress });
  }
  else {
    response.send({ message: 'Failed to turn ON the light', status: 'failed', shortAddress: +shortAddress });
  }


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

