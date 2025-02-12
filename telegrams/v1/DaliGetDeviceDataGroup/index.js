import TelegramHelper from '../TelegramHelper.js'

class DaliGetDeviceDataGroup {

    protocolVersion;
    telegramType;
    totalLength;
    telegramHelper = new TelegramHelper();
    payload;
    shortAddress;

    constructor(shortAddress) {
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion = this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x040D);
        this.totalLength = this.telegramHelper.createTotalLength(0x0008);
        this.payload = [parseInt(shortAddress, 16)];
    }

    create() {
        return this.telegramHelper.createTelegram(this)
    }
}

export default DaliGetDeviceDataGroup;

