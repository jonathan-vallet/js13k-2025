// Canvas variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const backgroundCanvas = document.getElementById('gameBackgroundCanvas');
const backgroundCtx = backgroundCanvas.getContext('2d');

const seasonCanvasList = {}; // ex: { summer: canvas, winter: canvas, ... }
const seasonContextList = {}; // stocke les contextes associés

// Global variables
let zoomFactor = 1; // Display size for each tile. Zoom whole game depending on screen size
let lastFrameTime = 0; // For animation loop
let keyStack = []; // Stack of keys pressed
const FPS = 1000 / 60; // ~16.67
let lastTimestamp = 0;
let accumulatedTime = 0;

let currentScreen = 'game'; // Current screen state

let initialData = {
  characterX: 50 * TILE_SIZE,
  characterY: 20 * TILE_SIZE,
  currentSeason: 'summer',
  characterMaxLife: 3,
  availableSeasons,
};
let savedData;

let characterMaxLife;
let characterLife = characterMaxLife;
let isCharacterFalling = false;
let isInvulnerable = false;
let invulnerabilityStartTime = 0; // Start time for invulnerability
const INVULNERABILITY_FRAME_DURATION = 1500;

const collisionMaps = {};

let isFallingAnimationActive = false;
let fallAnimationStartTime = 0;
const FALL_ANIMATION_DURATION = 420;
let fallStartX = 0;
let fallStartY = 0;
let fallTargetX = 0;
let fallTargetY = 0;
let fallDx = 0;
let fallDy = 0;

let collectedCatsNumber = 0;
let currentReadingText = '';
let seasonMusicList = {};

function getOppositeDirection(direction) {
  return { 1: 3, 2: 4, 3: 1, 4: 2 }[direction];
}

let musicAudio = document.createElement('audio');
let musicplayer = new CPlayer();

let isSoundActive = getLocalStorage('isSoundActive') === false ? false : true;
