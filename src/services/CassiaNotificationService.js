import axios from "axios";
import EventEmitter from "events";
import EventSource from "eventsource";

class CassiaNotificationService {
    static instance; // Singleton instance

    constructor(IP) {
        if (CassiaNotificationService.instance) {
            return CassiaNotificationService.instance;
        }

        this.IP = IP;
        this.eventSource = new EventSource(`http://${IP}/gatt/nodes?event=1`);
        this.eventEmitter = new EventEmitter();

        this.eventSource.onmessage = (msg) => {
            const { id, value } = JSON.parse(msg.data);
            console.log(id, value)
            this.eventEmitter.emit(id, value);
        };

        // Handle process exit to clean up resources
        this.setupCleanup();

        // Store singleton instance
        CassiaNotificationService.instance = this;
    }

    onData(mac, cb) {
        this.eventEmitter.on(mac, (data) => cb(data));
    }

    close() {
        console.log("Closing CassiaNotificationService...");
        this.eventSource.close();
        CassiaNotificationService.instance = null;
    }

    setupCleanup() {
        // Close connection when process is terminating
        const cleanup = () => {
            this.close();
            process.exit(); // Ensure the program exits
        };

        process.on("SIGINT", cleanup); // Ctrl+C
        process.on("SIGTERM", cleanup); // Termination signal (nodemon restart)
        process.on("beforeExit", cleanup); // When Node.js is about to exit
        process.on("exit", cleanup); // When the process actually exits

        // Nodemon-specific event for watching file changes
        process.once("SIGHUP", cleanup);
    }
}

export default CassiaNotificationService;