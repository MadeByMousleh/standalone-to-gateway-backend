class DaliAssignDeviceToZoneReply {


    constructor(value) {

        this.protocolVersion = value.slice(0, 2);
        this.telegramType = value.slice(2, 6);
        this.totalLength = value.slice(6, 10);
        this.crc16 = value.slice(10, 14);
        this.status = value.slice(14, 16);
        this.data = value.slice(16, 18);

    }

    static statusCodes = Object.freeze({
        "00": { message: "ACK - validated OK", ack: true },
        "01": { message: "NACK_RANGE_CHECK - parameter has invalid range", ack: false },
        "03": { message: "NACK_COMMISSIONING_RUNNING - Commissioning already running", ack: false }
    });

    getStatusMessage() {
        return DaliAssignDeviceToZoneReply.statusCodes[this.status] || { message: "Unknown status", ack: false };
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
            }
        };
    }
}

export default DaliAssignDeviceToZoneReply;