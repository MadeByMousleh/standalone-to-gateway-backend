import TelegramHelper from '../TelegramHelper.js'

class DaliGet102DeviceCount {

    protocolVersion;
    telegramType;
    totalLength;
    telegramHelper = new TelegramHelper();
    payload;

    constructor() {
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion = this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x040F);
        this.totalLength = this.telegramHelper.createTotalLength(0x0008);
        this.payload = [];
    }

    create() {
        return this.telegramHelper.createTelegram(this)
    }
}

export default DaliGet102DeviceCount;

