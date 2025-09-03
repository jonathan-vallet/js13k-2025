/**
 * @module sfx
 */
let soundList = {
  text: {
    songData: [
      {
        // Instrument 0
        i: [
          0, // OSC1_WAVEFORM
          255, // OSC1_VOL
          152, // OSC1_SEMI
          0, // OSC1_XENV
          0, // OSC2_WAVEFORM
          255, // OSC2_VOL
          152, // OSC2_SEMI
          12, // OSC2_DETUNE
          0, // OSC2_XENV
          0, // NOISE_VOL
          8, // ENV_ATTACK
          9, // ENV_SUSTAIN
          12, // ENV_RELEASE
          196, // ENV_EXP_DECAY
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          0, // LFO_AMT
          0, // LFO_FREQ
          0, // LFO_FX_FREQ
          2, // FX_FILTER
          94, // FX_FREQ
          0, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          47, // FX_PAN_AMT
          9, // FX_PAN_FREQ
          5, // FX_DELAY_AMT
          2, // FX_DELAY_TIME
        ],
        // Patterns
        p: [1],
        // Columns
        c: [{ n: [123, 123, , 123, 123, 123, 123], f: [] }],
      },
    ],
    rowLen: 4410, // In sample lengths
    patternLen: 32, // Rows per pattern
    endPattern: 0, // End pattern
    numChannels: 1, // Number of channels
  },
  damage: {
    songData: [
      {
        // Instrument 0
        i: [
          0, // OSC1_WAVEFORM
          255, // OSC1_VOL
          106, // OSC1_SEMI
          64, // OSC1_XENV
          0, // OSC2_WAVEFORM
          255, // OSC2_VOL
          106, // OSC2_SEMI
          0, // OSC2_DETUNE
          64, // OSC2_XENV
          0, // NOISE_VOL
          5, // ENV_ATTACK
          7, // ENV_SUSTAIN
          111, // ENV_RELEASE
          47, // ENV_EXP_DECAY
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          0, // LFO_AMT
          0, // LFO_FREQ
          0, // LFO_FX_FREQ
          2, // FX_FILTER
          255, // FX_FREQ
          0, // FX_RESONANCE
          2, // FX_DIST
          32, // FX_DRIVE
          83, // FX_PAN_AMT
          5, // FX_PAN_FREQ
          25, // FX_DELAY_AMT
          1, // FX_DELAY_TIME
        ],
        // Patterns
        p: [1],
        // Columns
        c: [{ n: [158], f: [] }],
      },
    ],
    rowLen: 4410, // In sample lengths
    patternLen: 32, // Rows per pattern
    endPattern: 0, // End pattern
    numChannels: 1, // Number of channels
  },
  fall: {
    songData: [
      {
        // Instrument 0
        i: [
          0, // OSC1_WAVEFORM
          255, // OSC1_VOL
          106, // OSC1_SEMI
          64, // OSC1_XENV
          0, // OSC2_WAVEFORM
          255, // OSC2_VOL
          106, // OSC2_SEMI
          0, // OSC2_DETUNE
          64, // OSC2_XENV
          0, // NOISE_VOL
          5, // ENV_ATTACK
          20, // ENV_SUSTAIN
          132, // ENV_RELEASE
          0, // ENV_EXP_DECAY
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          0, // LFO_AMT
          0, // LFO_FREQ
          0, // LFO_FX_FREQ
          2, // FX_FILTER
          255, // FX_FREQ
          0, // FX_RESONANCE
          2, // FX_DIST
          32, // FX_DRIVE
          83, // FX_PAN_AMT
          5, // FX_PAN_FREQ
          25, // FX_DELAY_AMT
          1, // FX_DELAY_TIME
        ],
        // Patterns
        p: [1],
        // Columns
        c: [{ n: [161], f: [] }],
      },
    ],
    rowLen: 4410, // In sample lengths
    patternLen: 32, // Rows per pattern
    endPattern: 0, // End pattern
    numChannels: 1, // Number of channels
  },
  seeker: {
    songData: [
      {
        // Instrument 0
        i: [
          3, // OSC1_WAVEFORM
          0, // OSC1_VOL
          128, // OSC1_SEMI
          0, // OSC1_XENV
          3, // OSC2_WAVEFORM
          68, // OSC2_VOL
          128, // OSC2_SEMI
          0, // OSC2_DETUNE
          64, // OSC2_XENV
          218, // NOISE_VOL
          20, // ENV_ATTACK
          0, // ENV_SUSTAIN
          44, // ENV_RELEASE
          21, // ENV_EXP_DECAY
          0, // ARP_CHORD
          0, // ARP_SPEED
          1, // LFO_WAVEFORM
          55, // LFO_AMT
          4, // LFO_FREQ
          1, // LFO_FX_FREQ
          2, // FX_FILTER
          67, // FX_FREQ
          115, // FX_RESONANCE
          124, // FX_DIST
          190, // FX_DRIVE
          67, // FX_PAN_AMT
          6, // FX_PAN_FREQ
          39, // FX_DELAY_AMT
          1, // FX_DELAY_TIME
        ],
        // Patterns
        p: [1],
        // Columns
        c: [{ n: [135, 147], f: [] }],
      },
    ],
    rowLen: 5513, // In sample lengths
    patternLen: 2, // Rows per pattern
    endPattern: 0, // End pattern
    numChannels: 1, // Number of channels
  },
  key: {
    songData: [
      {
        i: [0, 255, 152, 0, 0, 255, 152, 12, 0, 0, 12, 17, 28, 0, 0, 0, 0, 0, 0, 0, 2, 255, 0, 0, 32, 47, 3, 0, 0],
        p: [1],
        c: [{ n: [135, 147], f: [] }],
      },
    ],
    rowLen: 7350,
    patternLen: 32,
    endPattern: 0,
    numChannels: 1,
  },
};

let audioElements = {};

function preloadSFX() {
  for (let key in soundList) {
    let audio = document.createElement('audio');
    let soundPlayer = new CPlayer();

    // Initialise et génère le son
    soundPlayer.init(soundList[key]);
    while (soundPlayer.generate() < 1) {}

    // Crée l'onde sonore et stocke l'audio
    var wave = soundPlayer.createWave();
    audio.src = URL.createObjectURL(new Blob([wave], { type: 'audio/wav' }));
    audioElements[key] = audio;
  }
}

function playActionSound(tile, loop = false) {
  if (audioElements[tile]) {
    audioElements[tile].currentTime = 0; // Remet à zéro pour rejouer
    audioElements[tile].loop = loop;
    audioElements[tile].play();
  }
}
