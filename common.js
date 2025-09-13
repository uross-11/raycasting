export const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 4, 0, 4, 0, 4, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 2, 0, 2, 2, 0, 0, 0, 0, 4, 0, 4, 0, 4, 0, 0, 0, 1],
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

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
    return a * (1 - t) + b * t;
}

export function mapKeyCode(code) {
    switch (code) {
        case "ArrowUp":
        case "KeyW":
            return 0;
        case "ArrowDown":
        case "KeyS":
            return 1;
        case "ArrowLeft":
            return 2;
        case "ArrowRight":
            return 3;
        case "KeyA":
            return 6;
        case "KeyD":
            return 7;
        case "KeyF":
            return 8;
        default:
            return 255;
    }
}

export function rotateVectors(dir, plane, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const oldDirX = dir[0];
    const oldPlaneX = plane[0];
    const newDir = [dir[0] * cos - dir[1] * sin, oldDirX * sin + dir[1] * cos];
    const newPlane = [plane[0] * cos - plane[1] * sin, oldPlaneX * sin + plane[1] * cos];
    return { dir: newDir, plane: newPlane };
}

export function writeVector(view, off, vector) {
    view.setFloat32(off, vector[0], true);
    off += 4;
    view.setFloat32(off, vector[1], true);
    off += 4;
    return off;
}

export function readVector(view, off) {
    const x = view.getFloat32(off, true);
    off += 4;
    const y = view.getFloat32(off, true);
    off += 4;
    return { vector: [x, y], off };
}

export function writeString(view, off, str) {
    const bytes = new TextEncoder().encode(str);
    view.setUint8(off, bytes.length);
    off += 1;
    new Uint8Array(view.buffer, off, bytes.length).set(bytes);
    off += bytes.length;
    return off;
}

export function readString(view, off, u8) {
    const len = view.getUint8(off);
    off += 1;
    const str = new TextDecoder().decode(u8.subarray(off, off + len));
    off += len;
    return { str, off };
}

export function tryMovePosition(pos, dx, dy, levelMap) {
    const nx = pos[0] + dx;
    const ny = pos[1] + dy;
    const result = [pos[0], pos[1]];
    if (levelMap[~~pos[1]]?.[~~nx] === 0) result[0] = nx;
    if (levelMap[~~ny]?.[~~result[0]] === 0) result[1] = ny;
    return result;
}

export function isCollidingWithWidth(y, x, playerWidth, levelMap) {
    return (
        levelMap[~~(y - playerWidth)]?.[~~(x - playerWidth)] !== 0 ||
        levelMap[~~(y + playerWidth)]?.[~~(x - playerWidth)] !== 0 ||
        levelMap[~~(y - playerWidth)]?.[~~(x + playerWidth)] !== 0 ||
        levelMap[~~(y + playerWidth)]?.[~~(x + playerWidth)] !== 0
    );
}

export function tryMoveWithWidth(pos, dx, dy, playerWidth, levelMap) {
    let nx = pos[0] + dx;
    let ny = pos[1] + dy;
    let rx = pos[0];
    let ry = pos[1];
    if (!isCollidingWithWidth(pos[1], nx, playerWidth, levelMap)) rx = nx;
    if (!isCollidingWithWidth(ny, rx, playerWidth, levelMap)) ry = ny;
    return [rx, ry];
}

export function displaySwapBackImageData(backCtx, backImageData, ctx) {
    backCtx.putImageData(backImageData, 0, 0);
    ctx.drawImage(backCtx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function calculateDistance(pos1, pos2) {
    return Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2);
}

export function sortSpritesByDistance(sprites, playerPos) {
    sprites.sort((a, b) => {
        const distA = calculateDistance(playerPos, a.pos);
        const distB = calculateDistance(playerPos, b.pos);
        return distB - distA;
    });
}

export const GAME_CONSTANTS = {
    MOVE_SPEED: 3.0,
    ROTATION_SPEED: 3.0,
    PLAYER_WIDTH: 0.2,
    SENSITIVITY: 3,
    FACTOR: 50,
    TILE_SIZE: 10,
    MAP_SHOWN: false,
    MAX_HEALTH: 100,
    DAMAGE_AMOUNT: 10,
};

export const MOVE_SPEED = GAME_CONSTANTS.MOVE_SPEED;
export const ROTATION_SPEED = GAME_CONSTANTS.ROTATION_SPEED;
export const PLAYER_WIDTH = GAME_CONSTANTS.PLAYER_WIDTH;
export const SENSITIVITY = GAME_CONSTANTS.SENSITIVITY;
export const FACTOR = GAME_CONSTANTS.FACTOR;
export const TILE_SIZE = GAME_CONSTANTS.TILE_SIZE;
export const MAP_SHOWN = GAME_CONSTANTS.MAP_SHOWN;
export const MAX_HEALTH = GAME_CONSTANTS.MAX_HEALTH;
export const DAMAGE_AMOUNT = GAME_CONSTANTS.DAMAGE_AMOUNT;

export function intersectRayAABB(rayStartX, rayStartY, rayDirX, rayDirY, boxMinX, boxMinY, boxMaxX, boxMaxY) {
    const tMinX = (boxMinX - rayStartX) / rayDirX;
    const tMaxX = (boxMaxX - rayStartX) / rayDirX;
    const tMinY = (boxMinY - rayStartY) / rayDirY;
    const tMaxY = (boxMaxY - rayStartY) / rayDirY;

    const t1X = Math.min(tMinX, tMaxX);
    const t2X = Math.max(tMinX, tMaxX);
    const t1Y = Math.min(tMinY, tMaxY);
    const t2Y = Math.max(tMinY, tMaxY);

    const tNear = Math.max(t1X, t1Y);
    const tFar = Math.min(t2X, t2Y);

    if (tNear > tFar || tFar < 0) return Infinity;

    return tNear > 0 ? tNear : Infinity;
}

export function performShot(player, allEntities, damageAmount, isServer = false) {
    const rayDirX = player.dir[0];
    const rayDirY = player.dir[1];
    const playerPosX = player.pos[0];
    const playerPosY = player.pos[1];

    let closestHit = Infinity;
    let hitTarget = null;

    for (const targetEntity of allEntities.values()) {
        if (targetEntity.id === player.id) continue;

        let entityX, entityY, entityWidth;

        if (targetEntity.type === 'player') {
            entityX = targetEntity.pos[0];
            entityY = targetEntity.pos[1];
            entityWidth = GAME_CONSTANTS.PLAYER_WIDTH;
        } else if (targetEntity.type === 'enemy') {
            entityX = targetEntity.pos[0];
            entityY = targetEntity.pos[1];
            entityWidth = 0.5;
        } else {
            continue;
        }

        const boxMinX = entityX - entityWidth / 2;
        const boxMinY = entityY - entityWidth / 2;
        const boxMaxX = entityX + entityWidth / 2;
        const boxMaxY = entityY + entityWidth / 2;

        const hitDistance = intersectRayAABB(playerPosX, playerPosY, rayDirX, rayDirY, boxMinX, boxMinY, boxMaxX, boxMaxY);

        if (hitDistance < closestHit) {
            closestHit = hitDistance;
            hitTarget = targetEntity;
        }
    }

    if (hitTarget && closestHit < Infinity) {
        if (isServer && hitTarget.health !== undefined) {
            hitTarget.takeDamage(damageAmount);
        }
        return hitTarget;
    }
    return null;
}

export function applyInputToPlayer(player, deltaTime, levelMap) {
    const moveStep = MOVE_SPEED * deltaTime;
    const rotStep = ROTATION_SPEED * deltaTime;

    if (player.turningLeft) {
        const r = rotateVectors(player.dir, player.plane, rotStep);
        player.dir = r.dir;
        player.plane = r.plane;
    }
    if (player.turningRight) {
        const r = rotateVectors(player.dir, player.plane, -rotStep);
        player.dir = r.dir;
        player.plane = r.plane;
    }

    if (player.movingForward) {
        player.pos = tryMoveWithWidth(
            player.pos,
            player.dir[0] * moveStep,
            player.dir[1] * moveStep,
            PLAYER_WIDTH,
            levelMap,
        );
    }
    if (player.movingBackward) {
        player.pos = tryMoveWithWidth(
            player.pos,
            -player.dir[0] * moveStep,
            -player.dir[1] * moveStep,
            PLAYER_WIDTH,
            levelMap,
        );
    }
    if (player.movingLeft) {
        player.strafe(-moveStep);
    }
    if (player.movingRight) {
        player.strafe(moveStep);
    }
}

export function encodePlayers(playersArr, spritesArr) {
    let size = 2;
    for (const p of playersArr) {
        size += 1 + new TextEncoder().encode(p.id).length + 4 * 7;
    }

    size += 2;
    for (const s of spritesArr) {
        size += 1 + new TextEncoder().encode(s.tag).length + 4 * 3;
    }

    const buf = new ArrayBuffer(size);
    const view = new DataView(buf);
    let off = 0;
    view.setUint16(off, playersArr.length, true);
    off += 2;
    for (const p of playersArr) {
        off = writeString(view, off, p.id);
        off = writeVector(view, off, p.pos);
        off = writeVector(view, off, p.dir);
        off = writeVector(view, off, p.plane);
        view.setFloat32(off, p.health, true);
        off += 4;
    }

    view.setUint16(off, spritesArr.length, true);
    off += 2;
    for (const s of spritesArr) {
        off = writeString(view, off, s.tag);
        off = writeVector(view, off, s.pos);
        view.setFloat32(off, s.health, true);
        off += 4;
    }
    return buf;
}

export function encodeUpdate(playersArr, spritesArr) {
    const encoded = encodePlayers(playersArr, spritesArr);
    const buf = new ArrayBuffer(1 + encoded.byteLength);
    const view = new DataView(buf);
    view.setUint8(0, MESSAGE_TYPE_UPDATE);
    new Uint8Array(buf, 1).set(new Uint8Array(encoded));
    return buf;
}

export function encodeHello(selfId, playersArr) {
    const playersBuf = encodePlayers(playersArr, []);
    const total = 1 + (1 + new TextEncoder().encode(selfId).length) + playersBuf.byteLength;
    const buf = new ArrayBuffer(total);
    const view = new DataView(buf);
    let off = 0;
    view.setUint8(off, MESSAGE_TYPE_HELLO);
    off += 1;
    off = writeString(view, off, selfId);
    new Uint8Array(buf, off).set(new Uint8Array(playersBuf));
    return buf;
}

export const MESSAGE_TYPE_IDENTIFY = 0;
export const MESSAGE_TYPE_MOVE_INPUT = 1;
export const MESSAGE_TYPE_SHOOT_ACTION = 2;
export const MESSAGE_TYPE_MOUSE_INPUT = 3;
export const MESSAGE_TYPE_HELLO = 10;
export const MESSAGE_TYPE_UPDATE = 11;

export function encodeIdentify(clientId) {
    const buf = new ArrayBuffer(1 + 1 + new TextEncoder().encode(clientId).length);
    const view = new DataView(buf);
    let off = 0;
    view.setUint8(off, MESSAGE_TYPE_IDENTIFY);
    off += 1;
    off = writeString(view, off, clientId);
    return buf;
}
