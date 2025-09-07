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

function preRenderSeasonBackgrounds() {
  seasonList.forEach((seasonName) => {
    currentSeason = seasonName;
    // Crée un canvas pour cette saison
    const canvas = document.createElement('canvas');
    canvas.width = WORLD_WIDTH * TILE_SIZE;
    canvas.height = WORLD_HEIGHT * TILE_SIZE;

    const ctx = canvas.getContext('2d');
    seasonCanvasList[seasonName] = canvas;

    ctx.fillStyle = '#' + COLOR_SETS[seasonName][3];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const backgroundTileName = 'grass'; // Default background tile

    const backgroundTile = TILE_DATA[backgroundTileName].tiles[0];
    let backgroundColors = getColors(TILE_DATA[backgroundTileName]._colors, seasonName);

    const plantTile = TILE_DATA['plant'].tiles[0];
    let plantColors = getColors(TILE_DATA['plant']._colors, seasonName);

    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let x = 0; x < WORLD_WIDTH; x++) {
        if (((x - 812347 * y) * 928371 * (x + 156468 + y)) % 17 === 0) {
          drawTile(plantTile, plantColors, x, y, { context: ctx });
        } else {
          drawTile(backgroundTile, backgroundColors, x, y, { context: ctx });
        }
      }
    }

    // Draw all static elements
    drawLevelElements(true, ctx);
  });
}

const TRAP_LIST = [];
function setTrapList() {
  world.forEach((tile) => {
    if (['blade', 'seeker'].includes(tile.tile)) {
      TRAP_LIST.push(tile);
    }
  });
}

const ENEMY_LIST = [];
function setEnemyList() {
  world.forEach((tile) => {
    if (['skeleton', 'mommy'].includes(tile.tile)) {
      ENEMY_LIST.push(tile);
    }
  });
}
