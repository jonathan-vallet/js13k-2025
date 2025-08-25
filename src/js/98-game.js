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
  // Heals while changing season
  characterLife = characterMaxLife;

  startFade(1000, () => {
    currentSeason = seasonName;
    drawLevelBackground();
  });

  setTimeout(() => {
    isInputLocked = false;
  }, 1000);
}

loadGame();
