function setZoomFactor() {
  zoomFactor = Math.min(
    Math.floor(window.innerWidth / (DISPLAY_WIDTH * TILE_SIZE)),
    Math.floor((window.innerHeight * 0.89) / (DISPLAY_HEIGHT * TILE_SIZE)),
  );
  canvas.width = DISPLAY_WIDTH * TILE_SIZE * zoomFactor;
  canvas.height = DISPLAY_HEIGHT * TILE_SIZE * zoomFactor;

  // background canvas has same ratio than canvas but cover window size
  if (window.innerWidth / window.innerHeight > DISPLAY_WIDTH / DISPLAY_HEIGHT) {
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerWidth * (DISPLAY_HEIGHT / DISPLAY_WIDTH);
  } else {
    backgroundCanvas.height = window.innerHeight;
    backgroundCanvas.width = window.innerHeight * (DISPLAY_WIDTH / DISPLAY_HEIGHT);
  }
}

window.addEventListener('resize', () => {
  setZoomFactor();
  drawLevelBackground();
});

function loadGame() {
  // Adjust the canvas size to fit the level size
  setZoomFactor();
  seasonList.forEach((season) => {
    generateCollisionMapForSeason(season);
  });
  setTrapList();
  preRenderSeasonBackgrounds();
  startLevel();
  currentSeason = 'spring';
  drawLevelBackground();
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  requestAnimationFrame(animate);
}

function changeSeason(seasonName) {
  startFade(1000, () => {
    currentSeason = seasonName;
    drawLevelBackground();
  });

  // fin du fade-in -> déverrouille
  const oldOnMid = fadeOnMid;
  fadeOnMid = () => {
    oldOnMid && oldOnMid();
    // Après l'aller, on garde fadeOnMid pour ne pas le perdre,
    // le déverrouillage se fera à la fin du fade-in via un petit hook :
  };

  // on “hook” la fin du fade en surveillant isFading dans updateFade()
  // plus simple : petit timer safe (durée aller + retour)
  setTimeout(() => {
    isInputLocked = false;
  }, 1000 * 2 + 20);
}

loadGame();
