import TelegramHelper from '../TelegramHelper.js'

class DaliGetDevicesCommonParam {

    protocolVersion;
    telegramType;
    totalLength;
    telegramHelper = new TelegramHelper();
    payload;
    searchType;

    constructor(searchType) {
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion = this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0410);
        this.totalLength = this.telegramHelper.createTotalLength(0x0007);
        this.payload = [];
    }

    create() {
        return this.telegramHelper.createTelegram(this)
    }
}

export default DaliGetDevicesCommonParam;

