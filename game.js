import * as common from "./common.js";
import { applyInputToPlayer, GAME_CONSTANTS, performShot } from "./common.js";

const GAME_CONFIG = GAME_CONSTANTS;

const MAP_COLORS = {
    1: "red",
    2: "green",
    3: "blue",
    4: "white",
    5: "yellow",
    default: "black",
};

const WALL_COLORS = {
    1: { front: [255, 0, 0], back: [200, 0, 0] },
    2: { front: [0, 255, 0], back: [0, 200, 0] },
    3: { front: [0, 0, 255], back: [0, 0, 200] },
    4: { front: [200, 200, 200], back: [150, 150, 150] },
    5: { front: [255, 255, 0], back: [200, 200, 0] },
    default: { front: [50, 50, 50], back: [25, 25, 25] },
};

const FLOOR_COLORS = {
    light: [185, 185, 185],
    dark: [55, 50, 50],
};

const CEILING_COLORS = {
    light: [10, 10, 10],
    dark: [50, 50, 50],
};

const SPRITE_CONFIG = {
    VERTICAL_POSITION: 45.0,
    MIN_DISTANCE: 0.1,
    ALPHA_THRESHOLD: 0,
    JUMP_STRENGTH: 0.25,
    GRAVITY: 0.005,
};

export const SENSITIVITY = GAME_CONFIG.SENSITIVITY;
export const FACTOR = GAME_CONFIG.FACTOR;
export const MAP_SHOWN = GAME_CONFIG.MAP_SHOWN;
export const JUMP_STRENGTH = SPRITE_CONFIG.JUMP_STRENGTH;
export const GRAVITY = SPRITE_CONFIG.GRAVITY;

async function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.onerror = () => {
            reject(new Error(`Failed to load image: ${url}`));
        };
        img.src = url;
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

function isPlayerColliding(y, x) {
    const playerWidth = GAME_CONFIG.PLAYER_WIDTH;
    return (
        common.map[~~(y - playerWidth)][~~(x - playerWidth)] !== 0 ||
        common.map[~~(y + playerWidth)][~~(x - playerWidth)] !== 0 ||
        common.map[~~(y - playerWidth)][~~(x + playerWidth)] !== 0 ||
        common.map[~~(y + playerWidth)][~~(x + playerWidth)] !== 0
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

function calculateDistance(pos1, pos2) {
    return Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2);
}

function sortSpritesByDistance(sprites, playerPos) {
    sprites.sort((a, b) => {
        const distA = calculateDistance(playerPos, a.pos);
        const distB = calculateDistance(playerPos, b.pos);
        return distB - distA;
    });
}

function transformSpriteToScreen(sprite, player, backImageData) {
    const spriteX = sprite.pos[0] - player.pos[0];
    const spriteY = sprite.pos[1] - player.pos[1];

    const det = player.plane[0] * player.dir[1] - player.dir[0] * player.plane[1];
    const invDet = 1.0 / det;

    const transformX = invDet * (player.dir[1] * spriteX - player.dir[0] * spriteY);
    const transformY = invDet * (-player.plane[1] * spriteX + player.plane[0] * spriteY);

    if (transformY <= 0.01) return null;

    return {
        transformX,
        transformY,
        spriteScreenX: Math.floor((backImageData.width / 2) * (1 + transformX / transformY)),
    };
}

function calculateSpriteDimensions(transform, backImageData) {
    const { transformY, spriteScreenX } = transform;

    const effectiveDistance = Math.max(transformY, SPRITE_CONFIG.MIN_DISTANCE);

    const spriteHeight = Math.abs(Math.floor(backImageData.height / effectiveDistance));
    const spriteWidth = Math.abs(Math.floor(backImageData.height / effectiveDistance));

    const vMoveScreen = Math.floor(SPRITE_CONFIG.VERTICAL_POSITION / effectiveDistance);
    const drawStartY = Math.floor(Math.max(0, -spriteHeight / 2 + backImageData.height / 2 + vMoveScreen));
    const drawEndY = Math.floor(
        Math.min(backImageData.height - 1, spriteHeight / 2 + backImageData.height / 2 + vMoveScreen),
    );
    const drawStartX = Math.floor(Math.max(0, -spriteWidth / 2 + spriteScreenX));
    const drawEndX = Math.floor(Math.min(backImageData.width - 1, spriteWidth / 2 + spriteScreenX));

    return {
        spriteHeight,
        spriteWidth,
        drawStartY,
        drawEndY,
        drawStartX,
        drawEndX,
        effectiveDistance,
        spriteScreenX,
        vMoveScreen,
    };
}

function renderSpriteStripe(sprite, dimensions, stripeIndex, transformY, zBuffer, backImageData) {
    const { spriteWidth, spriteHeight, drawStartY, drawEndY, spriteScreenX, vMoveScreen } = dimensions;

    const texX = Math.floor(((stripeIndex - (-spriteWidth / 2 + spriteScreenX)) * sprite.imgData.width) / spriteWidth);
    const boundedTexX = Math.min(Math.max(0, texX), sprite.imgData.width - 1);

    if (stripeIndex >= 0 && stripeIndex < zBuffer.length && transformY < zBuffer[stripeIndex]) {
        const unclippedSpriteStartY = backImageData.height / 2 - spriteHeight / 2 + vMoveScreen;

        for (let y = drawStartY; y <= drawEndY; y++) {
            const currentYInUnclippedSprite = y - unclippedSpriteStartY;

            const texY = Math.min(
                Math.max(0, Math.floor((currentYInUnclippedSprite / spriteHeight) * sprite.imgData.height)),
                sprite.imgData.height - 1,
            );

            const imgIndex = (texY * sprite.imgData.width + boundedTexX) * 4;

            if (imgIndex >= 0 && imgIndex < sprite.imgData.data.length - 3) {
                const alpha = sprite.imgData.data[imgIndex + 3];
                const r = sprite.imgData.data[imgIndex];
                const g = sprite.imgData.data[imgIndex + 1];
                const b = sprite.imgData.data[imgIndex + 2];

                if (alpha <= SPRITE_CONFIG.ALPHA_THRESHOLD || (r === 0 && g === 0 && b === 0)) continue;

                const backIndex = (y * backImageData.width + stripeIndex) * 4;
                backImageData.data[backIndex] = sprite.imgData.data[imgIndex];
                backImageData.data[backIndex + 1] = sprite.imgData.data[imgIndex + 1];
                backImageData.data[backIndex + 2] = sprite.imgData.data[imgIndex + 2];
                backImageData.data[backIndex + 3] = alpha;
            }
        }
    }
}

function renderSprites(player, sprites, zBuffer, backImageData) {
    sortSpritesByDistance(sprites, player.pos);

    for (const sprite of sprites) {
        const transform = transformSpriteToScreen(sprite, player, backImageData);
        if (!transform) continue;

        const dimensions = calculateSpriteDimensions(transform, backImageData);

        for (let stripe = Math.floor(dimensions.drawStartX); stripe < dimensions.drawEndX; stripe++) {
            renderSpriteStripe(sprite, dimensions, stripe, transform.transformY, zBuffer, backImageData);
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
        vZ = 0,
        isGrounded = true,
        isJumping = false,
        health = common.GAME_CONSTANTS.MAX_HEALTH,
        shooting = false,
        shotDisplayTime = 0, // New property for gun-fire sprite display duration
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
        this.vZ = vZ;
        this.isGrounded = isGrounded;
        this.isJumping = isJumping;
        this.health = health;
        this.shooting = shooting;
        this.shotDisplayTime = shotDisplayTime; // Assign the new property
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
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

function updatePlayer(player, deltaTime) {
    applyInputToPlayer(player, deltaTime, common.map);

    player.vZ -= GAME_CONFIG.GRAVITY * deltaTime * 60;
    player.pos[2] += player.vZ;

    if (player.pos[2] < 0) {
        player.pos[2] = 0;
        player.vZ = 0;
        player.isGrounded = true;
    } else {
        player.isGrounded = false;
    }

    if (player.isJumping && player.isGrounded) {
        player.vZ = GAME_CONFIG.JUMP_STRENGTH;
        player.isGrounded = false;
        player.isJumping = false;
    }
}

function renderFPS(ctx, deltaTime) {
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText(`FPS: ${Math.round(1 / deltaTime)}`, ctx.canvas.width - 60, 20);
}

function getMapTileColor(tileValue) {
    return MAP_COLORS[tileValue] || MAP_COLORS.default;
}

function drawMap(ctx, map, wallTextures) {
    ctx.globalAlpha = 0.7;

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const tileValue = map[y][x];
            const tileSize = GAME_CONFIG.TILE_SIZE;

            if (tileValue !== 0 && wallTextures.has(tileValue)) {
                const texture = wallTextures.get(tileValue);
                ctx.drawImage(texture, x * tileSize, y * tileSize, tileSize, tileSize);
            } else {
                const color = getMapTileColor(tileValue);
                ctx.fillStyle = color;
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }

            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }

    ctx.globalAlpha = 1;
}

function drawPlayersOnMap(ctx, players) {
    ctx.beginPath();
    ctx.strokeStyle = "white";

    const tileSize = GAME_CONFIG.TILE_SIZE;
    const playerWidth = GAME_CONFIG.PLAYER_WIDTH;

    for (const player of players.values()) {
        ctx.moveTo(player.pos[0] * tileSize, player.pos[1] * tileSize);
        ctx.rect(
            player.pos[0] * tileSize - playerWidth * tileSize,
            player.pos[1] * tileSize - playerWidth * tileSize,
            tileSize * playerWidth * 2,
            tileSize * playerWidth * 2,
        );
    }
    ctx.stroke();
}

function drawSpritesOnMap(ctx, sprites) {
    const tileSize = GAME_CONFIG.TILE_SIZE;

    for (const sprite of sprites) {
        if (sprite.tag === "enemy") continue;

        ctx.putImageData(sprite.imgData, sprite.pos[0] * tileSize, sprite.pos[1] * tileSize, 0, 0, tileSize, tileSize);
    }
}

function drawLine(ctx, x1, y1, x2, y2, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function renderMap(ctx, map, player, players, sprites) {
    const width = ctx.canvas.width;
    if (!player) return; // Add this check

    drawMap(ctx, map);
    drawPlayersOnMap(ctx, players);
    drawSpritesOnMap(ctx, sprites);

    for (let x = 0; x < width; x++) {
        const pos = player.pos;
        const dir = player.dir;
        const plane = player.plane;

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

        if (x === 0 || x === width - 1) {
            drawLine(
                ctx,
                pos[0] * TILE_SIZE,
                pos[1] * TILE_SIZE,
                (pos[0] + rayDir[0] * 1) * TILE_SIZE,
                (pos[1] + rayDir[1] * 1) * TILE_SIZE,
                "white",
            );
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

function getFloorColor(cellX, cellY, shadow) {
    const isEven = (Math.floor(cellX) + Math.floor(cellY)) % 2 === 0;
    const color = isEven ? FLOOR_COLORS.light : FLOOR_COLORS.dark;
    return [color[0] * shadow, color[1] * shadow, color[2] * shadow, 255];
}

function getCeilingColor(cellX, cellY, shadow) {
    const isEven = (Math.floor(cellX) + Math.floor(cellY)) % 2 === 0;
    const color = isEven ? CEILING_COLORS.light : CEILING_COLORS.dark;
    return [color[0] * shadow, color[1] * shadow, color[2] * shadow, 255];
}

function renderFloorAndCeiling(ctx, player, backImageData, floorTexture, ceilingTexture) {
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
        const rowDistance = posZ / Math.max(1, p);

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

            const pixelIndex = (y * backImageData.width + x) * 4;

            if (isFloor && floorTexture) {
                const tx = Math.abs(Math.floor((cellX % 1) * floorTexture.width)) % floorTexture.width;
                const ty = Math.abs(Math.floor((cellY % 1) * floorTexture.height)) % floorTexture.height;
                const tIdx = (ty * floorTexture.width + tx) * 4;
                buffer[pixelIndex] = floorTexture.data[tIdx] * shadow;
                buffer[pixelIndex + 1] = floorTexture.data[tIdx + 1] * shadow;
                buffer[pixelIndex + 2] = floorTexture.data[tIdx + 2] * shadow;
                buffer[pixelIndex + 3] = 255;
            } else if (!isFloor && ceilingTexture) {
                const tx = Math.abs(Math.floor((cellX % 1) * ceilingTexture.width)) % ceilingTexture.width;
                const ty = Math.abs(Math.floor((cellY % 1) * ceilingTexture.height)) % ceilingTexture.height;
                const tIdx = (ty * ceilingTexture.width + tx) * 4;
                buffer[pixelIndex] = ceilingTexture.data[tIdx] * shadow;
                buffer[pixelIndex + 1] = ceilingTexture.data[tIdx + 1] * shadow;
                buffer[pixelIndex + 2] = ceilingTexture.data[tIdx + 2] * shadow;
                buffer[pixelIndex + 3] = 255;
            } else {
                const color = isFloor ? getFloorColor(cellX, cellY, shadow) : getCeilingColor(cellX, cellY, shadow);
                buffer[pixelIndex] = color[0];
                buffer[pixelIndex + 1] = color[1];
                buffer[pixelIndex + 2] = color[2];
                buffer[pixelIndex + 3] = color[3];
            }
        }
    }

    backImageData.data.set(buffer);
}

function castRay(map, playerPos, rayDir) {
    const mapPos = [~~playerPos[0], ~~playerPos[1]];
    const deltaDist = [Math.abs(1 / rayDir[0]), Math.abs(1 / rayDir[1])];

    let sideDist = [
        rayDir[0] < 0 ? (playerPos[0] - mapPos[0]) * deltaDist[0] : (mapPos[0] + 1 - playerPos[0]) * deltaDist[0],
        rayDir[1] < 0 ? (playerPos[1] - mapPos[1]) * deltaDist[1] : (mapPos[1] + 1 - playerPos[1]) * deltaDist[1],
    ];

    const step = [rayDir[0] < 0 ? -1 : 1, rayDir[1] < 0 ? -1 : 1];
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

    return { mapPos, side, step };
}

function calculatePerpWallDist(mapPos, playerPos, rayDir, side, step) {
    return side === 0
        ? Math.abs((mapPos[0] - playerPos[0] + (1 - step[0]) / 2) / rayDir[0])
        : Math.abs((mapPos[1] - playerPos[1] + (1 - step[1]) / 2) / rayDir[1]);
}

function getWallVisual(wallTextures, tileType, side) {
    const texture = wallTextures.get(tileType);
    if (texture) {
        return { texture: texture };
    }
    const wallColor = WALL_COLORS[tileType] || WALL_COLORS.default;
    const color = side === 0 ? wallColor.front : wallColor.back;
    return { color: color };
}

function renderWallStrip(buffer, x, wallTopY, wallBottomY, visual, wallX, shadow, width, backImageData, stripHeight) {
    if (visual.texture) {
        const tex = visual.texture;
        const texX = Math.min(Math.max(0, Math.floor(wallX * tex.width)), tex.width - 1);

        const unclippedWallStartY = (backImageData.height - stripHeight) / 2;

        for (let y = wallTopY; y <= wallBottomY; y++) {
            const currentYInUnclippedWall = y - unclippedWallStartY;

            const texY = Math.min(
                Math.max(0, Math.floor((currentYInUnclippedWall / stripHeight) * tex.height)),
                tex.height - 1,
            );

            const texIdx = (texY * tex.width + texX) * 4;
            const pixelIndex = (y * width + x) * 4;
            buffer[pixelIndex] = tex.data[texIdx] * shadow;
            buffer[pixelIndex + 1] = tex.data[texIdx + 1] * shadow;
            buffer[pixelIndex + 2] = tex.data[texIdx + 2] * shadow;
            buffer[pixelIndex + 3] = tex.data[texIdx + 3];
        }
    } else {
        const color = visual.color;
        for (let y = wallTopY; y <= wallBottomY; y++) {
            const pixelIndex = (y * width + x) * 4;
            buffer[pixelIndex] = color[0] * shadow;
            buffer[pixelIndex + 1] = color[1] * shadow;
            buffer[pixelIndex + 2] = color[2] * shadow;
            buffer[pixelIndex + 3] = 255;
        }
    }
}

function renderWalls(ctx, map, player, zBuffer, backImageData, wallTextures) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const buffer = new Uint8ClampedArray(backImageData.data);

    for (let x = 0; x < width; x++) {
        const cameraX = (2 * x) / width - 1;
        const rayDir = [player.dir[0] + player.plane[0] * cameraX, player.dir[1] + player.plane[1] * cameraX];

        const rayResult = castRay(map, player.pos, rayDir);
        const { mapPos, side, step } = rayResult;

        const perpWallDist = calculatePerpWallDist(mapPos, player.pos, rayDir, side, step);
        const tileType = map[mapPos[1]][mapPos[0]];
        const visual = getWallVisual(wallTextures, tileType, side);

        zBuffer[x] = perpWallDist;

        const stripHeight = backImageData.height / perpWallDist;
        const wallTopY = Math.max(0, ~~((height - stripHeight) / 2));
        const wallBottomY = Math.min(height - 1, ~~((height + stripHeight) / 2));
        const shadow = Math.min((1 / perpWallDist) * 4, 1);

        let wallX;
        if (side === 0) wallX = player.pos[1] + perpWallDist * (player.dir[1] + player.plane[1] * cameraX);
        else wallX = player.pos[0] + perpWallDist * (player.dir[0] + player.plane[0] * cameraX);
        wallX -= Math.floor(wallX);

        renderWallStrip(
            buffer,
            x,
            wallTopY,
            wallBottomY,
            visual,
            wallX,
            shadow,
            backImageData.width,
            backImageData,
            stripHeight,
        );
    }

    backImageData.data.set(buffer);
}

export class Game {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.players = new Map();
        this.me = null;
        this.id = null;
        this.mapShown = GAME_CONFIG.MAP_SHOWN;

        this.zBuffer = new Float32Array(canvasWidth).fill(Infinity);
        this.backImageData = new ImageData(canvasWidth, canvasHeight);
        this.backImageData.data.fill(0);

        this.visibleSprites = [];
        this.spritePool = { items: [], length: 0 };
        this.assets = new Map();
        this.minimapWallImages = new Map();
        this.spriteImageDataCache = new Map(); // New map to store ImageData for sprites
    }

    async initialize() {
        // Load all assets as HTMLImageElements first
        await this.loadAssets([
            "bluestone.png",
            "colorstone.png",
            "redbrick.png",
            "wood.png",
            "mossy.png",
            "greystone.png",
            "purplestone.png",
            "pillar.png",
            "barrel.png",
            "eagle.png",
            "gun.png",
            "gun-fire.png", // Load the gun-fire sprite
        ]);

        const wallTextureMap = new Map([
            [1, convertImageToImageData(this.assets.get("redbrick.png"))],
            [2, convertImageToImageData(this.assets.get("eagle.png"))],
            [3, convertImageToImageData(this.assets.get("purplestone.png"))],
            [4, convertImageToImageData(this.assets.get("greystone.png"))],
            [5, convertImageToImageData(this.assets.get("bluestone.png"))],
            [6, convertImageToImageData(this.assets.get("mossy.png"))],
            [7, convertImageToImageData(this.assets.get("wood.png"))],
            [8, convertImageToImageData(this.assets.get("colorstone.png"))],
        ]);

        this.wallTextures = wallTextureMap;
        this.ceilingTexture = convertImageToImageData(this.assets.get("greystone.png"));
        this.floorTexture = convertImageToImageData(this.assets.get("wood.png"));

        // Convert sprite HTMLImageElements to ImageData once and cache them
        const spritesToCache = ["pillar.png", "barrel.png"];
        for (const spriteName of spritesToCache) {
            const imgElement = this.assets.get(spriteName);
            if (imgElement) {
                this.spriteImageDataCache.set(spriteName, convertImageToImageData(imgElement));
            }
        }

        this.visibleSprites = [
            { pos: [21.5, 2.5], imgData: this.spriteImageDataCache.get("pillar.png"), tag: "enemy" },
        ];

        this.enemySprite = this.visibleSprites.find((sprite) => sprite.tag === "enemy");
        if (this.enemySprite) {
            this.enemySprite.health = common.GAME_CONSTANTS.MAX_HEALTH;
            this.enemySprite.takeDamage = function(amount) {
                this.health -= amount;
                if (this.health < 0) this.health = 0;
            };
        }
    }

    async loadAssets(assetNames) {
        const assetPromises = assetNames.map(async (name) => {
            const url = `./assets/${name}`;
            try {
                this.assets.set(name, await loadImage(url));
            } catch (error) {
            }
        });
        await Promise.all(assetPromises);

        // Process gun images for transparency once during loading
        this.processedGunImage = makeBlackPixelsTransparent(this.assets.get("gun.png")); // Apply transparency
        this.processedGunFireImage = makeBlackPixelsTransparent(this.assets.get("gun-fire.png")); // Apply transparency
    }

    handleMessage(data) {
        switch (data.type) {
            case "hello":
                this.id = data.id;
                for (const player of data.players) {
                    this.players.set(
                        player.id,
                        new Player(
                            player.pos,
                            player.dir,
                            player.plane,
                            player.id,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            0,
                            true,
                            false,
                            common.GAME_CONSTANTS.MAX_HEALTH,
                            false, // shooting
                            0, // shotDisplayTime
                        ),
                    );
                }
                this.me = this.players.get(this.id);
                break;

            case "update":
                for (const player of data.players) {
                    if (this.players.has(player.id)) {
                        if (player.id === this.id) {
                            const dx = player.pos[0] - this.me.pos[0];
                            const dy = player.pos[1] - this.me.pos[1];
                            const err = Math.max(Math.abs(dx), Math.abs(dy));

                            if (err > 1.0) {
                                this.me.pos[0] = player.pos[0];
                                this.me.pos[1] = player.pos[1];
                                this.me.pos[2] = 0;
                                this.me.vZ = 0;
                                this.me.isGrounded = true;
                                this.me.dir = player.dir;
                                this.me.plane = player.plane;
                                this.me.health = player.health;
                            } else if (err > 0.3) {
                                const alpha = 0.2;
                                this.me.pos[0] += dx * alpha;
                                this.me.pos[1] += dy * alpha;
                                this.me.dir[0] = common.lerp(this.me.dir[0], player.dir[0], alpha);
                                this.me.dir[1] = common.lerp(this.me.dir[1], player.dir[1], alpha);
                                this.me.plane[0] = common.lerp(this.me.plane[0], player.plane[0], alpha);
                                this.me.plane[1] = common.lerp(this.me.plane[1], player.plane[1], alpha);
                            }
                        } else {
                            const existingPlayer = this.players.get(player.id);
                            existingPlayer.pos = player.pos;
                            existingPlayer.dir = player.dir;
                            existingPlayer.plane = player.plane;
                            existingPlayer.health = player.health;
                        }
                    } else {
                        this.players.set(
                            player.id,
                            new Player(player.pos, player.dir, player.plane, player.id, false, false, false, false, false, false, 0, true, false, player.health, false, 0),
                        );
                    }
                }

                this.visibleSprites = [
                    { pos: [21.5, 2.5], imgData: this.spriteImageDataCache.get("pillar.png"), tag: "enemy" },
                    ...Array.from(this.players.values())
                        .filter((player) => player.id !== this.id)
                        .map((player) => {
                            return { pos: player.pos, imgData: this.spriteImageDataCache.get("barrel.png"), tag: "player" };
                        }),
                ].filter((s) => s.imgData);
                break;

            default:
                throw new Error("Unknown message type: " + data.type);
        }
    }

    handleBinaryMessage(arrayBuffer) {
        const u8 = new Uint8Array(arrayBuffer);
        const view = new DataView(arrayBuffer);
        let off = 0;
        const type = view.getUint8(off);
        off += 1;
        if (type === 10) {
            const idLen = view.getUint8(off);
            off += 1;
            const dec = new TextDecoder();
            const myId = dec.decode(u8.subarray(off, off + idLen));
            off += idLen;
            const innerType = view.getUint8(off);
            off += 1;
            if (innerType !== 11) return;
            const count = view.getUint16(off, true);
            off += 2;
            this.players.clear();
            for (let i = 0; i < count; i++) {
                const pidLen = view.getUint8(off);
                off += 1;
                const pid = dec.decode(u8.subarray(off, off + pidLen));
                off += pidLen;
                const pos = [view.getFloat32(off, true), view.getFloat32(off + 4, true)];
                off += 8;
                const dir = [view.getFloat32(off, true), view.getFloat32(off + 4, true)];
                off += 8;
                const plane = [view.getFloat32(off, true), view.getFloat32(off + 4, true)];
                off += 8;
                const health = view.getFloat32(off, true);
                off += 4;
                this.players.set(
                    pid,
                    new Player(pos, dir, plane, pid, false, false, false, false, false, false, 0, true, false, health, false, 0),
                );
            }
            this.id = myId;
            this.me = this.players.get(this.id);
        } else if (type === 11) {
            const dec = new TextDecoder();
            const playerCount = view.getUint16(off, true);
            off += 2;
            for (let i = 0; i < playerCount; i++) {
                const pidLen = view.getUint8(off);
                off += 1;
                const pid = dec.decode(u8.subarray(off, off + pidLen));
                off += pidLen;
                const pos = [view.getFloat32(off, true), view.getFloat32(off + 4, true)];
                off += 8;
                const dir = [view.getFloat32(off, true), view.getFloat32(off + 4, true)];
                off += 8;
                const plane = [view.getFloat32(off, true), view.getFloat32(off + 4, true)];
                off += 8;
                const health = view.getFloat32(off, true);
                off += 4;

                let playerToUpdate = this.players.get(pid);

                if (playerToUpdate) {
                    // Player already exists, update properties
                    playerToUpdate.pos = pos;
                    playerToUpdate.dir = dir;
                    playerToUpdate.plane = plane;
                    playerToUpdate.health = health;
                } else {
                    playerToUpdate = new Player(pos, dir, plane, pid, false, false, false, false, false, false, 0, true, false, health, false, 0);
                    this.players.set(pid, playerToUpdate);
                }

                if (pid === this.id) {
                    // Apply server's authoritative state
                    this.me.pos = pos; 
                    this.me.dir = dir;
                    this.me.plane = plane;
                    this.me.health = health;

                    // Re-apply any unacknowledged client-side inputs (e.g., mouse rotation)
                    // The client-side prediction in updatePlayer for movement means we already have a smooth local view.
                    // More advanced techniques involve storing a history of client inputs and re-simulating from the reconciled state.
                }
            }
            const spriteCount = view.getUint16(off, true);
            off += 2;
            for (let i = 0; i < spriteCount; i++) {
                const tagLen = view.getUint8(off);
                off += 1;
                const tag = dec.decode(u8.subarray(off, off + tagLen));
                off += tagLen;
                const pos = [view.getFloat32(off, true), view.getFloat32(off + 4, true)];
                off += 8;
                const health = view.getFloat32(off, true);
                off += 4;

                // Find the existing sprite and update its health
                const spriteToUpdate = this.visibleSprites.find((s) => s.tag === tag && s.pos[0] === pos[0] && s.pos[1] === pos[1]);
                if (spriteToUpdate) {
                    spriteToUpdate.health = health;
                }
            }
        }
    }

    handleKeyDown(keyCode) {
        if (!this.me) return false;

        let changed = false;
        switch (keyCode) {
            case "Space":
                if (this.me.isGrounded) {
                    this.me.isJumping = true;
                    changed = true;
                }
                break;
            case "KeyF": // Fire button
                if (!this.me.shooting) {
                    this.me.shooting = true;
                    this.me.shotDisplayTime = 0.1; // Revert to a reasonable display time
                    changed = true;
                }
                break;
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
            case "KeyA":
                if (!this.me.movingLeft) {
                    this.me.movingLeft = true;
                    changed = true;
                }
                break;
            case "ArrowRight":
                if (!this.me.turningRight) {
                    this.me.turningRight = true;
                    changed = true;
                }
                break;
            case "KeyD":
                if (!this.me.movingRight) {
                    this.me.movingRight = true;
                    changed = true;
                }
                break;
            case "KeyM":
                this.mapShown = !this.mapShown;
                break;
        }
        return changed;
    }

    handleKeyUp(keyCode) {
        if (!this.me) return false;

        let changed = false;
        switch (keyCode) {
            case "KeyF": // Fire button
                if (this.me.shooting) {
                    this.me.shooting = false; // Reset shooting state as shot is instant
                    changed = true;
                }
                break;
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
            case "KeyA":
                if (this.me.movingLeft) {
                    this.me.movingLeft = false;
                    changed = true;
                }
                break;
            case "ArrowRight":
                if (this.me.turningRight) {
                    this.me.turningRight = false;
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
        this.me.rotate(movementX * -0.001 * GAME_CONFIG.SENSITIVITY);
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
            z: this.me.pos[2],
            vZ: this.me.vZ,
            isGrounded: this.me.isGrounded,
            health: this.me.health,
        };
    }

    update(deltaTime) {
        if (this.me) {
            updatePlayer(this.me, deltaTime);
            if (this.me.shooting) {
                common.performShot(this.me, this.players, this.spritePool.items, common.GAME_CONSTANTS.DAMAGE_AMOUNT);
                this.me.shooting = false; // Instant shot, reset immediately
            }
            // Decrement shotDisplayTime for visual feedback
            if (this.me.shotDisplayTime > 0) {
                this.me.shotDisplayTime -= deltaTime;
                if (this.me.shotDisplayTime < 0) this.me.shotDisplayTime = 0;
            }
        }
    }

    render(ctx, backCtx, deltaTime) {
        if (!this.me) return; // Add this check

        this.visibleSprites = [
            { pos: [21.5, 2.5], imgData: this.spriteImageDataCache.get("pillar.png"), tag: "enemy" },
            ...Array.from(this.players.values())
                .filter((player) => player.id !== this.id)
                .map((player) => ({ pos: player.pos, imgData: this.spriteImageDataCache.get("barrel.png"), tag: "player" })),
        ].filter((s) => s.imgData);

        resetSpritePool(this.spritePool, this.visibleSprites);
        this.backImageData.data.fill(0);

        renderFloorAndCeiling(ctx, this.me, this.backImageData, this.floorTexture, this.ceilingTexture);
        renderWalls(ctx, common.map, this.me, this.zBuffer, this.backImageData, this.wallTextures);
        renderSprites(this.me, this.spritePool.items, this.zBuffer, this.backImageData);

        displaySwapBackImageData(backCtx, this.backImageData, ctx);

        renderFPS(ctx, deltaTime);
        this.renderPlayerInfo(ctx);

        // Draw gun sprite
        let currentGunImage = this.processedGunImage;
        if (this.me.shotDisplayTime > 0) { // Use shotDisplayTime for visual feedback
            currentGunImage = this.processedGunFireImage; // Use the processed image
        }

        if (currentGunImage) {
            const gunWidth = 156;
            const gunHeight = 156;
            const gunX = (ctx.canvas.width - gunWidth) / 2;
            const gunY = ctx.canvas.height - gunHeight;
            ctx.drawImage(currentGunImage, gunX, gunY, gunWidth, gunHeight);
        }

        if (this.mapShown) this.renderMinimap(ctx, common.map, this.me, this.players, this.visibleSprites);
    }

    renderPlayerInfo(ctx) {
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText(`Player ID: ${this.id}`, 20, 20);

        // Health bar
        const healthBarWidth = 200;
        const healthBarHeight = 20;
        const healthBarX = 20;
        const healthBarY = 50;

        // Background
        ctx.fillStyle = "gray";
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

        // Health fill
        const healthPercentage = this.me.health / common.GAME_CONSTANTS.MAX_HEALTH;
        const currentHealthWidth = healthBarWidth * healthPercentage;
        ctx.fillStyle = "red";
        ctx.fillRect(healthBarX, healthBarY, currentHealthWidth, healthBarHeight);

        // Border
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

        // Health percentage text
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
            `${Math.round(healthPercentage * 100)}%`,
            healthBarX + healthBarWidth / 2,
            healthBarY + healthBarHeight / 2,
        );
    }

    renderMinimap(ctx, map, player, players, sprites) {
        drawMap(ctx, map, this.minimapWallImages);
        drawPlayersOnMap(ctx, players);
        drawSpritesOnMap(ctx, sprites);
    }
}

function convertImageToImageData(image) {
    if (!image) {
        console.error("Attempted to convert an invalid image to ImageData.", image);
        return null;
    }
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d canvas is not supported");
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    return imageData;
}

function makeBlackPixelsTransparent(image) {
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return image; // Fallback if canvas context is not available

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // If the pixel is black, make it transparent
        if (r === 0 && g === 0 && b === 0) {
            pixels[i + 3] = 0; // Alpha channel
        }
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
}
