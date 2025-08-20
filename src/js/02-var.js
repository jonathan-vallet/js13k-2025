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

let currentScreen = 'game'; // Current screen state
let currentLevel = 0; // Current level index

let characterInitialX = 5 * TILE_SIZE;
let characterInitialY = 5 * TILE_SIZE;
let characterLife = 3;
let characterMaxLife = 3;
let isCharacterFalling = false;

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
