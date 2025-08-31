/**
 * Character
 * This file contains the logic for moving the character on the grid and performing actions
 * @module 50-character
 */

// Initialize the character on the grid at the start of the game
let characterScale = 1;
let characterFlipHorizontally = false;
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

  const characterTile = TILE_DATA['witch'].tiles[characterMoveFrame];
  let characterColors = TILE_DATA['witch'].colors;

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
    flipHorizontally: characterFlipHorizontally,
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

  // 1) Détection de blocage via AABB + tuiles recouvertes
  const blockBox = getAABB(tileName, x, y); // inclut le collisionPadding du tileName
  for (const { x: tx, y: ty } of getTilesInAABB(blockBox)) {
    if (tx < 0 || ty < 0 || tx >= WORLD_WIDTH || ty >= WORLD_HEIGHT) return false;
    const tile = map[ty][tx];
    if (BLOCKING_TILES.includes(tile)) {
      return { x: tx, y: ty, tile }; // tuile bloquante rencontrée
    }
  }

  if (!canFall) return null;

  // 2) Détection de chute (plus clémente) via une AABB "HOLE_PADDING"
  const fallBox = {
    l: x + HOLE_PADDING[3],
    r: x + TILE_SIZE - HOLE_PADDING[1],
    t: y + HOLE_PADDING[0] + TILE_SIZE / 3,
    b: y + TILE_SIZE - HOLE_PADDING[2] + TILE_SIZE / 2,
  };

  for (const { x: tx, y: ty } of getTilesInAABB(fallBox)) {
    if (tx < 0 || ty < 0 || tx >= WORLD_WIDTH || ty >= WORLD_HEIGHT) continue;
    const tile = map[ty][tx];
    if (tile === 'hole' || tile === 'water') {
      takeDamage();
      triggerFallAnimation(x, y);
      return { x: tx, y: ty, tile };
    }
  }

  return null;
}

function triggerFallAnimation(targetX, targetY) {
  isCharacterFalling = true;
  isFallingAnimationActive = true;

  playActionSound('fall');
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
      return 1;
    case ORIENTATION_RIGHT:
    case ORIENTATION_LEFT:
      return 2;
    case ORIENTATION_DOWN:
      return 0;
  }
}

function tryPerformCharacterAction() {
  // Try picking cat
  const interactBox = {
    l: characterX + HOLE_PADDING[3],
    r: characterX + TILE_SIZE - HOLE_PADDING[1],
    t: characterY + HOLE_PADDING[0],
    b: characterY + TILE_SIZE - HOLE_PADDING[2] + TILE_SIZE / 2,
  };

  for (const { x: tileX, y: tileY } of getTilesInAABB(interactBox)) {
    // Cat tile found: collect it
    if (getTileAt(tileX, tileY, ['cat'])) {
      removeTile('cat', tileX, tileY);
      ++collectedCatsNumber;
    }
    if (getTileAt(tileX, tileY, ['orb'])) {
      characterMaxLife += 1;
      const unlockedSeason = getTileAt(tileX, tileY, ['orb']).season;
      changeSeason(unlockedSeason);
      availableSeasons.push(unlockedSeason);
      removeTile('orb', tileX, tileY);
    }
    // Sets new respawn point when checkpoint is reached
    if (getTileAt(tileX, tileY, ['checkpoint'])) {
      saveGame();
    }

    // Checks if a trap can be triggered
    TRAP_LIST.forEach((trap) => {
      if (trap.moveDirection) {
        return;
      }

      // Triggers trap if character is at same row or line, and no obstacle is in between
      if (trap.x === tileX && isRowClear(tileX, tileY, trap.y)) {
        trap.moveDirection = tileY < trap.y ? ORIENTATION_UP : ORIENTATION_DOWN;
      } else if (trap.y === tileY && isLineClear(tileY, tileX, trap.x)) {
        trap.moveDirection = tileX < trap.x ? ORIENTATION_LEFT : ORIENTATION_RIGHT;
      }
      if (trap.tile === 'follow-trap' && trap.moveDirection) {
        playActionSound('follow-trap', true);
      }
    });
  }
}

function launchFireball() {
  let { dx, dy } = getDirectionOffsets(characterDirection);
  let x = characterX / TILE_SIZE + (dx * 0.5 || 0.1);
  let y = characterY / TILE_SIZE - (dy < 0 ? 0.2 : dy > 0 ? -0.8 : 0) + Math.abs(dx) * 0.5;

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
  return !!currentReadingText;
}

/**
 * If player is on a trigger and press action, change to next available season
 */
function tryChangeSeason() {
  const charBox = getAABB('witch', characterX, characterY);
  for (const { x: tx, y: ty } of getTilesInAABB(charBox)) {
    const tile = getTileAt(tx, ty, ['trigger']);
    let nextSeason = availableSeasons[(availableSeasons.indexOf(currentSeason) + 1) % availableSeasons.length];
    if (tile) {
      changeSeason(nextSeason);
      return true;
    }
  }
  return false;
}
