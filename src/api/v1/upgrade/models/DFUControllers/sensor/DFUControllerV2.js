import BootLoaderPacketGen from "./BootloaderPacketGen.js";
import ResponseHandler from "./ResponseHandler.js";
import PayloadProcessor from "./payloadProcessor.js";
import { EventEmitter } from 'events';


export default class DFUController {

    startByte = "01";
    endByte = "17";
    em = null;

    enterBootLoaderCommand = "38";
    writeRowCommand = "39";
    verifyRowCommand = "3a";
    sendDataCommand = "37";
    getFlashCommand = "32";

    #writeMethod = null;

    #payload = null;

    #securityId = null;

    currentStep = 1;

    rowIndex = 0;
    commandIndex = 0;

    processor = null;

    bleDevice = null;

    rows = [];
    progress;

    startedTime;



    constructor(payload, securityId, writeMethod, bleDevice) {

        this.#securityId = securityId;

        this.#payload = payload;

        this.#writeMethod = writeMethod;

        this.em = new EventEmitter();

        this.processor = new PayloadProcessor(this.#payload, this.#securityId);

        this.rows = this.processor.getFlashDataLines();

        this.bleDevice = bleDevice;
    }


    #splitRowIntoChunks(row) {
        return [row.substring(0, 256), row.substring(256, 512)];
    }

    #processRow(row) {

        const packetGen = new BootLoaderPacketGen();

        const chunks = this.#splitRowIntoChunks(row.data);

        const currentCommand = this.commandIndex;


        // console.log(this.rowIndex, this.rows.length), 'method';
        if (this.rowIndex === this.rows.length && this.commandIndex === 3) {
            this.commandIndex = 0;
            this.rowIndex++;
            this.currentStep = 4;
            return packetGen.writeRowPacket(row.arrayID, row.rowNumber, chunks[currentCommand]);
        }


        if (currentCommand === 1) { 
            this.commandIndex = 0;
            this.rowIndex++;
            return packetGen.writeRowPacket(row.arrayID, row.rowNumber, chunks[currentCommand]);
        }

        this.commandIndex++;
        return packetGen.sendDataPacket(chunks[currentCommand]);

    }

    #enterBootLoader() {
        const processor = new PayloadProcessor(this.#payload, this.#securityId);

        const packetGen = new BootLoaderPacketGen();

        const packet = packetGen.enterBootLoader(processor.getSecurityId());

        this.#writeMethod(packet, this.bleDevice)

        this.currentStep = 2;
    }

    #getFlashSizePacket() {
        const packetGen = new BootLoaderPacketGen();

        const packet = packetGen.getFlashSize();
        this.currentStep = 3
        return packet;
    }

    #getVerifyChecksum() {
        const packetGen = new BootLoaderPacketGen();

        const packet = packetGen.getVerifyChecksum();


        this.currentStep = 5
        return packet;
    }

    #exitBootLoader() {
        const packetGen = new BootLoaderPacketGen();

        const packet = packetGen.getExitBootLoader();
        this.currentStep = 6
        return packet;
    }

    getPacketToSend() {
        let step = this.currentStep;

        if (step === 2) {

            return this.#getFlashSizePacket();
        }

        if (step === 3) {

            // console.log(this.rowIndex, this.rows.length), 'method';
            if (this.rowIndex <= this.rows.length) {

                if (this.progress !== Math.floor((this.rowIndex / this.rows.length) * 100)) {
                    this.em.emit("progress", { mac: this.bleDevice, progress: Math.floor((this.rowIndex / this.rows.length) * 100) })
                    
                    this.em.emit('progress-v2', {
                        mac: this.bleDevice,
                        progress: Math.floor((this.rowIndex / this.rows.length) * 100),
                        lineReached: this.rowIndex,
                        elapsedTime: this.formatElapsedTime(this.startedTime, Date.now()),

                    })
                }
                this.progress =  Math.floor((this.rowIndex / this.rows.length) * 100);

                

                // console.log(Math.floor((this.rowIndex / this.rows.length) * 100), '%');

                const row = this.rows[this.rowIndex];

                if (row) {

                    const packet = this.#processRow(this.rows[this.rowIndex]);

                    if (packet) {

                        return packet;
                    }
                }

                return this.#getVerifyChecksum();
            }
        }

        if (step === 4) {
            return this.#getVerifyChecksum();
        }

        if (step === 5) {
            return this.#exitBootLoader();
        }

        if (step === 6) {
            console.log("DFU COMPLETE");
            this.em.emit('end-dfu', { mac: this.bleDevice, isComplete: true });
        }

    }

    startDFU() {
        this.#enterBootLoader();
        this.startedTime = Date.now();
    }

    onResponse(response) {

        const responseHandler = new ResponseHandler();

        const isAccepted = responseHandler.handleResponse(response);

        if (isAccepted) {
            const packet = this.getPacketToSend()?.toUpperCase();
            this.#writeMethod(packet, this.bleDevice, {
                progress: Math.floor((this.rowIndex / this.rows.length) * 100),
                lineReached: this.rowIndex });
        }
    }

    onProgress = (name, cb) => {

        return this.em.on(name, cb);
    }

    onProgressV2 = (cb) => {

        return this.em.on('progress-v2', cb);
    }

    onDFUend(cb) {
        return this.em.on('end-dfu', cb);
    }

     formatElapsedTime(startedTime, elapsedTime) {
        // Calculate the difference in time
        const elapsedTimeInMs = elapsedTime - startedTime;
    
        // Convert milliseconds to minutes and seconds
        const minutes = Math.floor(elapsedTimeInMs / 60000);
        const seconds = Math.floor((elapsedTimeInMs % 60000) / 1000);
    
        // Format the string
        return `Elapsed time: ${minutes} minute(s) and ${seconds} second(s)`;
    }
    
    
}
