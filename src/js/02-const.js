function clamp(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(maxValue, value));
}

let seasonList = ['spring', 'summer', 'fall', 'winter'];
let availableSeasons = [];
let currentSeason;
// spring _colors
let COLOR_SETS = {
  spring: [
    '2d2122',
    '5f4d2e',
    '519034',
    '76af2b',
    '8ec42b',
    'b7c42b',
    '576c87', // water
    '6b94ab', // water
  ],
  summer: [
    '2d2122',
    '8b4f44',
    'c89132',
    'e4b000',
    'e4ce00',
    'ffe224',
    '576c87', // water
    '6b94ab', // water
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
  trap: ['0d1b2a', '73849c', 'c2e8f7', '3b2e72'],
};

// Orientation constants
const ORIENTATION_UP = 1;
const ORIENTATION_RIGHT = 2;
const ORIENTATION_DOWN = 3;
const ORIENTATION_LEFT = 4;

// CAUTION! If new assets are added, push them at the end of the object, or it will break RLE
const TILE_DATA = {
  grass: {
    _rle: '16MD[ESB[AMDMAMANBZAMAMKYAO[QZAYO[NAMA[OAMZMCM[NAMBYNDZNA[AYDMAYEZCZAMAYCYBZAZAZMCZBZAZM[AM[ANYMYNAZNZMAPZAMAYBYPANZMBYDMAMDYANLYA',
    _colors: [2, 4],
    _isStatic: true,
  },
  plant: {
    _rle: '16B[EPBMB[AMfBRfCfAeCMBeBeBeBeMYCMfAeMAMfRAMfNBPAMAMBOENfAMAZNCZAfAeAZE[AeBeMYBfBZBMfNBfAeAYNBOANeBeNBfAYAYANfNBeBeBYAQCfAeMAYPANBMfNAYJOC',
    _colors: [2, 4, 5],
    _isStatic: true,
  },
  water: {
    _rle: '128LLINYfddZLLINZfddYLAMHNCMFMYfddZLAMHNCMFMZfddYINBPCOCOFMfddZINBPCOCOFMYfddYGPCPCNBM[PCMeddZGPCPCNBM[PCMfddYHPBM[MBMYN`Oedd[HPBM[MBMYN`OfddZDNCMZMAMYgMAMpgdd[DNCMZMAM\\MAMdZfddZCNYOhMjMpgdd\\CNYO\\MYiMphdd[CMZnddddCM]ppgdd\\DMhdddd_DMZlddddYEMeddddaEMgdddd_BOeddddbBOYfdddd`CNeddddbCNYeddddaEMddddbEMeddddaFMddddaFMddddaNEMdddd`NEMdddd`SddddaSdddda',
    _colors: [1, 6, 7],
    _animationSpeed: 900,
    _animationStep: 0,
  },
  ice: {
    _rle: '64LLIN[gYe[g]eYe]fLAMHNCMFMZeYeYe[g]eYe]gINBPCOCOFMeYeYe[g]g]eYeYGPCPCNBNfPCMe]eYe]gYe[eYeZHPBM[MBMYNYg\\Oe]eYe]gYe[eYe[DNCMfMAMZfMAM[g]eYe[eYeYe]eYeYe[g[eCNYOfZMZgYM[g]g[eYg]eYeYe[g[eYCM[eYeYe[g]gYe[g[eYg]eYe]eYe[eYeDMYeYeYe[eYe[eYeYeYe[g[eYg]g]eYeYeYeYeYEMYeYe[eYe[eYeYeYe[eYe[eYg]eYe]eYeYe[eYeBOf]eYe[eYeYeYe[eYe]eYe]eYe]gYe[gYCNe]gYeYeYgYeYeYeYe]eYe]eYe]gYe[gZEM\\eYeYe[g[eYg]eYe]eYeYe[g]gYeYFMZeYeYe[g[eYgYe[gYe[gYe[gYe[gYeZNEMeYe]g[eYgYe[gYe[gYe[gYe[gYe[Sg]g[eYgYe[gYe[gYe[g]g]e',
    _colors: [1, 3, 6],
    _isStatic: true,
  },
  character: {
    _rle: '64LLLLLLLLLLLLLLLLHOLLLLLQIOLFOLLBRGQLDQLOIQHRLCSJQHM[MJQLAMZNLSCVHVCTZMKMZNEMbNDNYQYPAN_OETZMDMZT[MBOYQYRZQ[NCN_ODMYWZQZOZRYUZMBMZQ[NCTeQYR]RAOeTYMAMYUZMBOePeOeXSBNeQeOYMAOeTYMBNeMeMfMeMeXRDMeMgMeOYMBNeQeOYMAOfMfMfOBXNCMfMhRCMeMgMeOYMBNlNDXDMkQCMfMhRDMjMHTGMiPEMkQDMeReMFMeNfNeMGQJMiPEMeOfNfMEMeRfMGMfNJRHMeSfMFTeMGMfOJMfOHWEVHSHNfQFMgRFWFUFWEVFWFUFWB',
    _colors: ['000', 3, 'ffaa87'],
    _collisionPadding: [18, 4, 1, 4],
    size: [1, 1.5],
  },
  tree: {
    _rle: '32FNBRAPLDMYeN[gMYfYOAOHMYjZfYgYfYMfYMGOfYfafZhMEMfdZfZjMCMgddYMBMYfYfdZhYNYMAMYeMYi`f\\hYMBMeM[gYMf[jMfZfNAN[gNfZMgYMgMfYMeOYMYNgMgYNgYMgMgYMYNePeOgPfNfOfNYNeMZNYNfNZNeOePeMYMBMe_MeM\\NZN[NZMAMfYMeYe[MZebe[eMAMfMhM\\fYMeYe[eYfYgNeOfMfYMgMiYfMfNfMANYNeMfMgNfMfMfMeRAMfYReYOeReOYeYMBMg\\QYO\\OYeYgMAMfMYfYeZfZfZf\\fMfMBOgNYgYMfNgYMgOEMfPfTfNfMIOqXRHrMtNrMrNqNtNrDrM[qMtMsMrNqYsMrBrM[qMZrNZqMsMq\\qMrAqMZsMZrMqZqMqZOqZrMqAqMrOZsMqZqMq[qPrMCtMZrO\\Nq[rMrMqDwOqZsPZqOqGwSyD',
    _colors: [0, 2, 4, 1],
    _isStatic: true,
    size: [2, 2],
  },
  hole: {
    _rle: '16AeBYeAZAeYBeAeMYeMZNZMeYMeAYMYTYMYAfXfZXZXPeXNeAYXYBYXYAeXNeXPZXZfXfAYMYTYMYAeMYeMZNZMeYMeAeBYeAZAeYBeA',
    _colors: [0, 6],
    _isStatic: true,
  },
  leaves: {
    _rle: '16eYPeSf[OfNhMeMYMfNYMfMZQeMYOeMZQeMeYPZNfMgYMhOfYQfMeSfNfMeYNhMgMgYNfMYNePeYOfZMeNfSZNeMeMeYNfTf[MfYNgOeZMgYMgYMePgYNfYNfT[Ne',
    _colors: [1, 2, 4],
    _isStatic: true,
  },
  bush: {
    _rle: '16LEPFPBMeZMrBM[MBMe[MrM\\MqAMfYqPrfMqBNqMYfYMqNrAMZMYhYMqYMqAMeYMjMYeMqAMfNYfYNfMqBNYqPqYNrAMqbqMqAM]eMe\\MqAMeZfNfZeMqAMhMrMhMqBPsAPrDtDsA',
    _colors: ['000', 2, 4, 1],
  },
  cat: {
    _rle: '16IMCMJMYMAMYMHMYqeMeqMGMYkMFMYkMBOAMlMAMZeNfMeYeMeNYeMYNgYqYfNeMAOf]MAMfNZg[MBMf[jNCMnYMCMnYMCMgPgNCMfNCMeMeMCMYMeMCMYMeMB',
    _colors: ['000', '222', '444', 'e54350'],
  },
  fireball: {
    _rle: '32LLLLLLLLLLLBPLPKM\\MJMhMIMZfZMHMfZfMHMYhYMHMe\\eMHMYhYMHMe\\eMHMZfZMHMfZfMIM\\MJMhMKPLPLLLLLLLLLLLB',
    _colors: COLOR_SETS.fall,
    _animationSpeed: 100,
    _moveSpeed: 3,
    _collisionPadding: [7, 7, 7, 7],
  },
  wall: {
    _rle: '112XqXOqXOrQqXP|M|sPxRYlYMYpeYMYplYMYkYS|M|sPxQYnMpgMpnMmYOqN|M|sMqNxNqNfYTqXOqXVqTYeYOYMqbqMqdYqNYMq^qMYOfMd\\MZqd[Md\\q[MfPYTqRsQtPYTYPfM_M]qZP]q[sQYtbM[MfOsfqMqpeqMqjNsjsNqNqYqZqZMZqZqZMZMZqZq_q]q`sPYMfNs\\Md[M_Ms`sNfMYqZqZqZrYMZqZqZu^M]MdYqZMfOr\\Md[q_Nr`rOfMYMZMqNZqZNrZMZqZq[sOqPq]q^qZMfNqMq\\Md[M_MqMq`qMqNfMYPZOqZMZqZOqZq]q]M`M^MZMfOYM\\MqdZM_NYM`MYOfMYqZMZqZqZq]MZqZqcq^qOqRqMfPYqZqRqZqQqMq^OYq^qYPfM_qcqdYqOrdZMZMfOqYQiPiWqYTYqOfYQqXRqR\\M]Rq]qZqNqMshM]MfM]MlMslsNYjYMYphYMYhYM[q\\MYhYMYvYMfMqMr\\q]qZq]q`qMr`rMqNYjMpjMjM`MjM`MfMrMq\\q]qZq]q`rMq`qMrUqXRqOYfM`MfZfM`MfMYrXXQYrVrY',
    _colors: COLOR_SETS.dungeon,
    _isStatic: true,
  },
  snow: {
    _rle: '112eqeYQYgYP\\X\\X\\RYeqeMYevlxkMYezeYMqYNYgYQ[RYlYRYlYRYgYNYqMYftosnMYfxfYMeMYetf[greZf{eZf{eZfueYMeMYm^n]MYpYMYMe||||zeMYMZidYg`MZnZNY|||||YNdd_MdZNe|||||eOdd^NdOe|||||eOdd^NdOe|||||eOdd^NdOe||||{eYOdd^NdOe||||{eMYNdd^NdOe||||{YMeNdd^NdOY||||{YMeYMdd_MdMZMe||||zYMeYNd_P_NbNYeMYe||||yeMYePdYXZeP^PeqYNYo|||yeYMqeXXRqeXeqeqeYX|||yeYMeqeZXQ\\ReqeZRZeqe',
    _colors: [1, 3, 5, 6],
    _isStatic: true,
  },
  spikes: {
    _rle: '32LGMGMLJMYMEMYMLIMYMEMYMDQCQCNYNCNYNCNYNCNYNCMeYeMCMeYeMCNYNCNYNCMqYqMCMqYqMCQCQCQCQLLLLEMGMLJMYMEMYMLIMYMEMYMDQCQCNYNCNYNCNYNCNYNCMeYeMCMeYeMCNYNCNYNCMqYqMCMqYqMCQCQCQCQLLJ',
    _animationSpeed: 1200,
    _colors: COLOR_SETS.dungeon,
  },
  blade: {
    _rle: '16GNLAMYeMKMYfYMJMqfqMIMqhqMFNrPrNCMYqeMqZqMeqYMAMhM\\MhNYgMqZqMgYOYqeReqYNAOrPrOCOqhqOFNqfqNIMYfYMJNZNKPF',
    _colors: COLOR_SETS.trap,
    _moveSpeed: 2.5,
    _returningMoveSpeed: 0.75,
    _collisionPadding: [1, 1, 1, 1],
  },
  seeker: {
    _rle: '32DPLFNHMgMLEMeMHMZeMHQCMYeMGRCNAMgRYeMFNhPeNeZNhNeMENfNfMZeRfNfODMeMfNfMYfMCNfNfOCMfMYhYMfMCOYhYOBMfYN\\NeNBMYO\\OYMAMe[TYMBNeSYMYMAMeTYNYMBNeYRZQYOf[NYMBNe[O\\eMAMZOfZMZMBNeZOiMBNZfMfYMYNBNeYMgRCSgNDNeUEVFVC',
    _colors: COLOR_SETS.trap,
    _animationSpeed: 100,
    _moveSpeed: 1.3,
    _collisionPadding: [1, 1, 1, 1],
  },
  heart: {
    _rle: '16LLLLDNCNHMZMAMZMFM\\M\\MEMaMEMaMFM_MHM]MJM[MLMYMLBMLLLLH',
    _colors: ['000', 'f00', 'fff'],
  },
  ground: {
    _rle: '16riseZeYreYeYeZqeZeYfq[e[qZeYeYeq_qYeYeYfq_q\\gq_q[eYfq_q^eqSqSrisgYereYeYgqeYe\\q[eYfqYe]q\\eYeq_q_q^eq_q]eYq_q\\gqSqS',
    _colors: ['514970', '7676a2', '8686b4', '6a648e'],
    _isStatic: true,
  },
  crack: {
    _rle: '16XSeZMYM[ePYNqNqMtMYNZOrMsYMYNqYNsMsNYXQYfN\\MYNf\\OsMqMq^MYMsOq^MqMrOr[XQYfYMZMZMYfNZrMrMrMqZN[qNqMrNZN[rOsNYO[qNsZO',
    _colors: COLOR_SETS.dungeon,
    _isStatic: true,
  },
  liana: {
    _rle: '16QZMYQYOr[MetfOrZMqfseNrMZNqMeMreNfqZNqMeYMZNgZNrM[fMqgYMgMZMfsNZfNZMqetMZeNZNvMeYNqYMgrPfNqZfPsfMr[NqNsYeMqZMZrNrfYMZOZqNqg\\MqfZOfM\\MqfMYM',
    _colors: ['0d1b2a', 2, 4, '3b2e72'],
    _isStatic: true,
  },
  mommy: {
    _rle: '16DSFOf[fMDMZMe^eMCMfNYNYMYeNBMZSYeMYMAMfM\\hMZNZMf]eMeYNfMeZfOZeNeZMeZMZeZeMAMeYePZeYeMCMjRBM_iMBMhOe\\MAM\\QhX]MAXO',
    _colors: COLOR_SETS.dungeon,
    _animationSpeed: 400,
    _moveSpeed: 0.8,
    _moveDirection: ORIENTATION_RIGHT,
    _collisionPadding: [1, 1, 1, 1],
  },
  skeleton: {
    _rle: '16FRIMjMGMgYhMFMeNZNeMCPeMhMeOAMfMYfNfYMeMAMfOhNfMBMgMeNeMfMBMYMfReMYMAQZNZNYMAMfMYNZNYOAMfNZNZMfMBWfMDMfOZODMgRFQH',
    _colors: COLOR_SETS.dungeon,
    _animationSpeed: 500,
    _moveSpeed: 0.8,
    _moveDirection: ORIENTATION_DOWN,
    _collisionPadding: [1, 1, 1, 1],
  },
  rock: {
    _rle: '16DsQqFqYiZMqDqfYgZqNDqg[tMCqjuMqBqf]tMqBqe^uMAqf_tMAqe`tMre`uMqM_vMqM^qMuMqMq\\qOsNAqMqZqTqBqWrD{A',
    _colors: [0, 2, 5, 1],
    _isStatic: true,
  },
  root: {
    _rle: '16BPKMgYMBQBMg[Nf[MAMfYNYMf]NeYQeZOYN[OeZQBM[NeYOYNCMZNZN[MCMYOZOYeMDUfMDMfZPfMCMf\\OfMBMe^NfYMBM[NZMeZMCMZNAMYMZMDMZMDMZMC',
    _colors: [0, 1, 2],
    _isStatic: true,
  },
  checkpoint: {
    _rle: '16LLLLLLLLLLLLLLLLLLLLLD',
    _colors: [],
    _isStatic: true,
  },
  trigger: {
    _rle: '16FPJNYfYNGMe]eYMEMeYeYre[MCMqZrZreYqMAM[q^qeZNeYqYe[fYqYeNeYqeqeYfqYqYeNeYeqe]q[NYeZrZrZeYMAMqeYeYr[eqMCMeqe\\eqYMEMYfreZMGN\\NJPLJ',
    _colors: [...COLOR_SETS.dungeon],
    _animationSpeed: 900,
  },
  orb: {
    _rle: '32LDfDhDfAfAlAfAgAlAgAhYPYhBhYPYhCfqM\\MqfDfqMq[MqfCfqMZfZMqfBfqMrYeZMqfBeYM[fsMYeBeYMqf]MYeBeMZeZrerMeAfMqgqYfZMfAeMsYrgYMeAfMresfrMfAeMqftfYMeAfMYyMfAeMqfs\\MeAfMZet[MfAeYMvZMYeBeYM[qfZMYeBfqMZqerMqfBfqMsfYMqfCfqMYsMqfDfqMsYMqfChYPYhBhYPYhBfAlAfAgAlAgLDfDhDf',
    _colors: [0, 2, 5, 1],
    _animationSpeed: 340,
  },
  signpanel: {
    _rle: '16AXNAMYpYNqdqXRqMYlYMqNqMeMYeMeOeMqNYMkMfMYNYMePYeNeMeNYMYlYMYXRq[j[qMAXNGMrMKqMrMqIrMZMrIvE',
    _colors: COLOR_SETS.dungeon,
  },
  mushroom: {
    _rle: '16ERHNhYqNEMqi[qMCM[g^MAMqafZNh]hqNi\\hqNj\\frMAMYh]rMCMq[vMENvNFqTqEsNrNsDtMZMtEzHvE',
    _colors: [0, 2, 5, 1],
    _isStatic: true,
  },
  stoneflower: {
    _rle: '16GYOIPqeMGOqMeZNFNYeqMYMeMFMqMYeqMeZMEMeqMYMeZNEMfqMeZMeMEMeYeqMYMeYMEMeqeqNeZMDNgqMeYMYNBMeMYgMe[MeMAMqeMZeMeZMYeMAMqfSYfMAeMseYNYgMYBeQBPYLF',
    _colors: COLOR_SETS.dungeon,
  },
  flower: {
    _rle: '16LJOINAM[MANDMZM]MZMCMZNYMYNZMBOZQZNBMZNqYqYqNZMAMZMqYqYqYqMZMANYNqYqYqNYNBNYSYNBQ]QAMgSgMAMfMgMgMfMBNgOgNDQAQLG',
    _colors: ['000', 5, 2, 6],
  },
};

// Game constants
const TILE_SIZE = 16; // Original tile size in pixels
const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 63;
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

// Seasonal tile replacements
const SEASON_REPLACE = {
  fall: { hole: 'leaves' },
  winter: { water: 'ice' },
  summer: { crack: 'liana' },
  spring: { stoneflower: 'flower' },
};
const HIDE_UNLESS = { snow: 'winter', root: 'summer', mushroom: 'fall' };
