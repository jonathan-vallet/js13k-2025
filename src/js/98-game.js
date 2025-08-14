function setZoomFactor() {
  console.log('Setting zoom factor...', window.innerWidth, window.innerHeight, WORLD_WIDTH, WORLD_HEIGHT, TILE_SIZE);
  zoomFactor = Math.min(
    Math.floor(window.innerWidth / (WORLD_WIDTH * TILE_SIZE)),
    Math.floor((window.innerHeight * 0.89) / (WORLD_HEIGHT * TILE_SIZE)),
  );
  console.log('Zoom factor set to:', zoomFactor);
  canvas.width = WORLD_WIDTH * TILE_SIZE * zoomFactor;
  canvas.height = WORLD_HEIGHT * TILE_SIZE * zoomFactor;
}

function initGame() {
  // Disable image smoothing for sharp pixelated look
  startLevel(currentLevel);
}

window.addEventListener('resize', () => {
  setZoomFactor();
  drawLevelBackground('grass');
});

function loadGame() {
  // Adjust the canvas size to fit the level size
  ctx.imageSmoothingEnabled = false;
  setZoomFactor();
  drawLevelBackground('grass');
}

loadGame();
