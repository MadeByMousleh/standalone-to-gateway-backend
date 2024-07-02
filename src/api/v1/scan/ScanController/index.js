import CassiaEndpoints from "../../../../thirdParty/cassia-rest-api/local/index.js";

import extractProductInfo from "../../../../../helpers/extractProductNrInfo.js";


const devices = {};


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

        // this.rawProductNumber = this.getMappedProductNumber(hexString);
        // this.sensorInfo = this.getSensorInfo(hexString)
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
            extractProductInfo.numberToProductNumberConverter[
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
    mail;
    tw;
    pushButtonEvent;
    pushButtonNumber;
    pirEvent;
    bleButtonMac;
    padding;
    timeStamp = null;

    constructor(hexString, macAddress) {


        // console.log(macAddress)
        if (macAddress === '10:B9:F7:0F:9B:87')
            console.log(hexString.replace(/(.{2})/g, '$1-').slice(0, -1));

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

            // [00-00-00-00-00-00-00-00-00]
            this.mail = hexString.slice(20, 38);
            this.tw = hexString.slice(38, 40);

            // [00-00-08-00-00-00]
            this.pushButtonEvent = hexString.slice(40, 42);
            this.pushButtonNumber = hexString.slice(42, 44);
            this.pirEvent = hexString.slice(44, 46);
            this.bleButtonMac = hexString.slice(46, 56);

            // [00-00-00-00-00]
            this.padding = hexString.slice(56, 66);
            this.macAddress = macAddress;

            if (this.pirEvent === '08') {
                const options = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' };
                this.timeStamp = new Date().toLocaleDateString('en-US', options);
            }
        }
    }


    // console.log(header, 'header');
    // console.log(payload, 'payload');

    // [02-01-06-1B-FF-FE-05]-[A6-03-01-00]-[00-00-00-00-00-00-00-00-00]-[00-00-08-00-00-00]-[00-00-00-00-00]
    // Header
    // [02-01-06-1B-FF-FE-05]-
    // 02 = Flags indicating BLE General Discoverable Mode
    // 01 = Length of the Flags field
    // 06 = Data Type indicating the Shortened Local Name
    // 1BFFFE05 = Bluetooth MAC Address (Little Endian)

    // [A6-03-01-00]
    // A6 = Sequence number
    // 03 = Source (network)
    // 01 = Source Type (Sec/push-button/master)
    // 00 = Wireless function

    // [00-00-00-00-00-00-00-00-00]
    // 00 = Mail
    // 00 = Mail
    // 00 = Mail
    // 00 = Mail
    // 00 = Mail
    // 00 = Mail
    // 00 = Mail
    // 00 = Mail
    // 00 = TW

    // [00-00-08-00-00-00]
    // 00 = Push button event
    // 00 = Push button number
    // 00 = Pir event
    // 00 = BLE button mac (Last three as the others are known)

    // [00-00-00-00-00]
    // 00 = Padding
    // 00 = Padding
    // 00 = Padding
    // 00 = Padding
    // 00 = Padding
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

// class Device {
//     scanData;
//     advertisementData;
//     signalStrength;
//     name;
//     eventType;
//     chipId;
//     macAddress;
//     macAddressType;
//     isConnected;
//     asciiName;
//     is230V;
//     isSecondary;
//     rawProductNumber;

//     constructor(jsonData) {

//         this.scanData = (jsonData.scanData && new ScanData(jsonData.scanData)) || null;

//         this.productNumber = this.scanData && this.scanData.productNumber;

//         this.advertisementData = (jsonData.adData && new AdvertisementData(jsonData.adData, jsonData.bdaddrs[0].bdaddr)) || null;

//         this.signalStrength = jsonData?.rssi;

//         this.eventType = jsonData?.evtType;

//         this.chipId = jsonData?.chipId;

//         this.macAddress = jsonData.bdaddrs[0].bdaddr;

//         this.macAddressType = jsonData.bdaddrs[0].bdaddrType;

//         // this.refinedProductNumber = extractProductInfo.extractProductInfo(this.scanData?.productNumber) ?? 'Unknown';

//         this.isConnected = this.eventType === 2;

//     }

//     #sensorSeries = {
//         0: "Not yet in use",
//         1: "Mini",
//         2: "Outdoor",
//         3: "Not yet in use",
//         4: "Not yet in use",
//         5: "Not yet in use",
//         6: "MR",
//         7: "LR",
//         8: "HC",
//         9: "Accessories",
//     };

//     #technology = {
//         0: "230V",
//         1: "NHC",
//         2: "24 V",
//         3: "KNX",
//         4: "Not yet in use",
//         5: "DALI",
//         6: "DALI wireless",
//         7: "On/Off wireless",
//         8: "Not yet in use",
//         9: "No value",
//     };

//     #mounting = {
//         0: "Ceiling, flush box",
//         1: "ceiling, flush",
//         2: "ceiling, surface",
//         3: "Wall",
//         4: "Wall flush",
//         5: "Not yet in use",
//         6: "Not yet in use",
//         7: "Not yet in use",
//         8: "Not yet in use",
//         9: "No value",
//     };

//     #output = {
//         0: "Slave",
//         1: "1 ch",
//         2: "2 ch",
//         3: "47",
//         4: "48",
//         5: "Not yet in use",
//         6: "Not yet in use",
//         7: "Not yet in use",
//         8: "Not yet in use",
//         9: "No value",
//     };

//     #detection = {
//         0: "No value",
//         1: "M",
//         2: "P",
//         3: "True presence",
//         4: "Not yet in use",
//         5: "Not yet in use",
//         6: "Not yet in use",
//         7: "Not yet in use",
//         8: "No value",
//         9: "No value",
//     };

//     #variant = {
//         0: "Wago 1 cable",
//         1: "White",
//         2: "Black",
//         3: "Silver",
//         4: "Wago 2 cables",
//         5: "Wieland 1 cable",
//         6: "Wieland 2 cables",
//         7: "Not yet in use",
//         8: "Remote control",
//         9: "No value",
//     };

//     #getOutput = (technology, output) => {
//         if (output !== "Slave") return output;
//         return technology !== "230V" ? "46" : "41";
//     };

//     #getIsSecondary = () => { };

//     getName = () => {
//         try {
//             const number = this.scanData.productNumber.split("-");
//             if (number[0] !== "353") return this.scanData.productNumber;
//             const usableNumber = number[1] || "";
//             const usableNumberArr = usableNumber.split("");
//             const correctOutput = this.#getOutput(
//                 this.#technology[usableNumberArr[1]],
//                 this.#output[usableNumberArr[3]]
//             );
//             const translated = `${this.#detection[usableNumberArr[4]]
//                 }${correctOutput} (${this.#sensorSeries[usableNumberArr[0]]}), ${this.#technology[usableNumberArr[1]]
//                 }`;
//             return translated;
//         } catch (err) {
//             return "Unknown";
//         }
//     };

//     hasName = () => {
//         return !this.scanData.rawProductNumber === "FF";
//     };
// }


class Device {
    commonBleData;
    scanData;
    advertisementData;

    constructor(commonBleData, scanData, advertisementData) {

        this.commonBleData = commonBleData;

        this.scanData = scanData;

        this.advertisementData = advertisementData;

        // this.isConnected = commonBleData.eventType === 2;

    }
}

const IP = "192.168.40.1";


function sendMobileScanData(event, response) {

    let data = JSON.parse(event.data)

    const commonData = new BLECommonData(data.bdaddrs[0].bdaddr, data.bdaddrs[0].bdaddrType, data.evtType, data.rssi, data.chipId, data.name, data?.scanData, data?.adData);

    const scanData = commonData.scanData && new ScanData(commonData.scanData);

    const adData = commonData.advertisementData && new AdvertisementData(commonData.advertisementData);

    const device = new Device(commonData, scanData, adData);

    response.write(`data: ${JSON.stringify(device)}\n\n`);

}

export const ScanForBleDevices = (request, response, next) => {

    const scanSSE = CassiaEndpoints.scanForBleDevices(IP, request, response, (event) => sendMobileScanData(event, response));

    const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
    };

    response.writeHead(200, headers);


};
