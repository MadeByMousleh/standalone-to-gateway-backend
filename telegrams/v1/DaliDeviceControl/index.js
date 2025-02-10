import TelegramHelper from '../TelegramHelper.js'

class DaliDeviceControl {

    protocolVersion;
    telegramType;
    totalLength;
    payload;

    telegramHelper = new TelegramHelper();

    constructor(payload) {
        
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion = this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0405);
        this.totalLength = payload.length === 6 ? this.telegramHelper.createTotalLength(0x000A)  : this.telegramHelper.createTotalLength(0x0009);
        this.payload = payload;
    }

    create() {
        return this.telegramHelper.createTelegramFromHexString(this)
    }
}

export default DaliDeviceControl;

