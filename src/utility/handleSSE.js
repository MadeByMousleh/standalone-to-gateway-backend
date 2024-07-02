import EventSource from "eventsource";



export const listenForSSE = (url,request, response, onMessageCb) => {

    const eventSource = new EventSource(url);

    eventSource.onopen = () => {

        console.log("## Eventsource to BLE gateway is now open ##");

    };

    eventSource.onmessage = (event) => {
        onMessageCb(event);
    };

    eventSource.onerror = (error) => {

        console.error('EventSource error:', error);

        // response.write(`data: ${JSON.stringify({ error: 'EventSource error occurred' })}\n\n`);
    };

    // request.on("close", () => {

    //     eventSource.close();

    //     console.log("Eventsource at BLE-gateway is now closed");

    // });
    
    return eventSource;
}