import EventEmitter from "events";
import EventSource from "eventsource";

class CassiaConnectionStateService {
    static instance; // Singleton instance

    constructor(IP) {
        if (CassiaConnectionStateService.instance) {
            return CassiaConnectionStateService.instance;
        }

        this.IP = IP;
        this.eventSource = new EventSource(`http://${IP}/management/nodes/connection-state`);
        this.eventEmitter = new EventEmitter();

        this.eventSource.onmessage = (msg) => {

            // console.log(msg);
            const { chipId, handle, rssi, connectionState } = JSON.parse(msg.data);

            this.eventEmitter.emit('connectionData', {chipId, handle, rssi, connectionState});

        };

        // Handle process exit to clean up resources
        this.setupCleanup();

        // Store singleton instance
        CassiaConnectionStateService.instance = this;
    }

    onData(cb) {
        this.eventEmitter.on('connectionData', (data) => cb(data));
    }

    close() {
        console.log("Closing CassiaConnectionStateService...");
        this.eventSource.close();
        CassiaConnectionStateService.instance = null;
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

export default CassiaConnectionStateService;