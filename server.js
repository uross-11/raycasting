import { WebSocketServer } from "ws";

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

const TICK_RATE = 1000 / 1;

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

const players = new Map();

wss.on("listening", () => console.log("ws://localhost:6900"));

wss.on("connection", (ws) => {
    if (!ws.id) {
        ws.id = wss.getUniqueID();
        console.log("Client connected", ws.id);
    } else {
        console.log("Client reconnected", ws.id);
    }

    // ws.x = Math.floor(Math.random() * BOARD_WIDTH);
    // ws.y = Math.floor(Math.random() * BOARD_HEIGHT);

    players.set(ws.id, {
        ws: ws,
        id: ws.id,
        pos: [22.5, 1.5],
        dir: [-Math.cos(initialRot), -Math.sin(initialRot)],
        plane: [-Math.sin(initialRot), Math.cos(initialRot)],
    });

    ws.send(
        JSON.stringify({
            type: "hello",
            id: ws.id,
            players: Array.from(players.values()),
        }),
    );

    ws.on("message", (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case "move":
                players.set(ws.id, {
                    ...players.get(ws.id),
                    pos: data.pos,
                    dir: data.dir,
                    plane: data.plane,
                });
                break;
            default:
                console.log("Unknown message type:", data.type);
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected", ws.id);
        players.delete(ws.id);
    });
});

(() => {
    let prevData;

    setInterval(() => {
        const data = {
            type: "update",
            players: players.size === 0 ? [] : Array.from(players.values()),
        };

        if (JSON.stringify(data) === JSON.stringify(prevData)) return;

        for (const player of players.values()) {
            player.ws.send(JSON.stringify(data));
        }

        prevData = data;
    }, TICK_RATE);
})();
