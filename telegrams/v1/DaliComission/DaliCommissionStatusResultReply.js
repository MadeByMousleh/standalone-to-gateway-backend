 
  

class DaliCommissionStatusResultReply {
    protocolVersion
    telegramType
    totalLength
    crc16
    status
    devicesFoundCount; 
    
     commissioningResults = Object.freeze({
        "00": { message: "NO_COMMISSIONING_RESPONSE", ack: false },
        "01": { message: "ONE_CONTROL_GEAR_RESTORED", ack: true },
        "02": { message: "MANUAL_COMMISSIONING_NEEDED", ack: false },
        "03": { message: "COMMISSIONING_DONE", ack: true },
        "04": { message: "COMMISSIONING_ERROR", ack: false },
        "05": { message: "NO_NEW_CONTROL_GEAR", ack: false },
        "06": { message: "NEW_CONTROL_GEAR_FOUND", ack: true },
        "07": { message: "NO_NEW_INPUT_DEVICES", ack: false },
        "08": { message: "NEW_INPUT_DEVICES_FOUND", ack: true },
        "09": { message: "ZONE_ASSIGN_ERROR", ack: false },
        "0A": { message: "ZONE_ASSIGN_OK", ack: true },
        "0B": { message: "ERROR_DALI_8BIT_FRAME_SEND", ack: false },
        "0C": { message: "ERROR_DALI_16BIT_FRAME_SEND", ack: false },
        "0D": { message: "ERROR_DALI_24BIT_FRAME_SEND", ack: false },
        "0E": { message: "DALI_START_CG_AUTO_SCAN_FSM1", ack: true },
        "0F": { message: "DALI_START_CG_AUTO_SCAN_FSM2", ack: true },
        "10": { message: "DALI_START_CG_AUTO_SCAN_FSM3", ack: true },
        "11": { message: "COMMISSIONING_DB_FULL", ack: false }
      });
      
    constructor(value) {

        this.protocolVersion = value.slice(0, 2);
        
        this.telegramType = value.slice(2, 6);

        this.totalLength = value.slice(6, 10);

        this.crc16 = value.slice(10, 14);

        this.status = value.slice(14, 16);

        this.devicesFoundCount = value.slice(16, 18);

    }

    swapBytes(bytes) {
        return [bytes >> 8, bytes & 0xff];
    }

}

export default DaliCommissionStatusResultReply;