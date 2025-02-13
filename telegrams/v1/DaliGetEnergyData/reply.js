class DaliGetEnergyDataReply {

    
static replyTelegram = "1606";

    constructor(value) {
        this.protocolVersion = value.slice(0, 2);
        this.telegramType = value.slice(2, 6);
        this.totalLength = value.slice(6, 10);
        this.crc16 = value.slice(10, 14);
        this.shortAddress = value.slice(14, 16);
        this.scalingFactor = value.slice(16,18);
        this.activeEnergy = this.parseEnergy(value.slice(18, 30));
        this.operatingTime = this.parseOperatingTime(value.slice(30, 38));
        this.operatingTimeText  = this.parseOperatingTimeToText(value.slice(30, 38));
    }

     convertActiveEnergy(scaleFactor, activeEnergy) {
        const scaleMapping = {
            0xFA: { factor: 1e-6, unit: "uWh" }, // -6
            0xFB: { factor: 1e-5, unit: "uWh" }, // -5
            0xFC: { factor: 1e-4, unit: "uWh" }, // -4
            0xFD: { factor: 1e-3, unit: "mWh" }, // -3
            0xFE: { factor: 1e-2, unit: "mWh" }, // -2
            0xFF: { factor: 1e-1, unit: "mWh" }, // -1
            0x00: { factor: 1, unit: "Wh" },    // 0
            0x01: { factor: 10, unit: "Wh" },   // +1
            0x02: { factor: 100, unit: "Wh" },  // +2
            0x03: { factor: 1e3, unit: "kWh" }, // +3
            0x04: { factor: 1e4, unit: "kWh" }, // +4
            0x05: { factor: 1e5, unit: "kWh" }, // +5
            0x06: { factor: 1e6, unit: "MWh" }  // +6
        };
        
        const scaleData = scaleMapping[scaleFactor] || { factor: 1, unit: "Unknown" };
        
        return {
            activeEnergy: activeEnergy * scaleData.factor,
            SIUnit: scaleData.unit, 
            scaleFactor: this.scalingFactor,
            rawActiveEnergy: this.activeEnergy
        };
    }
    

    parseEnergyInWh() {
        return energy / 100;
    }
    parseEnergy(bytes) {
        return parseInt(bytes, 16);
    }

    parseOperatingTime(bytes) {
        return parseInt(bytes, 16);
    }


    toJSON() {
        return {
            protocolVersion: this.protocolVersion,
            telegramType: this.telegramType,
            totalLength: this.totalLength,
            crc16: this.crc16,
            activeEnergy: this.activeEnergy, 
            operatingTime: this.operatingTime,
            operatingTimeText: this.operatingTimeText  ,
            activeEnergyData: this.convertActiveEnergy(parseInt(this.scalingFactor, 16), this.activeEnergy),
        };
    }

     
    
    parseOperatingTimeToText(bytes) {
        const totalSeconds = parseInt(bytes, 16);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours} Hours ${minutes.toString().padStart(2, '0')} minutes`;
    }

}

export default DaliGetEnergyDataReply;