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

        console.log(binaryStr);
    
        // Group mapping based on the image
        const groupMap = {
            0: 1,
            1: 2,
            2: 3,
            3: 4,
            4: 5,
            5: 6,
            6: 7,
            7: 8,
            8: 9
            // Bits 9-15 are not used
        };
    
        let activeGroups = [];
    
        // Check which bits are set
        for (let i = 0; i <= 8; i++) {
            if (binaryStr[15 - i] === '1') { // Reverse index as MSB is at left
                activeGroups.push(groupMap[i]);
            }
        }
    
        return activeGroups.length > 0 ? activeGroups : 0xFF;
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