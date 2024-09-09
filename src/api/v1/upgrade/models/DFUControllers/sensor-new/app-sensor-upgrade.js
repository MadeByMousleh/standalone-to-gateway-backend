import axios from "axios";
import DFUControllerV2 from "./DFUControllerV2.js";
import LoginTelegramReply from "../../../telegrams/v1/Login/reply.js";
import EventEmitter from "events";
import dotenv from 'dotenv'
import express from "express";
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import EventSource from 'eventsource';

dotenv.config()

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,

}

const PAYLOAD_PATH = './firmwares/P47/0218/353AP60218.cyacd';

let DFUControllers = [];

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors(corsOptions));

const dataEmitter = new EventEmitter();

const evReply = new EventSource('http://192.168.0.29/gatt/nodes?event=1')


evReply.onmessage = (msg) => {

    let { id, value, handle } = JSON.parse(msg.data);

    if(handle === 14)
    {
        
        let bufferData = new Buffer.from(value, 'hex');

        return DFUControllers[id].onResponse(bufferData);
    }

    else {

        dataEmitter.emit(id, value);

    }

    
}

function sendCypressData(data, mac) {
    axios(`http://192.168.0.29/gatt/nodes/${mac}/handle/14/value/${data}`)
}

async function openNotification(nodeMac) {

    const result = await axios(`http://192.168.0.29/gatt/nodes/${nodeMac}/handle/15/value/0100`)

    const resultData = result;

    if (resultData.status === 200) {
        return true;
    }

    console.log("Failed on opening notification")
    return false;

}

const checkIfHandleIsThere = async (mac, cb) => {

    try {

        const result = axios(`http://192.168.0.29/gatt/nodes/${mac}/characteristics`)

        const resultData = await result;


        if (resultData.status === 200) {

            return cb(!!resultData.data.find(char => char.uuid === "00060001-f8ce-11e4-abf4-0002a5d5c51b"))
        }

    } catch (err) {
        console.log(err)
        cb(false);
        // return cb(false);
    }

}

function listenForData(nodeMac, reply, cb) {

    return dataEmitter.on(nodeMac, data => {

        if (reply.isAck(data)) return cb(true);

    })

}


async function connectToDevice(nodeMac) {

    try {

        return axios({
            method: 'POST',
            data: { "timeout": "10000", "type": "public", "discovergatt": 0 },
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


function sendLoginTelegram(nodeMac, cb) {

    try {
        setTimeout(() => { return cb(false) }, 2000)

        axios(`http://192.168.0.29/gatt/nodes/${nodeMac}/handle/19/value/0110000900FB951D01?noresponse=1`)
            .then(res => {

                if (res.status === 200) {

                    listenForData(nodeMac, new LoginTelegramReply(), reply => {
                        console.log("REPLY", reply)
                        cb(reply)
                    })


                }
            })
    }

    catch (error) {

        return cb(false);
    }

}

function sendJumpToBootTelegram(nodeMac, application = "02", cb) {

    try {

        return axios(`http://192.168.0.29/gatt/nodes/${nodeMac}/handle/19/value/0101000800D9CB${application}?noresponse=1`)
            .then(res => {

                if (res.status === 200) {

                    return cb(true);
                }

            })
    }

    catch (error) { return cb(false); }


}


async function startSensorUpgrade(nodeMac) {

    if (DFUControllers[nodeMac]) return console.log("DFU already in progress")

    const connectionResult = await connectToDevice(nodeMac);

    if (connectionResult.status === 200) {

        console.log("Connected to device...\n")

        sendLoginTelegram(nodeMac, isLoggedIn => {

            if (isLoggedIn) {

                console.log("Logged into device...\n")

                checkIfHandleIsThere(nodeMac, async isAlreadyInBoot => {

                    if (!isAlreadyInBoot) {

                        console.log("Device is not in boot mode... \n")

                        sendJumpToBootTelegram(nodeMac, '01', async jumpedToBoot => {

                            console.log("Jumping to boot mode... \n")

                            if (jumpedToBoot) {

                                console.log("Device is not in boot mode... \n")

                                console.log("Disconnected automatically... \n")

                                setTimeout(async () => {

                                    const reconnectResult = await connectToDevice(nodeMac);

                                    if (reconnectResult.status === 200) {
    
                                        console.log("Reconnected... \n")
    
                                        checkIfHandleIsThere(nodeMac, async isInBootNow => {

                                            console.log("Checking handle...")
    
                                            if (isInBootNow) {
    
                                                console.log("Device is now in boot mode... \n");
    
                                                const notificationOpen = await openNotification(nodeMac);
    
                                                console.log("Opening for notifications... \n");
    
    
                                                if (notificationOpen) {
    
                                                    console.log("Notifications opened...");
    
                                                    var payload = readFileSync(PAYLOAD_PATH, 'utf8');
    
                                                    DFUControllers[nodeMac] = new DFUControllerV2(payload, "49A134B6C779", sendCypressData, nodeMac);
    
                                                    DFUControllers[nodeMac].onProgress('progress', sendData);
    
                                                    DFUControllers[nodeMac].startDFU();
    
                                                }
    
    
                                            }
    
                                        });
    
                                    }

                                }, 2000)

                            
                            }

                        });
                    }

                })

            }

            else {

                checkIfHandleIsThere(nodeMac, async isInBootMode => {


                    if (isInBootMode) {

                        console.log("Device is already in boot mode... \n");

                        const notificationOpen = await openNotification(nodeMac);

                        console.log("Opening for notifications... \n");


                        if (notificationOpen) {

                            var payload = readFileSync(PAYLOAD_PATH, 'utf8');

                            DFUControllers[nodeMac] = new DFUControllerV2(payload, "49A134B6C779", sendCypressData, nodeMac);

                            DFUControllers[nodeMac].onProgress('progress', sendData);

                            DFUControllers[nodeMac].startDFU();
                        }
                    }

                })

            }
        })

    }

}


app.post('/upgrade-start', (req, res, next) => {

    const mac = req.body.mac;
    startSensorUpgrade(mac);
    res.status(200);
})

app.get('/scan', (req, res, next) => {
    return res.send({data: 'hi'});
})

app.get('/', (req, res, next) => {
    return res.send({data: 'hi'});
})


const sendData = (data) => {
    console.log(data, 'YOYO');
}


app.listen(9999, () => {
    console.log('Events service started at http://localhost:9999')
});