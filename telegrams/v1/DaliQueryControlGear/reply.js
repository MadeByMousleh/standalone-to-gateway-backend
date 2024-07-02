import TelegramHelper from '../TelegramHelper.js';

class DaliQueryControlGearReply {
    protocolVersion;
    telegramType;
    totalLength;
    crc16;
    statusResult;
    data;
    telegramHelper;

    constructor(value) {
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion = value.slice(0, 2);
        this.telegramType = value.slice(2, 6);
        this.totalLength = this.swapHexBytes(value.slice(6, 10));
        this.crc16 = this.swapHexBytes(value.slice(10, 14));
        this.statusResult = value.slice(14, 16);
        this.data = value.slice(16, 18);
    }

    swapHexBytes(hexString) {
        if (hexString.length % 2 !== 0) {
            throw new Error("Hex string must have an even number of characters");
        }
        if (hexString.length === 2) return parseInt(hexString, 16);
        let bytes = parseInt(hexString, 16);
        return ((bytes & 0xff) << 8) | ((bytes >> 8) & 0xff);
    }

    getStatusResult() {
        return this.statusResult;
    }

    getData() {
        return this.data;
    }
}

export default DaliQueryControlGearReply ;
