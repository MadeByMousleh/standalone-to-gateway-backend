import TelegramHelper from "../../TelegramHelper.js";

 class GetWirelessFunctionTelegram  {

    totalBytes = 7;
    
    protocolVersion;
    telegramType;
    totalLength;
    payload;
    telegramHelper = new TelegramHelper();
    
    constructor() {
        this.protocolVersion =  this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0228);
        this.totalLength = this.telegramHelper.createTotalLength(0x001B);
        this.payload = '0001000000000000000000000000000000000000';
    }

     create()
    {
        return this.telegramHelper.createTelegramFromHexString(this)
    }
}

export default GetWirelessFunctionTelegram;