class DaliGetZoneAssignmentCountReply {
  protocolVersion;
  telegramType;
  totalLength;
  crc16;
  devicesInZoneOne;
  devicesInZoneTwo;
  devicesInZoneThree;
  devicesInZoneFour;
  devicesInMultiZone;
  multiZoneDevicesFromZones;
  existingHvacRelay;
  existingStandbyRelay;
  allDevicesCount;

  constructor(value) {
    this.protocolVersion = this.swapHexBytes(value.slice(0, 2));
    this.telegramType = this.swapHexBytes(value.slice(2, 6));
    this.totalLength = this.swapHexBytes(value.slice(6, 10));
    this.crc16 = this.swapHexBytes(value.slice(10, 14));
    this.devicesInZoneOne = this.swapHexBytes(value.slice(14, 16));
    this.devicesInZoneTwo = this.swapHexBytes(value.slice(16, 18));
    this.devicesInZoneThree = this.swapHexBytes(value.slice(18, 20));
    this.devicesInZoneFour = this.swapHexBytes(value.slice(20, 22));
    this.devicesInMultiZone = this.swapHexBytes(value.slice(22, 24));
    this.multiZoneDevicesFromZones = this.swapHexBytes(value.slice(24, 26));
    this.existingHvacRelay = this.swapHexBytes(value.slice(26, 28));
    this.existingStandbyRelay = this.swapHexBytes(value.slice(28, 30));
    this.allDevicesCount =
      this.devicesInZoneOne +
      this.devicesInZoneTwo +
      this.devicesInZoneThree +
      this.devicesInZoneFour;
  }

  swapHexBytes(hexString) {
    if (hexString.length % 2 !== 0) {
      throw new Error("Hex string must have an even number of characters");
    }

    if (hexString.length === 2) return parseInt(hexString, 16);

    let bytes = parseInt(hexString, 16);

    return ((bytes & 0xff) << 8) | ((bytes >> 8) & 0xff);
  }

  getProtocolVersion() {
    return this.protocolVersion;
  }

  getTelegramType() {
    return this.swapBytes(this.telegramType);
  }

  getTotalLength() {
    return this.swapBytes(this.totalLength);
  }

  getCrc16() {
    return this.swapBytes(this.crc16);
  }

  isAck(value) {
    let telegramType = value.substring(2, 6);
    return telegramType === "4004";
  }

  convertHexToInt(hexString) {
    return parseInt(hexString, 16);
  }

  createArray(count) {
    return Array.from({ length: count + 1 }, (_, index) => index);
  }

  getShortAddressFromZone() {
    let allDevicesCountArr = this.createArray(this.allDevicesCount);

    const zones = [
      {
        zoneNr: 1,
        shortAddresses: allDevicesCountArr.splice(0, this.devicesInZoneOne),
        count: this.devicesInZoneOne,
      },
      {
        zoneNr: 2,
        shortAddresses: allDevicesCountArr.splice(0, this.devicesInZoneTwo),
        count: this.devicesInZoneTwo,
      },
      {
        zoneNr: 3,
        shortAddresses: allDevicesCountArr.splice(0, this.devicesInZoneThree),
        count: this.devicesInZoneThree,
      },
      {
        zoneNr: 4,
        shortAddresses: allDevicesCountArr.splice(0, this.devicesInZoneFour),
        count: this.devicesInZoneFour,
      },
    ];

    return zones;
  }

  getCalculatedShortAddresses() {
    if (this.existingHvacRelay === 255 && this.existingStandbyRelay === 255) {
      return this.getShortAddressFromZone();
    }
    return null;
  }
}

export default DaliGetZoneAssignmentCountReply;
