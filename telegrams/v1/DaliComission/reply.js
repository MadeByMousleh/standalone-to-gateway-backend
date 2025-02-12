 
  

class DaliCommissionReply {
    protocolVersion
    telegramType
    totalLength
    crc16
    status

    statusCodes = Object.freeze({
        "00": { message: "ACK - validated OK", ack: true },
        "01": { message: "NACK_RANGE_CHECK - parameter has invalid range", ack: false },
        "03": { message: "NACK_COMMISSIONING_RUNNING - Commissioning already running", ack: false },
        "04": { message: "NACK_OPENPERIOD - Open Period Active", ack: false },
        "07": { message: "The function is not available in profile", ack: false },
        "0B": { message: "NACK_USER_CONFIG_BEING_SET - can’t start commission user config being set", ack: false }
      });

    constructor(value) {

        this.protocolVersion = value.slice(0, 2);
        
        this.telegramType = value.slice(2, 6);

        this.totalLength = value.slice(6, 10);

        this.crc16 = value.slice(10, 14);

        this.status = value.slice(14, 16);

        this.data = value.slice(16, 18);

    }

    swapBytes(bytes) {
        return [bytes >> 8, bytes & 0xff];
    }

}

export default DaliCommissionReply;