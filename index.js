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
    [1, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 5, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// TODO: add settings menu
const FACTOR = 50;
const CANVAS_WIDTH = 16 * FACTOR;
const CANVAS_HEIGHT = 9 * FACTOR;
const MOVE_SPEED = 0.05;
const ROTATION_SPEED = 0.05;
const PLAYER_WIDTH = 0.2;
const SENSITIVITY = 3;

const NEAR_CLIPPING_PLANE = 0.1;
const FAR_CLIPPING_PLANE = 10.0;

const TILE_SIZE = 24 * (FACTOR / 70);
const MAP_SHOWN = false;

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

function resetSpritePool(spritePool, visibleSprites) {
    spritePool.length = visibleSprites.length;
    spritePool.items = visibleSprites;
}

function renderSprites(player, sprites, zBuffer, backImageData) {
    // Sort sprites by distance (furthest first) for proper rendering order
    sprites.sort((a, b) => {
        const distA = Math.pow(player.pos[0] - a.pos[0], 2) + Math.pow(player.pos[1] - a.pos[1], 2);
        const distB = Math.pow(player.pos[0] - b.pos[0], 2) + Math.pow(player.pos[1] - b.pos[1], 2);
        return distB - distA;
    });

    for (let i = 0; i < sprites.length; i++) {
        const spriteX = sprites[i].pos[0] - player.pos[0];
        const spriteY = sprites[i].pos[1] - player.pos[1];
        const det = player.plane[0] * player.dir[1] - player.dir[0] * player.plane[1];
        const invDet = 1.0 / det;
        const transformX = invDet * (player.dir[1] * spriteX - player.dir[0] * spriteY);
        const transformY = invDet * (-player.plane[1] * spriteX + player.plane[0] * spriteY);

        // Prevent division by zero and negative values
        if (transformY <= 0.1) continue;

        const spriteScreenX = Math.floor((backImageData.width / 2) * (1 + transformX / transformY));

        // Calculate sprite size with a proper vertical offset
        // Use a vertical factor to maintain sprite height at close distances
        const verticalPosition = 45.0; // 0.0 = center, adjust if needed for different heights

        // Apply a minimum distance to prevent extreme scaling
        const effectiveDistance = Math.max(transformY, 0.3);

        // Calculate sprite dimensions based on effective distance
        const spriteHeight = Math.abs(Math.floor(backImageData.height / effectiveDistance));
        const spriteWidth = Math.abs(Math.floor(backImageData.height / effectiveDistance));

        // Calculate vertical position with proper centering
        const vMoveScreen = Math.floor(verticalPosition / effectiveDistance);
        let drawStartY = Math.floor(Math.max(0, -spriteHeight / 2 + backImageData.height / 2 + vMoveScreen));
        let drawEndY = Math.floor(
            Math.min(backImageData.height - 1, spriteHeight / 2 + backImageData.height / 2 + vMoveScreen),
        );

        let drawStartX = Math.floor(Math.max(0, -spriteWidth / 2 + spriteScreenX));
        let drawEndX = Math.floor(Math.min(backImageData.width - 1, spriteWidth / 2 + spriteScreenX));

        // Ensure we're using integer indices for the zBuffer array
        for (let stripe = Math.floor(drawStartX); stripe < drawEndX; stripe++) {
            // Make sure stripe is a valid integer
            const stripeIndex = Math.floor(stripe);

            // Calculate texture X coordinate with proper normalization
            const texX = Math.floor(
                ((stripe - (-spriteWidth / 2 + spriteScreenX)) * sprites[i].imgData.width) / spriteWidth,
            );
            const boundedTexX = Math.min(Math.max(0, texX), sprites[i].imgData.width - 1);

            // Ensure the index is within bounds and check zBuffer
            if (stripeIndex >= 0 && stripeIndex < zBuffer.length && transformY < zBuffer[stripeIndex]) {
                for (let y = drawStartY; y < drawEndY; y++) {
                    // Calculate the normalized Y coordinate in the texture
                    const normalizedY = y - drawStartY;
                    const texY = Math.floor((normalizedY * sprites[i].imgData.height) / spriteHeight);
                    const boundedTexY = Math.min(Math.max(0, texY), sprites[i].imgData.height - 1);

                    // Calculate the exact pixel in the sprite texture
                    const imgIndex = (boundedTexY * sprites[i].imgData.width + boundedTexX) * 4;

                    // Check bounds to avoid undefined access
                    if (imgIndex >= 0 && imgIndex < sprites[i].imgData.data.length - 3) {
                        const color = sprites[i].imgData.data[imgIndex];
                        const alpha = sprites[i].imgData.data[imgIndex + 3];

                        // Only draw non-transparent pixels
                        if (alpha > 0 && color !== 0) {
                            // Using a higher alpha threshold for better quality
                            const backIndex = (y * backImageData.width + stripeIndex) * 4;
                            // Ensure we're not writing outside the backImageData bounds
                            if (backIndex >= 0 && backIndex < backImageData.data.length - 3) {
                                backImageData.data[backIndex] = color;
                                backImageData.data[backIndex + 1] = sprites[i].imgData.data[imgIndex + 1];
                                backImageData.data[backIndex + 2] = sprites[i].imgData.data[imgIndex + 2];
                                backImageData.data[backIndex + 3] = alpha;
                            }
                        }
                    }
                }
            }
        }
    }
}

class Player {
    constructor(
        pos,
        dir,
        plane,
        id,
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
        this.id = id;
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
        if (sprite.tag === "enemy") continue;

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

        // const perpWallDist =
        //     side === 0
        //         ? Math.abs((mapPos[0] - pos[0] + (1 - step[0]) / 2) / rayDir[0])
        //         : Math.abs((mapPos[1] - pos[1] + (1 - step[1]) / 2) / rayDir[1]);

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

        zBuffer[x] = perpWallDist;

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

function renderEnemy(enemySprite, players, me) {
    if (!enemySprite) return; // Early return if no enemy sprite found

    for (let player of players.values()) {
        if (me.id === player.id) continue;

        enemySprite.pos = player.pos;
    }
}

function renderGame(
    ctx,
    map,
    me,
    deltaTime,
    mapShown,
    players,
    spritePool,
    visibleSprites,
    zBuffer,
    backImageData,
    backCtx,
    enemySprite,
) {
    resetSpritePool(spritePool, visibleSprites);
    backImageData.data.fill(0);

    renderFloorAndCeiling(ctx);
    renderWalls(ctx, map, me, zBuffer, backImageData);
    renderEnemy(enemySprite, players, me);
    renderSprites(me, spritePool.items, zBuffer, backImageData);
    updatePlayer(me);
    displaySwapBackImageData(backCtx, backImageData, ctx);
    if (mapShown) renderMap(ctx, map, players, visibleSprites);
    renderFPS(ctx, deltaTime);

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText(me.id, 20, 20);
}

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

(async () => {
    const ws = new WebSocket("ws://localhost:6900");

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
    let id;
    let me;
    const players = new Map();

    ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
            case "hello":
                id = data.id;
                for (const player of data.players) {
                    players.set(player.id, new Player(player.pos, player.dir, player.plane, player.id));
                }
                me = players.get(id);
                break;

            case "update":
                for (const player of data.players) {
                    if (players.has(player.id)) {
                        if (player.id === id) {
                            // if the difference is too big, reset the player, else just skip
                            if (
                                Math.abs(player.pos[0] - me.pos[0]) > 0.25 ||
                                Math.abs(player.pos[1] - me.pos[1]) > 0.25
                            ) {
                                me.pos = player.pos;
                                me.dir = player.dir;
                                me.plane = player.plane;
                            }
                        } else {
                            players.get(player.id).pos = player.pos;
                            players.get(player.id).dir = player.dir;
                            players.get(player.id).plane = player.plane;
                        }
                    } else {
                        players.set(player.id, new Player(player.pos, player.dir, player.plane, player.id));
                    }
                }
                break;

            default:
                throw new Error("Unknown message type");
        }
    });

    const assets = await Promise.all([loadImageData("./assets/barrel.png"), loadImageData("./assets/bomb.png")]);

    const visibleSprites = [
        {
            pos: [0, 0],
            imgData: assets[1],
            tag: "enemy",
        },
    ];

    const spritePool = {
        items: [],
        length: 0,
    };

    const backImageData = new ImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    backImageData.data.fill(255);

    // [
    // [
    //     0,
    //     new Player(
    //         [22.5, 1.5],
    //         [-Math.cos(initialRot), -Math.sin(initialRot)],
    //         [-Math.sin(initialRot), Math.cos(initialRot)],
    //     ),
    // ],
    // [1, new Player([22, 12], [-1, 0], [0, 0.66])],
    // ]

    const enemySprite = visibleSprites.find((sprite) => sprite.tag === "enemy");

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

    let prevTimestamp = 0;

    const frame = (timestamp) => {
        const deltaTime = (timestamp - prevTimestamp) / 1000;
        prevTimestamp = timestamp;

        if (!me) {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }

        if (me) {
            if (
                me.movingForward ||
                me.movingBackward ||
                me.movingLeft ||
                me.movingRight ||
                me.turningLeft ||
                me.turningRight
            ) {
                ws.send(
                    JSON.stringify({
                        type: "move",
                        id,
                        pos: me.pos,
                        dir: me.dir,
                        plane: me.plane,
                    }),
                );
            }

            renderGame(
                ctx,
                map,
                me,
                deltaTime,
                mapShown,
                players,
                spritePool,
                visibleSprites,
                zBuffer,
                backImageData,
                backCtx,
                enemySprite,
            );
        }

        window.requestAnimationFrame(frame);
    };

    window.requestAnimationFrame((timestamp) => {
        prevTimestamp = timestamp;
        window.requestAnimationFrame(frame);
    });
})();
