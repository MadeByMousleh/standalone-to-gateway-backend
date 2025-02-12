import TelegramHelper from '../TelegramHelper.js'

class DaliAssignDeviceToZone {

    protocolVersion;
    telegramType;
    totalLength;
    telegramHelper = new TelegramHelper();
    payload;
    shortAddress;

    constructor(shortAddress, zone, multiZone) {
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion = this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0402);
        this.totalLength = this.telegramHelper.createTotalLength(0x000A);
        this.payload = [parseInt(shortAddress, 16), parseInt(zone, 16), parseInt(multiZone, 16)];
    }

    create() {
        return this.telegramHelper.createTelegram(this)
    }
}

export default DaliAssignDeviceToZone;

