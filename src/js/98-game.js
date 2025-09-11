function setZoomFactor() {
  zoomFactor = Math.min(
    (window.innerWidth / (DISPLAY_WIDTH * TILE_SIZE)) | 0,
    ((window.innerHeight * 0.89) / (DISPLAY_HEIGHT * TILE_SIZE)) | 0,
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

function initMusic() {
  // Générer l'intro et la boucle au chargement
  seasonList.forEach((season, index) => {
    baseSong.songData[0].i[12] = seasonEnvRelease[index];
    seasonMusicList[season] = generateMusic(baseSong);
  });
}

function playSeasonMusic() {
  playMusic(seasonMusicList[currentSeason], true);

  if (isSoundActive) {
    playMusicControl();
  } else {
    stopMusic();
  }
}

function loadGame() {
  // Adjust the canvas size to fit the level size
  setZoomFactor();
  preloadSFX();
  initMusic();
  setTrapList();
  setEnemyList();
  loadInitialState();
  addSpecificWorldItems();
  seasonList.forEach((season) => {
    generateCollisionMapForSeason(season);
  });
  preRenderSeasonBackgrounds();
  drawLevelBackground();
  currentSeason = savedData.currentSeason;
  playSeasonMusic();
  // if no save, play intro
  if (!loadSaveData()?.characterMaxLife) {
    startIntro();
  }
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
  requestAnimationFrame(animate);
}

function changeSeason(seasonName) {
  // Heals while changing season
  characterLife = characterMaxLife;
  isChangingSeason = true;

  startFade(1000, () => {
    currentSeason = seasonName;
    playSeasonMusic();
    drawLevelBackground();
    saveGame();
    isChangingSeason = false;
  });
}

function saveGame() {
  savedData = {
    characterX: characterX,
    characterY: characterY,
    currentSeason,
    characterMaxLife,
    availableSeasons,
    collectedCatsList: savedData.collectedCatsList,
  };
  localStorage.setItem('witchcat', JSON.stringify(savedData));
}

function loadInitialState(isNew = false) {
  savedData = isNew ? { ...initialData } : { ...initialData, ...loadSaveData() };
  ({ characterX, characterY, currentSeason, characterMaxLife, availableSeasons } = savedData);
  characterLife = characterMaxLife;
}

function loadSaveData() {
  try {
    return JSON.parse(localStorage.getItem('witchcat')) || {};
  } catch {
    return {};
  }
}

loadGame();
