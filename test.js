function swap16String(string) {
    const stringArr = string.split("");
    return `${stringArr[2]}${stringArr[3]}${stringArr[0]}${stringArr[1]}`
}

function calcChecksum(message) {

    let sum = 0;

    for (let i = 0; i < message.length; i++) {
        sum += message[i];
    }

    let crc = (1 + (~sum & 0xFFFF)) & 0xFFFF;

    if (crc > 65535) { crc = crc - 65535 - 1; }

    return crc;

};


function calculateChecksum(command, dataLengthBuffer, dataBuffer) {
    const checkSumBuffer = Buffer.from([0x01, 0x10, 0x09]);

    let checksum = calcChecksum(checkSumBuffer)

    checksum = swap16String(checksum.toString(16));

    return checksum
}

function crc16(data, crc = 0xFFFF) {
    let poly = 0x1021;

    crc = data ^ crc;
    let shouldXOR = 0;

    for (var i = 0; i < data.length * 8; i++) {
        shouldXOR = 1 & crc; // Extract LSB 
        crc = crc >>> 1;

        if (shouldXOR) {
            crc = poly ^ crc;
        }

    }

    return crc;
}

function CalculateCRC(data) {
    let crc = 0x8005;
    for (let y = 0; y < data.length; y++) {
        const messageChunk = data[y];

        crc = crc16(Uint8Array.from([messageChunk]), crc);
    }

    return crc;

}


function crc(data) {
    let x;
    let crc = 0x8005;

    for (let i = 0; i < data.length * 8; i++) {
        x = crc >> 8 ^ data[i];
        x ^= x >> 4;
        crc = (crc << 8) ^ ((x << 12)) ^ ((x << 5)) ^ (x);
    }

    return crc;
}


// CalcCrc16(message)
// {
//     crc = 0x8005;
//     for (i = 0; i < length; i++) {
//         crc ^= (ushort)(message[i] << 8);
//         for (j = 0; j < 8; j++) {
//             if ((crc & 0x8000) > 0) {
//                 crc = (ushort)((crc << 1) ^ 0x1021);
//             }
//             else {
//                 crc <<= 1;
//             }
//         }
//     }
//     return crc;
// }

console.log(CalculateCRC(Buffer.from([0x01, 0x00, 0x10, 0x00, 0x09])));

// •	Protocol version(unsigned char – 1 byte)
// •	Telegram type(unsigned short – 2 bytes)
// •	Total length – header + payload(unsigned short – 2 bytes)
// •	CRC16(CRC of header – unsigned short – 2 bytes)
