import EventEmitter from "events";
import EventSource from 'eventsource';
import CassiaEndpoints from "../../../../thirdParty/cassia-rest-api/local/index.js";
import { NextGenDevice } from "../models/NextGenDevice/index.js";
import { readdirSync, statSync } from "fs";
import path from "path";


let progressController = {};

const IP = "192.168.40.1";

const dataEmitter = new EventEmitter();

const evReply = new EventSource('http://192.168.40.1/gatt/nodes?event=1')

const queueEmitter = new EventEmitter();

let startedUpgradeController = {};

const queue = [];

let upgradingQueue = [];

let isProcessing = false;

evReply.onmessage = (msg) => {

    let { id, value, handle } = JSON.parse(msg.data);

    if (handle === 14) {

        let bufferData = new Buffer.from(value, 'hex');

        const device = startedUpgradeController[id];

        device.onBootMessageReply(bufferData);

        progressController[device.mac] = device.progress;

        if (device.progress === 100) {

            queueEmitter.emit("start-next");

            upgradingQueue = upgradingQueue.filter(d => d.mac !== device.mac);

        }

    }

    else {

        dataEmitter.emit(id, value);

    }
}


const startUpgrade = (device) => {
    queueEmitter.emit('device-added', device);
}


export function upgradeSensor(req, res, next) {

    try {

        const devices = req.body.devices;

        devices.forEach((d, index) => {

            const nextGenDevice = new NextGenDevice(IP, d.data.macAddress, null, "", d.data.isBoot, d.firmware);

            queue.push(nextGenDevice);
            processQueue();

        })

    } catch (err) {

        console.log(err)
        res.sendStatus(500);

    }
}

export function UpgradeSSEStatus(req, res, next) {

    const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
    };
    res.writeHead(200, headers);

    // Send a message every second

    const intervalId = setInterval(() => {
        res.write(`data: ${JSON.stringify(progressController)}\n\n`);
    }, 1000);

};


queueEmitter.on("dfu-finished", (device) => {

    upgradingQueue.shift();

    if (queue.length > 0) {

        queueEmitter.emit("start-next");
    }

})


queueEmitter.on("start", (device) => {

    if (upgradingQueue.length < 3) {

        device.startUpgrading();

        upgradingQueue.push(device);

        startedUpgradeController[device.mac] = device;

    }
    else queue.push(device);

})

queueEmitter.on("start-next", () => {

    if (queue.length === 0) return;

    const device = queue[0];
    queue.shift();

    if (upgradingQueue.length < 3) {

        device.startUpgrading();

        upgradingQueue.push(device);

        startedUpgradeController[device.mac] = device;

    }

})


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


async function processQueue() {

    if (isProcessing) return;
    // Avoid re-entering if already processing
    isProcessing = true;

    while (queue.length > 0) {

        const device = queue.shift();  // Get the first device from the queue

        // Wait for 5 seconds before processing this device

        await delay(5000);

        const isBootMode = device.isBoot;

        if (isBootMode) {

            queueEmitter.emit("device-boot-ready", device);

        } else {

            const isConnected = await device.connect();

            if (isConnected) {
                const isAccepted = await device.jumpToBoot();

                if (isAccepted) {
                    const result = await device.disconnect();

                    if (result.status === 200) {
                        queueEmitter.emit("device-boot-ready", device);
                    }
                }
            }
        }
    }

    isProcessing = false;  // Done processing the current queue
}

queueEmitter.on("device-boot-ready", device => {

    upgradingQueue.push(device);
    device.startUpgrading();
    startedUpgradeController[device.mac] = device;

})