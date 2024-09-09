import axios from 'axios';

// Function to make API request with retry
const makeApiRequestWithRetry = async function makeApiRequestWithRetry(url, config, maxRetries = 5) {
    let retries = 0;

    while (retries < maxRetries) {

        try {

            const response = await axios(url, config);

            return {
                data: response.data,
                retries,
                url,
                status: response.status,
            };

        } catch (error) {

            // Retry only if there's a network error or server error (5xx)

            if (error.response) {

                console.error(`Request failed with status code: ${error.response.status}`);

            } else if (error.request) {

                console.error('Request failed: no response received' ,url);

            } else {

                console.error('Request failed: ', error.message);
            }

            if (retries === maxRetries - 1 ) {

                console.log('Max retries reached, returning error information', url);

                return {
                    data: error.response ? error.response.data : null,
                    retries,
                    url,
                    status: error.response ? error.response.status : null,

                };
                
            }

            // Exponential backoff before retrying
            await new Promise(resolve => setTimeout(resolve, 2 ** retries * 500));

            retries++;
        }
    }

    // Fallback return in case of unexpected behavior
    throw new Error('Unexpected error: retries exceeded without proper handling');
};



export default makeApiRequestWithRetry;