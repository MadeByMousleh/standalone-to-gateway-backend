class DaliGetDataGroupReply {


    constructor(value) {

   
        console.log(value)
        
        this.protocolVersion = value.slice(0, 2);
        this.telegramType = value.slice(2, 6);
        this.totalLength = value.slice(6, 10);
        this.crc16 = value.slice(10, 14);
        this.status = value.slice(14, 16);
        this.groups = value.slice(16,20);


    }

    static statusCodes = Object.freeze({
        "00": { message: "ACK - validated OK", ack: true },
        "01": { message: "NACK_RANGE_CHECK  - parameter has invalid range. - no devices configured with the current short address. ", ack: false },
        "03": { message: "NACK_COMMISSIONING_RUNNING  -  Commissioning running ", ack: false }
    });

    getStatusMessage() {
        return DaliGetDataGroupReply.statusCodes[this.status] || { message: "Unknown status", ack: false };
    }


     mapHexToGroups(hexStr) {
        // Convert hex string to a 16-bit binary string
        let binaryStr = parseInt(hexStr, 16).toString(2).padStart(16, '0');
    
        const predefinedMappings = {
            "0001000100000000": "Zone 1",
            "0000000100000001": "Zone 1 & Multizone",
            "0010001000000000": "Zone 2",
            "0000001000000001": "Zone 2 & Multizone",
            "0100010000000000": "Zone 3",
            "0000010000000001": "Zone 3 & Multizone",
            "1000100000000000": "Zone 4",
            "0000100000000001": "Zone 4 & Multizone"
        };
    
        return predefinedMappings[binaryStr] || "Unknown zone/group";
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
            zone: this.mapHexToGroups(this.groups),
        };
    }


}

export default DaliGetDataGroupReply;