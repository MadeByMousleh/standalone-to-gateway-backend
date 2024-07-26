import CheckPincodeTelegram from "../../../../../telegrams/v1/CheckPincode/index.js";
import CheckPincodeReply from "../../../../../telegrams/v1/CheckPincode/reply.js";
import CheckPincodeResult from "../../../../../telegrams/v1/CheckPincode/reply.js";
import LoginTelegramReply from "../../../../../telegrams/v1/LoginTelegram/LoginTelegramReply.js";
import LoginTelegram from "../../../../../telegrams/v1/LoginTelegram/index.js";
import CassiaNotificationService from "../../../../services/CassiaNotificationService.js";
import CassiaEndpoints from "../../../../thirdParty/cassia-rest-api/local/index.js";


const IP = "192.168.40.1";

const cassiaListener = new CassiaNotificationService(IP);

// Endpoints

export const connect = async (request, response, next) => {

    try {

        const macAddress = request.body?.macAddress;

        if (!macAddress) return response.status(400).json({
            error: "Bad Request",
            message: `Missing required parameter {macAddress} `
        });

        let result = await CassiaEndpoints.connectToBleDevice(IP, macAddress, 3)

        if (result.status === 200) {

            return response.status(200).json({
                macAddress,
                data: 'OK',
                time: new Date().getTime(),
                retires: result.retries,
            })

        }

    } catch (error) {

        return response.status(500).json({
            macAddress,
            data: 'Failed',
            time: new Date().getTime(),
            retires: result.retries,
            error
        });
    }

};

export const disconnect = async (request, response, next) => {
    const macAddress = request.body?.macAddress;

    // Check if macAddress is provided
    if (!macAddress) {
        return response.status(400).json({
            error: "Bad Request",
            message: "Missing required parameter {macAddress}"
        });
    }

    try {

        // Attempt to disconnect the device
        const result = await disconnectFromDevice(macAddress);
        return response.status(result.status).json(result);

    } catch (error) {
        console.error('Error during disconnection:', error);
        return response.status(500).json({
            error: error,
            message: "An unexpected error occurred during disconnection"
        });
    }
};

export const login = async (request, response, next) => {
    try {
        const { macAddress, pincode } = request.body;

        // Check if macAddress is provided
        if (!macAddress) {
            return response.status(400).json({
                error: "Bad Request",
                message: "Missing required parameter {macAddress}"
            });
        }

        // Attempt to connect to the device
        const connectResult = await connectToDevice(macAddress);

        if (connectResult.status !== 200) {

            return response.status(connectResult.status).json(connectResult.responseBody);

        }

        // Attempt to log in to the device
        const loginResult = await attemptLogin(macAddress);

        if (loginResult.status !== 200) {

            return response.status(loginResult.status).json([connectResult, loginResult]);
        }

        // Check if pincode is required and not provided
        if (loginResult.pincodeRequired && !pincode) {

            const disconnectResult = await CassiaEndpoints.disconnectFromBleDevice(IP, macAddress);

            return response.status(disconnectResult.status).json([connectResult, loginResult, disconnectResult]);

        }

        // Handle pincode verification if required
        if (loginResult.pincodeRequired) {

            const pinCodeResult = await checkPincode(pincode, macAddress);

            if (!pinCodeResult.pincodeAccepted) {

                const disconnectResult = await CassiaEndpoints.disconnectFromBleDevice(IP, macAddress);

                return response.status(disconnectResult.status).json([connectResult, loginResult, pinCodeResult, disconnectResult]);
            }
            return response.status(pinCodeResult.status).json([connectResult, loginResponseBody, pinCodeResult]);
        }

        // Return success response if no pincode is required
        return response.status(200).json([connectResult, loginResult]);

    } catch (error) {
        console.error('Error:', error);
        return response.status(500).json({
            error: error,
            message: "An unexpected error occurred"
        });
    }
};

export const connectMultiple = async (request, response, next) => {

    let i = 0;

    try {
        const macAddresses = request.body?.macAddresses;

        let results = [];

        for (let i = 0; i < macAddresses.length;) {

            const mac = macAddresses[i];

            const result = await connectToDevice(mac);

            results.push(result);

            if (result && result.status === 200) {

                const loginResult = await attemptLogin(mac);

                if (loginResult) {
                    i++;
                }
            }
            if (!result || result.status !== 200) {

                i++;
            }


        }

        response.send({ results });

    } catch (error) {

        response.send({ error: response.error });

    }
}

export const disconnectMultiple = async (request, response, next) => {

    try {

        const macAddresses = request.body?.macAddresses;

        let results = [];

        for (let i = 0; i < macAddresses.length;) {

            const mac = macAddresses[i];

            const result = await disconnectFromDevice(mac);

            results.push(result);

            if (result) {

                i++;
            }
        }

        response.send({ results });

    } catch (error) {

        response.send({ error: response.error });

    }
}


export async function getConnectionList(request, response, next) {
   
    const result = await CassiaEndpoints.getConnectionList(IP);
    console.log(result);
    return response.send(result);
}

async function connectToDevice(macAddress) {

    const connectResult = await CassiaEndpoints.connectToBleDevice(IP, macAddress, 3);
    const msg = connectResult.status === 200 ? 'Connection Achieved' : 'Connection failed';
    return createResponseWithMessage(macAddress, connectResult, msg)
}

async function disconnectFromDevice(macAddress) {

    const disconnectedResult = await CassiaEndpoints.disconnectFromBleDevice(IP, macAddress, 3);
    const msg = disconnectedResult.status === 200 ? 'Disconnected from the device' : 'Could not disconnect from device';
    return createResponseWithMessage(macAddress, disconnectedResult, msg);
}

async function attemptLogin(macAddress) {

    return new Promise(async (resolve, reject) => {

        const hexLoginValue = new LoginTelegram().create();

        const result = await CassiaEndpoints.writeBleMessage(IP, macAddress, 19, hexLoginValue, '?noresponse=1');

        cassiaListener.onData(macAddress, data => {

            const loginReply = new LoginTelegramReply(data)

            if (loginReply.telegramType === '1100') {

                const loginReplyResult = loginReply.getResult();



                return resolve(createResponseWithMessage(macAddress, result, loginReplyResult.msg, { pincodeRequired: loginReplyResult.pincodeRequired }))
            }
        })
    })
}

async function checkPincode(pincode, macAddress) {

    return new Promise(async (resolve, reject) => {

        const checkPincodeBytes = new CheckPincodeTelegram(pincode).create();

        const result = await CassiaEndpoints.writeBleMessage(IP, macAddress, 19, checkPincodeBytes, '?noresponse=1');

        cassiaListener.onData(macAddress, data => {

            const checkPincodeReply = new CheckPincodeReply(data);

            const pincodeResult = checkPincodeReply.getResult();

            // console.log(checkPincodeReply.telegramType)

            if (checkPincodeReply.telegramType === "3201") {

                return resolve({
                    status: result.status,
                    responseBody: createResponseWithMessage(macAddress, result, pincodeResult.msg, { pincodeAccepted: pincodeResult.ack })
                });

            }

        })
    })
}



function createResponse(macAddress, result) {
    return {
        macAddress,
        data: result.status === 200 ? 'OK' : 'Failed',
        time: new Date().getTime(),
        retires: result.retries,
        status: result.status,
        cassiaResult: result
    };
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


export default { connect, login }