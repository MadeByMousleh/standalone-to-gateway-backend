import TelegramHelper from '../TelegramHelper.js'

class CheckPincodeTelegram {

    protocolVersion;
    telegramType;
    totalLength;
    // crc16: number;
    payload;

    telegramHelper = new TelegramHelper();

    constructor(payload) {
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion = this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0131);
        this.totalLength = this.telegramHelper.createTotalLength(0x0009);
        this.payload = +payload;
        // this.crc16 = this.telegramHelper.createCrc16(0x95FB);
    }

    create() {

        this.payload = this.payload.toString(16).padStart(4, '0000').match(/.{1,2}/g).reverse().join("");
        return this.telegramHelper.createTelegramFromHexString(this);

    }
}

export default CheckPincodeTelegram;

