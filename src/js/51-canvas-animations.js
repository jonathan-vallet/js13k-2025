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
    if (TILE_DATA[tile.tile].tiles.length > 1) {
      tile.elapsed = (tile.elapsed || 0) + deltaTime;
      const interval = ANIMATION_INTERVAL[tile.tile];
      if (tile.elapsed >= interval) {
        tile.animationFrame = (tile.animationFrame + 1) % TILE_DATA[tile.tile].tiles.length || 0;
        tile.elapsed = 0;
      }
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
      const length = Math.hypot(dx, dy);
      dx /= length;
      dy /= length;

      const nextX = characterX + dx * characterSpeed;
      const nextY = characterY + dy * characterSpeed;

      if (canMoveTo(nextX, characterY)) {
        characterX = nextX;
      }
      if (canMoveTo(characterX, nextY)) {
        characterY = nextY;
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

      // Mets à jour l’animation du personnage
      updateCharacterWalkAnimation(deltaTime);
    } else {
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
    const respawnX = fallTargetX - fallDx * TILE_SIZE * 0.7;
    const respawnY = fallTargetY - fallDy * TILE_SIZE * 0.7;
    respawnCharacter(respawnX, respawnY);
  }
}

function checkCrateInHole(crate) {
  const holeTileAtPosition = getTileAt(crate.x, crate.y, ['hole', 'trap']);
  if (holeTileAtPosition) {
    removeTile(holeTileAtPosition.tile, crate.x, crate.y);
    removeTile('crate', crate.x, crate.y);
    addTile('hole-filled', crate.x, crate.y, { isUnder: true });
    playActionSound('fall');
  }
}
