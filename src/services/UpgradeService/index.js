import { readFileSync } from "fs";
import axios from "axios";
import DFUController from "./models/DFUController.js";
import dotenv from "dotenv";
import CassiaEndpoints from "../../thirdParty/cassia-rest-api/local/index.js";
import NextGenService from "../nexgenService/index.js";

dotenv.config();


const corsOptions = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
};


class UpgradeService {

    IP = "192.168.40.1";

    DFUControllers = [];

    PAYLOAD_PATH = "../../../firmwares/P42/0217/353AP10217.cyacd";

    nextGenService;

    constructor() {
        this.nextGenService = new NextGenService(this.IP);
    }

    sendCypressData(data, mac) {
        axios({
            method: "GET",
            url: `http://${this.IP}/gatt/nodes/${mac}/handle/14/value/${data}`,
            headers: {
                Authorization: "Bearer " + token,
                Accept: "*/*",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })
            .then()
            .catch((e) => console.log(e));

        console.log(
            "-----------------------------------------------------------------------------------"
        );

        console.log("Write Data: " + data);

        console.log(
            "-----------------------------------------------------------------------------------"
        );
    }

    checkIfHandleIsThere = async (mac) => {

        const result = axios(`http://${this.IP}/gatt/nodes/${mac}/services/00060000-f8ce-11e4-abf4-0002a5d5c51b/characteristics`);

        const resultData = await result;

        if (resultData.status === 200) {
            if (resultData.data[0].uuid === "00060001-f8ce-11e4-abf4-0002a5d5c51b") {
                return true;
            }
        }

        console.log("Failed on checking handle");

        return false;
    };

    async openNotification(nodeMac) {

        const result = await axios({
            method: "GET",
            url: `http://${this.IP}/gatt/nodes/${nodeMac}/handle/15/value/0100`,
            headers: {
                Accept: "*/*",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const resultData = result;

        if (resultData.status === 200) {

            return true;

        }

        console.log("Failed on opening notification");

        return false;
    }

    async sendJumpToBootTelegram(nodeMac) {
        try {
            return await axios({
                method: "GET",
                url: `http://${this.IP}/gatt/nodes/${nodeMac}/handle/19/value/0101000800D9CB01?noresponse=1`,
                headers: {
                    Accept: "*/*",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
        } catch (e) {
            console.log("Failed in jump to boot");
        }
    }

    sendData = (data) => {
        // subscribers.forEach((subscriber) =>
        //     subscriber.response.write(`data: ${JSON.stringify(data)}\n\n`)
        // );

        console.log(data)
    };

    upgradeSensor = async (mac) => {

        // Connect to ble device

        // Login 

        // Jump to boot

        // Connect

        // Open notification

        // Enter boot loader

        // Get flash size

        // Send data

        // Connect to ble device

        console.log("\n\n ################ UPGRADE SENSOR ################ \n\n")

        console.log("Trying to connect and login to detector...\n\n")

        const isConnected = await this.nextGenService.login(mac);



        if (isConnected) {

            console.log("Connection and login to detector successfully executed...\n\n");

            console.log("Jumping to boot... \n\n");

            const jumpToBootResponse = await this.nextGenService.jumpToBoot(mac);

            if (jumpToBootResponse.status === 200) {
                console.log("Jumping to boot successfully executed... \n\n");
            }

        }


        // const jumpToBootResult = await this.sendJumpToBootTelegram(mac);

        // //  console.log("Could not connect to device")


        // if (jumpToBootResult.status === 200) {

        //     console.log("Jumped to boot");

        //     console.log("Disconnected...");

        //     const result = await CassiaEndpoints.connectToBleDevice(mac);



        //     if (result) {

        //         if (result.status === 200) {
        //             return this.openAndStartDFU(mac)
        //         }

        //         return console.log("something went wrong here")
        //     }

        // }


    }

    openAndStartDFU = async (mac) => {

        try {

            if (!this.DFUControllers[mac]) {

                // const deviceInBoot = await this.checkIfHandleIsThere(mac);

                if (!deviceInBoot) {

                    console.log("Device is not in boot");

                    const jumpToBootResult = await this.sendJumpToBootTelegram(mac);

                    if (jumpToBootResult.status === 200) {

                        console.log("Jumped to boot");

                        console.log("Disconnected...");

                        const result = await CassiaEndpoints.connectToBleDevice(mac);

                        const connectResult = await connectToDevice(macAddress);


                        if (connectResult) {

                            if (connectResult.status === 200) {
                                return this.openAndStartDFU(mac)
                            }

                            return console.log("something went wrong here")
                        }

                    }
                }
            }

            console.log("Device is in boot")

            const notificationOpen = await this.openNotification(mac);

            if (notificationOpen) {

                console.log("Notification opened");

                var payload = readFileSync(this.PAYLOAD_PATH, "utf8");

                this.DFUControllers[mac] = new DFUController(payload, "49A134B6C779", this.sendCypressData, mac);

                this.DFUControllers[mac].onProgress("progress", this.sendData);

                this.DFUControllers[mac].startDFU();
            }

        } catch (e) {
            console.log("Failed here" + e);
        }

    };

    start(mac) {
        this.upgradeSensor(mac);
    }

}

export default UpgradeService;