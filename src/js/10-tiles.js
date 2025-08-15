/**
 * Get the tile coordinates from a pixel value
 * @param {number} val - The pixel value
 * @returns {number} - The tile coordinate
 */
const getTileCoord = (val) => Math.floor(val / TILE_SIZE);

/**
 * Get the tile at the specified position
 * @param {number} x - The x-coordinate
 * @param {number} y - The y-coordinate
 * @returns {string} - The name of the tile at this position or null if no element is found
 */
function getTileAt(x, y, type = [], levelIndex = currentLevel) {
  let lastTileAt = null;
  let levelData = world.levelData;
  for (const element of levelData) {
    if (element.x === x && element.y === y) {
      if (type.length > 0) {
        if (type.includes(element.tile)) {
          lastTileAt = element;
        }
      } else {
        lastTileAt = element;
      }
    }
  }
  return lastTileAt;
}

/**
 * Get all tiles of a specific type or all tiles in the level
 * @param {string[]} type - An array of tile names to filter by
 * @param {number} levelIndex - The index of the level to search
 * @returns {object[]} - An array of tile elements
 */
function getAllTiles(type = [], levelIndex = currentLevel) {
  let lastTileAt = [];
  let levelData = world.levelData;
  for (const element of levelData) {
    if (type.length > 0) {
      if (type.includes(element.tile)) {
        lastTileAt.push(element);
      }
    } else {
      lastTileAt.push(element);
    }
  }
  return lastTileAt;
}

/**
 * Remove a specific tile or multiple tiles from the level.
 * @param {string} tileName - The name of the tile to remove (e.g., "gong").
 * @param {number} [x] - The x-coordinate of the tile to remove.
 * @param {number} [y] - The y-coordinate of the tile to remove.
 */
function removeTile(tileName, x, y) {
  world.levelData = world.levelData.filter((element) => {
    // Remove tile if it matches the name and, if provided, coordinates
    return element.tile !== tileName || element.x !== x || element.y !== y;
  });
}

/**
 * Add a new tile to the level data
 * @param {string} tile - The name of the tile to add
 * @param {number} x - The x-coordinate of the tile
 * @param {number} y - The y-coordinate of the tile
 * @param {object} [options] - Additional options for the tile
 */
function addTile(tile, x, y, options = {}) {
  world.levelData[options.isUnder ? 'unshift' : 'push']({ tile, x, y, ...options });
  return world.levelData[options.isUnder ? 0 : world.levelData.length - 1];
}

/**
 * Move a tile if possible (crate, boulder)
 * @param {number} x - The x-coordinate of the crate
 * @param {number} y - The y-coordinate of the crate
 * @param {number} dx - The x-direction of movement
 * @param {number} dy - The y-direction of movement
 * @returns {boolean} - True if the crate was moved, false otherwise
 */
function tryMoveTile(tileName, x, y, dx, dy) {
  let maxDistance = 1;
  if (tileName === 'boulder') {
    maxDistance = LEVEL_WIDTH;
  }

  let distance = 0;
  while (distance < maxDistance) {
    let checkedX = x + (distance + 1) * dx;
    let checkedY = y + (distance + 1) * dy;
    let tileAtNewPosition = getTileAt(checkedX, checkedY)?.tile || null;
    if (
      isInLevelBounds(checkedX, checkedY) &&
      (tileAtNewPosition === null ||
        ['arrow', 'hole', 'trap', 'hole-filled', 'switch-off', 'switch-trigger', 'spikes'].includes(tileAtNewPosition))
    ) {
      distance++;
    } else {
      break;
    }
  }

  if (distance > 0) {
    // Update the crate's position in levelData
    let levelData = levels[currentLevel].levelData;
    for (const element of levelData) {
      if (element.x === x && element.y === y && element.tile === tileName) {
        startTileAnimation(element, x + distance * dx, y + distance * dy);
        for (let i = 1; i < distance; i++) {
          setTimeout(() => {
            playActionSound(tileName);
          }, TILE_CELL_MOVE_DURATION[tileName] * i);
        }
        return true;
      }
    }
  }

  return false;
}

/**
 * Start the animation of a crate moving from one position to another
 * @param {number} deltaTime - The time elapsed since the last frame
 */
function animateTile(deltaTime) {
  tileMoveElapsedTime += deltaTime;

  const totalDistance = Math.abs(tileMoveStartX - tileMoveTargetX) + Math.abs(tileMoveStartY - tileMoveTargetY);
  let moveDuration = TILE_CELL_MOVE_DURATION[movingTile.tile] * totalDistance;
  const progress = min(tileMoveElapsedTime / moveDuration, 1);

  movingTile.x = tileMoveStartX + (tileMoveTargetX - tileMoveStartX) * progress;
  movingTile.y = tileMoveStartY + (tileMoveTargetY - tileMoveStartY) * progress;

  if (progress >= 1) {
    movingTile.x = tileMoveTargetX;
    movingTile.y = tileMoveTargetY;
    tileMoveElapsedTime = 0;

    // When a fireball hit a bush
    if (movingTile.tile === 'fireball') {
      const deltaX = tileMoveTargetX - tileMoveStartX;
      const deltaY = tileMoveTargetY - tileMoveStartY;

      // Calculate the next position that the fireball would move to if it continued in the same direction
      const nextX = movingTile.x + (deltaX !== 0 ? Math.sign(deltaX) : 0);
      const nextY = movingTile.y + (deltaY !== 0 ? Math.sign(deltaY) : 0);

      // Check if the next position contains a bush
      const nextTile = getTileAt(nextX, nextY);
      if (nextTile && nextTile.tile === 'bush' && !nextTile.triggered) {
        nextTile.triggered = true;
        animateTileRemoval('bush', null, null, nextTile.orientation);
      }
    }
    movingTile = null; // Reset moving tile after the animation
  }
}
/**
 * Start the animation of a crate moving from one position to another
 * @param {number} crateX - The x-coordinate of the crate
 * @param {number} crateY - The y-coordinate of the crate
 * @param {number} dx - The x-direction of movement
 * @param {number} dy - The y-direction of movement
 */
function startTileAnimation(tile, targetX, targetY) {
  movingTile = tile;
  tileMoveStartX = tile.x;
  tileMoveStartY = tile.y;
  tileMoveTargetX = targetX;
  tileMoveTargetY = targetY;
  tileMoveElapsedTime = 0;
}

/**
 * Animate the removal of one or more tiles by scaling them down to 0
 * @param {string} tileName - The name of the tile to remove (e.g., "block", "gong")
 * @param {number|null} x - The x-coordinate of the tile to remove, or null to remove all matching tiles
 * @param {number|null} y - The y-coordinate of the tile to remove, or null to remove all matching tiles
 * @param {number|null} orientation - The orientation of the tile to remove, or null to remove all matching tiles
 * @param {function} callback - A callback function to execute once the animation is complete
 * @param {number} duration - The duration of the animation in milliseconds
 */
function animateTileRemoval(
  tileName,
  x = null,
  y = null,
  orientation = null,
  callback = () => {},
  duration = DEFAULT_REMOVAL_DURATION,
) {
  // Find all matching tiles in levelData
  const tilesToAnimate = levels[currentLevel].levelData.filter((element) => {
    return (
      element.tile === tileName &&
      (x === null || element.x === x) &&
      (y === null || element.y === y) &&
      (orientation === null || element.orientation === orientation)
    );
  });

  // Mark all tiles as being removed and initialize animation properties
  tilesToAnimate.forEach((tile) => {
    tile.isBeingRemoved = true;
    tile.scale = 1; // Initial scale
    tile.elapsed = 0; // Reset elapsed time for removal animation
    tile.removalDuration = duration; // Set removal duration
    tile.removeCallback = callback; // Store the callback
  });
}

/**
 * Invert all switches in the level
 */
function invertSwitches(orientation) {
  let switchOnList = getAllTiles('switch-on');
  let switchOffList = getAllTiles('switch-off');
  switchOnList.forEach((tile) => {
    if (tile.orientation === orientation) {
      tile.tile = 'switch-off';
    }
  });
  switchOffList.forEach((tile) => {
    if (tile.orientation === orientation) {
      tile.tile = 'switch-on';
      // If a tile is on a switch, remove it
      let tileAt = getTileAt(tile.x, tile.y, ['crate', 'boulder']);
      if (tileAt) {
        animateTileRemoval(tileAt.tile, tile.x, tile.y);
        playActionSound('fall');
      }
    }
  });
}
