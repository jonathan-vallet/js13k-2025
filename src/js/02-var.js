// Canvas variables
const canvas = $('#gameCanvas');
const ctx = canvas.getContext('2d');

// Global variables
let zoomFactor = 1; // Display size for each tile. Zoom whole game depending on screen size

let currentScreen = 'game'; // Current screen state
