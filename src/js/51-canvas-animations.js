/**
 * Canvas animations functions to change tile frames and animate the level
 * @module 51-canvas-animations
 */

/**
 * Main animation loop
 * @param {number} timestamp - The current timestamp
 */
function animate(timestamp) {
  const deltaTime = timestamp - lastFrameTime;

  updateAnimations(deltaTime);
  updateFallAnimation(timestamp);

  refreshCanvas();
  lastFrameTime = timestamp;
  handleGamepadInput();

  requestAnimationFrame(animate);
}

/**
 * Update the animation frames of all animated tiles
 * @param {number} deltaTime - The time elapsed since the last frame
 */
function updateAnimations(deltaTime) {
  world.levelData.forEach((tile) => {
    // Checks tiles which have multiple frames to animate them
    if (TILE_DATA[tile.tile].tiles.length > 1) {
      tile.elapsed = (tile.elapsed || 0) + deltaTime;
      const interval = TILE_DATA[tile.tile].animationSpeed;
      if (tile.elapsed >= interval) {
        tile.animationFrame = (tile.animationFrame + 1) % TILE_DATA[tile.tile].tiles.length || 0;
        tile.elapsed = 0;
      }
    }

    // Checks tiles which have a direction to move
    if (typeof tile.moveDirection !== 'undefined') {
      let { dx, dy } = getDirectionOffsets(tile.moveDirection);
      let moveSpeed = TILE_DATA[tile.tile].moveSpeed || 1;
      tile.x += (dx * moveSpeed) / deltaTime;
      tile.y += (dy * moveSpeed) / deltaTime;
    }
  });

  if (!isCharacterFalling && keyStack.length > 0) {
    const pressedKeys = new Set(keyStack);
    let dx = 0;
    let dy = 0;

    if (keyStack.length > 0) {
      // Regarde les deux dernières touches pressées
      const directions = keyStack.slice(-2).reverse(); // plus récente en premier

      for (const dir of directions) {
        switch (dir) {
          case 'left':
            if (dx === 0) dx = -1;
            break;
          case 'right':
            if (dx === 0) dx = 1;
            break;
          case 'up':
            if (dy === 0) dy = -1;
            break;
          case 'down':
            if (dy === 0) dy = 1;
            break;
        }
      }
    }

    // Normalise le vecteur pour éviter la double vitesse en diagonale
    if (dx !== 0 || dy !== 0) {
      const nextX = characterX + dx * characterSpeed;
      const nextY = characterY + dy * characterSpeed;
      let hasMovedHorizontally = false;
      let hasMovedVertically = false;

      // Check horizontal movement
      if (characterX !== nextX) {
        if (canMoveTo(nextX, characterY)) {
          characterX = nextX;
          hasMovedHorizontally = true;
        } else if (!isCharacterFalling) {
          // If cannot move but is near a free tile, try to move vertically
          if (canMoveTo(nextX, characterY + 5)) {
            characterY += 1;
            hasMovedVertically = true;
          } else if (canMoveTo(nextX, characterY - 5)) {
            characterY -= 1;
            hasMovedVertically = true;
          }
        }
      }

      if (!hasMovedVertically) {
        if (canMoveTo(characterX, nextY)) {
          characterY = nextY;
        } else if (!hasMovedHorizontally && !isCharacterFalling) {
          if (canMoveTo(characterX + 5, nextY)) {
            characterX += 1;
          } else if (canMoveTo(characterX - 5, nextY)) {
            characterX -= 1;
          }
        }
      }

      // 🔁 Orientation : selon la dernière direction pressée
      for (let i = keyStack.length - 1; i >= 0; i--) {
        switch (keyStack[i]) {
          case 'left':
            setCharacterDirection(ORIENTATION_LEFT);
            i = -1;
            break;
          case 'right':
            setCharacterDirection(ORIENTATION_RIGHT);
            i = -1;
            break;
          case 'up':
            setCharacterDirection(ORIENTATION_UP);
            i = -1;
            break;
          case 'down':
            setCharacterDirection(ORIENTATION_DOWN);
            i = -1;
            break;
        }
      }

      tryPerformCharacterAction();

      // Mets à jour l’animation du personnage
      updateCharacterWalkAnimation(deltaTime);
    }
  }
}

let walkAnimationTimer = 0;
let walkFrameIndex = 0;
const WALK_FRAME_INTERVAL = 120;

function updateCharacterWalkAnimation(deltaTime) {
  walkAnimationTimer += deltaTime;
  const base = getMoveFrameFromDirection(characterDirection);
  const sequence = [base + 3, base, base + 6, base];

  if (walkAnimationTimer >= WALK_FRAME_INTERVAL) {
    walkAnimationTimer = 0;

    // Fait tourner l'index (0 → 1 → 2 → 0 → ...)
    walkFrameIndex = (walkFrameIndex + 1) % sequence.length;
  }

  characterMoveFrame = sequence[walkFrameIndex];
}

function updateFallAnimation(timestamp) {
  if (!isFallingAnimationActive) return;

  const elapsed = timestamp - fallAnimationStartTime;
  const progress = clamp(elapsed / FALL_ANIMATION_DURATION, 0, 1);

  // Déplacement progressif vers le trou
  characterX = fallStartX + (fallTargetX - fallStartX) * progress;
  characterY = fallStartY + (fallTargetY - fallStartY) * progress;
  // Échelle du perso
  characterScale = 1 - progress;

  if (progress >= 1) {
    isFallingAnimationActive = false;
    isCharacterFalling = false;
    characterScale = 1;

    // Respawn 3 pixels en arrière
    const respawnX = Math.floor(fallTargetX - fallDx * TILE_SIZE * 0.7);
    const respawnY = Math.floor(fallTargetY - fallDy * TILE_SIZE * 0.7);
    respawnCharacter(respawnX, respawnY);
  }
}
