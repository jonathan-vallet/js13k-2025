function decodeLevel(worldLayers) {
  const levelData = [];
  let tileIndex = 0;

  for (const [layerName, encodedString] of Object.entries(worldLayers)) {
    if (/^[\d,\s]+$/.test(encodedString)) {
      // Nouveau format binaire compressé (vide/plein)
      const runs = encodedString.split(',').map((s) => parseInt(s.trim(), 10));
      let isFilled = false; // commence par vide
      for (const count of runs) {
        for (let i = 0; i < count; i++) {
          const x = tileIndex % WORLD_WIDTH;
          const y = Math.floor(tileIndex / WORLD_WIDTH);
          if (isFilled) {
            levelData.push({ tile: layerName, x, y });
          }
          tileIndex++;
        }
        isFilled = !isFilled;
      }
    }

    // On reset tileIndex pour chaque layer, pour que tous utilisent la même grille
    tileIndex = 0;
  }

  return {
    characterInitialX,
    characterInitialY,
    levelData,
  };
}

function generateCollisionMapForSeason(seasonName) {
  const map = Array.from({ length: WORLD_HEIGHT }, () => Array.from({ length: WORLD_WIDTH }, () => null));
  for (const tile of world.levelData) {
    let seasonTile = getSeasonalTile(tile.tile, seasonName);
    const tileData = TILE_DATA[seasonTile];
    if (!tileData) continue;

    const size = tileData.size || [1, 1];

    for (let dx = 0; dx < size[0]; dx++) {
      for (let dy = 0; dy < size[1]; dy++) {
        const x = tile.x + dx;
        const y = tile.y + dy;

        if (x < WORLD_WIDTH && y < WORLD_HEIGHT) {
          map[y][x] = seasonTile;
        }
      }
    }
  }

  collisionMaps[seasonName] = map;
}
