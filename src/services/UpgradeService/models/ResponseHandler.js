export default class ResponseHandler

{

ErrorCodes = {
    '00': 'The data send is accepted',
    '01': 'The provided key does not match the value',
    '02': 'The verification of the flash failed',
    '03': 'The amount of data available is outside the expected range',
    '04': 'The data is not in proper form',
    '05': 'The command is not recognized',
    '06': 'The expected device does not match the detected device',
    '07': 'The boot loader version detected is not supported',
    '08': 'The checksum does not match the expected value',
    '09': 'The flash array is not valid',
    '0a': 'The flash row is not valid',
    '0b': 'The flash row is protected and cannot be set as active',
    '0d': 'The application is currently marked as active',
    '0e': 'The callback function returns invalid data',
    '0f': 'An unknown error ocurred',
}
    


    constructor()
    {

    }

    handleResponse(response)
    {
        const errorCode = `${response[1]}`.padStart(2, 0);
        if(errorCode !== '00') {
            console.log(`ERROR: ${this.ErrorCodes[errorCode]} - RESPONSE RECEIVED: ${response.toString('hex')}`);
            return false;
        } 
            console.log(`SUCCESS: ${this.ErrorCodes[errorCode]} - RESPONSE RECEIVED: ${response.toString('hex')}`);
            return true;
        
    }

}