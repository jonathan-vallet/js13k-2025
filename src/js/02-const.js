let setLocalStorage = (key, value) => localStorage.setItem(key, value);
let getLocalStorage = (key, defaultValue = null) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : defaultValue;
};

function clamp(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(maxValue, value));
}

let seasonList = ['spring', 'summer', 'fall', 'winter'];
let availableSeasons = [];
let currentSeason;
// spring colors
let COLOR_SETS = {
  water: ['#87c7df', '#986b41', '#bd8e64', '#d7b588'],
  ice: ['#0038d0', '#50b0f8', '#f8f8f8'],
  cat: ['#000', '#222', '#666', '#e54350'],
  spring: [
    '#000',
    '#76af2b',
    '#d8f850',
    '#58e000',
    '#b0f838',
    '#60c800',
    '#e8c040',
    '#1c495a', // water N
    '#6e6e71', // water R
    '#76af2b', // water G
    '#91897f', // water B
    '#8ec42b ',
    '#519034',
    '#36721b',
    '#b9f746',
  ],
  summer: [
    '#000',
    '#e4b800',
    '#a0f820',
    '#28a800',
    '#a0f820',
    '#308800',
    '#c08018',
    '#632251', // water N
    '#816d70', // water R
    '#e4b800', // water G
    '#aa8b7f', // water B
    '#e4ce00 ',
    '#c89132',
    '#a57116',
    '#ffe960',
  ],
  fall: [
    '#000',
    '#dc752b',
    '#f8d000',
    '#d8a000',
    '#f8a050',
    '#e00000',
    '#e8a070',
    '#501e4a', // water N
    '#6e5b86', // water R
    '#dc752b', // water G
    '#9b7ba3', // water B
    '#e2892c',
    '#c16624',
    '#a94c09',
    '#fab770',
  ],
  winter: [
    '#000',
    '#9dace0',
    '#d8d8f8',
    '#a0a0f8',
    '#f8f8f8',
    '#50e0e8',
    '#e0b8c0',
    '#181d3e', // water N
    '#cfd3e1', // water R
    '#9dace0', // water G
    '#aac4e1', // water B
    '#aac4e1',
    '#7382dd',
    '#5666be',
    '#c2e8f7',
  ],
  wall: ['#120922', '#7e4794', '#d77cd8', '#512c7d'],
  heart: ['#000', '#ff0000', '#ffffff'],
  sign: ['#342112', '#ab513c', '#cd664e', '#632251'],
};

// Orientation constants
const ORIENTATION_UP = 1;
const ORIENTATION_RIGHT = 2;
const ORIENTATION_DOWN = 3;
const ORIENTATION_LEFT = 4;

// CAUTION! If new assets are added, push them at the end of the object, or it will break RLE
const TILE_DATA = {
  grass: {
    rle: '16qDgEwBgAqDqAqArBfAqAqKeAsgufAesgrAqAgsAqfqCqgrAqBerDfrAgAeDqAeEfCfAqAeCeBfAfAfqCfBfAfqgAqgAreqerAfrfqAtfAqAeBetArfqBeDqAqDeArLeA',
    colors: [0, 1, 11, 12],
  },
  plant: {
    rle: '16qLuEsEqArCqgqEtAqfAfqCqCrgqfAqAsCqeAsAqMsAMBqAfqArMArAqMBqAeBqMBqBrMBMBqMCqBvOCMqAsBsMzCrNvArCqNrDrAqMBqMrDrCqMBMAqCrArBMHrA',
    colors: [13, 1, 14, 12],
  },
  water: {
    rle: '64LLINYrddZLAMHNCMFMYrddZINBPCOCOFMrddZGPCPCNBM[PCMqddZHPBM[MBMYN`Oqdd[DNCMZMAMYsMAM|sdd[CNYOtMvM|sdd\\CMZzddddDMtdddd_EMqddddaBOqddddbCNqddddbEMddddbFMddddaNEMdddd`Sdddda',
    colors: [7, 8, 9, 10],
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
    collisionPadding: [10, 4, 0, 4],
  },
  tree: {
    rle: '32FNBRAPLDMYeN[gMYfYOAOHMYjZfYgYfYMfYMGOfYfafZhMEMfdZfZjMCMgddYMBMYfYfdZhYNYMAMYeMYi`f\\hYMBMeM[gYMf[jMfZfNAN[gNfZMgYMgMfYMeOYMYNgMgYNgYMgMgYMYNePeOgPfNfOfNYNeMZNYNfNZNeOePeMYMBMe_MeM\\NZN[NZMAMfYMeYe[MZebe[eMAMfMhM\\fYMeYe[eYfYgNeOfMfYMgMiYfMfNfMANYNeMfMgNfMfMfMeRAMfYReYOeReOYeYMBMg\\QYO\\OYeYgMAMfMYfYeZfZfZf\\fMfMBOgNYgYMfNgYMgOEMfPfTfNfMIOqXRHrMtNrMrNqNtNrDrM[qMtMsMrNqYsMrBrM[qMZrNZqMsMq\\qMrAqMZsMZrMqZqMqZOqZrMqAqMrOZsMqZqMq[qPrMCtMZrO\\Nq[rMrMqDwOqZsPZqOqGwSyD',
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
    rle: '64LLIN[gYe[g]eYe]fLAMHNCMFMZeYeYe[g]eYe]gINBPCOCOFMeYeYe[g]g]eYeYGPCPCNBNfPCMe]eYe]gYe[eYeZHPBM[MBMYNYg\\Oe]eYe]gYe[eYe[DNCMfMAMZfMAM[g]eYe[eYeYe]eYeYe[g[eCNYOfZMZgYM[g]g[eYg]eYeYe[g[eYCM[eYeYe[g]gYe[g[eYg]eYe]eYe[eYeDMYeYeYe[eYe[eYeYeYe[g[eYg]g]eYeYeYeYeYEMYeYe[eYe[eYeYeYe[eYe[eYg]eYe]eYeYe[eYeBOf]eYe[eYeYeYe[eYe]eYe]eYe]gYe[gYCNe]gYeYeYgYeYeYeYe]eYe]eYe]gYe[gZEM\\eYeYe[g[eYg]eYe]eYeYe[g]gYeYFMZeYeYe[g[eYgYe[gYe[gYe[gYe[gYeZNEMeYe]g[eYgYe[gYe[gYe[gYe[gYe[Sg]g[eYgYe[gYe[gYe[g]g]e',
    colors: [7, 8, 9],
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
    moveSpeed: 3,
    collisionPadding: [8, 8, 8, 8],
  },
  wall: {
    rle: '112XqXOqXOrQqXP|M||sRYlYMYpeYMYplYMYkYS|M||sQYnMpgMpnMmYOqN|M||sNqNfYTqXOqXVqTYeYOYMqbqMqdYrbqMYOfMdddd`MfPYTqRsQtPqTYPfMdddd`MfOsfqMqpeqMqpqMqfsNqNqdddd`MfNs\\Md[MdZM\\sNfMdddd`MfOr\\Md[qdZM\\rOfMdddd`MfNqMq\\Md[MdZM\\qMqNfMdddd`MfOYM\\MqdZMdYqM\\MYOfMdddd`MfPYqZqRqZqQqMq_qRqZqYPfMdddd`MfOqYQiPiWiQYqOfYQqXRqRbRaqNqMshM]MfM]MmM]MhsNYjYMYphYMYhYM`MYhYM`MfMqMr\\q]qZq]qaq]q\\rMqNYjMpjMjM`MjM`MfMrMq\\q]qZq]qaq]q\\qMrUqXRqOYfM`MfZfM`MfMerXXXRre',
    colors: COLOR_SETS.wall,
    isStatic: true,
  },
  snow: {
    rle: '112eqeYQYgYP\\X\\X\\RYeqeMYevlxkMYezeYMqYNYgYQ[RYlYRYlYRYgYNYqMYftosnMYfxfYMeMYetf[greZf{eZf{eZfueYMeMYm^n]MYpYMYMe||||zeMYMZidYg`MZnZNY|||||YNdd_MdZNe|||||eOdd^NdOe|||||eOdd^NdOe|||||eOdd^NdOe||||{eYOdd^NdOe||||{eMYNdd^NdOe||||{YMeNdd^NdOY||||{YMeYMdd_MdMZMe||||zYMeYNd_P_NbNYeMYe||||yeMYePdYXZeP^PeqYNYo|||yeYMqeXXRqeXeqeqeYX|||yeYMeqeZXQ\\ReqeZRZeqe',
    colors: [0, 3, 5, 1],
    isStatic: true,
  },
  spikes: {
    rle: '32LGMGMLJMYMEMYMLIMYMEMYMDQCQCNYNCNYNCNYNCNYNCMeYeMCMeYeMCNYNCNYNCMqYqMCMqYqMCQCQCQCQLLLLEMGMLJMYMEMYMLIMYMEMYMDQCQCNYNCNYNCNYNCNYNCMeYeMCMeYeMCNYNCNYNCMqYqMCMqYqMCQCQCQCQLLJ',
    animationSpeed: 1200,
    colors: COLOR_SETS.wall,
  },
  'blade-trap': {
    rle: '16ENBNIMYMBMYMGMZMBMZMEMZePeZMCMZeMhMeZMAMZeMjMeZReMfMeQCNeMfMeNFNjNCRhSZfRfZMAMZfPfZMCMZePeZMEMZMBMZMGMYMBMYMINBNE',
    colors: COLOR_SETS.wall,
    moveSpeed: 3,
    returningMoveSpeed: 0.75,
    collisionPadding: [1, 1, 1, 1],
  },
  'follow-trap': {
    rle: '32DPLFNHMgMLEMeMHMZeMHQCMYeMGRCNAMgRYeMFNhPeNeZNhNeMENfNfMZeRfNfODMeMfNfMYfMCNfNfOCMfMYhYMfMCOYhYOBMfYN\\NeNBMYO\\OYMAMe[TYMBNeSYMYMAMeTYNYMBNeYRZQYOf[NYMBNe[O\\eMAMZOfZMZMBNeZOiMBNZfMfYMYNBNeYMgRCSgNDNeUEVFVC',
    colors: COLOR_SETS.wall,
    animationSpeed: 100,
    moveSpeed: 1.3,
    collisionPadding: [1, 1, 1, 1],
  },
  heart: {
    rle: '16LLLLDNCNHMZMAMZMFM\\M\\MEMaMEMaMFM_MHM]MJM[MLMYMLBMLLLLH',
    colors: COLOR_SETS.heart,
  },
  'dungeon-ground': {
    rle: '16qYjqYjqYjqYjqYjqYjqYjqYjqYjqYjqYjqYjq_q_|uYjqYjqYjqYjqYjqYjqYjqYjqYjqYjqYjqYjq_q_|t',
    colors: COLOR_SETS.wall,
    isStatic: true,
  },
  crack: {
    rle: '16eYO^OYf[M\\MZMZe\\MYM]M_M]MYM_P[N^NYeYQ\\OYeZfYPYP[M[NYNYeYN^MYfYe[M\\MZMZe\\MYM]M_M]MYM_P[N^NYeYQ\\OYeZfYPYP[M[NYN',
    colors: COLOR_SETS.wall,
    isStatic: true,
  },
  liana: {
    rle: '16ZMeOeMfNeMeYNeMYMeMeNfOfMeNeNYMeMYNeNeOeOeNZMYMeMYMeNfMZMYNeReMYNeNeNfOeNhMeMYMfNeMfNeMeMZOYMeOYNePeMYMeM\\MeMfMeMYMeMZMfMYMfNZMeMYfNZPZMeMYNfYMYMeMZMeM[MeYeNeMhMYOeNfNeNeN',
    colors: [0, 2, 3],
    isStatic: true,
  },
  mommy: {
    rle: '16DSFOf[fMDMZMe^eMCMfNYNYMYeNBMZSYeMYMAMfM\\hMZNZMf]eMeYNfMeZfOZeNeZMeZMZeZeMAMeYePZeYeMCMjRBM_iMBMhOe\\MAM\\QhX]MAXO',
    colors: COLOR_SETS.wall,
    animationSpeed: 400,
    moveSpeed: 0.8,
    moveDirection: ORIENTATION_RIGHT,
    collisionPadding: [1, 1, 1, 1],
  },
  skeleton: {
    rle: '16FRIMjMGMgYhMFMeNZNeMCPeMhMeOAMfMYfNfYMeMAMfOhNfMBMgMeNeMfMBMYMfReMYMAQZNZNYMAMfMYNZNYOAMfNZNZMfMBWfMDMfOZODMgRFQH',
    colors: COLOR_SETS.wall,
    animationSpeed: 500,
    moveSpeed: 0.8,
    moveDirection: ORIENTATION_DOWN,
    collisionPadding: [1, 1, 1, 1],
  },
  rock: {
    rle: '16F[NINerfMFYMshYNCYvYeYqfMBYsgYseYMBYqhYseZOgYfZfZMeNiZe[MeYNYgsYNYMZN[rgMZMYMYAOqhMYMfYNYqeYeYeZNeYOseYfZNYPreYMe[NYNBMeZOYNYNDOAPYE',
    colors: ['#000', '#c08018', '#e0b8c0'],
    isStatic: true,
  },
  root: {
    rle: '16BQFNBMerYPBMqMAN[MerYMAMeMAMYQZeNeYMAMZMCOYMYMBqNqAMBMYeqMDrAMeMAMZeqMFMYMBMZeMEPBOYMDMereMAMZNCMeYNYMAMYfYMBMYMBNAMZeYMBMYMENZNAqOqDqPqBsFtIrG',
    colors: [0, 4, 5, 6],
    isStatic: true,
  },
  checkpoint: {
    rle: '16LLLLLLLLLLLLLLLLLLLLLD',
    colors: [],
  },
  trigger: {
    rle: '16EePeHeNYfYNYEYMe]eYNCYMeYese]AeMeYseYreYeMe[eqfYqfqe[MeYqfYeZfqYeNeYqeYeqeZeqYeNeYeqeYeqYf[NYeYreZfZeYOqeYes[eYNAZeqe\\fYNCYMYfreZNEYN[PGYSLH',
    colors: COLOR_SETS.wall,
  },
  orb: {
    rle: '32E^LLbLI\\t\\HtG[x[ExEZrfvZDrfvC[qgv[CqgvCZrgwZBrgwBZ|ZB|BZ|ZB|BZ|ZB|B[z[CzDZzZDzD[x[ExF\\t\\HtIbLL^LI',
    colors: [0, 4, 5, 6],
    animationSpeed: 800,
  },
  sign: {
    rle: '16AXNAMYpYNqdqXRqMYlYMqNqMeMYeMeOeMqNYMkMfMYNYMePYeNeMeNYMYlYMYXRq[j[qMAXNGMrMKqMrMqIrMZMrIvE',
    colors: COLOR_SETS.sign,
    isStatic: true,
  },
  mushroom: {
    rle: '16LJPJN\\NGMZeZeZMEMbMCMZe^eZMBM\\eZe\\MBMYe`eYMBN[eZe[NCN`NEVHMhMIMqhqMHMqhqMIRLI',
    colors: [0, 5, 2, 6],
  },
};

// Game constants
const TILE_SIZE = 16; // Original tile size in pixels
const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 62;
const DISPLAY_WIDTH = 19;
const DISPLAY_HEIGHT = 11;

const BLOCKING_TILES = ['tree', 'bush', 'wall', 'crack', 'rock', 'snow', 'root', 'sign', 'mushroom'];
const HOLE_PADDING = [11, 7, 5, 7];
