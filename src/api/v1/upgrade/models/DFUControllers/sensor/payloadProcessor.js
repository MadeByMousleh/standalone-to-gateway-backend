import FlashRow from './FlashRow.js'

class PayloadProcessor {

    #header = null
    #siliconId = null
    #siliconRev = null
    #checkSumType = null
    #flashDataLines = null
    #securityId = null
    #payload = null;
    #file = null;


    constructor(cypressPayload, securityId) {

        this.#securityId = securityId;

        this.#payload = cypressPayload;

        this.#file = this.#payload.trim(); // Remove surrounding whitespace

        this.#header = this.getHeader();

        this.#siliconId = this.getSiliconId();

        this.#siliconRev = this.getSiliconRev();

        this.#checkSumType = this.getChecksumType();

        this.#flashDataLines = this.getFlashDataLines();
    }


    //#region Private methods

    #readDataLines = () => {

        var lines = this.#file.split(/\r?\n/)
        let linesArr = [];
        
        // For each line (except the header)
        
        for (var i = 1; i < lines.length; i++) {
            
            // [1-byte ArrayID][2-byte RowNumber][2-byte DataLength][N-byte Data][1byte Checksum]
            var model = new FlashRow()
            model.arrayID = lines[i].substring(1, 3);// ie: 01
            model.rowNumber = lines[i].substring(3, 7);
            model.dataLength = lines[i].substring(7, 11); // ie: 0080
            model.data = lines[i].substring(11, lines[i].length - 2);
            model.checksum = lines[i].slice(lines[i].length - 2, lines[i].length);
            linesArr.push(model);
        }


        return linesArr;
    }


    //#endregion

    //#region  Getters

    getSecurityId = () => this.#securityId;

    getFlashDataLines = () => {
        if (!this.#flashDataLines) return this.#readDataLines();
        return this.#flashDataLines;
    }

    getHeader = () => {
        if (!this.#header) return this.#file.substring(0, 12)
        return this.#header;
    }

    getSiliconId = () => {
        if (!this.#siliconId) return this.#header.slice(0, 8);
        return this.#siliconId;
    }

    getSiliconRev = () => {

        if (!this.#siliconRev) return this.#header.slice(8, 10);
        return this.#siliconRev;
    }

    getChecksumType = () => {

        if (!this.#checkSumType) return this.#header.slice(10, 12);
        return this.#checkSumType;
    }

    //#endregion
}

export default PayloadProcessor
