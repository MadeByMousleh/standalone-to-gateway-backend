import TelegramHelper from '../TelegramHelper.js';

class DaliZoneControl {
    protocolVersion;
    telegramType;
    totalLength;
    telegramHelper = new TelegramHelper();
    payload;
    shortAddress;

    static DaliZoneControlZonesField = {
        GROUP_ZONE1: 0x00,
        GROUP_ZONE2: 0x01,
        GROUP_ZONE3: 0x02,
        GROUP_ZONE4: 0x03,
        MULTIDLC1: 0x04,
        MULTIDLC2: 0x05,
        MULTIDLC3: 0x06,
        MULTIDLC4: 0x07,
        MULTIZONE: 0x08,
        GROUP_PROP_CMD: 0x09,
        BCAST: 0x0A

    }


    static DaliZoneCommand = {
        DALI_OFF: 0x00,
        DALI_ON: 0x01,
        DALI_UP: 0x02,
        DALI_DOWN: 0x03,
        DALI_IDENTIFY: 0x04,
        DALI_DIRECT_LEVEL: 0x05,
        DALI_ON_AND_STEP_UP: 0x06,
        DALI_RECALL_MIN_LEVEL: 0x07,

    }

    constructor(
        zoneField = DaliZoneControl.DaliZoneControlZonesField.BCAST,
        command = DaliZoneControl.DaliZoneCommand.DALI_ON, 
        directLevel = 0x00) {
        this.telegramHelper = new TelegramHelper();
        this.protocolVersion = this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0406);
        this.totalLength = this.telegramHelper.createTotalLength(0x000A);
        this.payload = [directLevel,command, zoneField ];
    }

    create() {
        return this.telegramHelper.createTelegram(this);
    }
}

export default DaliZoneControl;