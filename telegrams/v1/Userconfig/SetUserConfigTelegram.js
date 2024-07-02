import TelegramHelper from "../TelegramHelper.js";

class SetUserConfigTelegram {

    totalBytes = 167;

    protocolVersion;
    telegramType;
    totalLength;
    payload;
    telegramHelper = new TelegramHelper();

    constructor(payload) {
        this.protocolVersion = this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x010D);
        this.totalLength = this.telegramHelper.createTotalLength(0x00A7);
        this.payload = payload;
    }

    create() {
        return this.telegramHelper.createTelegramFromHexString(this)
    }
}

export default SetUserConfigTelegram;