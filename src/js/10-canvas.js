/**
 * Canvas rendering functions
 * @module 50-canvas
 */

/**
 * Refresh the canvas by redrawing the level and the character
 */
function refreshCanvas() {
  console.log('Refreshing canvas...', COLOR_SETS[seasonList[currentSeason]]);
  drawLevel();
}

/**
 * Draw the level background and elements
 */
function drawLevel() {
  // draw background image
  drawLevelElements(world.levelData);
}

/**
 * Draw the background of the level with a border
 * @param {string} backgroundTileName - The name of the background tile
 * @param {string} borderTileName - The name of the border tile
 */
function drawLevelBackground(backgroundTileName, context = ctx) {
  context.fillStyle = COLOR_SETS[seasonList[currentSeason]][0]; // Use the first color
  context.fillRect(0, 0, canvas.width, canvas.height);

  const backgroundTile = TILE_DATA[backgroundTileName].tiles[0];
  const backgroundColors = TILE_DATA[backgroundTileName].colors;
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      // Draw the background tile at every position
      if (((x - 812347 * y) * 928371 * (x + 156468 + y)) % 17 === 0) {
        drawTile(backgroundTile, backgroundColors, x, y, { context });
      }
    }
  }

  // Draw all static elements
  if (currentScreen === 'game') {
    drawLevelElements(world.levelData, true);
  }
}

/**
 * Draw the level background elements
 * @param {Array} levelData - The level data array with tile information
 */
function drawLevelElements(levelData, isDrawingStatic = false, context = ctx) {
  levelData.forEach((element) => {
    const tile = TILE_DATA[element.tile];

    if (currentScreen === 'game' && ((isDrawingStatic && !tile.isStatic) || (!isDrawingStatic && tile.isStatic))) {
      return;
    }

    if (['water', 'road'].includes(element.tile)) {
      const { type, orientation } = getTileTypeAndOrientation(element, levelData);
      element.animationFrame = type; // 0 à 3 = coin/bord/intérieur/plein
      element.orientation = orientation; // 0 à 3 pour les rotations
    }

    const frame = tile.tiles[element.animationFrame || 0]; // Get the current frame
    const colors = element.color || TILE_DATA[element.tile].colors;
    const x = element.x;
    const y = element.y;
    const orientation = element.orientation || ORIENTATION_UP;
    const scale = element.scale || 1;
    const useOrientationForColor = TILE_DATA[element.tile].useOrientationForColor;
    drawTile(frame, colors, x, y, { orientation, scale, useOrientationForColor, context });
  });
}

/**
 * Draw a tile on the canvas at the specified position, color, and optional transformations
 * @param {number[][]} tile - The tile to draw (required)
 * @param {string[]} colors - The colors for the tile (required)
 * @param {number} x - The x-coordinate of the tile (required)
 * @param {number} y - The y-coordinate of the tile (required)
 * @param {Object} [options={}] - Optional parameters: orientation, scale, context, flipHorizontally
 * @param {number} [options.orientation=ORIENTATION_UP] - The orientation of the tile
 * @param {number} [options.scale=1] - The scale to apply to the tile
 * @param {CanvasRenderingContext2D} [options.context=ctx] - The canvas context to draw on
 * @param {boolean} [options.flipHorizontally=false] - Whether to flip the tile horizontally
 */
function drawTile(tile, colors, x, y, options = {}) {
  const {
    orientation = ORIENTATION_UP,
    scale = tile.scale || 1,
    context = ctx,
    flipHorizontally = false,
    alpha = 1,
    useOrientationForColor = false,
  } = options;

  context.save();

  const halfTileSize = (TILE_SIZE * zoomFactor) / 2;
  context.translate(Math.floor((x + 0.5) * TILE_SIZE * zoomFactor), Math.floor((y + 0.5) * TILE_SIZE * zoomFactor));

  // Apply horizontal flip if necessary
  let scaleDirection = 1;
  if (flipHorizontally) {
    scaleDirection = -1;
  }

  context.scale(scale * scaleDirection, scale); // Apply scaling
  if (useOrientationForColor) {
    colors = colors[orientation];
  } else {
    context.rotate((orientation * Math.PI) / 2); // Apply rotation
  }
  context.translate(-halfTileSize, -halfTileSize); // Move to the top-left corner of the tile

  // Draw the tile by iterating over the pixels
  for (let tileY = 0; tileY < tile.length; tileY++) {
    for (let tileX = 0; tileX < tile[tileY].length; tileX++) {
      const pixelValue = tile[tileY][tileX];
      if (pixelValue > 0) {
        // Skip transparent pixels (0)
        context.fillStyle = colors[pixelValue - 1];
        context.globalAlpha = alpha;
        context.fillRect(tileX * zoomFactor, tileY * zoomFactor, zoomFactor, zoomFactor);
      }
    }
  }

  context.restore();
}

function getTileTypeAndOrientation(element, levelData) {
  let x = element.x;
  let y = element.y;
  const isSameTile = (tx, ty) => levelData.some((e) => e.x === tx && e.y === ty && e.tile === element.tile);

  const n = isSameTile(x, y - 1);
  const s = isSameTile(x, y + 1);
  const w = isSameTile(x - 1, y);
  const e = isSameTile(x + 1, y);
  const nw = isSameTile(x - 1, y - 1);
  const ne = isSameTile(x + 1, y - 1);
  const sw = isSameTile(x - 1, y + 1);
  const se = isSameTile(x + 1, y + 1);

  let type = 3; // plein par défaut
  let orientation = 0;

  const neighbors = { nw, ne, sw, se, n, s, e, w };

  // 1. Tous les voisins sont water → plein
  if (Object.values(neighbors).every(Boolean)) {
    return { type: 3, orientation: 0 };
  }

  // 2. Coin intérieur : un seul vide parmi les coins
  const corners = [
    { key: 'nw', orientation: 0 },
    { key: 'ne', orientation: 1 },
    { key: 'se', orientation: 2 },
    { key: 'sw', orientation: 3 },
  ];

  const emptyCorners = corners.filter((c) => !neighbors[c.key]);
  const filledEdges = [n, s, e, w].filter(Boolean).length;

  if (emptyCorners.length === 1 && filledEdges === 4) {
    const { orientation } = emptyCorners[0];
    return { type: 2, orientation };
  }

  // 3. Bord : un seul côté vide parmi N/S/E/W
  const cardinal = [
    { key: 'n', orientation: 0 },
    { key: 'e', orientation: 1 },
    { key: 's', orientation: 2 },
    { key: 'w', orientation: 3 },
  ];

  const emptyCardinal = cardinal.filter((c) => !neighbors[c.key]);
  const filledCardinal = cardinal.filter((c) => neighbors[c.key]);

  if (emptyCardinal.length === 1 && filledCardinal.length === 3) {
    const { orientation } = emptyCardinal[0];
    return { type: 1, orientation };
  }

  // 4. Coin extérieur : deux côtés adjacents + leur coin rempli
  if (n && w && nw) {
    return { type: 0, orientation: 2 };
  }
  if (n && e && ne) {
    return { type: 0, orientation: 3 };
  }
  if (s && e && se) {
    return { type: 0, orientation: 0 };
  }
  if (s && w && sw) {
    return { type: 0, orientation: 1 };
  }

  return { type, orientation };
}
