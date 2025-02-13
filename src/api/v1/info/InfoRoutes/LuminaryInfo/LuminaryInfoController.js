import BaseReply from "../../../../../../telegrams/v1/BaseTelegram/reply.js";
import { DALI_COMMISSION_SEARCH_TYPE } from "../../../../../../telegrams/v1/DaliComission/DaliComissionSearchType.js";
import DaliCommissionStatusResultReply from "../../../../../../telegrams/v1/DaliComission/DaliCommissionStatusResultReply.js";
import DaliCommission from "../../../../../../telegrams/v1/DaliComission/index.js";
import DaliCommissionReply from "../../../../../../telegrams/v1/DaliComission/reply.js";
import DaliGet102DeviceCount from "../../../../../../telegrams/v1/DaliGet102DeviceCount/index.js";
import DaliGet102DeviceCountReply from "../../../../../../telegrams/v1/DaliGet102DeviceCount/reply.js";
import DaliGetDevicesCommonParam from "../../../../../../telegrams/v1/DaliGetDeviceCommonParam/index.js";
import DaliDeviceCommonParamReply from "../../../../../../telegrams/v1/DaliGetDeviceCommonParam/reply.js";
import DaliGetDeviceDataGroup from "../../../../../../telegrams/v1/DaliGetDeviceDataGroup/index.js";
import DaliGetDataGroupReply from "../../../../../../telegrams/v1/DaliGetDeviceDataGroup/reply.js";
import DaliGetDeviceDataType from "../../../../../../telegrams/v1/DaliGetDeviceDataType/index.js";
import DaliDeviceDataTypeReply from "../../../../../../telegrams/v1/DaliGetDeviceDataType/reply.js";
import DaliQueryControlGear from "../../../../../../telegrams/v1/DaliQueryControlGear/index.js";
import { QueryCommands } from "../../../../../../telegrams/v1/DaliQueryControlGear/QueryCommands.js";
import DaliQueryControlGearReply from "../../../../../../telegrams/v1/DaliQueryControlGear/reply.js";
import GetUserConfigTelegram from "../../../../../../telegrams/v1/Userconfig/GetUserConfigTelegram.js";
import CassiaNotificationService from "../../../../../services/CassiaNotificationService.js";
import CassiaEndpoints from "../../../../../thirdParty/cassia-rest-api/local/index.js";



const IP = "192.168.40.1";

const cassiaListener = new CassiaNotificationService(IP);

// Endpoints

async function getDali102DatabaseCount(macAddress) {

    return new Promise(async (resolve, reject) => {
        try {
            const command = new DaliGet102DeviceCount().create();

            // Send BLE message
            const result = await CassiaEndpoints.writeBleMessage(IP, macAddress, 19, command, "?noresponse=1");

            // Handler for incoming data
            const handler = (data) => {

                console.log(`Received data for ${macAddress}:`, data, '102 DATABSE COUNT');

                const reply = new DaliGet102DeviceCountReply(data)

                // Remove listener after receiving data
                cassiaListener.eventEmitter.removeListener(macAddress, handler);

                resolve(createResponseWithMessage(macAddress, result, reply.luminariesCount));

            };

            // Add a one-time listener for this specific MAC address
            cassiaListener.eventEmitter.once(macAddress, handler);
        } catch (error) {
            reject(error);
        }

    });
}

export const getAmountOf102Devices = async (req, res, next) => {

    const { mac } = req.params;

    const countResponse = await getDali102DatabaseCount(mac);
    res.send(countResponse);

}


const getLuminaryPowerOn = async (macAddress, shortAddress) => {

    const getUserConfigTelegram = new GetUserConfigTelegram().create();

    return new Promise(async (resolve, reject) => {
        await (macAddress)
        let attempts = 0;
        const maxAttempts = 10;
        const delay = 2000; // 1 second delay between attempts

        const emitter = 0;

        const attemptQuery = async () => {
            try {
                if (attempts === 0) {
                    const result = await CassiaEndpoints.writeBleMessage(IP, macAddress, 19, getUserConfigTelegram, "?noresponse=1");

                } else {
                    const telegram = new DaliQueryControlGear(shortAddress, QueryCommands.QUERY_LAMP_POWER_ON);
                    const hexCommand = telegram.create();

                    const result = await CassiaEndpoints.writeBleMessage(IP, macAddress, 19, hexCommand, "?noresponse=1");
                }

                // Send BLE message

                // Handler for incoming data
                const handler = (data) => {
                    console.log(data);

                    if (attempts !== 0) {

                        console.log(`Received data for ${macAddress}:`, data, 'POWER ON COMMAND');

                        const reply = new DaliQueryControlGearReply(data);

                        // Remove listener after receiving data
                        cassiaListener.eventEmitter.removeListener(macAddress, handler);

                        resolve(createResponseWithMessage(macAddress, result, ""));

                    }
                };

                if (attempts === 0) {

                    // Add a one-time listener for this specific MAC address
                    cassiaListener.eventEmitter.addListener(macAddress, handler);
                }

                // Retry if no response after a timeout
                setTimeout(() => {
                    if (attempts < maxAttempts) {
                        attempts++;
                        console.log(`Retrying (${attempts}/${maxAttempts}) for ${macAddress}...`);
                        attemptQuery();
                    } else {
                        reject(new Error(`Failed to get response after ${maxAttempts} attempts for ${macAddress}`));
                    }
                }, delay);
            } catch (error) {
                reject(error);
            }

        };

        attemptQuery();
    });
};


export const get102PowerOnEndpoint = async (req, res) => {

    const { mac, shortAddress } = req.params;

    let isLuminaryOn = await getLuminaryPowerOn(mac, shortAddress);

    console.log(isLuminaryOn);

    res.send(isLuminaryOn);
}

const getLuminaryZone = async () => {

}

const getLuminaryActualLevel = async () => {

}

const getLuminaryCommonParameters = async (macAddress) => {

    return new Promise(async (resolve, reject) => {

        try {

            const telegram = new DaliGetDevicesCommonParam();

            const hexCommand = telegram.create();

            // Send BLE message
            const result = await CassiaEndpoints.writeBleMessage(IP, macAddress, 19, hexCommand, "?noresponse=1");

            // Handler for incoming data
            const handler = (data) => {

                console.log(`Received data for ${macAddress}:`, data, 'DaliGetDevicesCommonParam');

                const reply = new DaliDeviceCommonParamReply(data)

                // Remove listener after receiving data
                cassiaListener.eventEmitter.removeListener(macAddress, handler);

                resolve(createResponseWithMessage(macAddress, result, reply.toJSON(), { commonParams: reply.paramsToJson() }));

            };

            // Add a one-time listener for this specific MAC address
            cassiaListener.eventEmitter.once(macAddress, handler);
        } catch (error) {
            reject(error);
        }
    });
}

const getDeviceTypeData = async (macAddress, shortAddress) => {

    return new Promise(async (resolve, reject) => {

        try {
            const telegram = new DaliGetDeviceDataType(shortAddress);

            const hexCommand = telegram.create();

            // Send BLE message
            const result = await CassiaEndpoints.writeBleMessage(IP, macAddress, 19, hexCommand, "?noresponse=1");

            // Handler for incoming data
            const handler = (data) => {

                console.log(`Received data for ${macAddress}:`, data, 'DALI GET DEVICE DATA TYPE');

                const reply = new DaliDeviceDataTypeReply(data)

                // Remove listener after receiving data
                cassiaListener.eventEmitter.removeListener(macAddress, handler);

                resolve(createResponseWithMessage(macAddress, result, reply.toJSON(), { params: reply.paramsToJson() }));

            };

            // Add a one-time listener for this specific MAC address
            cassiaListener.eventEmitter.addListener(macAddress, handler);
        } catch (error) {
            reject(error);
        }
    });
}

const getZoneForLuminary = async (macAddress, shortAddress) => {

    return new Promise(async (resolve, reject) => {

        try {
            const telegram = new DaliGetDeviceDataGroup(shortAddress);

            const hexCommand = telegram.create();

            // Send BLE message
            const result = await CassiaEndpoints.writeBleMessage(IP, macAddress, 19, hexCommand, "?noresponse=1");

            // Handler for incoming data
            const handler = (data) => {

                console.log(`Received data for ${macAddress}:`, data, 'DALI GET ZONE FOR LUMINARY');

                const reply = new DaliGetDataGroupReply(data)

                console.log(reply, 'yoyoyoyoo', reply.toJSON())

                // Remove listener after receiving data
                cassiaListener.eventEmitter.removeListener(macAddress, handler);

                resolve(createResponseWithMessage(macAddress, result, reply.toJSON()));

            };

            // Add a one-time listener for this specific MAC address
            cassiaListener.eventEmitter.addListener(macAddress, handler);
        } catch (error) {
            reject(error);
        }
    });

}


const commissionDevices = async (macAddress, searchType = DALI_COMMISSION_SEARCH_TYPE.TOTAL_NEW_SEARCH_102_AND_MANUAL_ASSIGN) => {


    return new Promise(async (resolve, reject) => {

        let ack = false;

        try {
            const command = new DaliCommission(searchType).create();

            // Send BLE message
            const result = await CassiaEndpoints.writeBleMessage(IP, macAddress, 19, command, "?noresponse=1");

            // Handler for incoming data
            const handler = async (data) => {

                const baseReply = new BaseReply(data);

                if (baseReply.telegramType === "2204") {
                    const reply = new DaliCommissionReply(data)


                    if (!reply.statusCodes[reply.status].ack) {
                        cassiaListener.eventEmitter.removeListener(macAddress, handler);
                        resolve(createResponseWithMessage(macAddress, result, reply.statusCodes[reply.status]));

                    } else {
                        ack = true;
                    }

                }

                if (baseReply.telegramType === "2104" && ack) {

                    const reply = new DaliCommissionStatusResultReply(data);

                    const commonParams = await getLuminaryCommonParameters(macAddress);


                    let luminaries = {
                        devicesFound: +reply.devicesFoundCount,
                        devices: Array.from({ length: +reply.devicesFoundCount }, (_, i) => ({
                            shortAddress: i.toString().padStart(2, "0"),
                            powerOn: true,
                            powerConsumption: 0,
                            ...commonParams.commonParams,
                        }))
                    }

                    let copy = [...luminaries.devices];

                    for (let index = 0; index < copy.length; index++) {

                        const luminary = copy[index];

                        const { params } = await getDeviceTypeData(macAddress, luminary.shortAddress);
                        copy[index].deviceType = params;
                    }


                    for (let index = 0; index < copy.length; index++) {

                        const luminary = copy[index];

                        const { zone } = await getZoneForLuminary(macAddress, luminary.shortAddress);
                        copy[index].zone = zone;
                    }

                    luminaries.devices = [...copy];



                    cassiaListener.eventEmitter.removeListener(macAddress, handler);
                    resolve(createResponseWithMessage(macAddress, result, reply.commissioningResults[reply.status], { luminaries }));
                    console.log(luminaries)
                }

            };

            // Add a one-time listener for this specific MAC address
            cassiaListener.eventEmitter.addListener(macAddress, handler);
        } catch (error) {
            reject(error);
        }
    });
}

const gatherLuminariesInformation = async (macAddress) => {


    let amountOf102Devices = await getDali102DatabaseCount(macAddress);

    const commonParams = await getLuminaryCommonParameters(macAddress);
    const params = {
        maxLevel: commonParams.data.maxLevel,
        minLevel: commonParams.data.minLevel,
        powerOnLevel: commonParams.data.powerOnLevel,
        sysFailLevel: commonParams.data.sysFailLevel,
        fadeTime: commonParams.data.fadeTime,
        fadeRate: commonParams.data.fadeRate,
        extendedFadeTime: commonParams.data.extendedFadeTime,
    }


    amountOf102Devices = parseInt(amountOf102Devices.data, 16);


    const luminaries = [];

    for (let index = 0; index < amountOf102Devices; index++) {

        const shortAddress = index;
        const zoneRequest = await getZoneForLuminary(macAddress, shortAddress);
        const deviceTypes = await getDeviceTypeData(macAddress, shortAddress);
        const types = {
            deviceTypesZero: deviceTypes.data.deviceType0,
            deviceTypesOne: deviceTypes.data.deviceType1

        }
        const luminary = {
            shortAddress,
            zone: zoneRequest.data.zone,
            commonParams: params,
            powerConsumption: 0,
            deviceType: types,
            powerOn: await getLuminaryPowerOn(macAddress, shortAddress),
        }

        luminaries.push(luminary)

    }

    console.log(luminaries);
    return luminaries;
}

const getLuminaryInfo = async (macAddress) => {


    let amountOf102Devices = await getDali102DatabaseCount(macAddress);

    amountOf102Devices = parseInt(amountOf102Devices.data, 16);

    console.log(amountOf102Devices, '109')

    const luminaries = {};

    for (let index = 0; index < amountOf102Devices; index++) {

        console.log("Hello")

        const shortAddress = index;

        luminaries[shortAddress].powerOn = await getLuminaryPowerOn(macAddress, shortAddress.toString().padStart('00'));
        // luminaries[shortAddress].zone = getLuminaryZone(shortAddress);
        // luminaries[shortAddress].actualLevel = getLuminaryActualLevel(shortAddress);
        // luminaries[shortAddress].deviceType = getLuminaryDeviceType(shortAddress);
        // luminaries[shortAddress].commonParams = getLuminaryCommonParameters();

        console.log(luminaries);


    }

    return luminaries;
}



export const getLuminariesInfo = async (req, res) => {

    const { mac } = req.params;

    const data = await gatherLuminariesInformation(mac);

    res.send(data);

}


export const daliCommission = async (req, res) => {

    const { mac } = req.params;
    const { searchType } = req.body;

    const answer = await commissionDevices(mac, searchType);

    res.send(answer);
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


export default { getAmountOf102Devices }