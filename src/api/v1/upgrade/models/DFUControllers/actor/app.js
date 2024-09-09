import { readFileSync } from 'fs';
import axios from 'axios';
import bodyParser from 'body-parser';
import express from "express";
import cors from 'cors';
import EventEmitter from 'events';
import dotenv from 'dotenv'
import EventSource from 'eventsource';
import EnterBootLoaderPacketReply from '../../../telegrams/v1/cypressPackets/EnterBootLoaderPacket/EnterBootLoaderReply.js';
import LoginTelegramReply from '../../../telegrams/v1/Login/reply.js';
import ActorBootStateRequestReply from '../../../telegrams/v1/ActorBootStateRequest-0017/reply.js';
import EnterBootLoaderPacket from '../../../telegrams/v1/cypressPackets/EnterBootLoaderPacket/index.js';
import SendDataPacket from '../../../telegrams/v1/cypressPackets/SendData/index.js';
import WriteRowDataPacket from '../../../telegrams/v1/cypressPackets/WriteDataRowPacket/index.js';
import VerifyRowPacket from '../../../telegrams/v1/cypressPackets/VerifyRow/index.js';
import VerifyChecksumPacket from '../../../telegrams/v1/cypressPackets/VerifyChecksum/index.js';
import ExitBootLoaderPacket from '../../../telegrams/v1/cypressPackets/ExitBootloader/index.js';
import GetFlashSizePacket from '../../../telegrams/v1/cypressPackets/GetFlashSize/index.js';
import GetFlashSizePacketReply from '../../../telegrams/v1/cypressPackets/GetFlashSize/reply.js';
import fs from 'fs';



dotenv.config()

let linesWritten = 0;

let count = 0;

const PAYLOAD_PATH = './firmwares/P47/0218/353AP20218.cyacd';

console.log("#################################################")
const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,

}

//Variables
let DFUControllers = [];

let DFUEmitter = new EventEmitter();


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));


const evReply = new EventSource('http://192.168.0.29/gatt/nodes?event=1');

const dfuControllerEvent = new EventSource('http://192.168.0.29/gatt/nodes?event=1');

async function connectToDevice(nodeMac) {

    try {

        return axios({
            method: 'POST',
            data: {
                "timeout": "10000",
                "type": "public",
                "discovergatt": 0
            },

            url: `http://192.168.0.29/gap/nodes/${nodeMac}/connection`,

            headers: {
                'Accept': "*/*",
                'Content-Type': "application/json"
            },

        })

    } catch (e) {
        console.log("Error in connection - Failed in connectToDevice")
    }

}

function sendLoginTelegram(nodeMac) {

    return new Promise((resolve, reject) => {

        try {



            let emitter = new EventEmitter();
            emitter.setMaxListeners(1);

            axios({
                method: 'GET',
                url: `http://192.168.0.29/gatt/nodes/${nodeMac}/handle/19/value/0110000900FB951D01?noresponse=1`,
                headers: {
                    'Accept': "*/*",
                    'Content-Type': "application/x-www-form-urlencoded"
                }
            })
                .then(res => {

                    console.log(res.status)

                    if (res.status === 200) {

                        evReply.onmessage = (msg) => {

                            console.log(msg)

                            let { id, value } = JSON.parse(msg.data);
                            
                            if (id.toUpperCase() === nodeMac.toUpperCase()) {


                                let loginReplyPacket = new LoginTelegramReply();

                                if (loginReplyPacket.isAck(value)) return resolve(true);
                                return resolve(false)
                            }
                        }
                    }
                })

        }
        catch (error) { resolve(error) }
    })
}

// Actor for 01
// Sensor for 02
function sendJumpToBootTelegram(nodeMac, application = "02") {

    return new Promise((resolve, reject) => {

        try {



            let emitter = new EventEmitter();
            emitter.setMaxListeners(1);

            return axios(`http://192.168.0.29/gatt/nodes/${nodeMac}/handle/19/value/0101000800D9CB${application}?noresponse=1`)
                .then(res => {
                    if (res.status === 200) {

                        return resolve(true);
                    }

                    resolve(false);

                })
        }
        catch (error) { resolve(error) }
    })

}

// Returns 00 for Application
// Return 01 for BOOT
function getActorBootState(nodeMac) {

    return new Promise((resolve, reject) => {

        try {

            axios(`http://192.168.0.29/gatt/nodes/${nodeMac}/handle/19/value/0117000700D9E7?noresponse=1`)
                .then(res => {
                    if (res.status === 200) {

                        evReply.onmessage = (msg) => {

                            let { id, value } = JSON.parse(msg.data);

                            let telegramType = value.slice(2, 6);

                            if (telegramType === "1800") {

                                if (id.toUpperCase() === nodeMac.toUpperCase()) {

                                    let reply = new ActorBootStateRequestReply(value);

                                    console.log(reply.data, 'DATA');


                                    return resolve(reply.data.value.join(""));

                                }
                            }
                        }

                    }

                })
        }
        catch (error) { reject(error) }
    })

}


async function enterBootLoader(nodeMac) {

    return new Promise((resolve, reject) => {

        const packet = new EnterBootLoaderPacket().create();

        axios(`http://192.168.0.29/gatt/nodes/${nodeMac}/handle/19/value/${packet}?noresponse=1`)
            .then(res => {
                if (res.status === 200) {

                    evReply.onmessage = (msg) => {

                        let { id, value } = JSON.parse(msg.data);


                        let reply = new EnterBootLoaderPacketReply(value);

                        let telegramType = value.slice(2, 6);

                        if (telegramType === "1500") {

                            if (id.toUpperCase() === nodeMac.toUpperCase()) {

                                resolve(reply);

                            }
                        }

                        // resolve(true);
                    }
                }
            })

    })

}


function splitFirmwareIntoLines(path) {


    let packetsArray = [];

    var payload = readFileSync(path, 'utf8');
    var lines = payload.split(/\r?\n/)

    for (var i = 1; i < lines.length - 1; i++) {

        const chunks = lines[i].substring(11, lines[i].length - 2).match(/.{1,144}/g);

        // let chunks = [chunk.substring(0, 256), chunk.substring(256, 512)];

        chunks.forEach((chunk, index) => {

            if (chunk.length === 144) {

                packetsArray.push(new SendDataPacket(chunk).create());
            }

            else {

                const arrayId = lines[i].substring(1, 3).toUpperCase();
                const rowNumber = lines[i].substring(3, 7).toUpperCase();
                packetsArray.push(new WriteRowDataPacket(chunk, rowNumber, arrayId).create());

                
                    packetsArray.push(new VerifyRowPacket(rowNumber).create());

                

            }

        })

    }

    packetsArray.push(new VerifyChecksumPacket().create());
    packetsArray.push(new ExitBootLoaderPacket().create());
    packetsArray.push(new ExitBootLoaderPacket().create());
    console.log(new ExitBootLoaderPacket().create())

    return packetsArray;
}

function writeToFile(line) {

    const filePath = './logs/log.txt';
    const stream = fs.createWriteStream(filePath, { flags: 'a' });
    stream.write(line + '\n');

    stream.end();
}

const connectToDetector = (mac) => {
    console.log("YOLOLOLOLO")

    console.log("\nTrying to connect\n")

    connectToDevice(mac).then(async (res) => {
        
        if (res.status === 200) {
            
            console.log("\n ## Connected ## \n ")

            console.log("\n Trying to login to detector.... \n")

            let isLoggedIn = await sendLoginTelegram(mac);
            
            console.log(isLoggedIn)
            
            
            if (isLoggedIn === true) {
                
                console.log(" \n ## Logged in to detector ## \n")

                console.log("\n Trying jumping too boot... \n")

                let isJumpedToBoot = await sendJumpToBootTelegram(mac);

                if (isJumpedToBoot) {

                    console.log(" \n ## Jumped to boot ## \n")

                    console.log("\n Trying to request boot state... \n")

                    let state = await getActorBootState(mac);

                    if (state === '01') {

                        console.log("\n ## Currently in: Boot state... ## \n")

                        console.log("Trying to enter DFU...");

                        const enterBootLoaderResult = await enterBootLoader(mac)

                        if (enterBootLoaderResult.isAccepted()) {

                            console.log("## Entered DFU ##")

                            DFUEmitter.emit('start-dfu', mac);

                        }

                    }

                    else if (state === '00') {
                        return console.log("\n ## Currently in: Application state... ## \n")
                    }

                    else {

                        return console.log("\n ## Something went wrong... ## \n")

                    }
                }

            }
        }
    });

}
function sendDataChunk(nodeMac, chunk) {

    writeToFile(chunk)

    axios({
        method: 'GET',
        url: `http://192.168.0.29/gatt/nodes/${nodeMac}/handle/19/value/${chunk}?noresponse=1`,
        headers: {
            'Accept': "*/*",
            'Content-Type': "application/x-www-form-urlencoded"
        }
    })


}

dfuControllerEvent.onmessage = (msg) => {

    let { id, value } = JSON.parse(msg.data);

    if (!DFUControllers[id]) return

    let lines = DFUControllers[id].commands;

    if (linesWritten <= lines.length - 1) {

        console.log(linesWritten, lines.length - 1)

        linesWritten++;

        sendDataChunk(id, lines[linesWritten]);

    }


}

DFUEmitter.on("start-dfu", (mac) => {

    console.log("Starting DFU process...");

    const linesArr = splitFirmwareIntoLines(PAYLOAD_PATH);

    DFUControllers[mac] = {
        commands: linesArr,
        amountOfLines: linesArr.length,
        commandsWritten: 0,
        progress: 0,
    };

    console.log("Start programming lines...");

    evReply.close();
    sendDataChunk(mac, linesArr[0]);
})


app.post('/upgrade-start', (req, res, next) => {

    try {
        connectToDetector(req.body.mac)
    }
    catch (err) {
        console.log(err)
        console.log("An error occured")
    }

})



app.listen(9999, () => {
    console.log('Events service started at http://localhost:8889')
});
