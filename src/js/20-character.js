/**
 * Character
 * This file contains the logic for moving the character on the grid and performing actions
 * @module 50-character
 */

// Initialize the character on the grid at the start of the game
let characterScale = 1;
let characterDirection; // Track the current direction
let characterX = characterInitialX * TILE_SIZE;
let characterY = characterInitialY * TILE_SIZE;
let characterSpeed = 1; // en pixels par frame
let isCharacterMoving;
let characterMoveStartX = characterX;
let characterMoveStartY = characterY;
let characterMoveTargetX = characterX;
let characterMoveTargetY = characterY;
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

  const characterTile = TILE_DATA['characters'].tiles[characterMoveFrame + 9 * characterData.gender];
  const characterColors = TILE_DATA['characters'].colors;
  ctx.save();
  ctx.scale(zoomFactor, zoomFactor); // Applique le zoom global
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
  const blockingTiles = ['tree', 'bush'];
  const fallTiles = ['hole', 'water'];

  // Blocking tiles
  const collisionPadding = TILE_DATA[tileName].collisionPadding || [0, 0, 0, 0];
  const cornersBlock = getCorners(x, y, collisionPadding);

  for (const { x: cx, y: cy } of cornersBlock) {
    const tileX = Math.floor(cx / TILE_SIZE);
    const tileY = Math.floor(cy / TILE_SIZE);

    if (tileX < 0 || tileY < 0 || tileX >= WORLD_WIDTH || tileY >= WORLD_HEIGHT) return false;

    const tile = map[tileY][tileX];
    if (blockingTiles.includes(tile)) {
      return { x: tileX, y: tileY, tile }; // Return the blocking tile
    }
  }

  if (!canFall) {
    return null; // If falling is not allowed, we stop here
  }

  // Falling detection (more lenient)
  const holePadding = TILE_DATA[tileName].holePadding || [0, 0, 0, 0];
  const cornersHole = getCorners(x, y, holePadding);

  for (const { x: cx, y: cy } of cornersHole) {
    const tileX = Math.floor(cx / TILE_SIZE);
    const tileY = Math.floor(cy / TILE_SIZE);

    if (tileX < 0 || tileY < 0 || tileX >= WORLD_WIDTH || tileY >= WORLD_HEIGHT) continue;

    const tile = map[tileY][tileX];
    if (fallTiles.includes(tile)) {
      triggerFallAnimation(x, y);
      return { x: tileX, y: tileY, tile };
    }
  }

  return null;
}

function getCorners(x, y, padding) {
  return [
    { x: x + padding[3], y: y + padding[0] },
    { x: x + TILE_SIZE - padding[1], y: y + padding[0] },
    { x: x + padding[3], y: y + TILE_SIZE - padding[2] },
    { x: x + TILE_SIZE - padding[1], y: y + TILE_SIZE - padding[2] },
  ];
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
  // Falling detection (more lenient)
  const padHole = TILE_DATA['characters'].holePadding;
  const cornersHole = getCorners(characterX, characterY, padHole);

  for (const { x: cx, y: cy } of cornersHole) {
    const tileX = Math.floor(cx / TILE_SIZE);
    const tileY = Math.floor(cy / TILE_SIZE);

    const tile = getTileAt(tileX, tileY, ['cat']);
    if (tile) {
      removeTile('cat', tileX, tileY);
      ++collectedCatsNumber;
      return false;
    }
  }
}

function tryLaunchFireball() {
  let { dx, dy } = getDirectionOffsets(characterDirection);
  let x = characterX / TILE_SIZE + (dx * 0.5 || 0.1);
  let y = characterY / TILE_SIZE + dy * 0.5;

  let fireballTile = addTile('fireball', x, y);
  fireballTile.moveDirection = characterDirection;
  return true;
}
