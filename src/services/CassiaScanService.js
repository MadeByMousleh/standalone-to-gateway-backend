import EventEmitter from "events";
import EventSource from "eventsource";
import productNumberHelper from "../../helpers/extractProductNrInfo.js";

import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import path, { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Writable } from 'stream';
import { promisify } from 'util';

import { finished } from 'stream/promises';

import { InfluxDB, Point } from '@influxdata/influxdb-client';


class BleScanService {
    static instance;

    constructor(IP) {
        if (BleScanService.instance) {
            console.log("♻️  Reusing existing BleScanService instance");
            return BleScanService.instance;
        }

        console.log("✅ Starting new BleScanService...");
        this.IP = IP;
        this.eventEmitter = new EventEmitter();
        this.eventSource = new EventSource(`http://${IP}/gap/nodes?event=1&filter_mac=10:B9:F7*&timestamp=1&active=1`);

        this.eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const commonData = new BLECommonData(
                data.bdaddrs[0].bdaddr,
                data.bdaddrs[0].bdaddrType,
                data.evtType,
                data.rssi,
                data.chipId,
                data.name,
                data?.scanData,
                data?.adData
            );

            const scanData = commonData.scanData && new ScanData(commonData.scanData);
            const adData = commonData.advertisementData && new AdvertisementData(commonData.advertisementData, commonData.bleAddress);
            const device = new Device(commonData, scanData, adData);

            this.eventEmitter.emit("scanData", device);
        };

        this.eventSource.onerror = (err) => {
            console.error("❌ Error in BleScanService:", err);
        };

        this.setupCleanup();
        BleScanService.instance = this;
    }

    onData(cb) {
        this.eventEmitter.on("scanData", (data) => cb(data));
    }

    close() {
        if (BleScanService.instance) {
            console.log("🛑 Closing BleScanService...");
            this.eventSource.close();
            this.eventEmitter.removeAllListeners();
            BleScanService.instance = null;
        }
    }

    setupCleanup() {
        const cleanup = () => {
            this.close();
            console.log("🚪 Cleanup executed before exit.");
            process.exit();
        };

        process.on("SIGINT", cleanup);   // Ctrl+C (Interrupt signal)
        process.on("SIGTERM", cleanup);  // Termination signal
        process.on("beforeExit", cleanup); // Before Node.js process exits
        process.on("exit", cleanup);     // When Node.js process exits
        process.once("SIGHUP", cleanup); // Terminal/VS Code close
    }
}

const currentWorkingDirectory = process.cwd();



function writePir(macAddress) {

    // console.log("Writing point", logCurrentTime());
    // try {

    //     let point = new Point('Movement')
    //         .tag("macAddress", macAddress)
    //         .intField('isPirDetected', 1)
    //     writeClient.writePoint(point)

    //     writeClient.flush();

    // } catch (err) {

    //     console.log(err)
    //     writeClient.flush();


    // }
}

function writeLux(macAddress, lux) {

    // console.log("Writing Lux data", lux, logCurrentTime());
    // try {

    //     let point = new Point('Lux')
    //         .tag("macAddress", macAddress)
    //         .intField('lux-level', lux)
    //     writeClient.writePoint(point)

    //     writeClient.flush();

    // } catch (err) {
    //     console.log(error)
    //     writeClient.flush();

    // }
}

function writeIsLightOn(macAddress) {

    // console.log("Writing is light on", logCurrentTime());
    // try {
    //     let point = new Point('Light On')
    //         .tag("macAddress", macAddress)
    //         .intField('light-on', 1)
    //     writeClient.writePoint(point)
    //     writeClient.flush();

    // } catch (err) {
    //     console.log(error)
    //     writeClient.flush();

    // }

}

const firmware = {};

const getFiles = (folderPath, detectorType, version) => {

    let arrayOfFiles = []

    try {

        const files = readdirSync(folderPath);

        if (!files) {

            return [];

        }

        files.forEach(file => {

            const fullPath = path.join(folderPath, file);

            if (file.includes('AP4')) {

                if (detectorType.includes('48') || detectorType.includes('47')) {


                    arrayOfFiles.push({
                        key: fullPath,
                        value: fullPath,
                        title: "Sensor",
                    });
                }
            }

            if (file.includes('AP2')) {

                if (detectorType.includes('48') || detectorType.includes('47')) {
                    arrayOfFiles.push({
                        key: fullPath,
                        value: fullPath,
                        title: file
                    });
                }
            }


            if (file.includes('BL')) {
                arrayOfFiles.push({
                    key: `${fullPath}-${version}`,
                    value: `${fullPath}-${version}`,
                    title: "Boot loader"
                });
            }



            if (file.includes('AP1') && (detectorType.includes('42') || detectorType.includes('41'))) {
                arrayOfFiles.push({
                    key: fullPath,
                    value: fullPath,
                    title: "Sensor"
                });
            }

            if (file.includes('AP3') && (detectorType.includes('46') || detectorType.includes('49'))) {
                arrayOfFiles.push({
                    key: fullPath,
                    value: fullPath,
                    title: "Sensor"
                });
            }

        })

        return arrayOfFiles;

    } catch (error) {
        console.error(`Error reading folder: ${error.message}`);
    }
}

function getFirmwarePaths(version, productType, currentDirectorPath) {

    const type = productType.slice(0, 3);

    if (version.includes('BL')) {
        return `./firmwares/${type}/${version}/${version.replace(/\./g, '')}.cyacd`
    }

    if (type === 'P46' || type === 'P42' || type === 'P48') {
        return `./firmwares/${type}/${version}/353AP3${version.replace(/\./g, '')}.cyacd`
    }


}


function listFilesInFolder(folderPath, detectorType) {

    if (firmware[detectorType]) {
        return firmware[detectorType]
    }

    let arrayOfFolders = []
    let array = [];

    try {

        const files = readdirSync(folderPath);

        if (!files) {
            return [];
        }

        files.forEach(file => {

            const fullPath = path.join(folderPath, file);

            arrayOfFolders.push(fullPath);

        })

        arrayOfFolders.forEach(folder => {
            array.push({
                detectorType,
                title: folder.slice(folder.length - 4, folder.length),
                folder,
                key: folder,
                value: folder,
                children: getFiles(folder, detectorType, folder.slice(folder.length - 4, folder.length)),
            })
        })


        // console.log(array)

        firmware[detectorType] = array;

        return firmware[detectorType];


    } catch (error) {
        console.error(`Error reading folder: ${error.message}`);
    }
}



class ScanData {

    constructor(hexString) {

        if (hexString.length !== 56) return null;

        this.fieldLength = hexString.slice(0, 2);
        this.fieldId = hexString.slice(2, 4);
        this.companyId = hexString.slice(4, 8);

        this.macAddress = hexString.slice(8, 20).match(/.{2}/g).join(":");

        this.rawProductNumber = hexString.slice(20, 50);

        this.productNumber = this.getTextProductNumber();

        this.networkId = hexString.slice(50, 52);

        this.lockedInfo = hexString.slice(52, 54);

        this.reserved = hexString.slice(54, 56);

        this.name = this.getName();

        this.productNumberInfo = productNumberHelper.productNumberToObject[this.productNumber];

        this.shortname = this.productNumberInfo && this.productNumberInfo.DetectorShortDescription + ' ' + this.productNumberInfo.DetectorType || "P48";
        this.firmwaresAvailable = listFilesInFolder(`${currentWorkingDirectory}/firmwares/${this.shortname.slice(0, 3)}`, this.shortname.slice(0, 3));
    }

    hexToAscii(hex) {
        let str = "";
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        return str;
    }

    asciiToHex(str) {
        let hex = "";
        for (let i = 0; i < str.length; i++) {
            hex += str.charCodeAt(i).toString(16).padStart(2, "0");
        }
        return hex;
    }

    getRefinedProductNumber() {
        return this.refinedProductNumber;
    }

    getTextProductNumber() {
        const asciiProductNumber = this.hexToAscii(this.rawProductNumber);
        if (asciiProductNumber.includes("353-")) {
            const productNumber = asciiProductNumber.split("\x00")[0];
            return productNumber;
        }

        const detectorInfo =
            productNumberHelper.numberToProductNumberConverter[
            +`${Number("0x" + this.rawProductNumber.slice(0, 2))} `
            ];
        // console.log(detectorInfo)
        if (detectorInfo) return detectorInfo.Name;

        return "Unknown";
        // console.log(extractInfo.numberToProductNumberConverter(Number(rawProductNumber.slice(0, 2))))
    }

    getName = () => {
        const asciiProductNumber = this.hexToAscii(this.rawProductNumber);

        if (asciiProductNumber.includes("353-")) {
            const productNumber = asciiProductNumber.split("\x00")[0];
            return productNumber;
        } else
            return asciiProductNumber
                .slice(1, asciiProductNumber.length)
                .split("\x00")[0];
    };

    toHexString() {
        const fieldLengthHex = this.fieldLength;
        const fieldIdHex = this.fieldId;
        const companyIdHex = this.companyId;
        const macAddressHex = this.macAddress.split(":").join("");
        const productNumberHex = this.asciiToHex(this.productNumber).padEnd(
            30,
            "0"
        );
        const networkIdHex = this.networkId;
        const lockedInfoHex = this.lockedInfo;
        const reservedHex = this.reserved;

        return (
            fieldLengthHex +
            fieldIdHex +
            companyIdHex +
            macAddressHex +
            productNumberHex +
            networkIdHex +
            lockedInfoHex +
            reservedHex
        );
    }
}

class AdvertisementData {
    flags;
    header;
    sequenceNumber;
    source;
    sourceType;
    wirelessFunction;
    mailOne;
    mailTwo;
    mailThree;
    mailFour;
    tw;
    pushButtonEvent;
    pushButtonNumber;
    pirEvent;
    bleButtonMac;
    padding;
    advertisementTimeStamp

    constructor(hexString, macAddress) {


        if (hexString.length > 0) {
            // Flags
            this.flags = hexString.slice(0, 2);

            // Header
            this.header = hexString.slice(2, 12);

            // [A6-03-01-00]
            this.sequenceNumber = Number(`0x${hexString.slice(12, 14)}`);

            this.source = Number(`0x${hexString.slice(14, 16)}`);

            this.sourceType = Number(`0x${hexString.slice(16, 18)}`);

            this.wirelessFunction = Number(`0x${hexString.slice(18, 20)}`);

            // [00-00-00-00-00-00-00-00-00-00-00-00]
            this.mailOne = hexString.slice(20, 26);

            this.mailTwo = hexString.slice(26, 32);

            this.mailThree = hexString.slice(32, 38);

            this.mailFour = hexString.slice(38, 44);



            this.tw = hexString.slice(44, 46);

            // [00-00-08-00-00-00]
            this.pushButtonEvent = hexString.slice(46, 48);

            this.pushButtonNumber = hexString.slice(48, 50);

            this.pirEvent = hexString.slice(50, 52);

            this.bleButtonMac = hexString.slice(52, 58);

            // [00-00-00-00-00]
            this.padding = hexString.slice(58, 68);

            this.macAddress = macAddress;
            this.advertisementTimeStamp = new Date().getTime();

            if (this.tw === '08') {
                writePir(this.macAddress);
            }

            if (this.mailFour !== "000000" && this.mailFour) {

                if (this.mailFour) {


                    let luxLevel = Number("0x" + this.mailFour.slice(2, 6));

                    // console.log(luxLevel, 'LUX level')

                    if (luxLevel !== 1023) {

                        writeLux(this.macAddress, Number("0x" + this.mailFour.slice(2, 6)))

                    }

                    let isLightOn = Number(this.mailFour.slice(0, 2));

                    // console.log(isLightOn, 'Light is on')

                    if (isLightOn === 1) {

                        writeIsLightOn(macAddress);
                    }

                }
            }



            if (this.pirEvent === '08') {
                const options = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' };
                // this.timeStamp = new Date().toLocaleDateString('en-US', options);
            }
        }
    }

}

class BLECommonData {

    bleAddress;
    bleAddressType;
    eventType;
    signalStrength;
    chipId;
    name;
    scanData;
    advertisementData;

    constructor(bleAddress, bleAddressType, eventType, signalStrength, chipId, name, scanData, advertisementData) {
        this.bleAddress = bleAddress;
        this.bleAddressType = bleAddressType;
        this.eventType = eventType;
        this.signalStrength = signalStrength;
        this.chipId = chipId;
        this.name = name;
        this.scanData = scanData;
        this.advertisementData = advertisementData;

    }
}

class Device {
    commonBleData;
    scanData;
    advertisementData;

    constructor(commonBleData, scanData, advertisementData) {

        this.commonBleData = commonBleData;

        this.scanData = scanData;

        this.advertisementData = advertisementData;

    }
}

export default BleScanService;
