const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 2, 0, 2, 2, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 0, 0, 0, 5, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// const HEIGHT_SCALE = 1;
// const LINE_THICKNESS = 1;
// const DRAW_EDGES = false;

const FACTOR = 50;
const CANVAS_WIDTH = 16 * FACTOR;
const CANVAS_HEIGHT = 9 * FACTOR;
const MOVE_SPEED = 0.05;
const ROTATION_SPEED = 0.05;
const PLAYER_WIDTH = 0.2;
const SENSITIVITY = 3;

const NEAR_CLIPPING_PLANE = 0.1;
const FAR_CLIPPING_PLANE = 10.0;

// map
const TILE_SIZE = 24 * (FACTOR / 70);
const MAP_SHOWN = true;

function isPlayerColliding(y, x) {
    return (
        map[~~(y - PLAYER_WIDTH)][~~(x - PLAYER_WIDTH)] !== 0 ||
        map[~~(y + PLAYER_WIDTH)][~~(x - PLAYER_WIDTH)] !== 0 ||
        map[~~(y - PLAYER_WIDTH)][~~(x + PLAYER_WIDTH)] !== 0 ||
        map[~~(y + PLAYER_WIDTH)][~~(x + PLAYER_WIDTH)] !== 0
    );
}

class Asset {
    constructor(src, x, y) {
        this.img = new Image();
        this.img.src = src;
        this.x = x;
        this.y = y;

        this.img.onload = () => {
            this.cacheImageData();
        };
    }

    cacheImageData() {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        canvas.width = this.img.width;
        canvas.height = this.img.height;
        ctx.drawImage(this.img, 0, 0);
        this.imgData = ctx.getImageData(0, 0, this.img.width, this.img.height).data;
    }
}

function createSpritePool() {
    return {
        items: [],
        length: 0,
    };
}

function resetSpritePool(spritePool) {
    spritePool.length = 0;
}

function renderSprites(player, sprites, zBuffer, backImageData) {
    for (let i = 0; i < sprites.length; i++) {
        const spriteX = sprites[i].pos[0] - player.pos[0];
        const spriteY = sprites[i].pos[1] - player.pos[1];

        const det = player.plane[0] * player.dir[1] - player.dir[0] * player.plane[1];
        if (Math.abs(det) < 1e-6) continue; // Prevent division by near-zero values

        const invDet = 1.0 / det;
        const transformX = invDet * (player.dir[1] * spriteX - player.dir[0] * spriteY);
        let transformY = invDet * (-player.plane[1] * spriteX + player.plane[0] * spriteY);

        if (transformY <= 0.01) continue; // Prevent near-zero issues

        const spriteScreenX = Math.round((backImageData.width / 2) * (1 + transformX / transformY));

        const spriteHeight = Math.abs(Math.floor(backImageData.height / transformY));
        let drawStartY = Math.max(0, -spriteHeight / 2 + backImageData.height / 2);
        let drawEndY = Math.min(backImageData.height - 1, spriteHeight / 2 + backImageData.height / 2);

        const spriteWidth = Math.abs(Math.floor(backImageData.height / transformY));
        let drawStartX = Math.max(0, -spriteWidth / 2 + spriteScreenX);
        let drawEndX = Math.min(backImageData.width - 1, spriteWidth / 2 + spriteScreenX);

        for (let stripe = drawStartX; stripe < drawEndX; stripe++) {
            const texX = Math.min(
                Math.max(
                    0,
                    ~~(((stripe - (-spriteWidth / 2 + spriteScreenX)) * sprites[i].imgData.width) / spriteWidth),
                ),
                sprites[i].imgData.width - 1,
            );

            if (transformY > 0 && stripe > 0 && stripe < backImageData.width && transformY < zBuffer[stripe]) {
                for (let y = drawStartY; y < drawEndY; y++) {
                    const d = y * backImageData.width + stripe;
                    const texY = Math.min(
                        Math.max(0, Math.floor(((y - drawStartY) * sprites[i].imgData.height) / spriteHeight)),
                        sprites[i].imgData.height - 1,
                    );

                    const imgIndex = (texY * sprites[i].imgData.width + texX) * 4;
                    const color = sprites[i].imgData.data[imgIndex];
                    const alpha = sprites[i].imgData.data[imgIndex + 3];

                    if (alpha > 0) {
                        backImageData.data[d * 4] = color;
                        backImageData.data[d * 4 + 1] = sprites[i].imgData.data[imgIndex + 1];
                        backImageData.data[d * 4 + 2] = sprites[i].imgData.data[imgIndex + 2];
                        backImageData.data[d * 4 + 3] = alpha;
                    }
                }
                zBuffer[stripe] = transformY; // Ensure zBuffer is properly updated
            }
        }
    }
}

// class Camera {
//   constructor(pos, dir, plane, width, height) {}
// }

// class Game {
//   constructor(me, players, camera, map, mapShown) {}
// }

class Player {
    constructor(
        pos,
        dir,
        plane,
        movingForward = false,
        movingBackward = false,
        movingLeft = false,
        movingRight = false,
        turningLeft = false,
        turningRight = false,
    ) {
        this.pos = pos;
        this.dir = dir;
        this.plane = plane;
        this.movingForward = movingForward;
        this.movingBackward = movingBackward;
        this.movingLeft = movingLeft;
        this.movingRight = movingRight;
        this.turningLeft = turningLeft;
        this.turningRight = turningRight;
    }

    rotate(angle) {
        const oldDirX = this.dir[0];
        const oldPlaneX = this.plane[0];

        this.dir[0] = this.dir[0] * Math.cos(angle) - this.dir[1] * Math.sin(angle);
        this.dir[1] = oldDirX * Math.sin(angle) + this.dir[1] * Math.cos(angle);

        this.plane[0] = this.plane[0] * Math.cos(angle) - this.plane[1] * Math.sin(angle);
        this.plane[1] = oldPlaneX * Math.sin(angle) + this.plane[1] * Math.cos(angle);
    }

    move(speed) {
        const newX = this.pos[0] + this.dir[0] * speed;
        const newY = this.pos[1] + this.dir[1] * speed;

        if (!isPlayerColliding(this.pos[1], newX)) this.pos[0] = newX;
        if (!isPlayerColliding(newY, this.pos[0])) this.pos[1] = newY;
    }

    strafe(speed) {
        const newX = this.pos[0] + this.plane[0] * speed;
        const newY = this.pos[1] + this.plane[1] * speed;

        if (!isPlayerColliding(this.pos[1], newX)) this.pos[0] = newX;
        if (!isPlayerColliding(newY, this.pos[0])) this.pos[1] = newY;
    }
}

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

function randomMap() {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            if (i === 0 || i === map.length - 1 || j === 0 || j === map[i].length - 1) continue;

            if (Math.random() > 0.9) {
                map[i][j] = ~~(Math.random() * 5);
            }
        }
    }
}

function updatePlayer(player) {
    if (player.movingForward) player.move(MOVE_SPEED);
    if (player.movingBackward) player.move(-MOVE_SPEED);
    if (player.movingLeft) player.strafe(-MOVE_SPEED);
    if (player.movingRight) player.strafe(MOVE_SPEED);
    if (player.turningLeft) player.rotate(ROTATION_SPEED);
    if (player.turningRight) player.rotate(-ROTATION_SPEED);
}

function renderFPS(ctx, deltaTime) {
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText(`FPS: ${Math.round(1 / deltaTime)}`, ctx.canvas.width - 60, 20);
}

function drawMap(ctx, map) {
    ctx.globalAlpha = 0.7;
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            let color;

            switch (map[y][x]) {
                case 1:
                    color = "red";
                    break;
                case 2:
                    color = "green";
                    break;
                case 3:
                    color = "blue";
                    break;
                case 4:
                    color = "white";
                    break;
                case 5:
                    color = "yellow";
                    break;
                default:
                    color = "black";
            }

            ctx.fillStyle = color;
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }
    ctx.globalAlpha = 1;
}

function drawPlayersOnMap(ctx, players) {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    for (const player of players.values()) {
        ctx.moveTo(player.pos[0] * TILE_SIZE, player.pos[1] * TILE_SIZE);
        ctx.rect(
            player.pos[0] * TILE_SIZE - PLAYER_WIDTH * TILE_SIZE,
            player.pos[1] * TILE_SIZE - PLAYER_WIDTH * TILE_SIZE,
            TILE_SIZE * PLAYER_WIDTH * 2,
            TILE_SIZE * PLAYER_WIDTH * 2,
        );
    }
    ctx.stroke();
}

function drawSpritesOnMap(ctx, sprites) {
    for (const sprite of sprites) {
        ctx.putImageData(
            sprite.imgData,
            sprite.pos[0] * TILE_SIZE,
            sprite.pos[1] * TILE_SIZE,
            0,
            0,
            TILE_SIZE,
            TILE_SIZE,
        );
    }
}

function drawLine(ctx, x1, y1, x2, y2, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function renderMap(ctx, map, players, sprites) {
    const width = ctx.canvas.width;

    drawMap(ctx, map);
    drawPlayersOnMap(ctx, players);
    drawSpritesOnMap(ctx, sprites);

    for (let x = 0; x < width; x++) {
        const pos = players.get(0).pos;
        const dir = players.get(0).dir;
        const plane = players.get(0).plane;

        const cameraX = (2 * x) / width - 1;

        const rayDir = [dir[0] + plane[0] * cameraX, dir[1] + plane[1] * cameraX];

        const mapPos = [~~pos[0], ~~pos[1]];

        const deltaDist = [Math.abs(1 / rayDir[0]), Math.abs(1 / rayDir[1])];

        const sideDist = [
            rayDir[0] < 0 ? (pos[0] - mapPos[0]) * deltaDist[0] : (mapPos[0] + 1 - pos[0]) * deltaDist[0],
            rayDir[1] < 0 ? (pos[1] - mapPos[1]) * deltaDist[1] : (mapPos[1] + 1 - pos[1]) * deltaDist[1],
        ];

        const step = [rayDir[0] < 0 ? -1 : 1, rayDir[1] < 0 ? -1 : 1];

        let side = 0;

        if (x === Math.floor((width - 1) / 2)) {
            // nearest y intersection axis
            // drawLine(
            //     ctx,
            //     pos[0] * TILE_SIZE,
            //     pos[1] * TILE_SIZE,
            //     (pos[0] + sideDist[0] * dir[0]) * TILE_SIZE,
            //     (pos[1] + sideDist[0] * dir[1]) * TILE_SIZE,
            //     "red",
            // );
            // nearest x intersection axis
            // drawLine(
            //     ctx,
            //     pos[0] * TILE_SIZE,
            //     pos[1] * TILE_SIZE,
            //     (pos[0] + sideDist[1] * dir[0]) * TILE_SIZE,
            //     (pos[1] + sideDist[1] * dir[1]) * TILE_SIZE,
            //     "green",
            // );
        }

        while (true) {
            if (sideDist[0] < sideDist[1]) {
                sideDist[0] += deltaDist[0];
                mapPos[0] += step[0];
                side = 0;
            } else {
                sideDist[1] += deltaDist[1];
                mapPos[1] += step[1];
                side = 1;
            }

            if (map[mapPos[1]][mapPos[0]] !== 0) break;
        }

        const perpWallDist =
            side === 0
                ? Math.abs((mapPos[0] - pos[0] + (1 - step[0]) / 2) / rayDir[0])
                : Math.abs((mapPos[1] - pos[1] + (1 - step[1]) / 2) / rayDir[1]);

        if (x % 64 === 0) {
            // draw ray until it hits a wall
            // drawLine(
            //     ctx,
            //     pos[0] * TILE_SIZE,
            //     pos[1] * TILE_SIZE,
            //     (pos[0] + rayDir[0] * perpWallDist) * TILE_SIZE,
            //     (pos[1] + rayDir[1] * perpWallDist) * TILE_SIZE,
            //     "yellow",
            // );
        }

        if (x === 0 || x === width - 1) {
            // draw ray direction
            drawLine(
                ctx,
                pos[0] * TILE_SIZE,
                pos[1] * TILE_SIZE,
                (pos[0] + rayDir[0] * 1) * TILE_SIZE,
                (pos[1] + rayDir[1] * 1) * TILE_SIZE,
                "white",
            );
            // player plane
            drawLine(
                ctx,
                pos[0] * TILE_SIZE,
                pos[1] * TILE_SIZE,
                (pos[0] + plane[0] * 1) * TILE_SIZE,
                (pos[1] + plane[1] * 1) * TILE_SIZE,
                "blue",
            );
        }
    }
}

function renderFloorAndCeiling(ctx) {
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height / 2);
    ctx.fillStyle = "gray";
    ctx.fillRect(0, ctx.canvas.height / 2, ctx.canvas.width, ctx.canvas.height / 2);
}

function renderWalls(ctx, map, player, zBuffer, backImageData) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const buffer = new Uint8ClampedArray(backImageData.data);

    for (let x = 0; x < width; x++) {
        const cameraX = (2 * x) / width - 1;

        const rayDir = [player.dir[0] + player.plane[0] * cameraX, player.dir[1] + player.plane[1] * cameraX];

        const mapPos = [~~player.pos[0], ~~player.pos[1]];

        const deltaDist = [Math.abs(1 / rayDir[0]), Math.abs(1 / rayDir[1])];

        let sideDist = [
            rayDir[0] < 0 ? (player.pos[0] - mapPos[0]) * deltaDist[0] : (mapPos[0] + 1 - player.pos[0]) * deltaDist[0],
            rayDir[1] < 0 ? (player.pos[1] - mapPos[1]) * deltaDist[1] : (mapPos[1] + 1 - player.pos[1]) * deltaDist[1],
        ];

        let step = [rayDir[0] < 0 ? -1 : 1, rayDir[1] < 0 ? -1 : 1];

        let side = 0;

        while (true) {
            if (sideDist[0] < sideDist[1]) {
                sideDist[0] += deltaDist[0];
                mapPos[0] += step[0];
                side = 0;
            } else {
                sideDist[1] += deltaDist[1];
                mapPos[1] += step[1];
                side = 1;
            }

            if (map[mapPos[1]][mapPos[0]] !== 0) {
                break;
            }
        }

        const perpWallDist =
            side === 0
                ? Math.abs((mapPos[0] - player.pos[0] + (1 - step[0]) / 2) / rayDir[0])
                : Math.abs((mapPos[1] - player.pos[1] + (1 - step[1]) / 2) / rayDir[1]);

        let color;
        switch (map[mapPos[1]][mapPos[0]]) {
            case 1:
                color = (side) => (side === 0 ? [255, 0, 0] : [200, 0, 0]);
                break;
            case 2:
                color = (side) => (side === 0 ? [0, 255, 0] : [0, 200, 0]);
                break;
            case 3:
                color = (side) => (side === 0 ? [0, 0, 255] : [0, 0, 200]);
                break;
            case 4:
                color = (side) => (side === 0 ? [200, 200, 200] : [150, 150, 150]);
                break;
            case 5:
                color = (side) => (side === 0 ? [255, 255, 0] : [200, 200, 0]);
                break;
            default:
                color = (side) => (side === 0 ? [50, 50, 50] : [25, 25, 25]);
                break;
        }

        const EPSILON = 1e-6;
        const MIN_DEPTH = 0.01;

        const safePerpWallDist = Math.max(perpWallDist + EPSILON, MIN_DEPTH);
        zBuffer[x] = safePerpWallDist;
        // zBuffer[x] = perpWallDist;

        const stripHeight = backImageData.height / zBuffer[x];
        const wallTopY = Math.max(0, ~~((height - stripHeight) / 2));
        const wallBottomY = Math.min(height - 1, ~~((height + stripHeight) / 2));

        for (let y = wallTopY; y < wallBottomY; y++) {
            const di = (y * backImageData.width + x) * 4;
            buffer[di] = color(side)[0];
            buffer[di + 1] = color(side)[1];
            buffer[di + 2] = color(side)[2];
            buffer[di + 3] = 255;
        }
    }

    backImageData.data.set(buffer);
}

function displaySwapBackImageData(backCtx, backImageData, ctx) {
    backCtx.putImageData(backImageData, 0, 0);
    ctx.drawImage(backCtx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

function renderEnemy(assets, spritePool) {
    pushSprite(spritePool, assets[0], [22, 12], 0.5, 1, [0, 0], [assets[0].width, assets[0].height]);
}

function renderGame(
    ctx,
    map,
    me,
    deltaTime,
    mapShown,
    players,
    assets,
    spritePool,
    visibleSprites,
    zBuffer,
    backImageData,
    backCtx,
) {
    resetSpritePool(spritePool);
    backImageData.data.fill(0);

    renderFloorAndCeiling(ctx);
    renderWalls(ctx, map, me, zBuffer, backImageData);
    renderEnemy(assets, spritePool);
    // cullAndSortSprites(me, spritePool, visibleSprites);
    renderSprites(me, visibleSprites, zBuffer, backImageData);
    updatePlayer(me);
    displaySwapBackImageData(backCtx, backImageData, ctx);
    if (mapShown) renderMap(ctx, map, players, visibleSprites);
    renderFPS(ctx, deltaTime);
}

// async function loadImage(url) {
//   const image = new Image();
//   image.crossOrigin = "anonymous";
//   image.src = url;
//   return new Promise((resolve, reject) => {
//     image.onload = () => resolve(image);
//     image.onerror = (e) => {
//       console.error("Error loading image:", e);
//       reject;
//     };
//   });
// }

// async function loadImageData(url) {
//   const image = await loadImage(url);
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d");
//   canvas.width = image.width;
//   canvas.height = image.height;
//   ctx.drawImage(image, 0, 0);

//   console.log(image.width, image.height);

//   return ctx.getImageData(0, 0, image.width, image.height).data;
// }

async function loadImage(url) {
    const image = new Image();
    image.src = url;
    return new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = reject;
    });
}

async function loadImageData(url) {
    const image = await loadImage(url);
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    if (ctx === null) throw new Error("2d canvas is not supported");
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, image.width, image.height);
}

function pushSprite(spritePool, image, position, z, scale, cropPosition, cropSize) {
    if (spritePool.length >= spritePool.items.length) {
        spritePool.items.push({
            image,
            position: [position.x ?? 0, position.y ?? 0],
            z,
            scale,
            pdist: 0,
            dist: 0,
            t: 0,
            cropPosition: [cropPosition.x ?? 0, cropPosition.y ?? 0],
            cropSize: [cropSize.x ?? 0, cropSize.y ?? 0],
        });
    }

    const last = spritePool.length;

    spritePool.items[last].image = image;
    spritePool.items[last].position = position;
    spritePool.items[last].z = z;
    spritePool.items[last].scale = scale;
    spritePool.items[last].pdist = 0;
    spritePool.items[last].dist = 0;
    spritePool.items[last].t = 0;

    if (image instanceof ImageData) {
        if (cropPosition === undefined) {
            spritePool.items[last].cropPosition.set(0, 0);
        } else {
            spritePool.items[last].cropPosition = cropPosition;
        }
        if (cropSize === undefined) {
            // spritePool.items[last].cropSize.set(image.width, image.height).sub(spritePool.items[last].cropPosition);
            spritePool.items[last].cropSize = [image.width, image.height].map(
                (v, i) => v - spritePool.items[last].cropPosition[i],
            );
        } else {
            spritePool.items[last].cropSize = cropSize;
        }
    } else {
        spritePool.items[last].cropPosition = [0, 0];
        spritePool.items[last].cropSize = [0, 0];
    }

    spritePool.length += 1;
}

function cullAndSortSprites(player, spritePool, visibleSprites) {
    let sp = [0, 0];
    const dir = [Math.cos(player.direction), Math.sin(player.direction)];
    const fov = [Math.cos(0.5), Math.sin(0.5)];

    visibleSprites.length = 0;
    for (let i = 0; i < spritePool.length; ++i) {
        const sprite = spritePool.items[i];

        sp = [sprite.position[0] - player.pos[0], sprite.position[1] - player.pos[1]];
        const spl = Math.sqrt(sp[0] * sp[0] + sp[1] * sp[1]);

        if (spl <= NEAR_CLIPPING_PLANE) continue; // Sprite is too close
        if (spl >= FAR_CLIPPING_PLANE) continue; // Sprite is too far

        const cos = (sp[0] * dir[0] + sp[1] * dir[1]) / spl;
        // TODO: @perf the sprites that are invisible on the screen but within FOV 180° are not culled
        // It may or may not impact the performance of renderSprites()
        if (cos < 0) continue; // Sprite is outside of the maximal FOV 180°
        sprite.dist = NEAR_CLIPPING_PLANE / cos;
        sp = spl === 0 ? sp : [(1 / spl) * sp[0], (1 / spl) * sp[1]]; // Normalize
        sp = [sp[0] * sprite.dist, sp[1] * sprite.dist]; //Scale
        sp = [sp[0] + player.pos[0], sp[1] + player.pos[1]]; //Add
        sp = [sp[0] - 0.5, sp[1] - 0.5]; //Subtract
        sprite.t =
            (Math.sqrt(sp[0] * sp[0] + sp[1] * sp[1]) / Math.sqrt(fov[0] * fov[0] + fov[1] * fov[1])) *
            Math.sign(sp[0] * fov[1] + sp[1] * fov[0]);

        sprite.pdist = (sprite.position[0] - player.pos[0]) * dir[0] + (sprite.position[1] - player.pos[1]) * dir[1];

        // TODO: I'm not sure if these checks are necessary considering the `spl <= NEAR_CLIPPING_PLANE` above
        if (sprite.pdist < NEAR_CLIPPING_PLANE) continue;
        if (sprite.pdist >= FAR_CLIPPING_PLANE) continue;

        visibleSprites.push(sprite);
    }

    visibleSprites.sort((a, b) => b.pdist - a.pdist);
}

(async () => {
    const canvas = document.getElementById("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    canvas.addEventListener("click", () => canvas.requestPointerLock());

    const backCanvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    const backCtx = backCanvas.getContext("2d");
    backCtx.imageSmoothingEnabled = false;

    let mapShown = MAP_SHOWN;
    let initialRot = sides.get("bottom-left");

    const assets = await Promise.all([loadImageData("./assets/bomb.png")]);

    const spritePool = {
        items: [assets[0]],
        length: 0,
    };

    const visibleSprites = [
        {
            pos: [21, 12],
            imgData: assets[0],
        },
    ];

    const backImageData = new ImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    backImageData.data.fill(255);

    const players = new Map([
        [
            0,
            new Player(
                [22.5, 1.5],
                [-Math.cos(initialRot), -Math.sin(initialRot)],
                [-Math.sin(initialRot), Math.cos(initialRot)],
            ),
        ],
        // [1, new Player([22, 12], [-1, 0], [0, 0.66])],
    ]);

    const me = players.get(0);

    // const game = new Game(player, players, new Camera(), map, mapShown);

    window.addEventListener("keydown", (e) => {
        if (!e.repeat) {
            switch (e.code) {
                case "ArrowUp":
                case "KeyW":
                    me.movingForward = true;
                    break;
                case "ArrowDown":
                case "KeyS":
                    me.movingBackward = true;
                    break;
                case "ArrowLeft":
                    me.turningLeft = true;
                    break;
                case "ArrowRight":
                    me.turningRight = true;
                    break;
                case "KeyM":
                    mapShown = !mapShown;
                    break;
                case "KeyA":
                    me.movingLeft = true;
                    break;
                case "KeyD":
                    me.movingRight = true;
                    break;
            }
        }
    });

    window.addEventListener("keyup", (e) => {
        if (!e.repeat) {
            switch (e.code) {
                case "ArrowUp":
                case "KeyW":
                    me.movingForward = false;
                    break;
                case "ArrowDown":
                case "KeyS":
                    me.movingBackward = false;
                    break;
                case "ArrowLeft":
                    me.turningLeft = false;
                    break;
                case "ArrowRight":
                    me.turningRight = false;
                    break;
                case "KeyA":
                    me.movingLeft = false;
                    break;
                case "KeyD":
                    me.movingRight = false;
                    break;
            }
        }
    });

    window.addEventListener("mousemove", (e) => {
        if (document.pointerLockElement === canvas) {
            me.rotate(e.movementX * -0.001 * SENSITIVITY);
        }
    });

    const zBuffer = new Float32Array(CANVAS_WIDTH);

    // setInterval(() => {
    //   console.log(window.performance.memory.usedJSHeapSize / 1024 / 1024 + " MB");
    // }, 5000);

    // randomMap();

    let prevTimestamp = 0;

    const frame = (timestamp) => {
        const deltaTime = (timestamp - prevTimestamp) / 1000;
        prevTimestamp = timestamp;

        renderGame(
            ctx,
            map,
            me,
            deltaTime,
            mapShown,
            players,
            assets,
            spritePool,
            visibleSprites,
            zBuffer,
            backImageData,
            backCtx,
        );
        window.requestAnimationFrame(frame);
    };

    window.requestAnimationFrame((timestamp) => {
        prevTimestamp = timestamp;
        window.requestAnimationFrame(frame);
    });
})();
