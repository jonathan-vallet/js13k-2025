let isDying = false;
let deathStartTime = 0;
const DEATH_SPIN_INTERVAL = 100; // ms

function drawLife() {
  const heartTile = TILE_DATA['heart'].tiles[0];
  const heartColors = getColors(TILE_DATA['heart'].colors);
  for (let i = 0; i < characterMaxLife; ++i) {
    const y = 1 * zoomFactor; // Position the hearts at the top
    // and right of canvas
    const x = (DISPLAY_WIDTH - i - 1) * TILE_SIZE;
    ctx.save();
    ctx.scale(zoomFactor, zoomFactor);
    ctx.translate(x, y);
    drawTile(heartTile, [heartColors[0], heartColors[i < characterLife ? 1 : 2]], 0, 0);
    ctx.restore();
  }
}

function takeDamage() {
  if (isInvulnerable) {
    return;
  }
  playActionSound('damage');
  --characterLife;
  isInvulnerable = true;
  invulnerabilityStartTime = performance.now();
  setTimeout(() => {
    isInvulnerable = false;
  }, INVULNERABILITY_FRAME_DURATION);
  if (characterLife <= 0) {
    // Trigger game over or respawn
    isDying = true;
  }
}

function runDieAnimation() {
  const elapsed = performance.now() - deathStartTime;

  // Spin : change d’orientation toutes les 100ms
  setCharacterDirection((Math.floor(elapsed / DEATH_SPIN_INTERVAL) % 4) + 1);

  // Quand scale est 0, on lance le fade + respawn au midpoint
  if (!isFading) {
    startFade(1500, () => {
      // Respawn (aux coords initiales du level)
      characterX = savedData.characterX;
      characterY = savedData.characterY;
      characterLife = characterMaxLife;
      currentSeason = savedData.currentSeason;
      setCharacterDirection(ORIENTATION_DOWN);
    });

    // déverrouille un poil après le fade-in
    setTimeout(() => {
      isDying = false;
      playActionSound('respawn');
    }, 1000);
  }

  // on “bloque” la marche animée pour éviter les frames de pas
  walkAnimationTimer = 0;
  walkFrameIndex = 0;
}
