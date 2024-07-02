

export default class ProtocolVersion {
    byteNumber = 0;
    fieldSize = 1;
    description = `Describes the protocl version`;
    value = 0x01;


    constructor(byteNumber, fieldSize, description, value) {
        this.byteNumber = byteNumber;
        this.fieldSize = fieldSize;
        this.description = description;
        this.value = value;
    }


    set() {
        this.value = value;
    }

    get() {
        return this.value;
    }

}

// protocolVersion = {
//     byteNumber: 0,
//     fieldSize: 1,
//     description: `Describes the protocl version`,
//     value: 0x01,
// }