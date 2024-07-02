import axios from "axios";
import EventEmitter from "events";
import EventSource from "eventsource";


class CassiaNotificationService {

    eventSource;

    eventEmitter = new EventEmitter();

    constructor(IP) {

        this.eventSource = new EventSource(`http://${IP}/gatt/nodes?event=1`);

        this.eventSource.onmessage = (msg) => {

            const { id, value, handle } = JSON.parse(msg.data);

            this.eventEmitter.emit(id, value);
        }
    }

    onData(mac, cb) {
        this.eventEmitter.on(mac, data => cb(data));
    }

    close()
    {
        this.eventSource.close();
    }
}

export default CassiaNotificationService;