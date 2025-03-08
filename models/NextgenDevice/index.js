class NextGenDevice {
  mac;
  lux = 0;
  movementDetected = false;
  isLightOn = false;
  eventType;
  signalStrength;
  chipId;
  name;

  constructor(mac, adData) {
    this.mac = mac;

    if (adData.tw === "08") { 

      this.movementDetected = true;

    }

    if (adData.mailFour !== "000000" && adData.mailFour) {

      this.lux = Number("0x" + adData.mailFour.slice(2, 6));


      this.isLightOn = adData.mailFour.slice(0, 2) === '01';
    }
  }
}

export default NextGenDevice;
