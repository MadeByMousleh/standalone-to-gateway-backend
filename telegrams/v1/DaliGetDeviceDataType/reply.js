class DaliDeviceDataTypeReply {
    constructor(value) {
        if (typeof value !== "string" || value.length < 20) {
            throw new Error("Invalid input data. Expected a hex string of at least 20 characters.");
        }

        this.protocolVersion = value.slice(0, 2);
        this.telegramType = value.slice(2, 6);
        this.totalLength = value.slice(6, 10);
        this.crc16 = value.slice(10, 14);
        this.status = value.slice(14, 16);
        this.deviceType0 = value.slice(16, 18);
        this.deviceType1 = value.slice(18, 20);
    }

    static statusCodes = Object.freeze({
        "00": { message: "ACK - validated OK", ack: true },
        "01": { message: "NACK_RANGE_CHECK - parameter has invalid range", ack: false },
        "03": { message: "NACK_COMMISSIONING_RUNNING - Commissioning running", ack: false }
    });

    getStatusMessage() {
        return DaliDeviceDataTypeReply.statusCodes[this.status] || { message: "Unknown status", ack: false };
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
            deviceType0: this.deviceType0,
            deviceType1: this.deviceType1
        };
    }

    paramsToJson() {
        return {
            deviceType0: this.deviceType0,
            deviceType1: this.deviceType1
        };
    }
}

export default DaliDeviceDataTypeReply;