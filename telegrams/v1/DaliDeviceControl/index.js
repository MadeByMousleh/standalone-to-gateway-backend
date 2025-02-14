import TelegramHelper from '../TelegramHelper.js'

class DaliDeviceControl {

    protocolVersion;
    telegramType;
    totalLength;
    payload;
    telegramHelper = new TelegramHelper();

    static DaliDeviceControlCommand = {
        DALI_OFF: 0x00,
        DALI_ON: 0x01,
        DALI_UP: 0x02,
        DALI_DOWN: 0x03,
        DALI_IDENTIFY: 0x04,
        DALI_DIRECT_LEVEL: 0x05,
        DALI_ON_AND_STEP_UP: 0x06,
        DALI_RECALL_MIN_LEVEL: 0x07,
        DALI_GOTO_LAST_ACT_LVL: 0x08,
    }

    constructor(shortAddress, DaliDeviceControlCommand = DaliDeviceControl.DaliDeviceControlCommand.DALI_ON, directLevel) {

        this.telegramHelper = new TelegramHelper();
        this.protocolVersion = this.telegramHelper.createProtocolVersion(0x01);
        this.telegramType = this.telegramHelper.createTelegramType(0x0405);
        this.totalLength = this.telegramHelper.createTotalLength(0x000A);
        this.payload = [directLevel, DaliDeviceControlCommand, shortAddress];
    }

    create() {
        return this.telegramHelper.createTelegram(this)
    }
}

export default DaliDeviceControl;

