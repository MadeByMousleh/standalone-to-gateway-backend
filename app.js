import { readFileSync } from "fs";
import axios from "axios";
// const EventSourcePolyfill = require("event-source-polyfill").EventSourcePolyfill;
import bodyParser from "body-parser";
import express, { json as _json } from "express";
import cors from "cors";
import DFUController from "./models/DFUController.js";
import EventEmitter from "events";
import extractInfo from "./helpers/extractProductNrInfo.js";
import dotenv from "dotenv";
import EventSource from "eventsource";
import LoginTelegram from "./telegrams/v1/LoginTelegram/index.js";
import LoginTelegramReply from "./telegrams/v1/LoginTelegram/LoginTelegramReply.js";
import GetUserConfigTelegram from "./telegrams/v1/Userconfig/GetUserConfigTelegram.js";
import GetUserConfigReply from "./telegrams/v1/Userconfig/GetUserConfigReply.js";
import SetUserConfigTelegram from "./telegrams/v1/Userconfig/SetUserConfigTelegram.js";
import GetWiredPushButtonList from "./telegrams/v1/WiredPushButtonList/GetWiredPushButtonList/index.js";
import SetWiredPushButtonList from "./telegrams/v1/WiredPushButtonList/SetWiredPushButtonList/index.js";
import GetWirelessFunctionTelegram from "./telegrams/v1/WirelessFunction/GetWirelessFunctionTelegram/index.js";
import extractProductInfo from "./helpers/extractProductNrInfo.js";
import fs from "fs";
import DaliGetZoneAssignmentCount from "./telegrams/v1/DaliGetZoneAssignmentCount/index.js";
import DaliGetZoneAssignmentCountReply from "./telegrams/v1/DaliGetZoneAssignmentCount/reply.js";
import DaliQueryControlGear from "./telegrams/v1/DaliQueryControlGear/index.js";
import DaliQueryControlGearReply from "./telegrams/v1/DaliQueryControlGear/reply.js";
dotenv.config();

function hexToAscii(hexString) {
    let asciiString = "";

    for (let i = 0; i < hexString.length; i += 2) {
        const hexCharCode = parseInt(hexString.substr(i, 2), 16);

        // Append the character to the ASCII string only if it's not a null character
        if (hexCharCode !== 0) {
            asciiString += String.fromCharCode(hexCharCode);
        }
    }

    return asciiString;
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

class AdvirtismentHeader {
    advLength;
    advType;
}
class AdvirtisementData {
    length;
    advirtismentType;
    companyId;
    macAddress;
    productNumber;
    networkId;
    lockedInfo;
    reserved;

    constructor(hexString) {
        if (hexString.length > 0) {
            this.fieldLength = Number(`0x${hexString.slice(0, 2)}`);
            this.fieldId = Number(`0x${hexString.slice(2, 4)}`);
            this.companyId = Number(`0x${hexString.slice(4, 8)}`);
            this.macAddress = hexString.slice(8, 20).replace(/(.{2})/g, "$1:").slice(0, -1);
            this.productNumber = hexToAscii(hexString.slice(20, 50));
            this.networkId = Number(`0x${hexString.slice(50, 52)}`);
            this.lockedInfo = Number(`0x${hexString.slice(52, 54)}`);
            this.reserved = Number(`0x${hexString.slice(54, 56)}`);
        }
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
    macAddress;
    timeStamp = null;

    constructor(hexString, macAddress) {

        // console.log(macAddress)

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



class Device {
    scanData;
    advertisementData;
    signalStrength;
    name;
    eventType;
    chipId;
    macAddress;
    macAddressType;
    isConnected;
    asciiName;
    is230V;
    isSecondary;
    rawProductNumber;

    constructor(jsonData) {

        this.scanData = (jsonData.scanData && new ScanData(jsonData.scanData)) || null;

        this.productNumber = this.scanData && this.scanData.productNumber;

        this.asciiName = this.scanData?.name ?? "Unknown";

        this.advertisementData = (jsonData.adData && new AdvertisementData(jsonData.adData, jsonData.bdaddrs[0].bdaddr)) || null;

        this.signalStrength = jsonData?.rssi;

        this.eventType = jsonData?.evtType;

        this.chipId = jsonData?.chipId;

        this.macAddress = jsonData.bdaddrs[0].bdaddr;

        this.macAddressType = jsonData.bdaddrs[0].bdaddrType;

        // this.refinedProductNumber = extractProductInfo.extractProductInfo(this.scanData?.productNumber) ?? 'Unknown';

        this.isConnected = false;

    }

    #sensorSeries = {
        0: "Not yet in use",
        1: "Mini",
        2: "Outdoor",
        3: "Not yet in use",
        4: "Not yet in use",
        5: "Not yet in use",
        6: "MR",
        7: "LR",
        8: "HC",
        9: "Accessories",
    };

    #technology = {
        0: "230V",
        1: "NHC",
        2: "24 V",
        3: "KNX",
        4: "Not yet in use",
        5: "DALI",
        6: "DALI wireless",
        7: "On/Off wireless",
        8: "Not yet in use",
        9: "No value",
    };

    #mounting = {
        0: "Ceiling, flush box",
        1: "ceiling, flush",
        2: "ceiling, surface",
        3: "Wall",
        4: "Wall flush",
        5: "Not yet in use",
        6: "Not yet in use",
        7: "Not yet in use",
        8: "Not yet in use",
        9: "No value",
    };

    #output = {
        0: "Slave",
        1: "1 ch",
        2: "2 ch",
        3: "47",
        4: "48",
        5: "Not yet in use",
        6: "Not yet in use",
        7: "Not yet in use",
        8: "Not yet in use",
        9: "No value",
    };

    #detection = {
        0: "No value",
        1: "M",
        2: "P",
        3: "True presence",
        4: "Not yet in use",
        5: "Not yet in use",
        6: "Not yet in use",
        7: "Not yet in use",
        8: "No value",
        9: "No value",
    };

    #variant = {
        0: "Wago 1 cable",
        1: "White",
        2: "Black",
        3: "Silver",
        4: "Wago 2 cables",
        5: "Wieland 1 cable",
        6: "Wieland 2 cables",
        7: "Not yet in use",
        8: "Remote control",
        9: "No value",
    };

    #getOutput = (technology, output) => {
        if (output !== "Slave") return output;
        return technology !== "230V" ? "46" : "41";
    };

    #getIsSecondary = () => { };

    getName = () => {
        try {
            const number = this.scanData.productNumber.split("-");
            if (number[0] !== "353") return this.scanData.productNumber;
            const usableNumber = number[1] || "";
            const usableNumberArr = usableNumber.split("");
            const correctOutput = this.#getOutput(
                this.#technology[usableNumberArr[1]],
                this.#output[usableNumberArr[3]]
            );
            const translated = `${this.#detection[usableNumberArr[4]]
                }${correctOutput} (${this.#sensorSeries[usableNumberArr[0]]}), ${this.#technology[usableNumberArr[1]]
                }`;
            return translated;
        } catch (err) {
            return "Unknown";
        }
    };

    hasName = () => {
        return !this.scanData.rawProductNumber === "FF";
    };
}

//CONSTANT
const PAYLOAD_PATH = "./353AP10215.cyacd";
const token =
    "6c57bd98c9a469b41b2cf8b89831dbdc951e084e3d555625cb0ff8be8b1e476a";
const applicationEventEmitter = new EventEmitter();

const baseUrl = process.env.BASE_URL;
const IP = "192.168.40.1";

const corsOptions = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
};

//Variables
var subscribers = [];

let DFUControllers = [];

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors(corsOptions));

const replyEmitter = new EventEmitter();

let replyName = "reply";

const messageEmitter = new EventEmitter();

const evReply = new EventSource(`http://${IP}/gatt/nodes?event=1`);

evReply.onmessage = (e) => replyEmitter.emit(replyName, e.data);

evReply.onmessage = (msg) => {
    let { id, value } = JSON.parse(msg.data);

    messageEmitter.emit(id, value);
};

function listenForData(nodeMac, reply, cb) {
    return messageEmitter.on(nodeMac, (data) => {
        if (reply.isAck(data)) return cb(true);
        cb(false);
    });
}

const subscribeOnce = (event, cb) => {
    replyName = event;
    replyEmitter.once(event, (e) => cb(e));
};

const unsubscribe = (event, cb) => {
    replyEmitter.removeAllListeners();
};

function events(request, response, next) {
    const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
    };

    response.writeHead(200, headers);

    const subscriberId = uniqueId("#");

    const subscriber = {
        id: subscriberId,
        response,
        progress: 0,
    };

    subscribers.push(subscriber);

    request.on("close", () => {
        console.log(`${subscriberId} Connection closed`);
        subscribers = subscribers.filter((sub) => sub.id !== subscriberId);
    });
}

function sendCypressData(data, mac) {
    axios({
        method: "GET",
        url: `http://${IP}/gatt/nodes/${mac}/handle/14/value/${data}`,
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

async function connectToDevice(nodeMac) {
    try {
        return axios({
            method: "POST",
            data: {
                timeout: "10000",
                type: "public",
                discovergatt: 0,
            },

            url: `http://${IP}/gap/nodes/${nodeMac}/connection`,

            headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
            },
        });
    } catch (e) {
        console.log("Error in connection - Failed in connectToDevice");
    }
}

async function sendLoginTelegram(nodeMac) {
    try {
        return axios({
            method: "GET",
            url: `http://${IP}/gatt/nodes/${nodeMac}/handle/19/value/0110000900FB951D01?noresponse=1`,
            headers: {
                Accept: "*/*",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
    } catch (e) {
        console.log(e);
        console.log("Failed in sending login telegram");
    }
}

async function sendJumpToBootTelegram(nodeMac) {
    try {
        return await axios({
            method: "GET",
            url: `http://${IP}/gatt/nodes/${nodeMac}/handle/19/value/0101000800D9CB01?noresponse=1`,
            headers: {
                Accept: "*/*",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
    } catch (e) {
        console.log("Failed in jump to boot");
    }
}

async function openNotification(nodeMac) {
    const result = await axios({
        method: "GET",
        url: `http://${IP}/gatt/nodes/${nodeMac}/handle/15/value/0100`,
        headers: {
            Accept: "*/*",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    const resultData = await result;

    if (resultData.status === 200) {
        return true;
    }

    console.log("Failed on opening notification");
    return false;
}

const eventSource = new EventSource(`http://${IP}/gatt/nodes?event=1`);

eventSource.onmessage = (result) => {
    const data = JSON.parse(result.data);

    console.log(data);

    if (data.handle === 16) {
        applicationEventEmitter.emit("applicationData", data);
    }

    if (data.handle === 14) {
        applicationEventEmitter.emit("bootData", data);

        // const data = JSON.parse(result.data);
        const bufferData = Buffer.from(data.value, "hex");

        console.log(
            "-----------------------------------------------------------------------------------"
        );

        console.log("Read data", bufferData);

        console.log(
            "-----------------------------------------------------------------------------------"
        );

        DFUControllers[data.id].onResponse(bufferData);
    }
};

eventSource.onerror = (err) => {
    console.log("EventSource error: ", err);
};

const checkIfHandleIsThere = async (mac) => {
    const result = axios({
        method: "GET",
        url: `http://${IP}/gatt/nodes/${mac}/services/00060000-f8ce-11e4-abf4-0002a5d5c51b/characteristics`,
        headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
        },
    });

    const resultData = await result;

    if (resultData.status === 200) {
        if (resultData.data[0].uuid === "00060001-f8ce-11e4-abf4-0002a5d5c51b") {
            return true;
        }
    }
    console.log("Failed on checking handle");
    return false;
};

const getConnectionList = async () => {
    try {
        return axios({
            method: "GET",

            url: `http://${IP}/gap/nodes?connection_state=connected`,
            headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
            },
        });
    } catch (e) {
        console.log(e);
        console.log("Failed in getting connection list");
    }
};

const tryFirmwareUpgrade = async (mac, cb) => {
    try {
        const connectedResult = await connectToDevice(mac);

        if (connectedResult.status === 200) {
            console.log("connected");

            const loginResult = await sendLoginTelegram(mac);

            if (loginResult.status === 200) {
                console.log("Logged in");

                const jumpToBootResult = await sendJumpToBootTelegram(mac);

                if (jumpToBootResult.status === 200) {
                    console.log("Jumped to boot");
                    console.log("Disconnected...");

                    return await connectToDevice(mac);
                }
            }
        }
    } catch (e) {
        console.log(e);
        console.log("Failed in try firmware");
    }
};

const openAndStartDFU = async (mac) => {
    try {
        connectToDevice(mac).then(async (res) => {
            if (res.status === 200) {
                console.log("Step");

                if (!DFUControllers[mac]) {
                    const deviceInBoot = await checkIfHandleIsThere(mac);

                    if (deviceInBoot) {
                        const notificationOpen = await openNotification(mac);

                        if (notificationOpen) {
                            console.log("Notification opened");

                            var payload = readFileSync(PAYLOAD_PATH, "utf8");
                            DFUControllers[mac] = new DFUController(
                                payload,
                                "49A134B6C779",
                                sendCypressData,
                                mac
                            );
                            DFUControllers[mac].onProgress("progress", sendData);
                            DFUControllers[mac].startDFU();
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.log("Failed here");
    }
};

app.post("/upgrade", (req, res, next) => {
    const mac = req.body.mac;

    try {
        openAndStartDFU(mac);
        res.status(200);
    } catch (e) {
        console.log(e);
        res.send(500);
    }
});

app.post("/jump-to-boot", (req, res, next) => {
    const mac = req.body.mac;

    try {
        tryFirmwareUpgrade(mac).then((result) => {
            if (result) {
                console.log(result, '"CHECKING IF CONNECTED AGAIN');
                if (result.status) {
                    if (result.status === 200) {
                        getConnectionList().then((getListRes) => {
                            const exists = getListRes.data.nodes.find((x) => x.id === mac);

                            if (exists) {
                                console.log("Sending that it exists");
                                res.status(200).send("OK");
                            } else {
                                throw new Error("Device is not connected");
                            }
                        });
                    }
                }
            }
        });
    } catch (e) {
        console.log(e);
        console.log("Failed");
        res.send(500);
    }
});

// app.post('/upgrade-start', (req, res, next) => {
//     const mac = req.body.mac;
//     openAndStartDFU(mac)
//     res.status(200);

// })

app.get("/detector/:productNumber/:mac", (req, response, next) => {
    const params = req.params;
    const getUserConfigTelegram = new GetUserConfigTelegram().create();

    axios(
        `http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${getUserConfigTelegram}?noresponse=1`,
        {
            method: "GET",
        }
    ).then((res) => {
        if (res.status === 200) {
            // console.log("Get user config executed successfully");
            subscribeOnce("getUserConfig", (data) => {
                // console.log(data);
                const getUserConfigReply = new GetUserConfigReply(data);

                getUserConfigReply.getOverview();
                if (getUserConfigReply) {
                    unsubscribe("getUserConfig", (e) => console.log(e));

                    return response.send(
                        JSON.stringify({
                            metaData: extractInfo(params.productNumber),
                            userConfigReply: getUserConfigReply.get(),
                        })
                    );
                }
            });
        }
    });

    // response.send(JSON.stringify(extractInfo(params.productNumber)));
});

app.get("/detector/:productNumber/:mac/sensitivity", (req, response, next) => {
    const params = req.params;
    const getUserConfigTelegram = new GetUserConfigTelegram().create();

    axios(
        `http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${getUserConfigTelegram}?noresponse=1`,
        {
            method: "GET",
        }
    ).then((res) => {
        if (res.status === 200) {
            subscribeOnce("getSensitivity", (data) => {
                const getUserConfigReply = new GetUserConfigReply(data);

                if (getUserConfigReply) {
                    unsubscribe("getSensitivity", (e) => console.log(e));

                    return response.send(
                        JSON.stringify({
                            sectorA: getUserConfigReply.vPirA.value,
                            sectorB: getUserConfigReply.vPirB.value,
                            sectorC: getUserConfigReply.vPirC.value,
                        })
                    );
                }
            });
        }
    });
});

app.put("/detector/:productNumber/:mac/sensitivity", (req, response, next) => {
    const params = req.params;
    const getUserConfigTelegram = new GetUserConfigTelegram().create();
    const { sectorA, sectorB, sectorC } = req.body;
    console.log(sectorA);

    axios(
        `http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${getUserConfigTelegram}?noresponse=1`,
        {
            method: "GET",
        }
    ).then((res) => {
        if (res.status === 200) {
            subscribeOnce("getSensitivity", (data) => {
                const getUserConfigReply = new GetUserConfigReply(data);

                getUserConfigReply.vPirA.value = sectorA;
                getUserConfigReply.vPirB.value = sectorB;
                getUserConfigReply.vPirC.value = sectorC;

                const payload = getUserConfigReply.getPayload();

                let setUserConfig = new SetUserConfigTelegram(payload).create();

                if (getUserConfigReply) {
                    unsubscribe("getSensitivity", (e) => console.log(e));

                    axios(
                        `http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${setUserConfig}?noresponse=1`,
                        {
                            method: "GET",
                        }
                    ).then((result) => {
                        if (result.status === 200) {
                            subscribeOnce("setSensitivity", (setSensData) => {
                                let reply = JSON.parse(setSensData);
                                console.log(reply, "REPLY");

                                if (reply) {
                                    unsubscribe("setSensitivity", (e) => console.log(e));
                                    response.send(
                                        JSON.stringify({ value: reply.value, mac: reply.id })
                                    );
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

app.get(
    "/detector/:productNumber/:mac/wired-push-button-list",
    (req, response, next) => {
        const params = req.params;
        const getWiredPushButtonList = new GetWiredPushButtonList().create();

        axios(
            `http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${getWiredPushButtonList}?noresponse=1`,
            {
                method: "GET",
            }
        ).then((res) => {
            if (res.status === 200) {
                subscribeOnce("getWiredPushButtonList", (data) => {
                    let jsonData = JSON.parse(data);
                    console.log(jsonData);

                    if (data) {
                        unsubscribe("getWiredPushButtonList", (e) => console.log(e));

                        return response.send(
                            JSON.stringify({
                                data: { value: jsonData.value, mac: jsonData.id },
                            })
                        );
                    }
                });
            }
        });
    }
);

app.put(
    "/detector/:productNumber/:mac/zones/:zoneNr",
    (req, response, next) => {

        const params = req.params;

        const getUserConfigTelegram = new GetUserConfigTelegram().create();

        const { zone } = req.body;


        axios(
            `http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${getUserConfigTelegram}?noresponse=1`,
            {
                method: "GET",
            }
        ).then((res) => {
            if (res.status === 200) {
                subscribeOnce("getUserConfig", (data) => {
                    let getUserConfigReply = new GetUserConfigReply(data);

                    if (getUserConfigReply) {
                        unsubscribe("getUserConfig", (e) => console.log(e));

                        getUserConfigReply.zone1.value = zone;

                        const payload = getUserConfigReply.getPayload();

                        let userConfigHex = new SetUserConfigTelegram(payload).create();

                        axios(
                            `http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${userConfigHex}?noresponse=1`,
                            {
                                method: "GET",
                            }
                        ).then((result) => {
                            if (result.status === 200) {
                                subscribeOnce("setUserConfigReply", (setUserConfigReply) => {
                                    let reply = JSON.parse(setUserConfigReply);

                                    if (setUserConfigReply) {
                                        unsubscribe("setUserConfigReply", (e) => console.log(e));
                                        JSON.stringify({ value: reply.value, mac: reply.id });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

        // response.send(JSON.stringify(extractInfo(params.productNumber)));
    }
);

app.put(
    "/detector/:productNumber/:mac/wired-push-button-list",
    (req, response, next) => {
        const params = req.params;
        const { payload } = req.body;
        const setWiredPushButtonlist = new SetWiredPushButtonList(payload).create();

        axios(
            `http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${setWiredPushButtonlist}?noresponse=1`,
            {
                method: "GET",
            }
        ).then((res) => {
            if (res.status === 200) {
                subscribeOnce("setWiredPushButtonList", (data) => {
                    let jsonData = JSON.parse(data);

                    if (data) {
                        unsubscribe("setWiredPushButtonList", (e) => console.log(e));

                        return response.send(
                            JSON.stringify({ value: jsonData.value, mac: jsonData.id })
                        );
                    }
                });
            }
        });
    }
);

const sendData = (data) => {
    subscribers.forEach((subscriber) =>
        subscriber.response.write(`data: ${JSON.stringify(data)}\n\n`)
    );
};

// dfuController.onProgress('progress', sendData);

function sendScanData(request, response, data) {
    response.write(`event: message\n`);
    response.write(`data: ${data}\n\n`);
}

app.get("/scan", (req, res, next) => {
    const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
    };

    res.writeHead(200, headers);

    const eventSource = new EventSource(
        `http://${IP}/gap/nodes?event=1&filter_duplicates=1&filter_mac=10:B9:F7*&report_interval=5000&active=1`
    );

    eventSource.onmessage = (e) => sendScanData(req, res, e.data);
});

function sendMobileScanData(event, response) {
    let device = new Device(JSON.parse(event.data));
    response.write(`data: ${JSON.stringify(device)}\n\n`);
}

function scanHandler(request, response, next) {
    const eventSource = new EventSource(
        `http://${IP}/gap/nodes?event=1&filter_duplicates=1&filter_mac=10:B9:F7*&active=1`
    );

    if (eventSource.OPEN) {
        console.log("## Eventsource to ble gateway is now open ##");

        const headers = {
            "Content-Type": "text/event-stream",
            Connection: "keep-alive",
            "Cache-Control": "no-cache",
        };

        response.writeHead(200, headers);
    }

    eventSource.addEventListener("message", (event) =>
        sendMobileScanData(event, response)
    );

    request.on("close", () => {
        eventSource.removeEventListener("message", sendMobileScanData);
        eventSource.close();

        if (eventSource.CLOSED) {
            console.log("Eventsource at BLE-gateway is now closed");
        }
    });
}

async function getFileNames(folder) {
    return new Promise((resolve, reject) => {
        const arr = [];
        fs.readdir(folder, (err, files) => {
            files.forEach((file) => {
                arr.push({ key: file, name: file });
            });
            return resolve(arr);
        });
    });
}

async function getFirmwareNames(detectorType) {
    switch (detectorType) {
        case "Comfort":
            return await getFileNames("./firmwares/P48");
    }
}

function advertisementHandler(request, response, next) {
    const eventSource = new EventSource(
        `http://${IP}/gap/nodes?event=1&filter_dulicates=1&filter_mac=10:B9:F7*&report_interval=5000&active=1`
    );

    if (eventSource.OPEN) {
        console.log("## Eventsource to ble gateway is now open ##");

        const headers = {
            "Content-Type": "text/event-stream",
            Connection: "keep-alive",
            "Cache-Control": "no-cache",
        };

        response.writeHead(200, headers);
    }

    eventSource.addEventListener("message", (event) =>
        sendMobileScanData(event, response)
    );

    request.on("close", () => {
        eventSource.removeEventListener("message", sendMobileScanData);
        eventSource.close();

        if (eventSource.CLOSED) {
            console.log("Eventsource at BLE-gateway is now closed");
        }
    });
}

app.get("/listen/advertisement", advertisementHandler);

app.post("/connect", async (req, res, next) => {
    const { mac } = req.body;

    if (!mac) return res.send(400);

    const connectResult = await axios(
        `http://${IP}/gap/nodes/${mac}/connection`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (connectResult.status === 200) {
        const loginTelegram = new LoginTelegram().create();

        axios(
            `http://${IP}/gatt/nodes/${mac}/handle/19/value/${loginTelegram}?noresponse=1`,
            {
                method: "GET",
            }
        ).then((result) => {
            if (result.status !== 200) return res.send(500);

            subscribeOnce("replyLogin", (data) => {
                const loginTelegramReply = new LoginTelegramReply(data);
                let reply = loginTelegramReply.getResult();

                if (reply.ack) {
                    unsubscribe("replyLogin", (e) => console.log(e));
                    return res.send(200);
                }
            });
        });
    }
});

function loginToDetector(mac, cb) {
    try {
        const loginTelegram = new LoginTelegram().create();

        axios(
            `http://${IP}/gatt/nodes/${mac}/handle/19/value/${loginTelegram}?noresponse=1`,
            {
                method: "GET",
                timeout: 1000,
            }
        ).then((result) => {
            if (result.data !== "OK") return false;
            listenForData(mac, new LoginTelegramReply(), (reply) => {
                cb(reply);
            });
        });
    } catch (err) {
        console.log(err);
    }
}

app.post("/connect-device", async (req, res, next) => {
    try {
        const { mac } = req.body;

        if (!mac) return res.send(400);

        axios(`http://${IP}/gap/nodes/${mac}/connection`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            timeout: 1000,
        }).then((res) => {
            if (res.status === 200) {
                loginToDetector(mac, (result) => { });
            }
        });
    } catch (err) {
        console.log(err);
    }
});

app.post("/disconnect", async (req, res, next) => {
    const { mac } = req.body;

    if (!mac) return res.send(400);

    const connectResult = await axios(
        `http://${IP}/gap/nodes/${mac}/connection`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (connectResult.status === 200) return res.send(200);

    return res.send(500);
});

async function fetchDisconnectPromises(mac) {
    try {
        const result = await axios.post(
            `http://localhost:8888/disconnect-mobile`,
            { mac },
            {
                headers: { "Content-type": "application/json" },
            }
        );

        return result.data;
    } catch (error) {
        console.error(`Error fetching data for MAC ${mac}:`, error);

        return null;
    }
}

app.get(
    "/detector/:productNumber/:mac/wireless-function/wireless-link",
    async (req, response, next) => {
        const { mac } = req.params;
        const getWirelessFunctionTelegram =
            new GetWirelessFunctionTelegram().create();
        console.log(getWirelessFunctionTelegram);

        const connectResult = await axios(
            `http://${IP}/gatt/nodes/${mac}/handle/19/value/${getWirelessFunctionTelegram}?noresponse=1`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then((res) => {
            if (res.status === 200) {
                subscribeOnce("getWirelessFunctionTelegram", (data) => {
                    let jsonData = JSON.parse(data);

                    console.log(jsonData);

                    if (jsonData) {
                        unsubscribe("getWirelessFunctionTelegram", (e) => console.log(e));
                        const jsonResponse = JSON.stringify({
                            value: jsonData.value,
                            mac: jsonData.id,
                        });
                        return response.send(jsonResponse);
                    }
                });
            }
        });
    }
);

app.get(
    "/detector/:productNumber/:mac/network-id",
    async (req, response, next) => {
        const { mac } = req.params;
        const getUserConfigTelegram = new GetUserConfigTelegram().create();

        axios(
            `http://${IP}/gatt/nodes/${mac}/handle/19/value/${getUserConfigTelegram}?noresponse=1`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then((res) => {
            if (res.status === 200) {
                subscribeOnce("getUserConfigTelegram", (data) => {
                    let reply = JSON.parse(data);
                    const getUserConfigReply = new GetUserConfigReply(data);

                    if (getUserConfigReply) {
                        unsubscribe("getUserConfigTelegram", (e) => console.log(e));

                        let jsonResponse = JSON.stringify({
                            value: getUserConfigReply.systemNetworkId.value,
                            mac: reply.id,
                            status: 200,
                        });
                        response.send(jsonResponse);
                    }
                });
            }
        });
    }
);

app.put(
    "/detector/:productNumber/:mac/user-config/system-network-byte",
    async (req, response, next) => {
        const params = req.params;

        const { networkByte } = req.body;
        const getUserConfigTelegram = new GetUserConfigTelegram().create();

        axios(
            `http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${getUserConfigTelegram}?noresponse=1`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then((res) => {
            if (res.status === 200) {
                subscribeOnce("getUserConfigTelegram", (data) => {
                    const getUserConfigReply = new GetUserConfigReply(data);

                    if (getUserConfigReply) {
                        unsubscribe("getUserConfigTelegram", (e) => console.log(e));

                        getUserConfigReply.systemNetworkId.value = networkByte;

                        const payload = getUserConfigReply.getPayload();

                        let userConfigHex = new SetUserConfigTelegram(payload).create();

                        axios(
                            `http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${userConfigHex}?noresponse=1`,
                            {
                                method: "GET",
                            }
                        ).then((result) => {
                            if (result.status === 200) {
                                subscribeOnce(
                                    "setUserConfigReplyTelegram",
                                    (setUserConfigReplyTelegram) => {
                                        let reply = JSON.parse(setUserConfigReplyTelegram);

                                        if (reply) {
                                            unsubscribe("setUserConfigReplyTelegram", (e) =>
                                                console.log(e)
                                            );
                                            response.send(
                                                JSON.stringify({
                                                    value: reply.value,
                                                    mac: reply.id,
                                                    status: 200,
                                                })
                                            );
                                        }
                                    }
                                );
                            }
                        });
                    }
                });
            }
        });
    }
);

app.get(
    "/detector/:productNumber/:mac/user-config/system-network-byte",
    async (req, response, next) => {
        const params = req.params;

        const { networkByte } = req.body;
        const getUserConfigTelegram = new GetUserConfigTelegram().create();

        axios(
            `http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${getUserConfigTelegram}?noresponse=1`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then((res) => {
            if (res.status === 200) {
                subscribeOnce("getUserConfigTelegram", (data) => {
                    let reply = JSON.parse(data);
                    const getUserConfigReply = new GetUserConfigReply(data);

                    if (getUserConfigReply) {
                        unsubscribe("getUserConfigTelegram", (e) => console.log(e));

                        let jsonResponse = JSON.stringify({
                            value: getUserConfigReply.systemNetworkId.value,
                            mac: reply.id,
                            status: 200,
                        });
                        response.send(jsonResponse);
                    }
                });
            }
        });
    }
);

app.get(
    "/detector/:productNumber/:mac/firmware",
    async (request, response, next) => {
        const { mac, productNumber } = request.params;

        console.log(mac, productNumber);

        let productInfo = extractProductInfo(productNumber);

        if (productInfo.output === "Comfort") {
            let result = await getFirmwareNames(productInfo.output);
            response.send(
                JSON.stringify({ firmware: result, status: 200, mac, productNumber })
            );
        }
        console.log(productInfo);
    }
);

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- //
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- //
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- //
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- //
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- //

// Scanning

app.get("/scan-mobile", scanHandler);

// Connect

app.post("/connect-mobile", async (req, res, next) => {
    try {
        const { mac } = req.body;

        if (!mac) return res.send(400);

        const connectResult = await axios(
            `http://${IP}/gap/nodes/${mac}/connection`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (connectResult.status === 200) {
            const loginTelegram = new LoginTelegram().create();

            axios(
                `http://${IP}/gatt/nodes/${mac}/handle/19/value/${loginTelegram}?noresponse=1`,
                {
                    method: "GET",
                }
            ).then((result) => {
                if (result.status !== 200)
                    return res.send({ status: 500, ack: false, value: mac });

                subscribeOnce("replyLogin", (data) => {

                    const loginTelegramReply = new LoginTelegramReply(data);

                    let reply = loginTelegramReply.getResult();

                    if (reply) {
                        if (reply.ack) {

                            unsubscribe("replyLogin", (e) => console.log(e));

                            return res.send({ status: 200, ack: true, value: mac });

                        }
                    }
                });
            });
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/connect-mobile/multiple", async (req, res, next) => {
    try {
        const macAddresses = req.body.macAddresses; // Assuming MAC addresses are sent in the request body

        const devices = [];
    } catch (error) {
        console.error("Error fetching devices:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Disconnect

app.post("/disconnect-mobile", async (req, res, next) => {
    const { mac } = req.body;

    const connectResult = await axios(
        `http://${IP}/gap/nodes/${mac}/connection`,
        {
            method: "DELETE",
            timeout: 1000,
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (connectResult.status === 200)
        return res.send({ ack: true, status: 200, value: mac });

    return res.send(500);
});

app.post("/disconnect-mobile/multiple", async (req, res, next) => {
    try {
        const macAddresses = req.body.macAddresses; // Assuming MAC addresses are sent in the request body

        const devices = [];

        // Array of promises for fetching data for each MAC address
        const fetchPromises = macAddresses.map((mac) =>
            fetchDisconnectPromises(mac)
        );

        // Execute all promises concurrently
        const results = await Promise.all(fetchPromises);

        // Add non-null results to devices array
        results.forEach((data) => {
            if (data !== null) {
                devices.push(data);
            }
        });

        res.send(devices);
    } catch (error) {
        console.error("Error fetching devices:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Connected devices
app.get("/connected-devices", async (req, res, next) => {
    try {
        axios(`http://${IP}/gap/nodes?connection_state=connected`, {
            method: "GET",
            headers: {
                Accept: "*/*",
                "Content-Type": "application/json",
            },
        }).then((response) => {
            console.log(response.data);
            let connectedDevices = response.data.nodes;
            if (Object.keys(connectedDevices).length === 0)
                return res.send({ connectedDevices: [] });
            return res.send({
                connectedDevices: connectedDevices.map((node) => node.id),
            });
        });
    } catch (e) {
        console.log(e);
        console.log("Failed in getting connection list");
    }
});

app.get("/query/:mac/:product-number", async (req, res, next) => {
    const params = req.params;

    const getUserConfigTelegram = new GetUserConfigTelegram().create();

    axios(
        `http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${getUserConfigTelegram}?noresponse=1`,
        {
            method: "GET",
        }
    ).then((res) => {
        if (res.status === 200) {
            // console.log("Get user config executed successfully");
            subscribeOnce("getUserConfig", (data) => {
                // console.log(data);
                const getUserConfigReply = new GetUserConfigReply(data);

                getUserConfigReply.getOverview();
                if (getUserConfigReply) {
                    unsubscribe("getUserConfig", (e) => console.log(e));

                    return response.send(
                        JSON.stringify({
                            metaData: extractInfo(params.productNumber),
                            userConfigReply: getUserConfigReply.get(),
                        })
                    );
                }
            });
        }
    });
});


app.get("/dali/zones/:mac/light/:shortAddress", async (req, res, next) => {

    try {
        const params = req.params;

        const powerOn = await getLightPowerOn(params.mac, params.shortAddress);


        return res.send({
            status: 200,
            ack: true,
            value: {
                powerOn
            }
        });


    } catch (error) {

        return res.status(500).send({ status: 500, ack: false, error: error.message });

    }
});

app.get("/dali/query-control-gear/:mac/:shortAddress/:queryCommand",
    async (req, res, next) => {
        const params = req.params;

        if (!(params.shortAddress && params.mac && params.queryCommand))
            return res.send({
                status: 500,
                ack: false,
                value: {
                    reply: "Missing params",
                    // zones: getDaliGetZoneAssignmentCountReply.getCalculatedShortAddresses()
                },
            });

        const daliControlGearRawHex = new DaliQueryControlGear(
            req.params.shortAddress,
            req.params.queryCommand
        ).create();

        console.log(daliControlGearRawHex);

        axios(
            `http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${daliControlGearRawHex}?noresponse=1`,
            {
                method: "GET",
            }
        ).then((result) => {
            if (result.status !== 200)
                return res.send({ status: 500, ack: false, value: mac });

            messageEmitter.once(params.mac, (data) => {
                console.log(data);

                const daliControlGearReply = new DaliQueryControlGearReply(data);

                console.log(JSON.stringify(daliControlGearReply));

                if (daliControlGearReply) {
                    return res.send({
                        status: 200,
                        ack: true,
                        value: {
                            reply: daliControlGearReply,
                            // zones: getDaliGetZoneAssignmentCountReply.getCalculatedShortAddresses()
                        },
                    });
                }
            });
        });
    }
);

app.get("/dali/get-zone-assignment-count/:mac", async (req, res, next) => {

    const params = req.params;

    const getDaliGetZoneAssignmentCount = new DaliGetZoneAssignmentCount().create();

    axios(
        `http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${getDaliGetZoneAssignmentCount}?noresponse=1`,
        {
            method: "GET",
        }
    ).then((result) => {
        if (result.status !== 200)
            return res.send({ status: 500, ack: false, value: mac });

        messageEmitter.once(params.mac, (data) => {
            const getDaliGetZoneAssignmentCountReply =
                new DaliGetZoneAssignmentCountReply(data);

            console.log(JSON.stringify(getDaliGetZoneAssignmentCountReply));

            if (getDaliGetZoneAssignmentCountReply) {
                return res.send({
                    status: 200,
                    ack: true,
                    value: {
                        reply: getDaliGetZoneAssignmentCountReply,
                        zones:
                            getDaliGetZoneAssignmentCountReply.getCalculatedShortAddresses(),
                    },
                });
            }
        });
    });
});

app.get("/dali/zones/status/:mac/", async (req, res, next) => {

    const params = req.params;

    const getDaliGetZoneAssignmentCount = new DaliGetZoneAssignmentCount().create();

    axios(`http://${IP}/gatt/nodes/${params.mac}/handle/19/value/${getDaliGetZoneAssignmentCount}?noresponse=1`,
        {
            method: "GET",
        }
    ).then((result) => {

        if (result.status !== 200)

            return res.send({ status: 500, ack: false, value: mac });

        messageEmitter.once(params.mac, (data) => {

            const getDaliGetZoneAssignmentCountReply = new DaliGetZoneAssignmentCountReply(data);

            let zones = getDaliGetZoneAssignmentCountReply.getCalculatedShortAddresses();

            zones.forEach(zone => {

                if (zone.shortAddresses.length > 0) {
                    // const isLightOnResponse = 
                }

            })


        });
    });

});

app.post("/dali/zones/status/:mac/", async (req, res, next) => {

    const params = req.params;

    const body = req.body;

    const data = await isZoneTurnedOn(params.mac, body.shortAddresses);

    return res.send({ status: 200, data });
});



app.listen(8888, () => {
    console.log("Events service started at http://localhost:8888");
});






// ################################### CASSIA-DALI FUNCTIONS ###########################################

const daliQueryControlGear = async (mac, shortAddress, command) => {

    return new Promise((resolve, reject) => {

        if (!(shortAddress && mac && command))

            throw new Error("Missing params");

        const daliControlGearRawHex = new DaliQueryControlGear(shortAddress, command).create();

        axios(`http://${IP}/gatt/nodes/${mac}/handle/19/value/${daliControlGearRawHex}?noresponse=1`)
            .then((result) => {

                if (result.status !== 200)

                    throw new Error(`Api request failed to cassia {http://${IP}/gatt/nodes/${mac}/handle/19/value/${daliControlGearRawHex}?noresponse=1}`)

                messageEmitter.once(mac, (data) => resolve(data));
            });
    })
}

const getLightPowerOn = async (mac, shortAddress) => {

    return new Promise(async (resolve, reject) => {

        const response = new DaliQueryControlGearReply(await daliQueryControlGear(mac, shortAddress, 0x93));

        console.log(response, 'YOYOYO')
        if (response.data) {

            const isPowerOn = response.data !== '00';

            return resolve(isPowerOn);
        }

    })

}

// Helper function to create a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isZoneTurnedOn = async (mac, shortAddresses) => {
    try {
        const results = [];

        for (const shortAddress of shortAddresses) {
            const isLightTurnedOn = await getLightPowerOn(mac, shortAddress);
            console.log('Short address: ', shortAddress, ' - ', 'Is light on: ', isLightTurnedOn);
            results.push({ shortAddress, isPowerOn: isLightTurnedOn });

            // Delay between requests
            await delay(500); // delay of 500 milliseconds
        }

        const allLightsOn = results.every(light => light.isPowerOn);

        return { isZoneTurnedOn: allLightsOn, shortAddresses: results };

    } catch (error) {
        console.error('Error: ', error);
        throw error;
    }
};

const getZones = async (mac) => {

    return new Promise((resolve, reject) => {

        const getDaliGetZoneAssignmentCount = new DaliGetZoneAssignmentCount().create();

        axios(`http://${IP}/gatt/nodes/${mac}/handle/19/value/${getDaliGetZoneAssignmentCount}?noresponse=1`)

            .then((result) => {

                if (result.status !== 200) throw new Error("Request failed", result)

                messageEmitter.once(mac, (data) => {

                    const getDaliGetZoneAssignmentCountReply = new DaliGetZoneAssignmentCountReply(data);
                    const zones = getDaliGetZoneAssignmentCountReply.getCalculatedShortAddresses();
                    return resolve(zones);

                })
            })

    })

    // try {
    //     const results = [];

    //     for (const shortAddress of shortAddresses) {
    //         const isLightTurnedOn = await getLightPowerOn(mac, shortAddress);
    //         console.log('Short address: ', shortAddress, ' - ', 'Is light on: ', isLightTurnedOn);
    //         results.push({ shortAddress, isPowerOn: isLightTurnedOn });

    //         // Delay between requests
    //         await delay(500); // delay of 500 milliseconds
    //     }

    //     const allLightsOn = results.every(light => light.isPowerOn);

    //     return { isZoneTurnedOn: allLightsOn, shortAddresses: results };

    // } catch (error) {
    //     console.error('Error: ', error);
    //     throw error;
    // }

}


