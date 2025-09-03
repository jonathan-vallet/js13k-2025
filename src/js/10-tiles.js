/**
 * Get the tile coordinates from a pixel value
 * @param {number} val - The pixel value
 * @returns {number} - The tile coordinate
 */
const getTileCoord = (val) => (val / TILE_SIZE) | 0;

/**
 * Get the tile at the specified position
 * @param {number} x - The x-coordinate
 * @param {number} y - The y-coordinate
 * @returns {string} - The name of the tile at this position or null if no element is found
 */
function getTileAt(x, y, type = []) {
  // Reversed loop to get topmost element
  for (let index = world.length - 1; index >= 0; --index) {
    const element = world[index];
    if (element.x === x && element.y === y && (type.length === 0 || type.includes(element.tile))) {
      return element;
    }
  }
  return null;
}

/**
 * Remove a specific tile or multiple tiles from the level.
 * @param {string} tileName - The name of the tile to remove (e.g., "gong").
 * @param {number} [x] - The x-coordinate of the tile to remove.
 * @param {number} [y] - The y-coordinate of the tile to remove.
 */
function removeTile(tileName, x, y) {
  world = world.filter((element) => {
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
  world[options.isUnder ? 'unshift' : 'push']({ tile, x, y, ...options });
  return world[options.isUnder ? 0 : world.length - 1];
}

function getDirectionOffsets(direction) {
  return {
    dx: direction === ORIENTATION_RIGHT ? 1 : direction === ORIENTATION_LEFT ? -1 : 0,
    dy: direction === ORIENTATION_DOWN ? 1 : direction === ORIENTATION_UP ? -1 : 0,
  };
}
