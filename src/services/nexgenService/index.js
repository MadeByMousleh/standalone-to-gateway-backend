import CheckPincodeTelegram from "../../../telegrams/v1/CheckPincode/index.js";
import CheckPincodeReply from "../../../telegrams/v1/CheckPincode/reply.js";
import LoginTelegram from "../../../telegrams/v1/LoginTelegram/index.js";
import LoginTelegramReply from "../../../telegrams/v1/LoginTelegram/LoginTelegramReply.js";
import CassiaEndpoints from "../../thirdParty/cassia-rest-api/local/index.js";
import CassiaNotificationService from "../CassiaNotificationService.js";

export default class NextGenService {

    cassiaListener;

    constructor(gatewayIp) {
        this.IP = gatewayIp;
        this.cassiaListener = new CassiaNotificationService(this.IP);
    }

    createResponseWithMessage(macAddress, result, msg, other) {
        return {
            macAddress,
            data: msg,
            time: new Date().getTime(),
            retires: result.retries,
            status: result.status,
            ...other,
        };
    }

    async checkPincode(pincode, macAddress) {

        return new Promise(async (resolve, reject) => {

            if (!macAddress || !pincode) throw new Error("MacAddress and pinCode is required");

            const checkPincodeBytes = new CheckPincodeTelegram(pincode).create();

            const result = await CassiaEndpoints.writeBleMessage(this.IP, macAddress, 19, checkPincodeBytes, '?noresponse=1');

            if (result.status !== 200) return false;

            cassiaListener.onData(macAddress, data => {

                const checkPincodeReply = new CheckPincodeReply(data);

                const pincodeResult = checkPincodeReply.getResult();

                // console.log(checkPincodeReply.telegramType)

                if (checkPincodeReply.telegramType === "3201") {

                    return resolve(pincodeResult.ack);

                }

            })
        })
    }

    async attemptLogin(macAddress) {

        try {


            return new Promise(async (resolve, reject) => {

                console.log("Creating telegram...\n\n")

                const hexLoginValue = new LoginTelegram().create();

                console.log("Writing telegram through Cassia gateway api... \n\n")

                const result = await CassiaEndpoints.writeBleMessage(this.IP, macAddress, 19, hexLoginValue, '?noresponse=1');

                if (result.status !== 200) {

                    console.log("Writing telegram FAILED - Please make sure you are connected to the same network as the gateway...\n\n")

                    return resolve({ ack: false });

                }

                console.log("Telegram successfully accepted - awaiting answer....\n\n")


                this.cassiaListener.onData(macAddress, data => {

                    console.log("Preparing to understand login reply...\n\n")

                    const loginReply = new LoginTelegramReply(data)

                    if (loginReply.telegramType === '1100') {

                        console.log("Listening for answer...\n\n")

                        const loginReplyResult = loginReply.getResult();

                        console.log("Answer received...", loginReplyResult, '\n\n');

                        if (loginReplyResult.ack && loginReplyResult.pincodeRequired) {
                            throw new Error("This detector is locked and a pincode is required to open it\n\n");
                        }
                        console.log("resolving...", loginReplyResult, '\n\n');

                        this.cassiaListener.close();

                        return resolve(loginReplyResult);
                    }
                })
            })
        } catch (err) {
            console.log(err)
        }

    }


    async connectToDevice(macAddress) {

        return new Promise(async (resolve, reject) => {
            const connectResult = await CassiaEndpoints.connectToBleDevice(this.IP, macAddress, 3);
            return resolve(connectResult.status === 200);
        })

    }

    async login(macAddress, pincode) {

        return new Promise(async (resolve, reject) => {

            try {

                console.log("Checking for Mac-address\n\n")

                if (!macAddress) {

                    throw new Error("MacAddress is required\n\n");

                }

                console.log("Mac-address exists\n\n")

                console.log("Trying to connect...\n\n")

                // Attempt to connect to the device
                const connectResult = await this.connectToDevice(macAddress);

                console.log("Connecting...\n\n")

                if (connectResult) {

                    console.log("Connected to device successfully...\n\n");

                }


                if (!connectResult) {

                    console.log("Connection to device failed...\n\n");
                    return resolve(false);

                }

                console.log("Trying to login to detector....\n\n");
                // Attempt to log in to the device
                const loginResult = await this.attemptLogin(macAddress);

                if (loginResult.ack) {

                    console.log("Successfully logged in to the detector...\n\n");


                }

                if (!loginResult.ack) {

                    console.log("Could not login to the detector...\n\n");
                }

                console.log("Resolving....", loginResult.ack, '\n\n');

                return resolve(loginResult.ack);

            } catch (error) {

                console.log("Error occurred - trying to disconnect from detector.... \n\n");

                const disconnectResult = await CassiaEndpoints.disconnectFromBleDevice(this.IP, macAddress);

                console.log("Disconnected from detector successfully... \n\n");

                throw error;

            }
        })

    }

    async jumpToBoot(macAddress, isSensor = true) {

        const data = isSensor ? '0101000800D9CB01' : '0101000800D9CB02';

        return new Promise(async (resolve, reject) => {
            const result = await CassiaEndpoints.writeBleMessage(this.IP, macAddress, 19, data, '?noresponse=1');
            return resolve(result.status === 200);
        })
    }


}

