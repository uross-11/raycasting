import { WebSocketServer } from "ws";
import { monitorEventLoopDelay } from "node:perf_hooks";
import * as common from "./common.js";
import { encodePlayers, encodeHello, clamp, applyInputToPlayer, MOVE_SPEED, ROTATION_SPEED, intersectRayAABB, performShot, MESSAGE_TYPE_IDENTIFY, MESSAGE_TYPE_MOVE_INPUT, MESSAGE_TYPE_SHOOT_ACTION, MESSAGE_TYPE_MOUSE_INPUT, rotateVectors, encodeUpdate } from "./common.js";

const wss = new WebSocketServer({ port: 6900 });

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + "-" + s4();
};

const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 20;

const TICK_RATE = 1000 / 30;

const sides = new Map([
    ["left", Math.PI],
    ["top", Math.PI / 2],
    ["right", 0],
    ["bottom", (3 / 2) * Math.PI],
    ["bottom-right", (5 / 4) * Math.PI],
    ["bottom-left", (7 / 4) * Math.PI],
    ["top-right", Math.PI / 4],
    ["top-left", (3 / 4) * Math.PI],
]);

let initialRot = sides.get("bottom-left");

const entities = new Map();
let prevData; // Declare prevData here
// Add initial enemy sprite to entities
const enemyId = "enemy-pillar-1"; // Unique ID for the enemy
entities.set(enemyId, {
    id: enemyId,
    pos: [21.5, 2.5],
    health: common.GAME_CONSTANTS.MAX_HEALTH,
    tag: "enemy",
    type: "enemy", // Added type for classification
    takeDamage: function(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        console.log(`Server: Enemy ${this.id} health: ${this.health}`);
    },
});

const stats = {
    tickCount: 0,
    lastLogAt: Date.now(),
    inputs: 0,
    mouse: 0,
    bytesIn: 0,
    bytesOut: 0,
    tickEmaMs: 0,
    cpuPrev: process.cpuUsage(),
};

const loopDelay = monitorEventLoopDelay({ resolution: 10 });
loopDelay.enable();

wss.on("listening", () => console.log("ws://localhost:6900"));

wss.on("connection", (ws) => {
    ws.id = wss.getUniqueID(); // Assign a unique ID immediately on connection
    console.log("Client connected, assigned temporary ID:", ws.id);

    const player = {
        ws: ws,
        id: ws.id,
        pos: [22.5, 1.5],
        dir: [-Math.cos(initialRot), -Math.sin(initialRot)],
        plane: [-Math.sin(initialRot), Math.cos(initialRot)],
        movingForward: false,
        movingBackward: false,
        movingLeft: false,
        movingRight: false,
        turningLeft: false,
        turningRight: false,
        type: "player",
        strafe: function(speed) {
            const newPos = common.tryMoveWithWidth(this.pos, this.plane[0] * speed, this.plane[1] * speed, common.GAME_CONSTANTS.PLAYER_WIDTH, common.map);
            this.pos[0] = newPos[0];
            this.pos[1] = newPos[1];
        },
        rotate: function(angle) {
            const { dir, plane } = common.rotateVectors(this.dir, this.plane, angle);
            this.dir = dir;
            this.plane = plane;
        },
        health: common.GAME_CONSTANTS.MAX_HEALTH,
        takeDamage: function(amount) {
            this.health -= amount;
            if (this.health < 0) this.health = 0;
            console.log(`Server: Player ${this.id} health: ${this.health}`);
        },
    };
    entities.set(ws.id, player);

    // Send initial hello message with the temporary ID. Client will update if it has a stored ID.
    ws.send(encodeHello(ws.id, Array.from(entities.values()).filter(e => e.type === 'player').map(({ ws: _ws, ...rest }) => rest)));

    ws.on("message", (message, isBinary) => {
        if (isBinary) {
            const buf = new Uint8Array(message);
            const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
            const type = view.getUint8(0);

            if (type === MESSAGE_TYPE_IDENTIFY) {
                // const idLen = view.getUint8(1);
                // const dec = new TextDecoder();
                // const clientIdFromClient = dec.decode(buf.subarray(2, 2 + idLen));
                const result = common.readString(view, 1, buf); // Read string starting at offset 1
                const clientIdFromClient = result.str;

                if (ws.id !== clientIdFromClient) { // Only update if the client's ID is different from the temporary one
                    // Remove the old entry if it exists (for the temporary ID)
                    if (entities.has(ws.id)) {
                        entities.delete(ws.id);
                    }

                    ws.id = clientIdFromClient; // Assign the client's ID to the websocket

                    if (entities.has(ws.id)) {
                        // Reconnecting player with existing ID
                        const existingPlayer = entities.get(ws.id);
                        existingPlayer.ws = ws; // Update WebSocket reference
                        console.log(`Server: Client ${ws.id} reconnected with stored ID.`);
                    } else {
                        // New player or first connection with a stored ID
                        console.log(`Server: New client ${ws.id} identified with stored ID.`);
                        // Create a new player object using the client-provided ID
                        const newPlayer = {
                            ws: ws,
                            id: ws.id,
                            pos: [22.5, 1.5],
                            dir: [-Math.cos(initialRot), -Math.sin(initialRot)],
                            plane: [-Math.sin(initialRot), Math.cos(initialRot)],
                            movingForward: false,
                            movingBackward: false,
                            movingLeft: false,
                            movingRight: false,
                            turningLeft: false,
                            turningRight: false,
                            type: "player",
                            strafe: function(speed) {
                                const newPos = common.tryMoveWithWidth(this.pos, this.plane[0] * speed, this.plane[1] * speed, common.GAME_CONSTANTS.PLAYER_WIDTH, common.map);
                                this.pos[0] = newPos[0];
                                this.pos[1] = newPos[1];
                            },
                            rotate: function(angle) {
                                const { dir, plane } = common.rotateVectors(this.dir, this.plane, angle);
                                this.dir = dir;
                                this.plane = plane;
                            },
                            health: common.GAME_CONSTANTS.MAX_HEALTH,
                            takeDamage: function(amount) {
                                this.health -= amount;
                                if (this.health < 0) this.health = 0;
                            },
                        };
                        entities.set(ws.id, newPlayer);
                    }

                    // Send hello message to the newly identified client with their actual ID
                    ws.send(encodeHello(ws.id, Array.from(entities.values()).filter(e => e.type === 'player').map(({ ws: _ws, ...rest }) => rest)));
                }
                return; // Important: return after handling identify message
            }

            const p = entities.get(ws.id);
            if (!p) {
                // If ws.id is not set yet, or player not found, ignore message
                console.warn(`Server: Received message from unidentified client or unknown player ID: ${ws.id}`);
                return;
            }
            stats.bytesIn += buf.byteLength;
            if (type === MESSAGE_TYPE_MOVE_INPUT) {
                const key = view.getUint8(1);
                const pressed = view.getUint8(2) === 1;
                stats.inputs++;
                switch (key) {
                    case 0: p.movingForward = pressed; break;
                    case 1: p.movingBackward = pressed; break;
                    case 2: p.turningLeft = pressed; break;
                    case 3: p.turningRight = pressed; break;
                    case 6: p.movingLeft = pressed; break; // A key for strafing left
                    case 7: p.movingRight = pressed; break; // D key for strafing right
                }
            } else if (type === MESSAGE_TYPE_SHOOT_ACTION) { // Shoot action
                common.performShot(p, entities, common.GAME_CONSTANTS.DAMAGE_AMOUNT, true);
            } else if (type === MESSAGE_TYPE_MOUSE_INPUT) {
                const dx = view.getInt16(1, true);
                const rotationAmount = dx * -0.001 * common.GAME_CONSTANTS.SENSITIVITY;
                p.rotate(rotationAmount);
                stats.mouse++;
            }
            return;
        }

        // Fallback: ignore JSON inputs
    });

    ws.on("close", () => {
        console.log("Client disconnected", ws.id);
        entities.delete(ws.id);
    });
});

// Removed: intersectRayAABB and serverPerformShot functions moved to common.js

let prevTs = Date.now();
setInterval(() => {
    const now = Date.now();
    const deltaTime = Math.max(0.001, Math.min(0.05, (now - prevTs) / 1000)); // cap at 50ms to avoid huge jumps
    prevTs = now;

    // Apply inputs (shared logic)
    for (const p of entities.values()) {
        if (p.type === 'player') { // Only apply input to actual players
            applyInputToPlayer(p, deltaTime, common.map);
        }
    }

    // Filter entities into players and sprites for encoding
    const serverPlayers = Array.from(entities.values()).filter(e => e.type === 'player').map(({ ws: _ws, ...rest }) => rest);
    const serverSprites = Array.from(entities.values()).filter(e => e.type === 'enemy').map((s) => ({ pos: s.pos, health: s.health, tag: s.tag }));

    const buf = common.encodeUpdate(serverPlayers, serverSprites); // Use the new encodeUpdate function

    for (const entity of entities.values()) {
        if (entity.type === 'player') {
            entity.ws.send(buf);
            stats.bytesOut += buf.byteLength;
        }
    }
    prevData = serverPlayers.length;

    // Stats
    const tickMs = Math.max(0, Date.now() - now);
    stats.tickEmaMs = stats.tickEmaMs === 0 ? tickMs : stats.tickEmaMs * 0.9 + tickMs * 0.1;
    stats.tickCount++;
    const LOG_INTERVAL_MS = 5000;
    if (now - stats.lastLogAt >= LOG_INTERVAL_MS) {
        const seconds = (now - stats.lastLogAt) / 1000;
        const inputsPerSec = (stats.inputs / seconds).toFixed(1);
        const mousePerSec = (stats.mouse / seconds).toFixed(1);
        const kbInPerSec = (stats.bytesIn / 1024 / seconds).toFixed(2);
        const kbOutPerSec = (stats.bytesOut / 1024 / seconds).toFixed(2);
        const mem = process.memoryUsage();
        const rssMb = (mem.rss / 1024 / 1024).toFixed(1);
        const heapUsedMb = (mem.heapUsed / 1024 / 1024).toFixed(1);
        const heapTotalMb = (mem.heapTotal / 1024 / 1024).toFixed(1);
        const cpu = process.cpuUsage(stats.cpuPrev);
        stats.cpuPrev = process.cpuUsage();
        const cpuPercent = (((cpu.user + cpu.system) / 1e6) / seconds * 100).toFixed(1);
        const loopMeanMs = (loopDelay.mean / 1e6).toFixed(2);
        const loopMaxMs = (loopDelay.max / 1e6).toFixed(2);
        console.log(
            `[stats] players=${entities.size} tick≈${stats.tickEmaMs.toFixed(2)}ms ` +
            `inputs/s=${inputsPerSec} mouse/s=${mousePerSec} in=${kbInPerSec}KB/s out=${kbOutPerSec}KB/s ` +
            `cpu=${cpuPercent}% rss=${rssMb}MB heap=${heapUsedMb}/${heapTotalMb}MB ` +
            `loop(mean/max)=${loopMeanMs}/${loopMaxMs}ms`
        );
        stats.inputs = 0;
        stats.mouse = 0;
        stats.bytesIn = 0;
        stats.bytesOut = 0; // This should be here, not outside the if
        stats.lastLogAt = now;
        loopDelay.reset();
    }
}, TICK_RATE);