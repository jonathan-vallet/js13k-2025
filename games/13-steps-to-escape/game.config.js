module.exports = {
  name: '13-steps-to-escape',
  title: '13 Steps to Escape',
  appId: 'com.musicandbits.13steptoescape',
  version: '1.0.0',
  window: { width: 1280, height: 720 },
  replacements: {
    // html elements
    gameBackgroundCanvas: 'gBC',
    gameCanvas: 'gC',
    editorOrientationSelect: 'eOS',
    editorTileSelect: 'eTS',
    editorCanvas: 'eC',
    uiCanvas: 'uC',
    editorTestLevelButton: 'eTLB',

    // Character parameters
    skin: 's',
    hair: 'h',
    outfit: 'o',
    gender: 'g',

    // colors
    blueGreen: 'bG',
    green: 'g',
    bronze: 'br',
    silver: 'si',
    gold: 'go',
    purple: 'p',
    sand: 's',

    // object properties
    canChangeOrientation: 'cCO',
    useOrientationForColor: 'uOFC',
    colors: 'co',
    isStatic: 'iS',
    orientation: 'o',
    rle: 'r',
    characterData: 'cD',
    levelData: 'lD',
    collectedKeysNumber: 'cKN',
    characterX: 'cX',
    characterY: 'cY',
    characterDirection: 'cDi',
    characterInitialX: 'cIX',
    characterInitialY: 'cIY',
    limit: 'l',

    // Music player
    numChannels: 'nC',
    songData: 'sD',
    patternLen: 'pL',
    endPattern: 'eP',
    rowLen: 'rL',

    // Storage data
    isSoundActive: 'iSA',

    // Menu names
    levelEditor: 'lE',
    characterSelection: 'cS',
    newGame: 'nG',
    levelSelector: 'lS',
  },
  terserOptions: {},
};
