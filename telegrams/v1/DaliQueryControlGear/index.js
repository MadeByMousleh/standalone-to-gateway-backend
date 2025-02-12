import TelegramHelper from '../TelegramHelper.js';


class DaliQueryControlGear {
    protocolVersion;
    telegramType;
    totalLength;
    crc16;
    shortAddress;
    query;
    telegramHelper;
    payload;
    

    constructor(shortAddress, query) {
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion = this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0409);
        this.totalLength = this.telegramHelper.createTotalLength(0x0009);
        this.shortAddress = this.toHex(shortAddress);
        this.query = this.toHex(query);
        this.payload = [this.query, this.shortAddress];
    }

     toHex(value) {
        // Convert the number to hexadecimal string
        let hex = value.toString(16).toUpperCase();
        
        // Ensure the hex string is at least two characters long
        if (hex.length < 2) {
            hex = '0' + hex;
        }
        
        // Prepend '0x' to the hex string
        return '0x' + hex;
    }
    
    create() {
        return this.telegramHelper.createTelegram(this);
    }
}


export default DaliQueryControlGear ;
