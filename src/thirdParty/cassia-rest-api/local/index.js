import {listenForSSE } from '../../../utility/handleSSE.js';
import makeApiRequestWithRetry from '../../../utility/makeApiRequestWithRetry.js';

let postConfig = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}

let getConfig = {
    method: 'GET',
}

let deleteConfig = {
    method: 'DELETE',
}


const CassiaEndpoints = {

    connectToBleDevice:  async (gatewayIp, macAddress, retries) => {
        return await makeApiRequestWithRetry(`http://${gatewayIp}/gap/nodes/${macAddress}/connection`, postConfig, retries);
    },

    disconnectFromBleDevice:  async (gatewayIp, macAddress, retries) => {
        return await makeApiRequestWithRetry(`http://${gatewayIp}/gap/nodes/${macAddress}/connection`, deleteConfig, retries);
    },

    writeBleMessage: async (gatewayIp, macAddress, handle, message, queryParams, retries) => {
        return await makeApiRequestWithRetry(`http://${gatewayIp}/gatt/nodes/${macAddress}/handle/${handle}/value/${message}${queryParams}`, getConfig, retries);
    },   

     scanForBleDevices: async (gatewayIp, request, response, onData) => {
        return listenForSSE(`http://${gatewayIp}/gap/nodes?event=1&filter_mac=10:B9:F7*&active=1&report_interval=1000&timestamp=1`,request, response, onData);
    },

}

export default CassiaEndpoints;