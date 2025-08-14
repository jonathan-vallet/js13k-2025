let $ = (selector) => document.querySelector(selector);

let seasonList = ['spring', 'summer', 'autumn', 'winter'];
let currentSeason = Math.floor(Math.random() * seasonList.length);
// spring colors
let COLOR_SETS = {
  blueGreen: ['#024d53', '#599dbc', '#72d1c7', '#a9ffe6'],
  water: ['#87c7df', '#986b41', '#bd8e64', '#d7b588'],
  grass: ['#ddb982', '#d6af74', '#34ac5c', '#55c768'],
  spring: ['#f8c000', '#78c800', '#308000', '#78c800'],
  summer: ['#a0f820', '#28a800', '#28a800', '#f8f870'],
  autumn: ['#f8e878', '#e09000', '#a06000', '#e09000'],
  winter: ['#ffffff', '#a0a0f0', '#6060e8', '#a0a0f0'],
};

// CAUTION! If new assets are added, push them at the end of the object, or it will break RLE of every levels
const TILE_DATA = {
  grass: {
    rle: '16XMeXNeZUeMYMZMeTYeMZNYUYMZMZUZM[WYMYMYWYSeXNZeXeMZMYMeTYNZMeYTZMZMYV[MZVYMYMYXOYV',
    colors: COLOR_SETS[seasonList[currentSeason]],
  },
  water: {
    rle: '64LLKfXXOBqAvBqErFsEqeYXXOAseYgvBrerBsesAreYXXPBqf[jshrlqgYXXPAqf^NZfZM[gM[iYXXQAqeZU[O\\P^XXRAqeYXXXXXAqeYXXXXXAqfXXXXXAqfXXXXXBqeXXXXXBqYXXXXXAreXXXXXBqeYXXXXWBqeYXXXXWCqeXXXXW',
    colors: COLOR_SETS.water,
    isStatic: true,
  },
  road: {
    rle: '64HqLGeFedd\\ErAeqBqDrAqeqAeqAfDqfdd\\CrfqfreqAeqfqgqfqgAhdd]BqgYfYhqfZfZfYfYeqgdd^Aqfafae]eYedd_AqfdddddqfdddddYqfdddddYAqfdddddAqedddddYBqedddddAqgddddcBreddddcAredddddAqedddddYBqeddddd',
    colors: COLOR_SETS[seasonList[currentSeason]],
    isStatic: true,
  },
};

if (currentSeason === 3) {
  // winter
  COLOR_SETS.water = ['#ffffff', '#986b41', '#bd8e64', '#d7b588'];
}

// Game constants
const TILE_SIZE = 16; // Original tile size in pixels
const WORLD_WIDTH = 50;
const WORLD_HEIGHT = 50;
const DISPLAY_WIDTH = 10;
const DISPLAY_HEIGHT = 10;

// Orientation constants
const ORIENTATION_UP = 0;
const ORIENTATION_RIGHT = 1;
const ORIENTATION_DOWN = 2;
const ORIENTATION_LEFT = 3;
