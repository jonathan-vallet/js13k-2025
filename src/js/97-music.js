// Base song data (common to both intro and loop)
let seasonEnvRelease = [20, 45, 70, 90];
let envRelease = seasonEnvRelease[0];

var baseSong = {
  songData: [
    {
      // Instrument 0
      i: [
        1, // OSC1_WAVEFORM
        152, // OSC1_VOL
        128, // OSC1_SEMI
        0, // OSC1_XENV
        1, // OSC2_WAVEFORM
        20, // OSC2_VOL
        128, // OSC2_SEMI
        9, // OSC2_DETUNE
        0, // OSC2_XENV
        0, // NOISE_VOL
        7, // ENV_ATTACK
        23, // ENV_SUSTAIN
        0, // ENV_RELEASE
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
        0, // FX_DIST
        32, // FX_DRIVE
        47, // FX_PAN_AMT
        3, // FX_PAN_FREQ
        24, // FX_DELAY_AMT
        2, // FX_DELAY_TIME
      ],

      // Patterns
      p: [1],
      // Columns
      c: [
        {
          n: [
            142,
            ,
            139,
            ,
            ,
            ,
            142,
            ,
            138,
            ,
            146,
            ,
            ,
            ,
            144,
            ,
            142,
            ,
            139,
            ,
            ,
            ,
            135,
            ,
            134,
            ,
            139,
            141,
            146,
            ,
            144,
            ,
            142,
            ,
            ,
            ,
            144,
            ,
            146,
            ,
            147,
            ,
            149,
            ,
            151,
            ,
            152,
            ,
            154,
            ,
            ,
            ,
            152,
            ,
            148,
            ,
            151,
            ,
            ,
            ,
            149,
            ,
            ,
            ,
            156,
            ,
            152,
            ,
            ,
            ,
            151,
            ,
            150,
            ,
            158,
            159,
            158,
            ,
            156,
            ,
            154,
            ,
            151,
            ,
            ,
            ,
            154,
            ,
            148,
            ,
            156,
            157,
            156,
            ,
            154,
            ,
            154,
            ,
            152,
            ,
            151,
            ,
            152,
            ,
            156,
            ,
            159,
            ,
            163,
            ,
            161,
            ,
            159,
            ,
            163,
            ,
            161,
            ,
            ,
            ,
            166,
            ,
            ,
            ,
            161,
          ],
          f: [],
        },
      ],
    },
    {
      // Instrument 1
      i: [
        1, // OSC1_WAVEFORM
        192, // OSC1_VOL
        128, // OSC1_SEMI
        0, // OSC1_XENV
        1, // OSC2_WAVEFORM
        191, // OSC2_VOL
        116, // OSC2_SEMI
        9, // OSC2_DETUNE
        0, // OSC2_XENV
        0, // NOISE_VOL
        6, // ENV_ATTACK
        25, // ENV_SUSTAIN
        34, // ENV_RELEASE
        0, // ENV_EXP_DECAY
        0, // ARP_CHORD
        0, // ARP_SPEED
        0, // LFO_WAVEFORM
        69, // LFO_AMT
        2, // LFO_FREQ
        1, // LFO_FX_FREQ
        1, // FX_FILTER
        23, // FX_FREQ
        167, // FX_RESONANCE
        0, // FX_DIST
        32, // FX_DRIVE
        77, // FX_PAN_AMT
        6, // FX_PAN_FREQ
        25, // FX_DELAY_AMT
        6, // FX_DELAY_TIME
      ],
      // Patterns
      p: [1],
      // Columns
      c: [
        {
          n: [
            123,
            ,
            127,
            ,
            118,
            ,
            127,
            ,
            122,
            ,
            127,
            ,
            123,
            ,
            127,
            ,
            123,
            ,
            127,
            ,
            117,
            ,
            127,
            ,
            122,
            ,
            126,
            ,
            118,
            ,
            126,
            ,
            123,
            ,
            127,
            ,
            118,
            ,
            127,
            ,
            122,
            ,
            126,
            ,
            117,
            ,
            126,
            ,
            125,
            ,
            128,
            ,
            120,
            ,
            128,
            ,
            118,
            ,
            120,
            ,
            122,
            ,
            118,
            ,
            128,
            ,
            132,
            ,
            123,
            ,
            128,
            ,
            122,
            ,
            129,
            ,
            126,
            ,
            129,
            ,
            127,
            ,
            130,
            ,
            122,
            ,
            130,
            ,
            120,
            ,
            127,
            ,
            124,
            ,
            127,
            ,
            125,
            ,
            128,
            ,
            120,
            ,
            128,
            ,
            125,
            ,
            128,
            ,
            120,
            ,
            119,
            ,
            118,
            ,
            125,
            ,
            113,
            ,
            125,
            ,
            118,
            ,
            118,
            ,
            120,
            ,
            122,
          ],
          f: [],
        },
      ],
    },
  ],
  rowLen: 5513, // In sample lengths
  patternLen: 128, // Rows per pattern
  endPattern: 0, // End pattern
  numChannels: 2, // Number of channels
};
