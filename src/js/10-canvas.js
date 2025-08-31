/**
 * Canvas rendering functions
 * @module 50-canvas
 */

/**
 * Refresh the canvas by redrawing the level and the character
 */
function refreshCanvas() {
  ctx.imageSmoothingEnabled = false;
  drawLevel();
  drawCharacter();
  checkDamages();
  drawLife();
  if (isDying) {
    runDieAnimation();
  }
  updateFade();
  if (currentReadingText) {
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(
      40 * zoomFactor,
      10 * zoomFactor,
      DISPLAY_WIDTH * TILE_SIZE * zoomFactor - 80 * zoomFactor,
      40 * zoomFactor,
    );
    ctx.restore();
    writeText({
      text: currentReadingText,
      x: 24,
      y: 9,
      scale: 2,
      color: '#fff',
    });
  }
}

/**
 * Draw the level background and elements
 */
function drawLevel() {
  const { offsetX, offsetY } = getCameraOffset();
  ctx.drawImage(
    seasonCanvasList[currentSeason],
    offsetX * TILE_SIZE,
    offsetY * TILE_SIZE,
    DISPLAY_WIDTH * TILE_SIZE,
    DISPLAY_HEIGHT * TILE_SIZE,
    0,
    0,
    DISPLAY_WIDTH * TILE_SIZE * zoomFactor,
    DISPLAY_HEIGHT * TILE_SIZE * zoomFactor,
  );

  ctx.save();
  ctx.scale(zoomFactor, zoomFactor); // Applique le zoom global
  ctx.translate(Math.round(-offsetX * TILE_SIZE), Math.round(-offsetY * TILE_SIZE)); // Décale la vue
  drawLevelElements(false, ctx);
  ctx.restore();
}

/**
 * Draw the background of the level
 * @param {string} backgroundTileName - The name of the background tile
 * @param {string} borderTileName - The name of the border tile
 */
function drawLevelBackground() {
  const seasonCanvas = seasonCanvasList[currentSeason];
  if (!seasonCanvas) return;

  // Met à jour le fond flouté
  backgroundCtx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
  backgroundCtx.drawImage(seasonCanvas, 0, 0, backgroundCanvas.width, backgroundCanvas.height);
}

/**
 * Draw the level background elements
 * @param {boolean} isDrawingStatic - Whether to draw static elements
 * @param {CanvasRenderingContext2D} context - The canvas rendering context
 */
function drawLevelElements(isDrawingStatic = false, context = ctx) {
  const { offsetX, offsetY } = getCameraOffset();
  const minX = (offsetX | 0) - 1,
    minY = (offsetY | 0) - 1;
  const maxX = minX + DISPLAY_WIDTH + 2;
  const maxY = minY + DISPLAY_HEIGHT + 2;

  world.forEach((element) => {
    // If element is not visible on screen, skip it
    if (!isDrawingStatic && (element.x < minX || element.x > maxX || element.y < minY || element.y > maxY)) {
      return;
    }

    let displayedTile = getSeasonalTile(element.tile);
    let colors;

    if (!displayedTile) {
      return;
    }
    if (element.tile !== displayedTile) {
      element.animationFrame = 0; // Reset frame if the tile is seasonal
      element.orientation = ORIENTATION_UP; // Ensure orientation is set
    }
    const tile = TILE_DATA[displayedTile];

    // Draw only static or dynamic tiles, depending on isDrawingStatic parameter
    if ((isDrawingStatic && !tile.isStatic) || (!isDrawingStatic && tile.isStatic)) {
      return;
    }

    // Flip the cat based on the character's position to make it face the right direction
    if (displayedTile === 'cat') {
      element.flipHorizontally = characterX / TILE_SIZE < element.x;
    }

    if (['water', 'road', 'ice'].includes(displayedTile)) {
      const { type, orientation } = getTileTypeAndOrientation(element);
      element.animationFrame = type;
      element.orientation = orientation;
    }

    if (['wall', 'snow'].includes(element.tile)) {
      const { type, orientation } = getWallTypeAndOrientation(element);
      element.animationFrame = type;
      element.orientation = orientation;
      const belowY = element.y + 1;
      if (!getTileAt(element.x, belowY)) {
        const leftWall = getTileAt(element.x - 1, element.y)?.tile === element.tile;
        const rightWall = getTileAt(element.x + 1, element.y)?.tile === element.tile;

        // Choose the thickness frame based on the wall's surroundings
        let thicknessFrameIndex = 5; // default segment (left+right)
        let flipHorizontally = false;

        if (!leftWall && rightWall) {
          thicknessFrameIndex = 4; // left corner
        } else if (leftWall && !rightWall) {
          thicknessFrameIndex = 4; // right corner = left corner + mirror
          flipHorizontally = true;
        } else if (!leftWall && !rightWall) {
          // isolated: can keep 5 (small segment), or 4 depending on your art.
          thicknessFrameIndex = 6;
        }
        const thicknessFrame = tile.tiles[thicknessFrameIndex];
        let colors = tile.colors;
        if (Array.isArray(colors)) {
          colors = colors.map((colorIndex) => COLOR_SETS[currentSeason][colorIndex] || colorIndex);
        }

        drawTile(thicknessFrame, colors, element.x, belowY, {
          orientation: ORIENTATION_UP,
          flipHorizontally,
          context,
        });
      }
    }

    const frame = tile.tiles[element.animationFrame || 0]; // Get the current frame
    colors = element.color || TILE_DATA[displayedTile].colors;

    // if colors are numbers, get their corresponding color from the season
    if (Array.isArray(colors)) {
      colors = colors.map((colorIndex) => COLOR_SETS[currentSeason][colorIndex] || colorIndex);
    }

    if (element.tile === 'orb') {
      // Orb color is orb's season
      const orbSeason = getTileAt(element.x, element.y, ['orb']).season;
      colors = COLOR_SETS[orbSeason];
    }

    const x = element.x;
    const y = element.y;
    const orientation = element.orientation || ORIENTATION_UP;
    const scale = element.scale || 1;
    const flipHorizontally = element.flipHorizontally;
    drawTile(frame, colors, x, y, { orientation, scale, context, flipHorizontally });
  });
}

function getSeasonalTile(tileName, season = currentSeason) {
  if (season === 'fall' && tileName === 'hole') {
    return 'leaves';
  }
  if (season === 'winter' && tileName === 'water') {
    return 'ice';
  }
  if (season !== 'winter' && tileName === 'snow') {
    return '';
  }
  if (season === 'summer' && tileName === 'crack') {
    return 'liana';
  }
  if (season !== 'summer' && tileName === 'root') {
    return '';
  }
  if (season !== 'fall' && tileName === 'mushroom') {
    return '';
  }

  return tileName;
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
  } = options;
  context.save();

  const halfTileSize = TILE_SIZE / 2;
  context.translate(Math.floor((x + 0.5) * TILE_SIZE), Math.floor((y + 0.5) * TILE_SIZE));

  // Apply horizontal flip if necessary
  let scaleDirection = 1;
  if (flipHorizontally) {
    scaleDirection = -1;
  }

  context.scale(scale * scaleDirection, scale); // Apply scaling
  context.rotate(((orientation - 1) * Math.PI) / 2); // Apply rotation
  context.translate(-halfTileSize, -halfTileSize); // Move to the top-left corner of the tile
  context.globalAlpha = alpha;

  // Draw the tile by iterating over the pixels
  for (let tileY = 0; tileY < tile.length; tileY++) {
    for (let tileX = 0; tileX < tile[tileY].length; tileX++) {
      const pixelValue = tile[tileY][tileX];
      if (pixelValue > 0) {
        // Skip transparent pixels (0)
        context.fillStyle = colors[pixelValue - 1];
        // Draw the pixel
        context.fillRect(tileX, tileY, 1, 1);
      }
    }
  }

  context.restore();
}

/**
 * Get the tile type and orientation for a given element
 * @param {*} element - The element to check
 * @returns {Object} - An object containing the tile type and orientation
 */
function getTileTypeAndOrientation(element) {
  let x = element.x;
  let y = element.y;
  const isSameTile = (tx, ty) => world.some((e) => e.x === tx && e.y === ty && e.tile === element.tile);

  const n = isSameTile(x, y - 1);
  const s = isSameTile(x, y + 1);
  const w = isSameTile(x - 1, y);
  const e = isSameTile(x + 1, y);
  const nw = isSameTile(x - 1, y - 1);
  const ne = isSameTile(x + 1, y - 1);
  const sw = isSameTile(x - 1, y + 1);
  const se = isSameTile(x + 1, y + 1);

  let type = 3; // fill by default
  let orientation = 0;

  const neighbors = { nw, ne, sw, se, n, s, e, w };

  // Every neighbor is water: fill
  if (Object.values(neighbors).every(Boolean)) {
    return { type: 3, orientation: ORIENTATION_UP };
  }

  // Inner corner: one empty among the corners
  const corners = [
    { key: 'nw', orientation: ORIENTATION_UP },
    { key: 'ne', orientation: ORIENTATION_RIGHT },
    { key: 'se', orientation: ORIENTATION_DOWN },
    { key: 'sw', orientation: ORIENTATION_LEFT },
  ];

  const emptyCorners = corners.filter((c) => !neighbors[c.key]);
  const filledEdges = [n, s, e, w].filter(Boolean).length;

  if (emptyCorners.length === 1 && filledEdges === 4) {
    const { orientation } = emptyCorners[0];
    return { type: 2, orientation };
  }

  // Edge: one side empty among N/S/E/W
  const cardinal = [
    { key: 'n', orientation: ORIENTATION_UP },
    { key: 'e', orientation: ORIENTATION_RIGHT },
    { key: 's', orientation: ORIENTATION_DOWN },
    { key: 'w', orientation: ORIENTATION_LEFT },
  ];

  const emptyCardinal = cardinal.filter((c) => !neighbors[c.key]);
  const filledCardinal = cardinal.filter((c) => neighbors[c.key]);

  if (emptyCardinal.length === 1 && filledCardinal.length === 3) {
    const { orientation } = emptyCardinal[0];
    return { type: 1, orientation };
  }

  // Outer corner: two adjacent sides + their corner filled
  if (n && w && nw) {
    return { type: 0, orientation: ORIENTATION_DOWN };
  }
  if (n && e && ne) {
    return { type: 0, orientation: ORIENTATION_LEFT };
  }
  if (s && e && se) {
    return { type: 0, orientation: ORIENTATION_UP };
  }
  if (s && w && sw) {
    return { type: 0, orientation: ORIENTATION_RIGHT };
  }

  return { type, orientation };
}

function getWallTypeAndOrientation(element) {
  const { x, y, tile } = element;
  const isSame = (tx, ty) => world.some((e) => e.x === tx && e.y === ty && e.tile === tile);

  const n = isSame(x, y - 1) ? 1 : 0;
  const e = isSame(x + 1, y) ? 1 : 0;
  const s = isSame(x, y + 1) ? 1 : 0;
  const w = isSame(x - 1, y) ? 1 : 0;

  const bits = n + e + s + w;

  // 1 neighbor: border
  if (bits === 1) {
    return {
      type: 0,
      orientation: e ? ORIENTATION_UP : s ? ORIENTATION_RIGHT : w ? ORIENTATION_DOWN : ORIENTATION_LEFT,
    };
  }

  // 2 neighbors: segment
  if (e && w && !n && !s) return { type: 1, orientation: ORIENTATION_UP }; // horizontal
  if (n && s && !e && !w) return { type: 1, orientation: ORIENTATION_RIGHT }; // vertical

  // 3 neighbors: T
  if (bits === 3) {
    return {
      type: 2,
      orientation: !n ? ORIENTATION_UP : !e ? ORIENTATION_RIGHT : !s ? ORIENTATION_DOWN : ORIENTATION_LEFT,
    };
  }

  // corners (2 adjacent neighbors)
  if (bits === 2) {
    if (e && s) return { type: 3, orientation: ORIENTATION_LEFT }; // ES
    if (s && w) return { type: 3, orientation: ORIENTATION_UP }; // SW
    if (w && n) return { type: 3, orientation: ORIENTATION_RIGHT }; // WN
    if (n && e) return { type: 3, orientation: ORIENTATION_DOWN }; // NE
  }

  // fallback
  return { type: 1, orientation: ORIENTATION_UP };
}
