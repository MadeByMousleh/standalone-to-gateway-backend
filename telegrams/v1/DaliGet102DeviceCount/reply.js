const LoginResult = {
    0: { bleSpecMsg: 'LOGIN NACK', msg: 'Login failed', ack: false, pincodeRequired: false },
    1: { bleSpecMsg: 'LOGIN ACK. No pincode required', msg: 'Login succeeded', ack: true, pincodeRequired: false },
    2: { bleSpecMsg: 'LOGIN ACK. Pincode Required', msg: 'A pincode is required to be able to login to the detector', ack: true, pincodeRequired: true },
    3: { bleSpecMsg: 'Login.Ack. Open Period Active. No Pincode Required.', msg: 'Open period is currently active', ack: true, pincodeRequired: false }
}

class DaliGet102DeviceCountReply {
    protocolVersion
    telegramType
    totalLength
    crc16
    status
    static replyTelegram = "1F04";

    constructor(value) {

        this.protocolVersion = value.slice(0, 2);
        
        this.telegramType = value.slice(2, 6);

        this.totalLength = value.slice(6, 10);

        this.crc16 = value.slice(10, 14);

        this.status = value.slice(14, 16);

        this.commissioningFlag = value.slice(16, 18);

        this.luminariesCount = value.slice(18,20);
    }

    swapBytes(bytes) {
        return [bytes >> 8, bytes & 0xff];
    }

}

export default DaliGet102DeviceCountReply;