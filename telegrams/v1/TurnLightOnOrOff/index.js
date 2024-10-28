import TelegramHelper from '../TelegramHelper.js'

class TurnLightOnOrOffTelegram {

    protocolVersion;

    telegramType;

    totalLength;
    // crc16: number;
    payload;

    telegramHelper = new TelegramHelper();

    constructor(payload) {
        
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion = this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x022A);
        this.totalLength = this.telegramHelper.createTotalLength(0x0010);
        this.payload = payload;
    }

    create() {
        return this.telegramHelper.createTelegramFromHexString(this)
    }
}

export default TurnLightOnOrOffTelegram;

