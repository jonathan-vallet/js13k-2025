function getAABB(tileName, px, py) {
  const padding = TILE_DATA[tileName].collisionPadding || [0, 0, 0, 0];
  return {
    l: px + padding[3],
    r: px + TILE_SIZE - padding[1],
    t: py + padding[0],
    b: py + TILE_SIZE - padding[2],
  };
}

function aabbOverlap(a, b) {
  return !(a.r <= b.l || a.l >= b.r || a.b <= b.t || a.t >= b.b);
}

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
