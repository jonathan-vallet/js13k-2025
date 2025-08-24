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
function getTileAt(x, y, type = []) {
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

function getDirectionOffsets(direction) {
  return {
    dx: direction === ORIENTATION_RIGHT ? 1 : direction === ORIENTATION_LEFT ? -1 : 0,
    dy: direction === ORIENTATION_DOWN ? 1 : direction === ORIENTATION_UP ? -1 : 0,
  };
}
