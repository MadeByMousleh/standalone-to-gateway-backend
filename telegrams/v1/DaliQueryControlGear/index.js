import TelegramHelper from '../TelegramHelper.js';

const QueryCommands = {
    QUERY_STATUS: 0x90,
    QUERY_CONTROL_GEAR_PRESENT: 0x91,
    QUERY_LAMP_FAILURE: 0x92,
    QUERY_LAMP_POWER_ON: 0x93,
    QUERY_LIMIT_ERROR: 0x94,
    QUERY_RESET_STATE: 0x95,
    QUERY_MISSING_SHORT_ADDRESS: 0x96,
    QUERY_VERSION_NUMBER: 0x97,
    QUERY_CONTENT_DTR0: 0x98,
    QUERY_DEVICE_TYPE: 0x99,
    QUERY_PHYSICAL_MINIMUM: 0x9A,
    QUERY_POWER_FAILURE: 0x9B,
    QUERY_CONTENT_DTR1: 0x9C,
    QUERY_CONTENT_DTR2: 0x9D,
    QUERY_OPERATING_MODE: 0x9E,
    QUERY_LIGHT_SOURCE_TYPE: 0x9F,
    QUERY_ACTUAL_LEVEL: 0xA0,
    QUERY_MAX_LEVEL: 0xA1,
    QUERY_MIN_LEVEL: 0xA2,
    QUERY_POWER_ON_LEVEL: 0xA3,
    QUERY_SYSTEM_FAILURE_LEVEL: 0xA4,
    QUERY_FADE_TIME_FADE_RATE: 0xA5,
    QUERY_MANUFACTURER_SPECIFIC_MODE: 0xA6,
    QUERY_NEXT_DEVICE_TYPE: 0xA7,
    QUERY_EXTENDED_FADE_TIME: 0xA8,
    QUERY_CONTROL_GEAR_FAILURE: 0xA9,
    QUERY_SCENE_LEVEL: 0xB0,
    QUERY_GROUPS_0_7: 0xC0,
    QUERY_GROUPS_8_15: 0xC1,
    QUERY_RANDOM_ADDRESS_H: 0xC2,
    QUERY_RANDOM_ADDRESS_M: 0xC3,
    QUERY_RANDOM_ADDRESS_L: 0xC4
};

Object.freeze(QueryCommands); // Ensure the enum is immutable

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
        console.log(this.shortAddress)
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
