import EnterBootLoaderPacket from "../../../telegrams/v1/cypressPackets/EnterBootLoaderPacket/index.js";
import ExitBootLoaderPacket from "../../../telegrams/v1/cypressPackets/ExitBootloader/index.js";
import GetFlashSizePacket from "../../../telegrams/v1/cypressPackets/GetFlashSize/index.js";
import VerifyChecksumPacket from "../../../telegrams/v1/cypressPackets/VerifyChecksum/index.js";
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

    constructor(payload, writeMethod, bleDevice) {


        this.#payload = payload;

        this.#writeMethod = writeMethod;

        this.em = new EventEmitter();

        this.processor = new PayloadProcessor(this.#payload, this.#securityId);

        this.rows = this.processor.splitFirmwareIntoLines();

        this.bleDevice = bleDevice;

    }



    #enterBootLoader() {

        this.#writeMethod(new EnterBootLoaderPacket().create(), this.bleDevice);
        this.currentStep = 2;
    }

    #getFlashSizePacket() {
        this.currentStep = 3
        return new GetFlashSizePacket().create();
    }

    #getVerifyChecksum() {
        this.currentStep = 5
        return new VerifyChecksumPacket().create();
    }

    #exitBootLoader() {

        this.currentStep = 6
        return new ExitBootLoaderPacket().create();
    }

    getPacketToSend() {

        let step = this.currentStep;

        if (step === 2) {

            return this.#getFlashSizePacket();

        }

        if (step === 3) {

            if (this.rowIndex <= this.rows.length) {

                this.em.emit("progress", { mac: this.bleDevice, progress: this.rowIndex, length: this.rows.length })

                const row = this.rows[this.rowIndex];
                this.rowIndex++

                return row;
            }

            this.currentStep = 4;
        }

        if (step === 4) {
            return this.#getVerifyChecksum();
        }

        if (step === 5) {
            return this.#exitBootLoader();
        }

        if (step === 6) {
            console.log("DFU COMPLETE");
        }

    }


    startDFU() {

        this.#enterBootLoader();
    }


    onResponse(response) {

        const responseHandler = new ResponseHandler();
        const isAccepted = responseHandler.handleResponse(response);

        if (isAccepted) {
            const packet = this.getPacketToSend().toUpperCase();
            return this.#writeMethod(packet, this.bleDevice);
        }
    }

    onProgress = (name, cb) => {
        return this.em.on(name, cb);
    }
}
