import * as game from "./game.js";

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

    window.addEventListener("keydown", (e) => !e.repeat && gameInstance.handleKeyDown(e.code));
    window.addEventListener("keyup", (e) => !e.repeat && gameInstance.handleKeyUp(e.code));

    canvas.addEventListener("click", () => canvas.requestPointerLock());
    window.addEventListener(
        "mousemove",
        (e) => document.pointerLockElement === canvas && gameInstance.handleMouseMove(e.movementX),
    );

    const ws = new WebSocket("ws://localhost:6900");
    ws.addEventListener("message", (event) => gameInstance.handleMessage(JSON.parse(event.data)));

    let prevTimestamp = 0;
    const frame = (timestamp) => {
        const deltaTime = (timestamp - prevTimestamp) / 1000;
        prevTimestamp = timestamp;

        gameInstance.update(deltaTime);

        if (gameInstance.shouldSendUpdate()) {
            const playerState = gameInstance.getPlayerState();
            if (playerState) ws.send(JSON.stringify(playerState));
        }

        gameInstance.render(ctx, backCtx, deltaTime);

        window.requestAnimationFrame(frame);
    };

    window.requestAnimationFrame((timestamp) => {
        prevTimestamp = timestamp;
        window.requestAnimationFrame(frame);
    });
})();
