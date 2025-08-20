function drawLife() {
  const heartTile = TILE_DATA['heart'].tiles[0];
  const heartColors = TILE_DATA['heart'].colors;
  for (let i = 0; i < characterMaxLife; ++i) {
    const y = 1 * zoomFactor; // Position the hearts at the top
    // and right of canvas
    const x = (DISPLAY_WIDTH - i - 1) * TILE_SIZE;
    ctx.save();
    ctx.scale(zoomFactor, zoomFactor);
    ctx.translate(x, y);
    drawTile(heartTile, [heartColors[0], heartColors[i < characterLife ? 1 : 2]], 0, 0, {
      scale: 1,
    });
    ctx.restore();
  }
}

function takeDamage() {
  if (isInvulnerable) {
    return;
  }
  --characterLife;
  isInvulnerable = true;
  invulnerabilityStartTime = performance.now();
  setTimeout(() => {
    isInvulnerable = false;
  }, INVULNERABILITY_FRAME_DURATION);
  if (characterLife <= 0) {
    // Trigger game over or respawn
    console.log('Game Over');
  }
}
