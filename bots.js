// Node.js bot controller using the server's binary protocol
import WebSocket from "ws";

const KEY_FORWARD = 0;
const KEY_BACKWARD = 1;
const KEY_TURN_LEFT = 2;
const KEY_TURN_RIGHT = 3;

function sendInput(ws, key, pressed) {
    const buf = Buffer.allocUnsafe(3);
    buf[0] = 1; // type: input
    buf[1] = key & 0xff;
    buf[2] = pressed ? 1 : 0;
    ws.send(buf);
}

function sendMouse(ws, dx) {
    const buf = Buffer.allocUnsafe(3);
    buf[0] = 2; // type: mouse
    // int16 little-endian
    const clamped = Math.max(-50, Math.min(50, dx | 0));
    buf.writeInt16LE(clamped, 1);
    ws.send(buf);
}

class Bot {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.forwardHeld = false;
        this.turnHeld = null; // KEY_TURN_LEFT or KEY_TURN_RIGHT
        this.turnTimer = null;
        this.mouseTimer = null;
        this.alive = false;

        this.ws.on("message", (data) => {
            if (!(data instanceof Buffer)) return;
            const type = data[0];
            if (type === 10 && !this.alive) {
                this.start();
            }
        });

        this.ws.on("close", () => this.stop());
        this.ws.on("error", () => this.stop());
    }

    start() {
        if (this.alive) return;
        this.alive = true;
        this.forwardHeld = true;
        sendInput(this.ws, KEY_FORWARD, true);
        // Pick a turn direction and toggle periodically
        this.turnHeld = Math.random() < 0.5 ? KEY_TURN_LEFT : KEY_TURN_RIGHT;
        sendInput(this.ws, this.turnHeld, true);
        this.turnTimer = setInterval(() => {
            sendInput(this.ws, this.turnHeld, false);
            this.turnHeld = this.turnHeld === KEY_TURN_LEFT ? KEY_TURN_RIGHT : KEY_TURN_LEFT;
            sendInput(this.ws, this.turnHeld, true);
        }, 1500 + Math.floor(Math.random() * 1500));
        // Optional: comment out mouse jitter to reduce mouse event rate
        // this.mouseTimer = setInterval(() => {
        //     sendMouse(this.ws, (Math.random() * 10 - 5) | 0);
        // }, 200);
    }

    stop() {
        if (!this.alive) return;
        this.alive = false;
        clearInterval(this.turnTimer);
        clearInterval(this.mouseTimer);
        if (this.forwardHeld) sendInput(this.ws, KEY_FORWARD, false);
        if (this.turnHeld != null) sendInput(this.ws, this.turnHeld, false);
        try { this.ws.close(); } catch {}
    }
}

function parseArgs(argv) {
    const opts = { count: 1, url: "ws://localhost:6900" };
    for (const arg of argv.slice(2)) {
        if (arg.startsWith("--count=")) opts.count = Math.max(1, Math.min(100, parseInt(arg.split("=")[1], 10) || 1));
        else if (arg.startsWith("-c=")) opts.count = Math.max(1, Math.min(100, parseInt(arg.split("=")[1], 10) || 1));
        else if (arg.startsWith("--url=")) opts.url = arg.split("=")[1] || opts.url;
    }
    return opts;
}

async function main() {
    const { count, url } = parseArgs(process.argv);
    const bots = [];
    for (let i = 0; i < count; i++) {
        bots.push(new Bot(url));
        await new Promise((r) => setTimeout(r, 50)); // small stagger
    }

    const shutdown = () => {
        for (const b of bots) b.stop();
        process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

