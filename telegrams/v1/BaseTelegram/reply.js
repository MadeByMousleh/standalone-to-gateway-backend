 
  

class BaseReply {
    protocolVersion
    telegramType
    totalLength
    crc16
    
    constructor(value) {
        this.protocolVersion = value.slice(0, 2);
        this.telegramType = value.slice(2, 6);
        this.totalLength = value.slice(6, 10);
        this.crc16 = value.slice(10, 14);
    }

}

export default BaseReply;