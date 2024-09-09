import { EventEmitter } from "events";

export class UpgradeQueue {

    items;

    progressEmitter = new EventEmitter();

    constructor() {
        this.items = [];
    }


    // Add an item to the queue
    enqueue(item) {
        this.items.push(item);
    }

    // Remove an item from the queue
    dequeue() {
        if (this.isEmpty()) {
            throw new Error("Queue is empty");
        }
        return this.items.shift();
    }

    // View the first item in the queue without removing it
    peek() {
        if (this.isEmpty()) {
            throw new Error("Queue is empty");
        }
        return this.items[0];
    }

    // Check if the queue is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // Get the size of the queue
    size() {
        return this.items.length;
    }

    onReceivingProgress(data) {
        this.progressEmitter.emit('progress', data);

    }

    onUpgradeEnd(data) {

        if (data.isComplete) {
          this.dequeue();  
        }

    }

    onProgress(cb) {
        this.progressEmitter.on('progress', cb)
        console.log(this.items);
    }

    start() {

        console.log(this.items)
        
        if (this.isEmpty()) {
            return;
        }

        this.items[0].upgradeSensor();
        this.items[0].onDFUProgress(onReceivingProgress)
        this.items[0].onDFUend(onUpgradeEnd)

    
    }

}