import { readFileSync } from "fs";
import NextGenService from "../../../../../services/nexgenService/index.js";
import CassiaEndpoints from "../../../../../thirdParty/cassia-rest-api/local/index.js";
import DFUController from "../DFUControllers/sensor/DFUControllerV2.js";
import { resolve } from "path";
import EventEmitter from "events";


class UpgradeProcessor {

    controller;
    payload;

    constructor(bleDeviceMac, firmwarePath, securityCode = "49A134B6C779", writeMethod) {

        if(firmwarePath.includes('BL'))
            {
                firmwarePath = firmwarePath.slice(0, firmwarePath.length -5);
            }

        this.bleDeviceMac = bleDeviceMac;
        this.firmwarePath = firmwarePath;
        this.securityCode = securityCode;
        this.payload = readFileSync(firmwarePath, 'utf8');
        this.controller = new DFUController(this.payload, "49A134B6C779", writeMethod, bleDeviceMac);

    }

    startUpgrade() {
        this.controller.startDFU();
    }

    onProgress(cb) {
        this.controller.onProgress('progress', cb);
    }

    onProgressV2(cb) {
        this.controller.onProgress('progress-v2', cb);
    }

    onResponse(response) {
        this.controller.onResponse(response)
    }




}

export class NextGenDevice {

    mac;

    productNumber;

    type;

    dfuProgress;

    DFUOngoing;

    nextGenService;

    pinCode;

    upgradeProcessor;

    firmwarePath;

    dfuCompleted = false;

    upgradingSensor = false;

    upgradingActor = false;

    upgradingBootLoader = false;

    amountOfLines = 0;

    progress;

    upgradingOnGoing = false;

    fileIndex = 0;

    progressEmitter = new EventEmitter();

    sensorUpgradeProgress = 0;
    actorUpgradeProgress = 0;
    bootLoaderUpgradeProgress = 0;


    constructor(gatewayIp, mac, pinCode = null, firmwarePath, isBoot = false, firmwareToUpgrade,) {
        this.mac = mac;
        this.gatewayIp = gatewayIp;
        this.nextGenService = new NextGenService(gatewayIp);
        this.pinCode = this.pinCode
        this.writeBleBootMessage = this.writeBleBootMessage.bind(this);
        this.firmwarePath = firmwarePath;
        this.dfuCompleted = false;
        this.isBoot = isBoot;
        this.upgradeProcessor = new UpgradeProcessor(this.mac, firmwareToUpgrade[0], "49A134B6C779", this.writeBleBootMessage);
        this.firmwareToUpgrade = firmwareToUpgrade;


    }

    async connect() {

        return new Promise((resolve, reject) => {

            CassiaEndpoints.connectToBleDevice(this.gatewayIp, this.mac)

                .then(result => {

                    if (result.status === 200) {

                        if (result.status !== 200) return resolve(false);

                        this.getMode().then(mode => {
                            if (mode === 'BOOT') return resolve(true)
                        })

                        this.login().then(loginResult => {
                            return resolve(true);
                        })

                    }
                })
        })
    }

    async disconnect() {
        const result = await CassiaEndpoints.disconnectFromBleDevice(this.gatewayIp, this.mac);
        return result;
    }

    async login() {

        return await this.nextGenService.attemptLogin(this.mac);
    }

    async getMode() {

        return new Promise(async (resolve, reject) => {

            try {
                const { data } = await CassiaEndpoints.checkForCharacteristic(this.gatewayIp, this.mac);
                
                const isInBootMode = !!data.find(characterstic => characterstic.handle === 14 && characterstic.uuid === '00060001-f8ce-11e4-abf4-0002a5d5c51b');

                if (isInBootMode) return resolve("BOOT");
                return resolve("APPLICATION");
            } catch (err) {
                console.log(err)
            }
        })
    }

    async writeBleBootMessage(data) {

        return CassiaEndpoints.writeBleMessage(this.gatewayIp, this.mac, 14, data);

    }

    async jumpToBoot() {

        const result = await this.nextGenService.jumpToBoot(this.mac, true);

        return result;
    }

    async changeToBootMode() {
        const result = await this.jumpToBoot();
        return result;
    }

    async goToBootMode() {

        try {

            return new Promise((resolve, reject) => {

                this.connect()

                    .then(connectRes => {

                        if (connectRes) {

                            this.getMode()

                                .then(res => {

                                    if (res === "BOOT") return resolve(true);

                                    this.login()

                                        .then(loginRes => {

                                            if (loginRes.ack) {

                                                this.changeToBootMode()

                                                    .then(bootRes => {

                                                        this.disconnect();

                                                        return resolve(bootRes);
                                                    })
                                            }
                                        })

                                })
                        }
                    })
            })
        } catch (err) {

        }

    }

    delay = (delayInms) => {
        return new Promise(resolve => setTimeout(resolve, delayInms));
    };

    async upgradeFromBootMode() {

        const openNotificationResult = await CassiaEndpoints.openNotifications(this.gatewayIp, this.mac);

        if (openNotificationResult.status === 200) {

            this.upgradeProcessor.startUpgrade();
        }
        
    }

    async upgradeSensor(sensorFirmware) {

        const isConnected = await this.connect();

        if (!isConnected) return { isCompleted: false, reason: "Could not connect to the device" };

        const openNotificationResult = await CassiaEndpoints.openNotifications(this.gatewayIp, this.mac);

        if (openNotificationResult.status === 200) {

            this.upgradeProcessor.startUpgrade();
        }

        this.upgradeProcessor.onProgressV2(data => {

            console.log(this.progress);
            this.progress = data.progress;

        })

        // if (mode === 'APPLICATION') {

        //     const loginResult = await this.login();

        //     console.log(loginResult, '#####################################################')

        //     if (loginResult.ack) {

        //         const result = await this.changeToBootMode()

        //         console.log("Has sent change boot mode successfully");

        //         if (result) {

        //             setTimeout(async () => {

        //                 const isConnected = await this.connect();

        //                 if (!isConnected) return { isCompleted: false, reason: "Could not connect to the device" };

        //                 console.log(isConnected, 'Connected response')

        //                 if (isConnected) {
        //                     const connectAgain = await this.connect();

        //                     if (connectAgain) {
        //                         console.log(connectAgain, 'Connect again response')

        //                         const mode = await this.getMode();

        //                         if (mode === 'BOOT') {
        //                             await this.upgradeFromBootMode(sensorFirmware);
        //                         }

        //                         console.log(mode, "THIS IS THE MODE AFTER CONNECT AGAIN");

        //                     }
        //                 }
        //             }, 5000);

        //         }


        //         if (!loginResult.ack) return { isCompleted: false, reason: "Could not login to device" };

        //     }

        // }

    }

    async upgradeBootLoader(bootLoaderFirmware) {

        let upgradeProcessor = new UpgradeProcessor(this.mac, bootLoaderFirmware, "49A134B6C779", this.writeBleBootMessage);

        const isConnected = await this.connect();

        if (!isConnected) return { isCompleted: false, reason: "Could not connect to the device" };

        const mode = await this.getMode();

        if (mode === "BOOT") {

            const openNotificationResult = await CassiaEndpoints.openNotifications(this.gatewayIp, this.mac);

            if (openNotificationResult.status === 200) {
            }

        }




    }
    upgradeActor(firmwarePath) {

    }

    onDFUProgress(cb) {

        this.upgradeProcessor.onProgress(data => {

            if (this.dfuProgress === data.progress) return;
            cb(data);
        });
    }
    onBootMessageReply(reply) {

        this.upgradeProcessor.onResponse(reply);

    }

    onDFUend(cb) {
        return this.upgradeProcessor.controller.onDFUend(data => {
            if (data.isComplete) {
                this.dfuCompleted = true;
            }
            return cb(data);
        });

    }

    startUpgrading() {

        // const files = [];

        // this.firmwareToUpgrade.forEach(firmwarePath => {

        //     let fileContent = "";

        //     if (firmwarePath.includes('BL')) {

        //         fileContent = readFileSync(firmwarePath.slice(0, firmwarePath.length - 5), 'utf8'); // Read file content as string
        //     }

        //     else {

        //         fileContent = readFileSync(firmwarePath, 'utf8');
        //     }

        //     // Split the file content by newlines and count the lines
        //     const lineCount = fileContent.split(/\r?\n/).length;

        //     this.amountOfLines += lineCount;

        //     files.push({ path: firmwarePath, fileContent, lineCount });
        // })

        this.startDFU(this.firmwareToUpgrade[0]);

    }

    upgrade(path) {

        // console.log(path, '***************')

        let newPath = path;

        if (newPath.includes('BL')) {

            newPath = path.slice(0, newPath.length - 5)
            return this.upgradeSensor(path.slice(0, newPath.length - 5));


        }else {
            
            return this.upgradeSensor(path.slice(0, newPath.length - 5));
        }



    }

    startDFU(firmware) {

        this.upgrade(firmware);
    }



}