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
    title = '13 STEPS TO ESCAPE';
  }
  if (currentScreen === 'characterSelection') {
    title = 'CHARACTER CUSTOMIZATION';
  }
  if (currentScreen === 'game') {
    title = 'STEPS';
    scale = 1;
  }

  writeText({
    ctx: uiCtx,
    x: 10,
    y: scale === 1 ? 6 : 3.33,
    text: title,
    scale,
  });

  if (currentScreen === 'game') {
    // Draw the key icon and count
    const keyTile = TILE_DATA['key'].tiles[0];
    const keyColors = TILE_DATA['key'].colors;
    drawTile(keyTile, keyColors, 4.5, 0.2, { context: uiCtx });

    // Draw current level
    writeText({
      ctx: uiCtx,
      x: 120,
      y: 6,
      text: `LEVEL: ${currentLevel}`,
    });

    writeText({
      ctx: uiCtx,
      x: 90,
      y: 6,
      text: `x${collectedKeysNumber}`,
    });
  }
}
