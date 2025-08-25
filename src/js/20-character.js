/**
 * Character
 * This file contains the logic for moving the character on the grid and performing actions
 * @module 50-character
 */

// Initialize the character on the grid at the start of the game
let characterScale = 1;
let characterDirection; // Track the current direction
let characterX;
let characterY;
let characterSpeed = 1; // en pixels par frame
let isCharacterMoving;
let characterMoveFrame = 0; // Frame of the character sprite to show
let characterMoveElapsedTime;

let characterReturnStartTime; // Start time for the character return animation
let characterRespawnStartX, characterRespawnStartY; // Start position for the character respawn
let characterRespawnTargetX, characterRespawnTargetY; // Target position for the character respawn

/**
 * Draw the character sprite on the canvas
 */
function drawCharacter() {
  const { offsetX, offsetY } = getCameraOffset();

  const drawX = characterX - offsetX * TILE_SIZE;
  const drawY = characterY - offsetY * TILE_SIZE;

  const characterTile = TILE_DATA['characters'].tiles[characterMoveFrame];
  let characterColors = TILE_DATA['characters'].colors;

  if (isInvulnerable) {
    const now = performance.now();
    if (Math.floor((now - invulnerabilityStartTime) / 200) % 2 === 0) {
      characterColors = COLOR_SETS['winter'];
    }
  }

  ctx.save();
  ctx.scale(zoomFactor, zoomFactor);
  if (characterScale !== 1) {
    ctx.translate(drawX, drawY);
  } else {
    ctx.translate(Math.floor(drawX), Math.floor(drawY));
  }
  drawTile(characterTile, characterColors, 0, 0, {
    scale: characterScale,
    flipHorizontally: characterDirection === ORIENTATION_RIGHT,
  });
  ctx.restore();
}

/**
 * Check if the character can move to the specified position
 * @param {string} tileName - The name of the tile
 * @param {number} x - The x-coordinate
 * @param {number} y - The y-coordinate
 * @param {number} dx - The x-direction of movement
 * @param {number} dy - The y-direction of movement
 * @returns {tile || null} - The tile at the destination or null if not blocked
 */
function getTileAtDestination(tileName, x, y, canFall = true) {
  const map = collisionMaps[currentSeason];

  // Blocking tiles
  const collisionPadding = TILE_DATA[tileName].collisionPadding || [0, 0, 0, 0];
  const cornersBlock = getCorners(x, y, collisionPadding);

  for (const { x: cx, y: cy } of cornersBlock) {
    const tileX = getTileCoord(cx);
    const tileY = getTileCoord(cy);

    if (tileX < 0 || tileY < 0 || tileX >= WORLD_WIDTH || tileY >= WORLD_HEIGHT) return false;

    const tile = map[tileY][tileX];
    if (BLOCKING_TILES.includes(tile)) {
      return { x: tileX, y: tileY, tile }; // Return the blocking tile
    }
  }

  if (!canFall) {
    return null; // If falling is not allowed (for traps and fireballs), we stop here
  }

  // Falling detection (more lenient)
  const cornersHole = getCorners(x, y, HOLE_PADDING);

  for (const { x: cx, y: cy } of cornersHole) {
    const tileX = getTileCoord(cx);
    const tileY = getTileCoord(cy);

    if (tileX < 0 || tileY < 0 || tileX >= WORLD_WIDTH || tileY >= WORLD_HEIGHT) {
      continue;
    }

    const tile = map[tileY][tileX];
    if (['hole', 'water'].includes(tile)) {
      takeDamage();
      triggerFallAnimation(x, y);
      return { x: tileX, y: tileY, tile: tile };
    }
  }

  return null;
}

function triggerFallAnimation(targetX, targetY) {
  isCharacterFalling = true;
  isFallingAnimationActive = true;
  fallAnimationStartTime = performance.now();

  fallStartX = characterX;
  fallStartY = characterY;

  // Calcule la direction de chute
  fallDx = Math.sign(targetX - characterX);
  fallDy = Math.sign(targetY - characterY);

  // Cible de l'animation visuelle de chute
  fallTargetX = characterX + fallDx * TILE_SIZE * 0.5;
  fallTargetY = characterY + fallDy * TILE_SIZE * 0.5;
  if (fallDy > 0) {
    fallTargetY += TILE_SIZE * 0.2;
  }
}

function respawnCharacter(targetX, targetY) {
  characterX = targetX;
  characterY = targetY;
}

function setCharacterDirection(direction) {
  characterDirection = direction;
  characterMoveFrame = getMoveFrameFromDirection(characterDirection);
}

function getMoveFrameFromDirection(direction) {
  switch (direction) {
    case ORIENTATION_UP:
      return 2;
    case ORIENTATION_RIGHT:
    case ORIENTATION_LEFT:
      return 1;
    case ORIENTATION_DOWN:
      return 0;
  }
}

function tryPerformCharacterAction() {
  // Try picking cat
  const cornersHole = getCorners(characterX, characterY, HOLE_PADDING);

  for (const { x: cx, y: cy } of cornersHole) {
    const tileX = getTileCoord(cx);
    const tileY = getTileCoord(cy);

    // Cat tile found: collect it
    if (getTileAt(tileX, tileY, ['cat'])) {
      removeTile('cat', tileX, tileY);
      ++collectedCatsNumber;
    }
    if (getTileAt(tileX, tileY, ['orb'])) {
      changeSeason(getTileAt(tileX, tileY, ['orb']).season);
      removeTile('orb', tileX, tileY);
    }
    // Sets new respawn point when checkpoint is reached
    if (getTileAt(tileX, tileY, ['checkpoint'])) {
      characterInitialX = tileX * TILE_SIZE;
      characterInitialY = tileY * TILE_SIZE;
    }
  }
}

function launchFireball() {
  let { dx, dy } = getDirectionOffsets(characterDirection);
  let x = characterX / TILE_SIZE + (dx * 0.5 || 0.1);
  let y = characterY / TILE_SIZE + dy * 0.5;

  let fireballTile = addTile('fireball', x, y);
  fireballTile.moveDirection = characterDirection;
  return true;
}

function tryReadSign() {
  if (characterDirection !== ORIENTATION_UP) {
    return;
  }
  const tileX = getTileCoord(characterX + TILE_SIZE / 2);
  const tileY = getTileCoord(characterY + TILE_SIZE / 4);

  const tile = getTileAt(tileX, tileY, ['sign']);
  currentReadingText = tile?.text;
}

function tryTriggerTrap() {
  const corners = getCorners(characterX, characterY, TILE_DATA['characters'].collisionPadding);
  for (const { x, y } of corners) {
    let tileX = getTileCoord(x);
    let tileY = getTileCoord(y);
    // Checks if path is clear between character and traps to trigger them
    TRAP_LIST.forEach((trap) => {
      if (trap.moveDirection) {
        return;
      }
      if (trap.x === tileX && isRowClear(tileX, tileY, trap.y)) {
        trap.moveDirection = tileY < trap.y ? ORIENTATION_UP : ORIENTATION_DOWN;
      } else if (trap.y === tileY && isLineClear(tileY, tileX, trap.x)) {
        trap.moveDirection = tileX < trap.x ? ORIENTATION_LEFT : ORIENTATION_RIGHT;
      }
    });
  }
  return false;
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
