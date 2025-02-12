import TelegramHelper from '../TelegramHelper.js'

class DaliCommission {

    protocolVersion;
    telegramType;
    totalLength;
    telegramHelper = new TelegramHelper();
    payload;
    searchType;

    constructor(searchType) {
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion = this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0400);
        this.totalLength = this.telegramHelper.createTotalLength(0x0008);
        this.searchType = searchType;
        this.payload = [this.searchType];
    }

    create() {
        return this.telegramHelper.createTelegram(this)
    }
}

export default DaliCommission;

