import { listenForSSE } from '../../../utility/handleSSE.js';
import makeApiRequestWithRetry from '../../../utility/makeApiRequestWithRetry.js';

let postConfig = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
}

let connectConfig = {
    method: 'POST',
    data: {"timeout": "10000", "type": "public", "discovergatt": 0 },
    headers: {
        'Content-Type': 'application/json'
    },
}

let getConfig = {
    method: 'GET',
}

let deleteConfig = {
    method: 'DELETE',
}


const CassiaEndpoints = {

    connectToBleDevice: async (gatewayIp, macAddress, retries = 3) => {
        return await makeApiRequestWithRetry(`http://${gatewayIp}/gap/nodes/${macAddress}/connection`,connectConfig, retries);
    },

    disconnectFromBleDevice: async (gatewayIp, macAddress, retries = 3) => {
        return await makeApiRequestWithRetry(`http://${gatewayIp}/gap/nodes/${macAddress}/connection`, deleteConfig, retries);
    },

    writeBleMessage: async (gatewayIp, macAddress, handle, message, queryParams, retries = 3) => {
        return await makeApiRequestWithRetry(`http://${gatewayIp}/gatt/nodes/${macAddress}/handle/${handle}/value/${message}${queryParams}`, getConfig, retries);
    },

    getConnectionList: async (gatewayIp, retries = 3) => {
        return await makeApiRequestWithRetry(`http://${gatewayIp}/gap/nodes?connection_state=connected`, getConfig, retries);
    },

    openNotifications: async (gatewayIp, macAddress, retries = 3) => {
        return await makeApiRequestWithRetry(`http://${gatewayIp}/gatt/nodes/${macAddress}/handle/15/value/0100`, getConfig, retries);
    },

    checkForCharacteristic: async (gatewayIp, macAddress, retries = 3) => {
        return makeApiRequestWithRetry(`http://${gatewayIp}/gatt/nodes/${macAddress}/characteristics`, getConfig, retries);
    },

    // SSE

    scanForBleDevices: (gatewayIp, request, response, onData, active = 1) => {
        return listenForSSE(`http://${gatewayIp}/gap/nodes?event=1&filter_mac=10:B9:F7*&active=${active}&report_interval=1000&timestamp=1`, request, response, onData);
    },

    listenForConnections: async (gatewayIp, request, response, onData) => {
        return listenForSSE(`http://${gatewayIp}/management/nodes/connection-state`, request, response, onData);
    }



}

export default CassiaEndpoints;