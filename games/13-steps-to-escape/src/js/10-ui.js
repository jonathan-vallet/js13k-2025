function refreshUI() {
  drawUI();
}

/**
 * Draw the UI (steps, keys, controls) on the UI canvas
 */
function drawUI() {
  uiCtx.fillStyle = COLOR_TEXT;
  uiCtx.fillRect(0, 0, uiCanvas.width, uiCanvas.height);

  let title = '';
  let scale = 1.5;
  if (currentScreen === 'menu') {
    title = t('title');
  }
  if (currentScreen === 'characterSelection') {
    title = t('characterCustomization');
  }
  if (currentScreen === 'game') {
    title = t('steps');
    scale = 1;
  }
  if (currentScreen === 'levelSelector') {
    title = t('levelSelection');
  }
  if (currentScreen === 'options') {
    title = t('options');
  }

  writeText({
    ctx: uiCtx,
    x: 10,
    y: scale === 1 ? 6 : 3.33,
    text: title,
    scale,
  });

  if (currentScreen === 'game') {
    // Draw steps remaining
    let shakeX = 0;
    let shakeY = 0;
    if (stepsPerformed >= 10) {
      const intensity = stepsPerformed - 9;
      shakeX = getShakeOffset(intensity);
      shakeY = getShakeOffset(intensity);
    }

    // Draw steps remaining
    writeText({
      ctx: uiCtx,
      x: 25 + shakeX,
      y: 3 + shakeY,
      text: `${13 - stepsPerformed}`,
      color: getStepColor(stepsPerformed),
      scale: 1.5,
    });

    // Draw the key icon and count
    const keyTile = TILE_DATA['key'].tiles[0];
    const keyColors = TILE_DATA['key'].colors;
    drawTile(keyTile, keyColors, 4.5, 0.2, { context: uiCtx });

    // Draw current level
    writeText({
      ctx: uiCtx,
      x: 120,
      y: 6,
      text: `${t('level')}: ${currentLevel}`,
    });

    writeText({
      ctx: uiCtx,
      x: 90,
      y: 6,
      text: `x${collectedKeysNumber}`,
    });

    writeText({
      ctx: uiCtx,
      x: 220,
      y: 3,
      text: t('undo'),
    });
    writeText({
      ctx: uiCtx,
      x: 220,
      y: 10,
      text: t('reset'),
    });
  }
}

function getShakeOffset(intensity) {
  const maxShake = intensity * 0.5; // L'intensité détermine l'amplitude du shake
  return Math.random() * maxShake - maxShake / 2; // Retourne une valeur aléatoire entre -maxShake/2 et +maxShake/2
}

function getStepColor(stepsPerformed) {
  if (stepsPerformed < 11) {
    return 'rgb(255, 255, 255)'; // White
  } else if (stepsPerformed < 12) {
    return 'rgb(255, 255, 0)'; // Yellow
  } else if (stepsPerformed < 13) {
    return 'rgb(255, 165, 0)'; // Orange
  } else {
    return 'rgb(255, 0, 0)'; // Red
  }
}

