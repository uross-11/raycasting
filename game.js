// function pushSprite(spritePool, image, position, z, scale, cropPosition, cropSize) {
//     if (spritePool.length >= spritePool.items.length) {
//         spritePool.items.push({
//             image,
//             position: [position.x ?? 0, position.y ?? 0],
//             z,
//             scale,
//             pdist: 0,
//             dist: 0,
//             t: 0,
//             cropPosition: [cropPosition.x ?? 0, cropPosition.y ?? 0],
//             cropSize: [cropSize.x ?? 0, cropSize.y ?? 0],
//         });
//     }

//     const last = spritePool.length;

//     spritePool.items[last].image = image;
//     spritePool.items[last].position = position;
//     spritePool.items[last].z = z;
//     spritePool.items[last].scale = scale;
//     spritePool.items[last].pdist = 0;
//     spritePool.items[last].dist = 0;
//     spritePool.items[last].t = 0;

//     if (image instanceof ImageData) {
//         if (cropPosition === undefined) {
//             spritePool.items[last].cropPosition.set(0, 0);
//         } else {
//             spritePool.items[last].cropPosition = cropPosition;
//         }
//         if (cropSize === undefined) {
//             // spritePool.items[last].cropSize.set(image.width, image.height).sub(spritePool.items[last].cropPosition);
//             spritePool.items[last].cropSize = [image.width, image.height].map(
//                 (v, i) => v - spritePool.items[last].cropPosition[i],
//             );
//         } else {
//             spritePool.items[last].cropSize = cropSize;
//         }
//     } else {
//         spritePool.items[last].cropPosition = [0, 0];
//         spritePool.items[last].cropSize = [0, 0];
//     }

//     spritePool.length += 1;
// }

import * as common from "./common.js";

export class Sprite {
    constructor(src, x, y) {
        this.src = src;
        this.x = x;
        this.y = y;
    }

    async loadImage(url) {
        const image = new Image();
        image.src = url;
        return new Promise((resolve, reject) => {
            image.onload = () => resolve(image);
            image.onerror = reject;
        });
    }

    async loadImageData(url) {
        const image = await this.loadImage(url);
        const canvas = new OffscreenCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");
        if (ctx === null) throw new Error("2d canvas is not supported");
        ctx.drawImage(image, 0, 0);
        return ctx.getImageData(0, 0, image.width, image.height);
    }

    // async loadAssets(urls) {
    //     const promises = urls.map((url) => this.loadImageData(url));
    //     return Promise.all(promises);
    // }
}

async function loadImage(url) {
    const image = new Image();
    image.src = url;
    return new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = reject;
    });
}

export async function loadImageData(url) {
    const image = await loadImage(url);
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    if (ctx === null) throw new Error("2d canvas is not supported");
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, image.width, image.height);
}

// const assets = await Promise.all([
//     game.loadImageData("./assets/barrel.png"),
//     game.loadImageData("./assets/bomb.png"),
// ]);

// const visibleSprites = [{ pos: [22.5, 22.5], imgData: assets[0], tag: "enemy" }];
// const spritePool = { items: [], length: 0 };

// const enemySprite = visibleSprites.find((sprite) => sprite.tag === "enemy");

// function createSpritePool() {
//     return {
//         items: [],
//         length: 0,
//     };
// }

// TODO: add settings menu
const MOVE_SPEED = 0.03;
const ROTATION_SPEED = 0.05;
const PLAYER_WIDTH = 0.2;
export const SENSITIVITY = 3;
export const FACTOR = 50;

const TILE_SIZE = 24 * (FACTOR / 70);
export const MAP_SHOWN = false;

function isPlayerColliding(y, x) {
    return (
        common.map[~~(y - PLAYER_WIDTH)][~~(x - PLAYER_WIDTH)] !== 0 ||
        common.map[~~(y + PLAYER_WIDTH)][~~(x - PLAYER_WIDTH)] !== 0 ||
        common.map[~~(y - PLAYER_WIDTH)][~~(x + PLAYER_WIDTH)] !== 0 ||
        common.map[~~(y + PLAYER_WIDTH)][~~(x + PLAYER_WIDTH)] !== 0
    );
}

function displaySwapBackImageData(backCtx, backImageData, ctx) {
    backCtx.putImageData(backImageData, 0, 0);
    ctx.drawImage(backCtx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

function resetSpritePool(spritePool, visibleSprites) {
    spritePool.length = visibleSprites.length;
    spritePool.items = visibleSprites;
}

function renderSprites(player, sprites, zBuffer, backImageData) {
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
                        if (alpha <= 0 || color === 0) continue;

                        // Using a higher alpha threshold for better quality
                        const backIndex = (y * backImageData.width + stripeIndex) * 4;
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

export class Player {
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

// function drawMap(ctx, map) {
//     ctx.globalAlpha = 0.7;
//     for (let y = 0; y < map.length; y++) {
//         for (let x = 0; x < map[y].length; x++) {
//             let color;

//             switch (map[y][x]) {
//                 case 1:
//                     color = "red";
//                     break;
//                 case 2:
//                     color = "green";
//                     break;
//                 case 3:
//                     color = "blue";
//                     break;
//                 case 4:
//                     color = "white";
//                     break;
//                 case 5:
//                     color = "yellow";
//                     break;
//                 default:
//                     color = "black";
//             }

//             ctx.fillStyle = color;
//             ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
//             ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
//             ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
//         }
//     }
//     ctx.globalAlpha = 1;
// }

// function drawPlayersOnMap(ctx, players) {
//     ctx.beginPath();
//     ctx.strokeStyle = "white";
//     for (const player of players.values()) {
//         ctx.moveTo(player.pos[0] * TILE_SIZE, player.pos[1] * TILE_SIZE);
//         ctx.rect(
//             player.pos[0] * TILE_SIZE - PLAYER_WIDTH * TILE_SIZE,
//             player.pos[1] * TILE_SIZE - PLAYER_WIDTH * TILE_SIZE,
//             TILE_SIZE * PLAYER_WIDTH * 2,
//             TILE_SIZE * PLAYER_WIDTH * 2,
//         );
//     }
//     ctx.stroke();
// }

// function drawSpritesOnMap(ctx, sprites) {
//     for (const sprite of sprites) {
//         if (sprite.tag === "enemy") continue;

//         ctx.putImageData(sprite.imgData, sprite.pos[0] * TILE_SIZE, sprite.pos[1] * TILE_SIZE, 0, 0, TILE_SIZE, TILE_SIZE);
//     }
// }

// function drawLine(ctx, x1, y1, x2, y2, color) {
//     ctx.beginPath();
//     ctx.strokeStyle = color;
//     ctx.moveTo(x1, y1);
//     ctx.lineTo(x2, y2);
//     ctx.stroke();
// }

// function renderMap(ctx, map, players, sprites) {
//     const width = ctx.canvas.width;

//     drawMap(ctx, map);
//     drawPlayersOnMap(ctx, players);
//     drawSpritesOnMap(ctx, sprites);

//     for (let x = 0; x < width; x++) {
//         const pos = players.get(0).pos;
//         const dir = players.get(0).dir;
//         const plane = players.get(0).plane;

//         const cameraX = (2 * x) / width - 1;

//         const rayDir = [dir[0] + plane[0] * cameraX, dir[1] + plane[1] * cameraX];

//         const mapPos = [~~pos[0], ~~pos[1]];

//         const deltaDist = [Math.abs(1 / rayDir[0]), Math.abs(1 / rayDir[1])];

//         const sideDist = [
//             rayDir[0] < 0 ? (pos[0] - mapPos[0]) * deltaDist[0] : (mapPos[0] + 1 - pos[0]) * deltaDist[0],
//             rayDir[1] < 0 ? (pos[1] - mapPos[1]) * deltaDist[1] : (mapPos[1] + 1 - pos[1]) * deltaDist[1],
//         ];

//         const step = [rayDir[0] < 0 ? -1 : 1, rayDir[1] < 0 ? -1 : 1];

//         let side = 0;

//         while (true) {
//             if (sideDist[0] < sideDist[1]) {
//                 sideDist[0] += deltaDist[0];
//                 mapPos[0] += step[0];
//                 side = 0;
//             } else {
//                 sideDist[1] += deltaDist[1];
//                 mapPos[1] += step[1];
//                 side = 1;
//             }

//             if (map[mapPos[1]][mapPos[0]] !== 0) break;
//         }

//         if (x === 0 || x === width - 1) {
//             drawLine(
//                 ctx,
//                 pos[0] * TILE_SIZE,
//                 pos[1] * TILE_SIZE,
//                 (pos[0] + rayDir[0] * 1) * TILE_SIZE,
//                 (pos[1] + rayDir[1] * 1) * TILE_SIZE,
//                 "white",
//             );
//             drawLine(
//                 ctx,
//                 pos[0] * TILE_SIZE,
//                 pos[1] * TILE_SIZE,
//                 (pos[0] + plane[0] * 1) * TILE_SIZE,
//                 (pos[1] + plane[1] * 1) * TILE_SIZE,
//                 "blue",
//             );
//         }
//     }
// }

function renderFloorAndCeiling(ctx, player, backImageData) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const buffer = new Uint8ClampedArray(backImageData.data);

    for (let y = 0; y < height; y++) {
        const rayDirX0 = player.dir[0] - player.plane[0];
        const rayDirY0 = player.dir[1] - player.plane[1];
        const rayDirX1 = player.dir[0] + player.plane[0];
        const rayDirY1 = player.dir[1] + player.plane[1];

        const isFloor = y > height / 2;
        const p = isFloor ? y - height / 2 : height / 2 - y;
        const posZ = 0.5 * height;
        const rowDistance = posZ / p;

        const floorStepX = (rowDistance * (rayDirX1 - rayDirX0)) / width;
        const floorStepY = (rowDistance * (rayDirY1 - rayDirY0)) / width;

        let floorX = player.pos[0] + rowDistance * rayDirX0;
        let floorY = player.pos[1] + rowDistance * rayDirY0;

        const shadow = Math.min((1 / rowDistance) * 4, 1);

        for (let x = 0; x < width; x++) {
            const cellX = floorX;
            const cellY = floorY;

            floorX += floorStepX;
            floorY += floorStepY;

            const di = (y * backImageData.width + x) * 4;

            if (y > height / 2) {
                if ((Math.floor(cellX) + Math.floor(cellY)) % 2 === 0) {
                    buffer[di] = 185 * shadow;
                    buffer[di + 1] = 185 * shadow;
                    buffer[di + 2] = 185 * shadow;
                    buffer[di + 3] = 255;
                } else {
                    buffer[di] = 55 * shadow;
                    buffer[di + 1] = 50 * shadow;
                    buffer[di + 2] = 50 * shadow;
                    buffer[di + 3] = 255;
                }
            } else {
                if ((Math.floor(cellX) + Math.floor(cellY)) % 2 === 0) {
                    buffer[di] = 10 * shadow;
                    buffer[di + 1] = 10 * shadow;
                    buffer[di + 2] = 10 * shadow;
                    buffer[di + 3] = 255;
                } else {
                    buffer[di] = 50 * shadow;
                    buffer[di + 1] = 50 * shadow;
                    buffer[di + 2] = 50 * shadow;
                    buffer[di + 3] = 255;
                }
            }
        }
    }

    backImageData.data.set(buffer);
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

            if (map[mapPos[1]][mapPos[0]] !== 0) break;
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

        const shadow = Math.min((1 / zBuffer[x]) * 4, 1);

        for (let y = wallTopY; y < wallBottomY; y++) {
            const di = (y * backImageData.width + x) * 4;
            buffer[di] = color(side)[0] * shadow;
            buffer[di + 1] = color(side)[1] * shadow;
            buffer[di + 2] = color(side)[2] * shadow;
            buffer[di + 3] = 255;
        }
    }

    backImageData.data.set(buffer);
}

// function renderEnemy(enemySprite, players, me) {
//     if (!enemySprite) return; // Early return if no enemy sprite found

//     for (let player of players.values()) {
//         if (me.id === player.id) continue;

//         enemySprite.pos = player.pos;
//     }
// }

export class Game {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.players = new Map();
        this.me = null;
        this.id = null;
        this.mapShown = false;

        this.zBuffer = new Float32Array(canvasWidth);
        this.backImageData = new ImageData(canvasWidth, canvasHeight);
        this.backImageData.data.fill(0);

        this.visibleSprites = [];
        this.spritePool = { items: [], length: 0 };
        this.assets = new Map();

        this.inputState = {
            movingForward: false,
            movingBackward: false,
            movingLeft: false,
            movingRight: false,
            turningLeft: false,
            turningRight: false,
        };
    }

    async initialize() {
        const assetUrls = ["./assets/barrel.png", "./assets/barrel.png"];

        const loadedAssets = await Promise.all(assetUrls.map((url) => loadImageData(url)));

        this.assets.set("barrel", loadedAssets[0]);
        this.assets.set("bomb", loadedAssets[1]);

        this.visibleSprites = [{ pos: [21.5, 2.5], imgData: this.assets.get("bomb"), tag: "enemy" }];

        this.enemySprite = this.visibleSprites.find((sprite) => sprite.tag === "enemy");
    }

    handleMessage(data) {
        switch (data.type) {
            case "hello":
                this.id = data.id;
                for (const player of data.players) {
                    this.players.set(player.id, new Player(player.pos, player.dir, player.plane, player.id));
                }
                this.me = this.players.get(this.id);
                break;

            case "update":
                for (const player of data.players) {
                    if (this.players.has(player.id)) {
                        if (player.id === this.id) {
                            // Client-side prediction: only reset if difference is too big
                            if (
                                Math.abs(player.pos[0] - this.me.pos[0]) > 0.25 ||
                                Math.abs(player.pos[1] - this.me.pos[1]) > 0.25
                            ) {
                                this.me.pos = player.pos;
                                this.me.dir = player.dir;
                                this.me.plane = player.plane;
                            }
                        } else {
                            const existingPlayer = this.players.get(player.id);
                            existingPlayer.pos = player.pos;
                            existingPlayer.dir = player.dir;
                            existingPlayer.plane = player.plane;
                        }
                    } else {
                        this.players.set(player.id, new Player(player.pos, player.dir, player.plane, player.id));
                    }
                }
                break;

            default:
                throw new Error("Unknown message type: " + data.type);
        }
    }

    handleKeyDown(keyCode) {
        if (!this.me) return false;

        let changed = false;
        switch (keyCode) {
            case "ArrowUp":
            case "KeyW":
                if (!this.me.movingForward) {
                    this.me.movingForward = true;
                    changed = true;
                }
                break;
            case "ArrowDown":
            case "KeyS":
                if (!this.me.movingBackward) {
                    this.me.movingBackward = true;
                    changed = true;
                }
                break;
            case "ArrowLeft":
                if (!this.me.turningLeft) {
                    this.me.turningLeft = true;
                    changed = true;
                }
                break;
            case "ArrowRight":
                if (!this.me.turningRight) {
                    this.me.turningRight = true;
                    changed = true;
                }
                break;
            case "KeyM":
                this.mapShown = !this.mapShown;
                break;
            case "KeyA":
                if (!this.me.movingLeft) {
                    this.me.movingLeft = true;
                    changed = true;
                }
                break;
            case "KeyD":
                if (!this.me.movingRight) {
                    this.me.movingRight = true;
                    changed = true;
                }
                break;
        }
        return changed;
    }

    handleKeyUp(keyCode) {
        if (!this.me) return false;

        let changed = false;
        switch (keyCode) {
            case "ArrowUp":
            case "KeyW":
                if (this.me.movingForward) {
                    this.me.movingForward = false;
                    changed = true;
                }
                break;
            case "ArrowDown":
            case "KeyS":
                if (this.me.movingBackward) {
                    this.me.movingBackward = false;
                    changed = true;
                }
                break;
            case "ArrowLeft":
                if (this.me.turningLeft) {
                    this.me.turningLeft = false;
                    changed = true;
                }
                break;
            case "ArrowRight":
                if (this.me.turningRight) {
                    this.me.turningRight = false;
                    changed = true;
                }
                break;
            case "KeyA":
                if (this.me.movingLeft) {
                    this.me.movingLeft = false;
                    changed = true;
                }
                break;
            case "KeyD":
                if (this.me.movingRight) {
                    this.me.movingRight = false;
                    changed = true;
                }
                break;
        }
        return changed;
    }

    handleMouseMove(movementX) {
        if (!this.me) return;
        this.me.rotate(movementX * -0.001 * SENSITIVITY);
    }

    shouldSendUpdate() {
        if (!this.me) return false;

        return (
            this.me.movingForward ||
            this.me.movingBackward ||
            this.me.movingLeft ||
            this.me.movingRight ||
            this.me.turningLeft ||
            this.me.turningRight
        );
    }

    getPlayerState() {
        if (!this.me) return null;

        return {
            type: "move",
            id: this.id,
            pos: this.me.pos,
            dir: this.me.dir,
            plane: this.me.plane,
        };
    }

    update(deltaTime) {
        if (this.me) updatePlayer(this.me);
    }

    render(ctx, backCtx, deltaTime) {
        // if (!this.me) {
        //     ctx.fillStyle = "black";
        //     ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        //     ctx.fillStyle = "white";
        //     ctx.font = "16px Arial";
        //     ctx.textAlign = "center";
        //     ctx.fillText("Waiting for server connection...", this.canvasWidth / 2, this.canvasHeight / 2 - 20);
        //     ctx.font = "12px Arial";
        //     ctx.fillText(
        //         `ID: ${this.id || "-"} | Players: ${this.players.size}`,
        //         this.canvasWidth / 2,
        //         this.canvasHeight / 2 + 10,
        //     );
        //     ctx.textAlign = "left"; // Reset text align
        //     return;
        // }

        resetSpritePool(this.spritePool, this.visibleSprites);
        this.backImageData.data.fill(0);

        renderFloorAndCeiling(ctx, this.me, this.backImageData);
        renderWalls(ctx, common.map, this.me, this.zBuffer, this.backImageData);
        renderSprites(this.me, this.spritePool.items, this.zBuffer, this.backImageData);
        updatePlayer(this.me);
        displaySwapBackImageData(backCtx, this.backImageData, ctx);
        renderFPS(ctx, deltaTime);

        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText(this.id, 20, 20);
    }

    isReady() {
        return this.me !== null;
    }

    getPlayerId() {
        return this.id;
    }

    toggleMap() {
        this.mapShown = !this.mapShown;
    }
}
