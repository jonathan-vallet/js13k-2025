/**
 * Get collision box applying a padding around the item
 * @param {number} x
 * @param {number} y
 * @param {Array<number>} padding
 * @returns {Array} - Array of corner points
 */
function getCorners(x, y, padding) {
  return [
    { x: x + padding[3], y: y + padding[0] },
    { x: x + TILE_SIZE - padding[1], y: y + padding[0] },
    { x: x + padding[3], y: y + TILE_SIZE - padding[2] },
    { x: x + TILE_SIZE - padding[1], y: y + TILE_SIZE - padding[2] },
  ];
}

/**
 * Get the axis-aligned bounding box (AABB) for a tile
 * @param {string} tileName - The name of the tile
 * @param {number} px - The x-coordinate
 * @param {number} py - The y-coordinate
 * @returns {Object} - The AABB object with left, right, top, and bottom properties
 */
function getAABB(tileName, px, py) {
  const padding = TILE_DATA[tileName].collisionPadding || [0, 0, 0, 0];
  return {
    l: px + padding[3],
    r: px + TILE_SIZE - padding[1],
    t: py + padding[0],
    b: py + TILE_SIZE - padding[2],
  };
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
function checkTrapDamage() {
  if (isInvulnerable) {
    return;
  }

  // Hitbox pixel perfect
  const charBox = getAABB('characters', characterX, characterY);

  for (const trap of TRAP_LIST) {
    if (!trap.moveDirection) {
      continue; // Skip inactive traps
    }

    const trapPx = trap.x * TILE_SIZE;
    const trapPy = trap.y * TILE_SIZE;
    const trapBox = getAABB('blade-trap', trapPx, trapPy);

    if (aabbOverlap(charBox, trapBox)) {
      takeDamage();
      break; // one hit per frame
    }
  }

  // Check if an active spike is hitting the character
  const spikesCorners = getCorners(characterX, characterY, HOLE_PADDING);

  for (const { x: cx, y: cy } of spikesCorners) {
    const tileX = getTileCoord(cx);
    const tileY = getTileCoord(cy);

    const tile = collisionMaps[currentSeason][tileY][tileX];
    if (['spikes'].includes(tile)) {
      // Spikes don't deal damage at it's first  frame
      if (getTileAt(tileX, tileY).animationFrame > 0) {
        takeDamage();
        break;
      }
    }
  }
}
