import TelegramHelper from "../../TelegramHelper.js";


export default class GetWiredPushButtonList  {

    protocolVersion;
    telegramType;
    totalLength;
    // crc16: number;
    payload;

    telegramHelper = new TelegramHelper();
    
    constructor() {
        this.protocolVersion =  this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0113);
        this.totalLength = this.telegramHelper.createTotalLength(0x0007);
        this.payload = Uint8Array.from([])
        // this.crc16 = this.telegramHelper.createCrc16(0x95FB);
    }

     create()
    {
        return this.telegramHelper.createTelegram(this)
    }
}

