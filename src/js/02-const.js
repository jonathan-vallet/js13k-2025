let setLocalStorage = (key, value) => localStorage.setItem(key, value);
let getLocalStorage = (key, defaultValue = null) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : defaultValue;
};

function clamp(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(maxValue, value));
}

let seasonList = ['spring', 'summer', 'fall', 'winter'];
let currentSeason = 0; // Default to spring
// spring colors
let COLOR_SETS = {
  blueGreen: ['#024d53', '#599dbc', '#72d1c7', '#a9ffe6'],
  water: ['#87c7df', '#986b41', '#bd8e64', '#d7b588'],
  ice: ['#0038d0', '#50b0f8', '#f8f8f8'],
  cat: ['#000', '#222', '#666', '#e54350'],
  grass: ['#ddb982', '#d6af74', '#34ac5c', '#55c768'],
  spring: ['#000', '#f8f8b0', '#d8f850', '#58e000', '#b0f838', '#60c800', '#e8c040'],
  summer: ['#000', '#f8f870', '#a0f820', '#28a800', '#a0f820', '#308800', '#c08018'],
  fall: ['#000', '#f8f8b8', '#f8d000', '#d8a000', '#f8a050', '#e00000', '#e8a070'],
  winter: ['#000', '#f8f8f8', '#d8d8f8', '#a0a0f8', '#f8f8f8', '#50e0e8', '#e0b8c0'],
  wall: ['#000', '#e8e0f0', '#b888d0', '#904070'],
};

// CAUTION! If new assets are added, push them at the end of the object, or it will break RLE
const TILE_DATA = {
  grass: {
    rle: '16XMeXNeZUeMYMZMeTYeMZNYUYMZMZUZM[WYMYMYWYSeXNZeXeMZMYMeTYNZMeYTZMZMYV[MZVYMYMYXOYV',
    colors: [1, 2, 3],
  },
  water: {
    rle: '64LLKfXXOBqAvBqErFsEqeYXXOAseYgvBrerBsesAreYXXPBqf[jshrlqgYXXPAqf^NZfZM[gM[iYXXQAqeZU[O\\P^XXRAqeYXXXXXAqeYXXXXXAqfXXXXXAqfXXXXXBqeXXXXXBqYXXXXXAreXXXXXBqeYXXXXWBqeYXXXXWCqeXXXXW',
    colors: COLOR_SETS.water,
    isStatic: true,
  },
  road: {
    rle: '64HqLGeFedd\\ErAeqBqDrAqeqAeqAfDqfdd\\CrfqfreqAeqfqgqfqgAhdd]BqgYfYhqfZfZfYfYeqgdd^Aqfafae]eYedd_AqfdddddqfdddddYqfdddddYAqfdddddAqedddddYBqedddddAqgddddcBreddddcAredddddAqedddddYBqeddddd',
    colors: [1, 2, 3],
    isStatic: true,
  },
  characters: {
    rle: '144FPKQLPLLLLLLLLJNhNGNiNHNhNJPKQLPLPKQLPIMlMEMmMFMlMGNhNGNiNHNhNHNhNGNiNHNhNGMlMEMmMFMlMFMlMEMmMFMlMFMlMEMmMFMlMFMlMEMmMFMlMFMlMEMmMFMlMFMlMEMmMFMlMFMe[eZeMEMe]gMFMlMFMlMEMmMFMlMFMlMEMmMFMlMEMYe^eYMEM]fNEMYlYMEMeZe[eMEMe]gMFMlMFMeZe[eMEMe]gMFMlMFMZMZMZMFMYM[eMYMFMlMEMYe^eYMEM]fNEMYlYMDMYe^eYMEM]fNEMYlYMFMYMZMYMGMYM]MHMjMGMZMZMZMFMYM[eMYMFMlMFMZMZMZMFMYM[eMYMFMlMFO\\OGM\\NHO\\OFNYMZMYNFMYM]MHNhNGNYMZMYNFMYM]MHNhNFMsPsMGPqMGMsPsMDMrM\\MrMFM\\NHMrPrMEMrM\\MrMFM\\OGMrPrMDMrMrZrMrMFNsMFMrMvMrMCOqPqMqYMEQqNFMYMvOCMYqMqPqOFQsMEOvMYMCMrMvMrMFMqMrMFMrMvMrMCMZMuNYMDMZtMYMFNuMZMCMYNuMZMEMYNrMqYMEMZMuNEMYTYMGMqMYNGMYTYMEUANEOtMHUDNAUGNtMYMFUGNvNHOYMINvNHMYNrMISHMrNYMIMrNYMJSIMYNrMHMZNZMIMZNJMZNZMJOZMHMZNZMHMZOJMZOJMZNZMJOZMJPKQLPLLLLLLLLJNhNGNiNHNhNJPKQLPLPKQLPIMlMEMmMFNjNGNhNGNiNHNhNHNhNGNiNHNhNGMlMEMmMFMlMFMlMEMmMFNjNFMlMEMmMFNjNFMgYhMEMmMFMlMFMlMEMmMFMlMFMlMEMmMFMlMFMe^eMEMeZjMFMlMFMgYhMEMmMFMlMFMgYhMEMmMFMlMEMYe^eYMEM[hMeMDMYlYMEMe^eMEMeZjMFMlMFMe^eMEMeZjMFMlMFMeYMZMYeMFMYMYgMYMeMDMgNgMEMYe^eYMEM[hMeMDMYlYMDMYe^eYMEM[hMeMDMYlYMFMYMZMYMGMYMYfZMfMEMeMfMeMGMeYMZMYeMFMYMYgMYMeMDMgNgMFMeYMZMYeMFMYMYgMYMeMDMgNgMGN\\NHM\\NfMFNhNHMYMZMYMGMYMYfZMfMEMeMfMeMHMYMZMYMGMYMYfZMfMEMeMfMeMGMrPrMHSeMEMqMhMqMFMqM\\MqMGM\\NfMEMqMhMqMFMqM\\MqMGM\\NfMEMqMhMqMFMsZsMGMqNqMANFMrMfMrMFMqQqNHSfMDMqMgPFNqQqMGTfMDMqNgOEMYNtNYMFMrMYMHMYNqNqNYMEOtMZMFMrYNYODMZNeQEMZMtOGMsMZOEQeNZMCMZNtNZMFMqMYMGMZNtNZMCMZMtPFM[PFPqNqMZMDPtMZMEMYMrNYMFMZMqNqPDOZNZOGMZNHOZNZOEOYNZMIOqYMIMZNYOGMZNYOGMZNqNGOYNZMIMYNYMKMYMLMYNYMKOYMJMYNYMJMYOKMYOJMYOYMKOYME',
    colors: ['#000', '#e3b38d', '#dfa245', '#017949'],
    collisionPadding: [10, 4, 2, 4],
  },
  tree: {
    rle: '32GYXQYKYOe\\eOe\\eOYHYMe\\hZi\\eMeFeOeYgagYePDNe[gdf[eNBeMe[gdYf\\eMYAMe\\gdYg\\NeMe\\gdYg\\eNf\\h[f^g]eNf]m[i\\fNg\\ph]fOf_fZhZe\\eZePgYeaf`eYfNeMeMgdZe[gMeMePhYe[e_fZgQeNfMhYf[eZlNeNfNeMlZlMeNfNgOhMnMfOgOhNgMiMhMeNhNqMeMgRgOfPgMeMqPlQePjQqOpnOqNsNfMpMhNsOrSgOgTrNqNqMqAuPqPvMrMtMqC|uArNrAqMqCsMrDtMtArMrAqMqAsPqDsPuMrBMsOrMrBtMrOvBqOvMvNtPrGwNrOzKuPvH',
    colors: [0, 4, 5, 6],
    isStatic: true,
    size: [2, 2],
  },
  hole: {
    rle: '16AeBYeAZAeYBeAeMYeMZNZMeYMeAYMYTYMYAfXfZXZXPeXNeAYXYBYXYAeXNeXPZXZfXfAYMYTYMYAeMYeMZNZMeYMeAeBYeAZAeYBeA',
    colors: [0, 6],
    isStatic: true,
  },
  leaves: {
    rle: '16M[R]MYN]MYP[MYNZMYNYMZM[MYMYMYMYM[NYMYN\\NZMZPYP[N^NYM_M[NYNZPZNYMYNZNYM_N[MYNYMZN_NZMYMYNZN^MYNYMZMYMYMYM\\NZMYNYNYMYM\\P[NZO_N[M',
    colors: [4, 5],
    isStatic: true,
  },
  ice: {
    rle: '16OYMYeZeYNZMYOYMYeYfYN\\OYMYeYfYN\\OYMYeYfYN\\OYMYeYfYNYeZOYM[fZMYeZO[MYfZMYeZO[MYgYMYeZO[MZfYMYeZO[MZfYMYeZMYM^eZM[NYMZM[eZM[NYMZM^NZNYNYM^NZNYNYM^NZN',
    colors: COLOR_SETS.ice,
    isStatic: true,
  },
  bush: {
    rle: '16LJOLAMrNHOfqeqNEMqiqfqMCMqhqiqMCMiqiMBMZqgrerMCMYqeqjrMBMqgYrZqeqMBMqfYqeqZfqMBMe[qf[eMDM[f\\eMEM[e\\MH^LI',
    colors: [0, 4, 5, 6],
  },
  cat: {
    rle: '16IMCMJMYMAMYMHMYqeMeqMGMYkMFMYkMBOAMlMAMZeNfMeYeMeNYeMYNgYqYfNeMAOf]MAMfNZg[MBMf[jNCMnYMCMnYMCMgPgNCMfNCMeMeMCMYMeMCMYMeMB',
    colors: COLOR_SETS.cat,
  },
  fireball: {
    rle: '32LLLLLLLLLLLBPLPKM\\MJMhMIMZfZMHMfZfMHMYhYMHMe\\eMHMYhYMHMe\\eMHMZfZMHMfZfMIM\\MJMhMKPLPLLLLLLLLLLLB',
    colors: COLOR_SETS.fall,
    animationSpeed: 100,
    moveSpeed: 4,
    collisionPadding: [8, 8, 8, 8],
  },
  wall: {
    rle: '112eqXXXXXqePpphPlPqMeddddbeMqMqNexewewerMqNewNqNe[ppppkZeOqMexewewerNqMewMqO[qXXXXRqeZPqexewewerOqexPZqMqpppphqMqeYQpphPlQYeMqfYeYmqgYgqgYeYkYkYjYfqMeYNqNtewewewMqNweNqNYeMjqfYplqfYhqfYhqfYjMeYOqMtewewewNqMweMqOYeMeqkqgYkYoqkqkqhqeMeYPuewewewOxeqPYeMgYpfqkqppeYgMeYMYOpphYOlOYMYeMqiYgqpppmMeYNYNexewewerMYNewNYNYeqMqeYfqkqfYhqfYjYjYlYgYgMeYNqYXXRqYVYqNZeqMrpphqjqlqkMeYNrdd]MrbrNqZeqXXPpPlqeMeYNrppiMrnrOqZpphqMgYfYgMqfqMgYiMeYNrppiMrnrMeNdd^eqMlMqeZeqMlMeYMqMqppiqMqnqMreXXRqYeMlMeYrYeMlMeYMeqXXReqXqe',
    colors: COLOR_SETS.wall,
    isStatic: true,
  },
  spikes: {
    rle: '32LGMGMLJMYMEMYMLIMYMEMYMDQCQCNYNCNYNCNYNCNYNCMeYeMCMeYeMCNYNCNYNCMqYqMCMqYqMCQCQCQCQLLLLEMGMLJMYMEMYMLIMYMEMYMDQCQCNYNCNYNCNYNCNYNCMeYeMCMeYeMCNYNCNYNCMqYqMCMqYqMCQCQCQCQLLJ',
    animationSpeed: 1000,
    colors: COLOR_SETS.wall,
  },
  'blade-trap': {
    rle: '16ENBNIMYMBMYMGMZMBMZMEMZePeZMCMZeMhMeZMAMZeMjMeZReMfMeQCNeMfMeNFNjNCRhSZfRfZMAMZfPfZMCMZePeZMEMZMBMZMGMYMBMYMINBNE',
    colors: COLOR_SETS.wall,
    moveSpeed: 3,
    returningMoveSpeed: 0.75,
    collisionPadding: [1, 1, 1, 1],
  },
};

// Game constants
const TILE_SIZE = 16; // Original tile size in pixels
const WORLD_WIDTH = 50;
const WORLD_HEIGHT = 50;
const DISPLAY_WIDTH = 25;
const DISPLAY_HEIGHT = 15;

// Orientation constants
const ORIENTATION_UP = 1;
const ORIENTATION_RIGHT = 2;
const ORIENTATION_DOWN = 3;
const ORIENTATION_LEFT = 4;

const BLOCKING_TILES = ['tree', 'bush', 'wall'];
const HOLE_PADDING = [11, 7, 5, 7];

const BLADE_TRAPS_LIST_PER_ROW = [];
const BLADE_TRAPS_LIST_PER_COL = [];
