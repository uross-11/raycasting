import * as game from "./game.js";
import { mapKeyCode, MESSAGE_TYPE_IDENTIFY, encodeIdentify, MESSAGE_TYPE_MOVE_INPUT, MESSAGE_TYPE_SHOOT_ACTION, MESSAGE_TYPE_MOUSE_INPUT, readString, MESSAGE_TYPE_HELLO } from "./common.js";

const CANVAS_WIDTH = 16 * game.FACTOR;
const CANVAS_HEIGHT = 9 * game.FACTOR;

(async () => {
    const canvas = document.getElementById("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d");

    const backCanvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const backCtx = backCanvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;
    backCtx.imageSmoothingEnabled = false;

    const gameInstance = new game.Game(CANVAS_WIDTH, CANVAS_HEIGHT);
    await gameInstance.initialize();

    const ws = new WebSocket("ws://localhost:6900");
    ws.binaryType = "arraybuffer";

    ws.addEventListener("open", () => {
        const clientId = localStorage.getItem('clientId');
        if (clientId) {
            ws.send(encodeIdentify(clientId));
        }
    });

    window.addEventListener("keydown", (e) => {
        if (e.repeat) return;
        const changed = gameInstance.handleKeyDown(e.code);
        if (changed) {
            const buf = new ArrayBuffer(3); // Create once
            const view = new DataView(buf);
            if (e.code === 'KeyF') {
                view.setUint8(0, MESSAGE_TYPE_SHOOT_ACTION); // Type 2 for shoot action
                view.setUint8(1, 0); // Key is not used for shoot, set to 0
                view.setUint8(2, 1); // Pressed: true
                ws.send(buf);
            } else {
                const key = mapKeyCode(e.code);
                if (key !== 255) {
                    view.setUint8(0, MESSAGE_TYPE_MOVE_INPUT);
                    view.setUint8(1, key);
                    view.setUint8(2, 1);
                    ws.send(buf);
                }
            }
        }
    });

    window.addEventListener("keyup", (e) => {
        const changed = gameInstance.handleKeyUp(e.code);
        if (changed) {
            if (e.code === 'KeyF') {
                // No need to send keyup for shooting, it's an instant action
            } else {
                const key = mapKeyCode(e.code);
                if (key !== 255) {
                    const buf = new ArrayBuffer(3); // Create once
                    const view = new DataView(buf);
                    view.setUint8(0, MESSAGE_TYPE_MOVE_INPUT);
                    view.setUint8(1, key);
                    view.setUint8(2, 0);
                    ws.send(buf);
                }
            }
        }
    });

    canvas.addEventListener("click", () => canvas.requestPointerLock());
    let mouseDxAccum = 0;
    const MOUSE_SEND_INTERVAL_MS = 16; // Reduced interval for more frequent updates
    const flushMouse = () => {
        if (Math.abs(mouseDxAccum) < 0.5) {
            mouseDxAccum = 0;
            return;
        }
        const dx = Math.max(-200, Math.min(200, Math.trunc(mouseDxAccum)));
        mouseDxAccum = 0;
        if (ws.readyState === WebSocket.OPEN) {
            const buf = new ArrayBuffer(3);
            const view = new DataView(buf);
            view.setUint8(0, MESSAGE_TYPE_MOUSE_INPUT);
            view.setInt16(1, dx, true);
            ws.send(buf);
        } else {
            console.warn(`[Client Mouse] WebSocket not open, readyState: ${ws.readyState}`);
        }
    };
    setInterval(flushMouse, MOUSE_SEND_INTERVAL_MS);

    window.addEventListener("mousemove", (e) => {
        if (document.pointerLockElement !== canvas) return;
        gameInstance.handleMouseMove(e.movementX);
        mouseDxAccum += e.movementX;
    });

    ws.addEventListener("message", (event) => {
        if (event.data instanceof ArrayBuffer) {
            const view = new DataView(event.data);
            const type = view.getUint8(0);
            if (type === MESSAGE_TYPE_HELLO) { // Hello message
                const result = readString(view, 1, new Uint8Array(event.data)); // Read string starting at offset 1
                const serverClientId = result.str;
                localStorage.setItem('clientId', serverClientId);
            }
            gameInstance.handleBinaryMessage(event.data);
        } else {
            gameInstance.handleMessage(JSON.parse(event.data));
        }
    });

    let prevTimestamp = 0;
    const frame = (timestamp) => {
        const deltaTime = (timestamp - prevTimestamp) / 1000;
        prevTimestamp = timestamp;

        gameInstance.update(deltaTime);

        gameInstance.render(ctx, backCtx, deltaTime);

        window.requestAnimationFrame(frame);
    };

    window.requestAnimationFrame((timestamp) => {
        prevTimestamp = timestamp;
        window.requestAnimationFrame(frame);
    });
})();
