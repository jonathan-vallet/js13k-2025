function getCameraOffset() {
  const viewWidth = DISPLAY_WIDTH * TILE_SIZE;
  const viewHeight = DISPLAY_HEIGHT * TILE_SIZE;

  // Center the camera on the character
  let camX = characterX - viewWidth / 2;
  let camY = characterY - viewHeight / 2;

  // Clamp to avoid exceeding world bounds
  const maxCamX = WORLD_WIDTH * TILE_SIZE - viewWidth;
  const maxCamY = WORLD_HEIGHT * TILE_SIZE - viewHeight;

  camX = clamp(camX, 0, maxCamX);
  camY = clamp(camY, 0, maxCamY);
  return { offsetX: camX / TILE_SIZE, offsetY: camY / TILE_SIZE };
}

function startLevel(levelIndex) {
  // Saves initial state of the level
  currentLevel = levelIndex;
  characterX = world.characterInitialX;
  characterY = world.characterInitialY;
}

/**
 * Check if a given position is within the bounds of the level
 * @param {number} x - The x-coordinate to check
 * @param {number} y - The y-coordinate to check
 * @returns {boolean} - Whether the position is within the level bounds
 */
function isInLevelBounds(x, y) {
  return x >= 1 && x < WORLD_WIDTH - 1 && y >= 1 && y < WORLD_HEIGHT - 1;
}

function preRenderSeasonBackgrounds() {
  seasonList.forEach((seasonName) => {
    currentSeason = seasonName;
    // Crée un canvas pour cette saison
    const canvas = document.createElement('canvas');
    canvas.width = WORLD_WIDTH * TILE_SIZE;
    canvas.height = WORLD_HEIGHT * TILE_SIZE;

    const ctx = canvas.getContext('2d');
    seasonCanvasList[seasonName] = canvas;
    seasonContextList[seasonName] = ctx;
    let seasonColors = COLOR_SETS[seasonName];

    ctx.fillStyle = seasonColors[1];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const backgroundTileName = 'grass'; // Default background tile

    const backgroundTile = TILE_DATA[backgroundTileName].tiles[0];
    let backgroundColors = TILE_DATA[backgroundTileName].colors.map((colorIndex) => seasonColors[colorIndex] || '#000');

    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let x = 0; x < WORLD_WIDTH; x++) {
        if (((x - 812347 * y) * 928371 * (x + 156468 + y)) % 17 === 0) {
          drawTile(backgroundTile, backgroundColors, x, y, { context: ctx });
        }
      }
    }

    // Dessine les éléments statiques
    if (currentScreen === 'game') {
      drawLevelElements(world.levelData, true, ctx);
    }
  });
}
