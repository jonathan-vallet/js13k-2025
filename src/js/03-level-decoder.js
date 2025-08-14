function decodeLevel(worldLayers) {
  const levelData = [];
  const characterInitialX = 10;
  const characterInitialY = 5;
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
    } else {
      // Ancien format (ex: 5A3B10-)
      const regex = /([A-Z\-])([xyz]?)(\d*)/g;
      let match;
      while ((match = regex.exec(encodedString)) !== null) {
        const tileChar = match[1];
        const orientationSymbol = match[2] || '';
        const tileCount = parseInt(match[3] || '1', 10);
        const tileName = tileChar === '-' ? null : getTileName(tileChar);
        const orientation = getOrientationFromSymbol(orientationSymbol);
        for (let i = 0; i < tileCount; i++) {
          const x = tileIndex % WORLD_WIDTH;
          const y = Math.floor(tileIndex / WORLD_WIDTH);
          if (tileName) {
            levelData[['crate', 'boulder'].includes(tileName) ? 'push' : 'unshift']({
              tile: tileName,
              x,
              y,
              orientation,
            });
          }
          tileIndex++;
        }
      }
    }

    // On reset tileIndex pour chaque layer, pour que tous utilisent la même grille
    tileIndex = 0;
  }
  console.log(`Decoded level data: ${JSON.stringify(levelData)}`);
  return {
    characterInitialX,
    characterInitialY,
    levelData,
  };
}

/**
 * Convert an orientation symbol to a numeric value
 */
function getOrientationFromSymbol(symbol) {
  switch (symbol) {
    case 'x':
      return 1;
    case 'y':
      return 2;
    case 'z':
      return 3;
    default:
      return 0;
  }
}

/**
 * Convert a tile character back to its tile name
 */
function getTileName(tileChar) {
  const tileNames = Object.keys(TILE_DATA);
  const tileIndex = tileChar.charCodeAt(0) - 'A'.charCodeAt(0);
  return tileNames[tileIndex];
}
