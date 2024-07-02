export default class ZoneCommonFunc1 {

    byte = {
        0: { active: 0, description: 'Daylight control' },
        1: { active: 0, description: 'Overexposed active' },
        2: { active: 0, description: 'Reserved' },
        3: { active: 0, description: 'Eight hour test active' },
        4: { active: 0, description: 'Manually Off (E.g button)' },
        5: { active: 0, description: 'Manually using an input (E.g button)' },
        6: { active: 0, description: 'When movement is detected' },
        7: { active: 0, description: 'Reserved' },
    }

    constructor(value) {
        let changedByte = value;

        for (let index = 0; index < 8; index++) {
            const bitType = this.byte[index];
            const lsb = changedByte & 1;
            bitType.active = lsb;
            changedByte = changedByte >> 1;
        }
    }

}