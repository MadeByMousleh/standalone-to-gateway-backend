class DaliDeviceCommonParamReply {
    constructor(value) {
        if (typeof value !== "string" || value.length < 30) {
            throw new Error("Invalid input data. Expected a hex string of at least 30 characters.");
        }

        this.protocolVersion = value.slice(0, 2);
        this.telegramType = value.slice(2, 6);
        this.totalLength = value.slice(6, 10);
        this.crc16 = value.slice(10, 14);
        this.status = value.slice(14, 16);
        this.maxLevel = value.slice(16, 18);
        this.minLevel = value.slice(18, 20);
        this.powerOnLevel = value.slice(20, 22);
        this.sysFailLevel = value.slice(22, 24);
        this.fadeTime = value.slice(24, 26);
        this.fadeRate = value.slice(26, 28);
        this.extendedFadeTime = value.slice(28, 30);
    }

    static statusCodes = Object.freeze({
        "00": { message: "ACK - validated OK", ack: true },
        "03": { message: "NACK_COMMISSIONING_RUNNING - Commissioning already running", ack: false }
    });

    getStatusMessage() {
        return DaliDeviceCommonParamReply.statusCodes[this.status] || { message: "Unknown status", ack: false };
    }

    toJSON() {
        return {
            protocolVersion: this.protocolVersion,
            telegramType: this.telegramType,
            totalLength: this.totalLength,
            crc16: this.crc16,
            status: {
                code: this.status,
                message: this.getStatusMessage().message,
                ack: this.getStatusMessage().ack
            },
            maxLevel: this.maxLevel,
            minLevel: this.minLevel,
            powerOnLevel: this.powerOnLevel,
            sysFailLevel: this.sysFailLevel,
            fadeTime: this.fadeTime,
            fadeRate: this.fadeRate,
            extendedFadeTime: this.extendedFadeTime
        };
    }

    paramsToJson() {
        return {
            maxLevel: this.maxLevel,
            minLevel: this.minLevel,
            powerOnLevel: this.powerOnLevel,
            sysFailLevel: this.sysFailLevel,
            fadeTime: this.fadeTime,
            fadeRate: this.fadeRate,
            extendedFadeTime: this.extendedFadeTime
        };
    }

}

export default DaliDeviceCommonParamReply;