import TelegramHelper from "../../TelegramHelper.js";


export default class SetWiredPushButtonList {

    protocolVersion;
    telegramType;
    totalLength;
    // crc16: number;
    payload;

    telegramHelper = new TelegramHelper();

    constructor(payload) {
        this.protocolVersion = this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0111);
        this.totalLength = this.telegramHelper.createTotalLength(0x001C);
        this.payload = payload
        // this.crc16 = this.telegramHelper.createCrc16(0x95FB);
    }

    create() {
        return this.telegramHelper.createTelegramFromHexString(this)
    }
}

