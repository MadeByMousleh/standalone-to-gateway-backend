const Result = {
    0: { bleSpecMsg: 'ACK', msg: 'Command succeeded', ack: true},
    1: { bleSpecMsg: 'NACK_RANGE_CHECK', msg: 'This address does not exist', ack: false },
    3: { bleSpecMsg: 'COMMISSIONING_RUNNING', msg: 'Command failed as commissioning is running', ack: false}
}

class DaliDeviceControlReply {
    protocolVersion
    telegramType
    totalLength
    crc16
    status

    constructor(value) {
        this.protocolVersion = value.slice(0, 2);
        this.telegramType = value.slice(2, 6);
        this.totalLength = value.slice(6, 10);
        this.crc16 = value.slice(10, 14);
        this.status = value.slice(14, 16);
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

        return LoginResult[+this.loginResult]
    }

}

export default DaliDeviceControlReply;