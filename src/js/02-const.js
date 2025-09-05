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
  spring: [
    '2d2122',
    '5f4d2e',
    '519034',
    '76af2b',
    '8ec42b',
    'b7c42b',
    '6e6e71', // water
    '91897f', // water
  ],
  summer: [
    '2d2122',
    '8b4f44',
    'c89132',
    'e4b000',
    'e4ce00',
    'e4ce00',
    '6e6e71', // water
    '91897f', // water
  ],
  fall: [
    '2d2122',
    '802c36',
    'c16624',
    'dc752b',
    'e2892c',
    'fab770',
    '6e5b86', // water
    '9b7ba3', // water
  ],
  winter: [
    '2d2122',
    '644683',
    '7382dd',
    '9dace0',
    'aac4e1',
    'c2e8f7',
    'cfd3e1', // water (ice)
  ],
  dungeon: ['0d1b2a', '5a5a7c', '73849c', '3b2e72'],
};

// Orientation constants
const ORIENTATION_UP = 1;
const ORIENTATION_RIGHT = 2;
const ORIENTATION_DOWN = 3;
const ORIENTATION_LEFT = 4;

// CAUTION! If new assets are added, push them at the end of the object, or it will break RLE
const TILE_DATA = {
  grass: {
    rle: '16MD[ESB[AMDMAMANBZAMAMKYAO[QZAYO[NAMA[OAMZMCM[NAMBYNDZNA[AYDMAYEZCZAMAYCYBZAZAZMCZBZAZM[AM[ANYMYNAZNZMAPZAMAYBYPANZMBYDMAMDYANLYA',
    colors: [2, 4],
  },
  plant: {
    rle: '16YL]E[EYAZCYgYE\\AYfAfYCYCZgYfAYA[CYeA[AYM[AMBYAfYAZMAZAYMBYAeBYMBYBZMBMBYMCYB^OCMYA[B[MbCZN^AZCYNZDZAYMBYMZDZCYMBMAYCZAZBMHZA',
    colors: [1, 2, 5],
  },
  water: {
    rle: '64LLINYfddZLAMHNCMFMYfddZINBPCOCOFMfddZGPCPCNBM[PCMeddZHPBM[MBMYN`Oedd[DNCMZMAMYgMAMpgdd[CNYOhMjMpgdd\\CMZnddddDMhdddd_EMeddddaBOeddddbCNeddddbEMddddbFMddddaNEMdddd`Sdddda',
    colors: [1, 6, 7],
    isStatic: true,
  },
  ice: {
    rle: '64LLIN[gYe[g]eYe]fLAMHNCMFMZeYeYe[g]eYe]gINBPCOCOFMeYeYe[g]g]eYeYGPCPCNBNfPCMe]eYe]gYe[eYeZHPBM[MBMYNYg\\Oe]eYe]gYe[eYe[DNCMfMAMZfMAM[g]eYe[eYeYe]eYeYe[g[eCNYOfZMZgYM[g]g[eYg]eYeYe[g[eYCM[eYeYe[g]gYe[g[eYg]eYe]eYe[eYeDMYeYeYe[eYe[eYeYeYe[g[eYg]g]eYeYeYeYeYEMYeYe[eYe[eYeYeYe[eYe[eYg]eYe]eYeYe[eYeBOf]eYe[eYeYeYe[eYe]eYe]eYe]gYe[gYCNe]gYeYeYgYeYeYeYe]eYe]eYe]gYe[gZEM\\eYeYe[g[eYg]eYe]eYeYe[g]gYeYFMZeYeYe[g[eYgYe[gYe[gYe[gYe[gYeZNEMeYe]g[eYgYe[gYe[gYe[gYe[gYe[Sg]g[eYgYe[gYe[gYe[g]g]e',
    colors: [1, 3, 6],
    isStatic: true,
  },
  character: {
    rle: '64LLLLLLLLLLLLLLLLHOLLLLLQIOLFOLLBRGQLDQLOIQHRLCSJQHMfYMJQLAMfNLSCVHVCTYeMKMfNEMbNDNYQYPAN_OETYeMDMZT[MBOeQeRZQ[NCN_ODMYWZQYeOeYRYUZMBMZQ[NCTeQYRYgYRAOeTYMAMYUZMBOePeOeXSBNeQeOYMAOeTYMBNeMeMfMeMeXRDMeMgMeOYMBNeQeOYMAOfMfMfOBXNCMfMhRCMeMgMeOYMBNYjYNDXDMjYQCMfMhRDMYhYMHTGMgZPEMjYQDMeReMFMYNfNeMGQJMgZPEMeOfNfMEMYRYeMGMfNJRHMYSfMFTYMGMfOJMfOHWEVHSHNfQFMhQFWFUFWEVFWFUFWB',
    colors: ['000', 'e3b38d', 'dfa245'],
    collisionPadding: [18, 4, 1, 4],
    size: [1, 1.5],
  },
  tree: {
    rle: '32FNBRAPLDMYeN[gMYfYOAOHMYjZfYgYfYMfYMGOfYfafZhMEMfdZfZjMCMgddYMBMYfYfdZhYNYMAMYeMYi`f\\hYMBMeM[gYMf[jMfZfNAN[gNfZMgYMgMfYMeOYMYNgMgYNgYMgMgYMYNePeOgPfNfOfNYNeMZNYNfNZNeOePeMYMBMe_MeM\\NZN[NZMAMfYMeYe[MZebe[eMAMfMhM\\fYMeYe[eYfYgNeOfMfYMgMiYfMfNfMANYNeMfMgNfMfMfMeRAMfYReYOeReOYeYMBMg\\QYO\\OYeYgMAMfMYfYeZfZfZf\\fMfMBOgNYgYMfNgYMgOEMfPfTfNfMIOqXRHrMtNrMrNqNtNrDrM[qMtMsMrNqYsMrBrM[qMZrNZqMsMq\\qMrAqMZsMZrMqZqMqZOqZrMqAqMrOZsMqZqMq[qPrMCtMZrO\\Nq[rMrMqDwOqZsPZqOqGwSyD',
    colors: [0, 2, 4, 1],
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
  bush: {
    rle: '16LKNGOCMZMCPZMAM\\MAMZN[N\\N[NYeZMYNYMZeYNYfZMZMZfYN[eYMZMYfZMBQfQCM[ePe[MAMZgMfMgZN[fYfYf[N\\MYfYM\\S\\REM\\MKPF',
    colors: ['000', 1, 2, 3],
  },
  cat: {
    rle: '16IMCMJMYMAMYMHMYqeMeqMGMYkMFMYkMBOAMlMAMZeNfMeYeMeNYeMYNgYqYfNeMAOf]MAMfNZg[MBMf[jNCMnYMCMnYMCMgPgNCMfNCMeMeMCMYMeMCMYMeMB',
    colors: ['000', '222', '444', 'e54350'],
  },
  fireball: {
    rle: '32LLLLLLLLLLLBPLPKM\\MJMhMIMZfZMHMfZfMHMYhYMHMe\\eMHMYhYMHMe\\eMHMZfZMHMfZfMIM\\MJMhMKPLPLLLLLLLLLLLB',
    colors: COLOR_SETS.fall,
    animationSpeed: 100,
    moveSpeed: 3,
    collisionPadding: [7, 7, 7, 7],
  },
  wall: {
    rle: '112XqXOqXOrQqXP|M|sPxRYlYMYpeYMYplYMYkYS|M|sPxQYnMpgMpnMmYOqN|M|sMqNxNqNfYTqXOqXVqTYeYOYMqbqMqdYqNYMq^qMYOfMd\\MZqd[Md\\q[MfPYTqRsQtPYTYPfM_M]qZP]q[sQYtbM[MfOsfqMqpeqMqjNsjsNqNqYqZqZMZqZqZMZMZqZq_q]q`sPYMfNs\\Md[M_Ms`sNfMYqZqZqZrYMZqZqZu^M]MdYqZMfOr\\Md[q_Nr`rOfMYMZMqNZqZNrZMZqZq[sOqPq]q^qZMfNqMq\\Md[M_MqMq`qMqNfMYPZOqZMZqZOqZq]q]M`M^MZMfOYM\\MqdZM_NYM`MYOfMYqZMZqZqZq]MZqZqcq^qOqRqMfPYqZqRqZqQqMq^OYq^qYPfM_qcqdYqOrdZMZMfOqYQiPiWqYTYqOfYQqXRqR\\M]Rq]qZqNqMshM]MfM]MlMslsNYjYMYphYMYhYM[q\\MYhYMYvYMfMqMr\\q]qZq]q`qMr`rMqNYjMpjMjM`MjM`MfMrMq\\q]qZq]q`rMq`qMrUqXRqOYfM`MfZfM`MfMYrXXQYrVrY',
    colors: COLOR_SETS.dungeon,
    isStatic: true,
  },
  snow: {
    rle: '112eqeYQYgYP\\X\\X\\RYeqeMYevlxkMYezeYMqYNYgYQ[RYlYRYlYRYgYNYqMYftosnMYfxfYMeMYetf[greZf{eZf{eZfueYMeMYm^n]MYpYMYMe||||zeMYMZidYg`MZnZNY|||||YNdd_MdZNe|||||eOdd^NdOe|||||eOdd^NdOe|||||eOdd^NdOe||||{eYOdd^NdOe||||{eMYNdd^NdOe||||{YMeNdd^NdOY||||{YMeYMdd_MdMZMe||||zYMeYNd_P_NbNYeMYe||||yeMYePdYXZeP^PeqYNYo|||yeYMqeXXRqeXeqeqeYX|||yeYMeqeZXQ\\ReqeZRZeqe',
    colors: [1, 3, 5, 6],
    isStatic: true,
  },
  spikes: {
    rle: '32LGMGMLJMYMEMYMLIMYMEMYMDQCQCNYNCNYNCNYNCNYNCMeYeMCMeYeMCNYNCNYNCMqYqMCMqYqMCQCQCQCQLLLLEMGMLJMYMEMYMLIMYMEMYMDQCQCNYNCNYNCNYNCNYNCMeYeMCMeYeMCNYNCNYNCMqYqMCMqYqMCQCQCQCQLLJ',
    animationSpeed: 1200,
    colors: COLOR_SETS.dungeon,
  },
  blade: {
    rle: '16ENBNIMYMBMYMGMZMBMZMEMZePeZMCMZeMhMeZMAMZeMjMeZReMfMeQCNeMfMeNFNjNCRhSZfRfZMAMZfPfZMCMZePeZMEMZMBMZMGMYMBMYMINBNE',
    colors: COLOR_SETS.dungeon,
    moveSpeed: 3,
    returningMoveSpeed: 0.75,
    collisionPadding: [1, 1, 1, 1],
  },
  seeker: {
    rle: '32DPLFNHMgMLEMeMHMZeMHQCMYeMGRCNAMgRYeMFNhPeNeZNhNeMENfNfMZeRfNfODMeMfNfMYfMCNfNfOCMfMYhYMfMCOYhYOBMfYN\\NeNBMYO\\OYMAMe[TYMBNeSYMYMAMeTYNYMBNeYRZQYOf[NYMBNe[O\\eMAMZOfZMZMBNeZOiMBNZfMfYMYNBNeYMgRCSgNDNeUEVFVC',
    colors: COLOR_SETS.dungeon,
    animationSpeed: 100,
    moveSpeed: 1.3,
    collisionPadding: [1, 1, 1, 1],
  },
  heart: {
    rle: '16LLLLDNCNHMZMAMZMFM\\M\\MEMaMEMaMFM_MHM]MJM[MLMYMLBMLLLLH',
    colors: ['000', 'f00', 'fff'],
  },
  ground: {
    rle: '16qYjqYjqYjqYjqYjqYjqYjqYjqYjqYjqYjqYjq_q_|uYjqYjqYjqYjqYjqYjqYjqYjqYjqYjqYjqYjq_q_|t',
    colors: ['514970', '7676a2', '8686b4', '6a648e'],
    isStatic: true,
  },
  crack: {
    rle: '16eYO^OYf[M\\MZMZe\\MYM]M_M]MYM_P[N^NYeYQ\\OYeZfYPYP[M[NYNYeYN^MYfYe[M\\MZMZe\\MYM]M_M]MYM_P[N^NYeYQ\\OYeZfYPYP[M[NYN',
    colors: COLOR_SETS.dungeon,
    isStatic: true,
  },
  liana: {
    rle: '16ZMeOeMfNeMeYNeMYMeMeNfOfMeNeNYMeMYNeNeOeOeNZMYMeMYMeNfMZMYNeReMYNeNeNfOeNhMeMYMfNeMfNeMeMZOYMeOYNePeMYMeM\\MeMfMeMYMeMZMfMYMfNZMeMYfNZPZMeMYNfYMYMeMZMeM[MeYeNeMhMYOeNfNeNeN',
    colors: [0, 2, 3],
    isStatic: true,
  },
  mommy: {
    rle: '16DSFOf[fMDMZMe^eMCMfNYNYMYeNBMZSYeMYMAMfM\\hMZNZMf]eMeYNfMeZfOZeNeZMeZMZeZeMAMeYePZeYeMCMjRBM_iMBMhOe\\MAM\\QhX]MAXO',
    colors: COLOR_SETS.dungeon,
    animationSpeed: 400,
    moveSpeed: 0.8,
    moveDirection: ORIENTATION_RIGHT,
    collisionPadding: [1, 1, 1, 1],
  },
  skeleton: {
    rle: '16FRIMjMGMgYhMFMeNZNeMCPeMhMeOAMfMYfNfYMeMAMfOhNfMBMgMeNeMfMBMYMfReMYMAQZNZNYMAMfMYNZNYOAMfNZNZMfMBWfMDMfOZODMgRFQH',
    colors: COLOR_SETS.dungeon,
    animationSpeed: 500,
    moveSpeed: 0.8,
    moveDirection: ORIENTATION_DOWN,
    collisionPadding: [1, 1, 1, 1],
  },
  rock: {
    rle: '16F[NINerfMFYMshYNCYvYeYqfMBYsgYseYMBYqhYseZOgYfZfZMeNiZe[MeYNYgsYNYMZN[rgMZMYMYAOqhMYMfYNYqeYeYeZNeYOseYfZNYPreYMe[NYNBMeZOYNYNDOAPYE',
    colors: COLOR_SETS.dungeon,
    isStatic: true,
  },
  root: {
    rle: '16BQFNBMerYPBMqMAN[MerYMAMeMAMYQZeNeYMAMZMCOYMYMBqNqAMBMYeqMDrAMeMAMZeqMFMYMBMZeMEPBOYMDMereMAMZNCMeYNYMAMYfYMBMYMBNAMZeYMBMYMENZNAqOqDqPqBsFtIrG',
    colors: [0, 1, 2, 3],
    isStatic: true,
  },
  checkpoint: {
    rle: '16LLLLLLLLLLLLLLLLLLLLLD',
    colors: [],
  },
  trigger: {
    rle: '16EePeHeNYfYNYEYMe]eYNCYMeYese]AeMeYseYreYeMe[eqfYqfqe[MeYqfYeZfqYeNeYqeYeqeZeqYeNeYeqeYeqYf[NYeYreZfZeYOqeYes[eYNAZeqe\\fYNCYMYfreZNEYN[PGYSLH',
    colors: COLOR_SETS.dungeon,
  },
  orb: {
    rle: '32E^LLbLI\\t\\HtG[x[ExEZrfvZDrfvC[qgv[CqgvCZrgwZBrgwBZ|ZB|BZ|ZB|BZ|ZB|B[z[CzDZzZDzD[x[ExF\\t\\HtIbLL^LI',
    colors: [0, 4, 5, 6],
    animationSpeed: 800,
  },
  signpanel: {
    rle: '16AXNAMYpYNqdqXRqMYlYMqNqMeMYeMeOeMqNYMkMfMYNYMePYeNeMeNYMYlYMYXRq[j[qMAXNGMrMKqMrMqIrMZMrIvE',
    colors: COLOR_SETS.dungeon,
  },
  mushroom: {
    rle: '16LJPJN\\NGMZeZeZMEMbMCMZe^eZMBM\\eZe\\MBMYe`eYMBN[eZe[NCN`NEVHMhMIMqhqMHMqhqMIRLI',
    colors: [0, 5, 2, 6],
  },
  stoneflower: {
    rle: '16GYOIPqeMGOqMeZNFNYeqMYMeMFMqMYeqMeZMEMeqMYMeZNEMfqMeZMeMEMeYeqMYMeYMEMeqeqNeZMDNgqMeYMYNBMeMYgMe[MeMAMqeMZeMeZMYeMAMqfSYfMAeMseYNYgMYBeQBPYLF',
    colors: COLOR_SETS.dungeon,
  },
  flower: {
    rle: '16LJOINAM[MANDMZM]MZMCMZNYMYNZMBOZQZNBMZNqYqYqNZMAMZMqYqYqYqMZMANYNqYqYqNYNBNYSYNBQ]QAMgSgMAMfMgMgMfMBNgOgNDQAQLG',
    colors: ['000', 5, 2, 6],
  },
};

// Game constants
const TILE_SIZE = 16; // Original tile size in pixels
const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 63;
// const DISPLAY_WIDTH = 19;
// const DISPLAY_HEIGHT = 11;
const DISPLAY_WIDTH = 27;
const DISPLAY_HEIGHT = 15;

const BLOCKING_TILES = [
  'tree',
  'bush',
  'wall',
  'crack',
  'rock',
  'snow',
  'root',
  'signpanel',
  'mushroom',
  'stoneflower',
  'flower',
];
const HOLE_PADDING = [10, 7, 5, 7];
