function decodeLevel(worldLayers) {
  const worldData = [];
  let tileIndex = 0;

  for (const [layerName, encodedString] of Object.entries(worldLayers)) {
    // Split on comma, and if string is empty, add 1
    const runs = encodedString.split(',').map((s) => parseInt(s.trim(), 10) || 1);
    let isFilled = false; // commence par vide
    for (const count of runs) {
      for (let i = 0; i < count; i++) {
        const x = tileIndex % WORLD_WIDTH;
        const y = Math.floor(tileIndex / WORLD_WIDTH);
        const moveDirection = TILE_DATA[layerName]?.moveDirection || null;
        if (isFilled) {
          worldData.push({ tile: layerName, x, y, moveDirection });
        }
        tileIndex++;
      }
      isFilled = !isFilled;
    }

    // On reset tileIndex pour chaque layer, pour que tous utilisent la même grille
    tileIndex = 0;
  }

  return worldData;
}

function generateCollisionMapForSeason(seasonName) {
  const map = Array.from({ length: WORLD_HEIGHT }, () => Array.from({ length: WORLD_WIDTH }, () => null));
  for (const tile of world) {
    let seasonTile = getSeasonalTile(tile.tile, seasonName);
    const tileData = TILE_DATA[seasonTile];
    if (!tileData) {
      continue;
    }

    const size = tileData.size || [1, 1];

    for (let dx = 0; dx < size[0]; dx++) {
      for (let dy = 0; dy < size[1]; dy++) {
        const x = tile.x + dx;
        const y = tile.y + dy;

        if (x < WORLD_WIDTH && y < WORLD_HEIGHT) {
          map[y][x] = seasonTile;
        }
        if (['wall', 'snow'].includes(seasonTile)) {
          map[y + 1][x] = seasonTile;
        }
      }
    }
  }

  collisionMaps[seasonName] = map;
}
