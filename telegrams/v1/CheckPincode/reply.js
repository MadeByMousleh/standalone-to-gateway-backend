const CheckPincodeResult = {
    0: { bleSpecMsg: 'OK', msg: 'Pincode is accepted', ack: true },
    1: { bleSpecMsg: 'Check pincode failed', msg: 'Pincode is not accepted', ack: false }
}

class CheckPincodeReply {

    protocolVersion
    telegramType
    totalLength
    crc16
    result

    constructor(value) {
        this.protocolVersion = value.slice(0, 2);
        this.telegramType = value.slice(2, 6);
        this.totalLength = value.slice(6, 10);
        this.crc16 = value.slice(10, 14);
        this.result = value.slice(14, 16);
    }

    swapBytes(bytes) {
        return [bytes >> 8, bytes & 0xff];
    }

    getProtocolVersion() {
        return this.protocolVersion;
    }

    getTelegramType() {
        return this.swapBytes(this.telegramType);
    }

    getTotalLength() {
        return this.swapBytes(this.totalLength);
    }

    getCrc16() {
        return this.swapBytes(this.crc16);
    }

    getResult() {
        return CheckPincodeResult[+this.result]
    }

    isAck(value) {

        let telegramType = value.substring(2, 6);

        let result = value.substring(14, 16);

        if (telegramType === "3201") {
            return result === '0';
        }

        return false;
    }


}

export default CheckPincodeReply;