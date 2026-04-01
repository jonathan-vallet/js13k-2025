// Canvas variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const backgroundCanvas = document.getElementById('gameBackgroundCanvas');
const backgroundCtx = backgroundCanvas.getContext('2d');

const seasonCanvasList = {}; // ex: { summer: canvas, winter: canvas, ... }

// Global variables
let zoomFactor = 1; // Display size for each tile. Zoom whole game depending on screen size
let lastFrameTime = 0; // For animation loop
let keyStack = []; // Stack of keys pressed
const FPS = 1000 / 60; // ~16.67
let lastTimestamp = 0;
let accumulatedTime = 0;

let initialData = {
  characterX: 784, // 49 * TILE_SIZE
  characterY: 336, // 21 * TILE_SIZE
  currentSeason: 'summer',
  characterMaxLife: 3,
  availableSeasons,
  collectedCatsList: [],
};
let savedData;

let characterMaxLife;
let characterLife;
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

let currentReadingText = '';
let currentReadingStartTime = 0; // ms from performance.now()
let seasonMusicList = {};

/**
 * Get the opposite direction
 * @param {number} direction (ORIENTATION_UP | ORIENTATION_DOWN | ORIENTATION_LEFT | ORIENTATION_RIGHT)
 * @returns {number} - The opposite direction
 */
function getOppositeDirection(direction) {
  // If direction is odd (1 or 3), toggle bit 1 (XOR with 2), else toggle bit 2 (XOR with 6)
  return direction & 1 ? direction ^ 2 : direction ^ 6;
}

let musicAudio = document.createElement('audio');
let musicplayer = new CPlayer();

let isSoundActive = true;
let isChangingSeason = false;
