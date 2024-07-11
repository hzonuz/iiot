// src/WebSocketService.js

class WebSocketService {
    static instance = null;
    callbacks = {};

    static getInstance() {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    constructor() {
        this.socketRef = null;
    }

    connect() {
        const path = "ws://localhost:8000/ws/data";
        this.socketRef = new WebSocket(path);

        this.socketRef.onopen = () => {
            console.log("WebSocket connection opened.");
        };

        this.socketRef.onmessage = e => {
            this.socketNewMessage(e.data);
        };

        this.socketRef.onclose = () => {
            console.log("WebSocket connection closed.");
            // this.connect();  // Reconnect on close
        };

        this.socketRef.onerror = () => {
            console.log("WebSocket error.");
        };
    }

    socketNewMessage(data) {
        const parsedData = JSON.parse(data);
        Object.keys(this.callbacks).forEach(key => {
            this.callbacks[key](parsedData);
        });
    }

    addCallbacks(callback) {
        if (callback !== null) {
            this.callbacks[1] = callback;
        }
    }
}

const WebSocketInstance = WebSocketService.getInstance();

export default WebSocketInstance;