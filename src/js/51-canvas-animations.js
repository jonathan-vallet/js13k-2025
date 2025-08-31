/**
 * Canvas animations functions to change tile frames and animate the level
 * @module 51-canvas-animations
 */

/**
 * Main animation loop
 * @param {number} timestamp - The current timestamp
 */

function animate(ts) {
  if (!lastTimestamp) lastTimestamp = ts;
  let frameMs = ts - lastTimestamp;

  // clamp to avoid huge jumps
  if (frameMs > 100) {
    frameMs = 100;
  }

  lastTimestamp = ts;
  accumulatedTime += frameMs;

  // 💡 exécute 0, 1 ou plusieurs updates **avec un delta constant**
  while (accumulatedTime >= FPS) {
    // 👉 Si updateAnimations attend des **ms** :
    updateAnimations(FPS);

    // 👉 Si updateFallAnimation utilise un timestamp absolu, tu peux l’appeler ici
    //    ou en dehors; comme elle est basée sur performance.now(), elle restera stable :
    updateFallAnimation(ts);

    accumulatedTime -= FPS;
  }

  // Un seul rendu par frame écran
  refreshCanvas();
  handleGamepadInput();
  requestAnimationFrame(animate);
}

/**
 * Update the animation frames of all animated tiles
 * @param {number} deltaTime - The time elapsed since the last frame
 */
function updateAnimations(deltaTime) {
  world.forEach((tile) => {
    // Checks tiles which have multiple frames to animate them
    if (TILE_DATA[tile.tile].animationSpeed) {
      tile.elapsed = (tile.elapsed || 0) + deltaTime;
      const interval = TILE_DATA[tile.tile].animationSpeed;
      if (tile.elapsed >= interval) {
        if (TILE_DATA[tile.tile].tiles.length < 2) {
          tile.flipHorizontally = !tile.flipHorizontally;
        }
        tile.animationFrame = (tile.animationFrame + 1) % TILE_DATA[tile.tile].tiles.length || 0;
        tile.elapsed = 0;
      }
    }

    // Checks tiles which have a direction to move
    let moveDirection = tile.moveDirection;
    if (moveDirection) {
      let { dx, dy } = getDirectionOffsets(moveDirection);
      let moveSpeed = TILE_DATA[tile.tile][tile.isReturning ? 'returningMoveSpeed' : 'moveSpeed'] || 1;
      let nextX = tile.x + (dx * moveSpeed) / deltaTime;
      let nextY = tile.y + (dy * moveSpeed) / deltaTime;

      tile.x = nextX;
      tile.y = nextY;

      let destinationTile = getTileAtDestination(tile.tile, nextX * TILE_SIZE, nextY * TILE_SIZE, false);
      if (destinationTile) {
        if (tile.tile === 'fireball') {
          tile.moveDirection = null; // Stop moving if blocked
          // Remove fireball from the world
          removeTile('fireball', tile.x, tile.y);
          if (destinationTile.tile === 'bush') {
            removeTile('bush', destinationTile.x, destinationTile.y);
            Object.keys(collisionMaps).forEach((season) => {
              collisionMaps[season][destinationTile.y][destinationTile.x] = null;
            });
          }
        }
        if (tile.tile === 'follow-trap') {
          tile.moveDirection = null; // Stop moving if blocked
          tile.x = Math.round(tile.x);
          tile.y = Math.round(tile.y);
          // Stops sound
          audioElements['follow-trap'].pause();
        }
        if (tile.tile === 'blade-trap') {
          if (!tile.isReturning) {
            tile.isReturning = true;
            // Moves in opposite direction
            tile.moveDirection = getOppositeDirection(tile.moveDirection);
          } else {
            tile.isReturning = false;
            tile.moveDirection = null;
          }
          tile.x = Math.round(tile.x);
          tile.y = Math.round(tile.y);
        }
        if (['skeleton', 'mommy'].includes(tile.tile)) {
          tile.moveDirection = getOppositeDirection(tile.moveDirection);
          tile.x = Math.round(tile.x);
          tile.y = Math.round(tile.y);
        }
      }

      // Checks if a fireball hits an enemy to remove him
      if (tile.tile === 'fireball') {
        const fireballBox = getAABB('fireball', tile.x * TILE_SIZE, tile.y * TILE_SIZE);
        for (let i = ENEMY_LIST.length - 1; i >= 0; --i) {
          const enemy = ENEMY_LIST[i];
          const enemyBox = getAABB(enemy.tile, enemy.x * TILE_SIZE, enemy.y * TILE_SIZE);
          if (aabbOverlap(fireballBox, enemyBox)) {
            // retire la mommy du niveau + de la liste dynamique
            removeTile(enemy.tile, enemy.x, enemy.y);
            ENEMY_LIST.splice(i, 1);

            // retire la fireball aussi
            removeTile('fireball', tile.x, tile.y);
            break;
          }
        }
      }
    }
  });

  if (!isCharacterFalling && !isFading && !isDying && keyStack.length > 0 && !currentReadingText) {
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
        if (!getTileAtDestination('characters', nextX, characterY)) {
          characterX = nextX;
          hasMovedHorizontally = true;
        } else if (!isCharacterFalling) {
          // If cannot move but is near a free tile, try to move vertically
          if (!getTileAtDestination('characters', nextX, characterY + 5)) {
            characterY += 1;
            hasMovedVertically = true;
          } else if (!getTileAtDestination('characters', nextX, characterY - 5)) {
            characterY -= 1;
            hasMovedVertically = true;
          }
        }
      }

      if (!hasMovedVertically) {
        if (!getTileAtDestination('characters', characterX, nextY)) {
          characterY = nextY;
        } else if (!hasMovedHorizontally && !isCharacterFalling) {
          if (!getTileAtDestination('characters', characterX + 5, nextY)) {
            characterX += 1;
          } else if (!getTileAtDestination('characters', characterX - 5, nextY)) {
            characterX -= 1;
          }
        }
      }

      // Set character direction from last pressed key
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
  if (!isFallingAnimationActive) {
    return;
  }

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
