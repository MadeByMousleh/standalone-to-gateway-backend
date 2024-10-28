import CassiaEndpoints from "../../../../thirdParty/cassia-rest-api/local/index.js";

import productNumberHelper from "../../../../../helpers/extractProductNrInfo.js";

import EventEmitter from "events";

import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import path, { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Writable } from 'stream';
import { promisify } from 'util';
import { finished } from 'stream/promises';

import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { error } from "console";
import NextGenDevice from "../../../../../models/NextgenDevice/index.js";

const token = 'vV_E03gDMHwmt1r4242KfR7Gc_oOjdCQKdtS65Q7G5Ysz9f6jz-2hd4ubuYufslPvoPYgouPuHudaOF9ledLwg=='
const url = 'http://localhost:8086'

const client = new InfluxDB({ url, token })


let org = `Wygwam`
let bucket = `standalone-to-bms`

let writeClient = client.getWriteApi(org, bucket, 'ns')


// Polyfill for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IP = "192.168.40.1";

const firmware = {};

const devices = {};

const luxEvent = new EventEmitter();


function logCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

const changeEndianness = (string) => {
    const result = [];
    let len = string.length - 2;
    while (len >= 0) {
      result.push(string.substr(len, 2));
      len -= 2;
    }
    return result.join('');
}



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


// const writeStream = fs.createWriteStream();


// Promisify the stream write operation to use async/await
luxEvent.on('lux', data => {
    // console.log(data)
    const { macAddress, timeStamp, lux } = data;
    // writeJsonData(macAddress, timeStamp, lux).catch(console.error);
});

// async function writeJsonData(macAddress, timeStamp, lux) {
//     const baseDir = resolve(__dirname, '../../../../data/lux');
//     const filePath = join(baseDir, `${macAddress}.json`);

//     if (!existsSync(baseDir)) {
//         mkdirSync(baseDir, { recursive: true });
//     }

//     const dataToWrite = JSON.stringify({ lux, timeStamp }) + '\n';

//     // Use async function to write data to file
//     if (existsSync(filePath)) {
//         console.log("APPENDING...");
//         await appendData(filePath, dataToWrite);
//     } else {
//         console.log("Writing new data...");
//         await writeData(filePath, dataToWrite);
//     }
// }

async function appendData(filePath, data) {
    const writeStream = createWriteStream(filePath, { flags: 'a' });
    writeStream.write(data);
    await finished(writeStream);
    console.log("Data appended");
}

async function writeData(filePath, data) {
    const writeStream = createWriteStream(filePath);
    writeStream.write(data);
    await finished(writeStream);
    console.log("New data written");
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

const currentWorkingDirectory = process.cwd();


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

        console.log(hexString.length)

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

        // console.log(this.advertisementData)

        // this.isConnected = commonBleData.eventType === 2;

    }
}

function extractLuxData(hexData) {

    // Extract the last two characters
    const hexString = hexData.slice(-2);

    // Convert the hexadecimal string to an integer
    const lux = parseInt(hexString, 16);

    return lux;
}


function updateDevices(device) {

    const exists = devices[device.mac];


    if (exists) {
        if (device.lux === 0 && exists.lux !== 0) {
            devices[device.mac] = { ...device, lux: exists.lux };
        }
        else {
            devices[device.mac] = { ...device };
        }
    }
    else {
        devices[device.mac] = device;
    }

    // console.log(devices);
    // console.log(Object.keys(devices).length)

}



function sendMobileScanData(event, response) {

    let data = JSON.parse(event.data)

    const commonData = new BLECommonData(data.bdaddrs[0].bdaddr, data.bdaddrs[0].bdaddrType, data.evtType, data.rssi, data.chipId, data.name, data?.scanData, data?.adData);

    const scanData = commonData.scanData && new ScanData(commonData.scanData);

    const adData = commonData.advertisementData && new AdvertisementData(commonData.advertisementData, commonData.bleAddress);

    const device = new Device(commonData, scanData, adData);

    if (adData) {

        const nextGenDevice = new NextGenDevice(device.commonBleData.bleAddress, adData);

        updateDevices(nextGenDevice);
    }

    // 0201061BFFFE05CB1901000000000000000000000000080000000000000000

    // AdvertisementData {
    //     flags: '02',
    //     header: '01061BFFFE',
    //     sequenceNumber: 5,
    //     source: 203,
    //     sourceType: 25,
    //     wirelessFunction: 1,
    //     mailOne: '000000',
    //     mailTwo: '000000',
    //     mailThree: '000000',
    //     mailFour: '000000',
    //     tw: '08',
    //     pushButtonEvent: '00',
    //     pushButtonNumber: '00',
    //     pirEvent: '00',
    //     bleButtonMac: '000000',
    //     padding: '0000',
    //     advertisementTimeStamp: 1724231075160,
    //     macAddress: '10:B9:F7:0F:6C:AC'
    //   } 0201061BFFFE05CD1901000000000000000000000000080000000000000000


    // if (commonData.bleAddress === '10:B9:F7:10:61:A5') {

    //     console.log(device.advertisementData)
    // }



    response.write(`data: ${JSON.stringify(device)}\n\n`);

}
export const ScanForBleDevices = (request, response, next) => {

    let listenMode = request.query['listenMode'];

    const scanSSE = CassiaEndpoints.scanForBleDevices(IP, request, response, (event) => sendMobileScanData(event, response), listenMode);

    const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
    };

    response.writeHead(200, headers);


    response.on('close', () => {
        console.log('Client closed the connection, stopping BLE scan.');

        scanSSE.close();

        // End the response
        response.end()

    });


};


export const getData = (request, response, next) => {

    const { mac } = request.params;

    console.log(devices[mac.toUpperCase()]);

    let device = devices[mac.toUpperCase()];

    response.status(200).send(JSON.stringify(device));
}