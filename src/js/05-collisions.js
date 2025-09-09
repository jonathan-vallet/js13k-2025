/**
 * Get the axis-aligned bounding box (AABB) for a tile
 * @param {string} tileName - The name of the tile
 * @param {number} px - The x-coordinate
 * @param {number} py - The y-coordinate
 * @returns {Object} - The AABB object with left, right, top, and bottom properties
 */
function getAABB(tileName, px, py) {
  const padding = TILE_DATA[tileName]._collisionPadding || [0, 0, 0, 0];
  return {
    l: px + padding[3],
    r: px + TILE_SIZE - padding[1],
    t: py + padding[0],
    b: py + TILE_SIZE - padding[2] + (tileName === 'character' ? TILE_SIZE / 2 : 0),
  };
}

function getTileAABB(tile) {
  return getAABB(tile.tile, tile.x * TILE_SIZE, tile.y * TILE_SIZE);
}

function getTilesInAABB(box) {
  const minX = clamp((box.l / TILE_SIZE) | 0, 0, WORLD_WIDTH - 1);
  const maxX = clamp(((box.r - 1) / TILE_SIZE) | 0, 0, WORLD_WIDTH - 1);
  const minY = clamp((box.t / TILE_SIZE) | 0, 0, WORLD_HEIGHT - 1);
  const maxY = clamp(((box.b - 1) / TILE_SIZE) | 0, 0, WORLD_HEIGHT - 1);

  const out = [];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      out.push({ x, y });
    }
  }
  return out;
}

/**
 * Check if two AABBs overlap
 * @param {Object} a - The first AABB
 * @param {Object} b - The second AABB
 * @returns {boolean} - True if they overlap, false otherwise
 */
function aabbOverlap(a, b) {
  return !(a.r <= b.l || a.l >= b.r || a.b <= b.t || a.t >= b.b);
}

/**
 * Check if the character is touching any traps
 */
function checkDamages() {
  if (isInvulnerable) {
    return;
  }

  // Hitbox pixel perfect
  const charBox = getAABB('character', characterX, characterY);

  for (const trap of TRAP_LIST) {
    if (!trap._moveDirection) {
      continue; // Skip inactive traps
    }

    const trapPx = trap.x * TILE_SIZE;
    const trapPy = trap.y * TILE_SIZE;
    const trapBox = getAABB(trap.tile, trapPx, trapPy);

    if (aabbOverlap(charBox, trapBox)) {
      takeDamage();
      break; // one hit per frame
    }
  }

  for (const { x: tx, y: ty } of getTilesInAABB(charBox)) {
    const tileName = collisionMaps[currentSeason][ty]?.[tx];
    if (tileName !== 'spikes') {
      continue;
    }

    // Spikes don't deal damage at it's first  frame
    const spikeTile = getTileAt(tx, ty);
    if (!spikeTile || (spikeTile._animationFrame || 0) === 0) {
      continue;
    }

    const spikeBox = getAABB('spikes', tx * TILE_SIZE, ty * TILE_SIZE);
    if (aabbOverlap(charBox, spikeBox)) {
      takeDamage();
      break; // one hit per frame
    }
  }

  for (const enemy of ENEMY_LIST) {
    const tileX = enemy.x * TILE_SIZE;
    const tileY = enemy.y * TILE_SIZE;

    const enemyBox = getAABB(enemy.tile, tileX, tileY);
    if (aabbOverlap(charBox, enemyBox)) {
      takeDamage();
      break; // one hit per frame
    }
  }
}

function isLineClear(y, x1, x2) {
  if (x1 === x2) {
    return true;
  }
  const map = collisionMaps[currentSeason];
  const step = x2 > x1 ? 1 : -1;
  for (let x = x1 + step; x !== x2; x += step) {
    if (x < 0 || x >= WORLD_WIDTH) return false;
    if (BLOCKING_TILES.includes(map[y][x])) return false;
  }
  return true;
}

function isRowClear(x, y1, y2) {
  if (y1 === y2) return true; // rien à scanner
  const map = collisionMaps[currentSeason];
  const step = y2 > y1 ? 1 : -1;
  for (let y = y1 + step; y !== y2; y += step) {
    if (y < 0 || y >= WORLD_HEIGHT) return false;
    if (BLOCKING_TILES.includes(map[y][x])) return false;
  }
  return true;
}
