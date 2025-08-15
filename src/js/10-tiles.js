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

function getDirectionOffsets(direction) {
  return {
    dx: direction === ORIENTATION_RIGHT ? 1 : direction === ORIENTATION_LEFT ? -1 : 0,
    dy: direction === ORIENTATION_DOWN ? 1 : direction === ORIENTATION_UP ? -1 : 0,
  };
}
