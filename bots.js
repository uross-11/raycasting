import { map } from "./common.js";

const MOVE_INTERVAL = 200; // move once per second

class Bot {
    constructor(id, pos, ws) {
        this.id = id;
        this.pos = pos; // [x, y]
        this.dir = [1, 0]; // fixed
        this.plane = [0, 0.66]; // fixed
        this.ws = ws;
    }

    update() {
        const [x, y] = this.pos;

        // possible moves: up, down, left, right
        const directions = [
            [1, 0], // right
            [-1, 0], // left
            [0, 1], // down
            [0, -1], // up
        ];

        // shuffle directions randomly
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }

        // pick the first valid move
        for (const [dx, dy] of directions) {
            const nx = Math.floor(x + dx);
            const ny = Math.floor(y + dy);

            if (map[ny] && map[ny][nx] === 0) {
                this.pos = [x + dx, y + dy]; // move 1 tile
                break;
            }
        }

        // tell server
        this.ws.send(
            JSON.stringify({
                type: "move",
                id: this.id,
                pos: this.pos,
                dir: this.dir,
                plane: this.plane,
            }),
        );
    }
}

(async () => {
    let bot;

    const ws = new WebSocket("ws://localhost:6900");
    ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "hello") {
            const { id, pos, dir, plane } = data.players.find((p) => p.id === data.id) || {};
            bot = new Bot(id, [Math.floor(pos[0]), Math.floor(pos[1])], ws);
            console.log("Bot initialized:", bot);

            // move around randomly
            setInterval(() => {
                if (bot) bot.update();
            }, MOVE_INTERVAL);
        }
    });
})();
