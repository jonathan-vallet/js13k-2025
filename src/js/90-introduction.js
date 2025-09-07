// Continuous FX flags for a step
const FX_FLIP = 1; // toggle characterFlipHorizontally
const FX_CYCLE_SEASONS = 2; // currentSeason = seasonList[(elapsed/800)|0 % seasonList.length]

let isPlayingIntro = false;
let introStepIndex = -1;
let introTimeLeft = 0;
let introFxMask = 0;
let introIsTransitioning = false; // true while a fade is in progress

function startIntro() {
  isPlayingIntro = true;
  introStepIndex = -1;
  introIsTransitioning = false;
  _introNextStep();
}

// Introduction Steps:
//  _dur(ms) | _x | _y | _season | _text (-1 clears) | _showChar(0/1) | _orientation | _fx | _fade(ms)
const INTRO_STEPS = [
  { _dur: 2000, _x: 784, _y: 336, _orientation: ORIENTATION_LEFT, _showChar: 1, _fx: FX_FLIP, _season: 2 },
  { _dur: 2000, _text: 'MY CATS VANISHED|I MUST SAVE THEM!', _orientation: ORIENTATION_DOWN, _season: 2 },
  { _dur: 2000, _showChar: 0, _text: 'THEY ARE ACROSS THE WORLD', _x: 1360, _y: 440, _season: 0 },
  { _dur: 2000, _x: 560, _y: 184, _season: 3 },
  { _dur: 6000, _x: 144, _y: 488, _text: 'OH NO! THE SEASONS ARE IN CHAOS!', _fx: FX_CYCLE_SEASONS, _season: 0 },
  { _dur: 1200, _x: 16, _y: 16, _text: 'FIND SEASON ORBS IN TEMPLES|SAVE THE CATS', _fade: 600, _season: 3 },
  { _dur: 1200, _x: 1024, _fade: 600, _season: 1 },
  { _dur: 1200, _x: 1400, _y: 872, _fade: 600, _season: 2 },
  { _dur: 1200, _x: 16, _fade: 600, _season: 0 },
  {
    _dur: 2000,
    _x: 784,
    _y: 336,
    _season: 1,
    _text: 'MOVE WITH ARROWS|ACTION TO INTERACT',
    _showChar: 1,
    _fade: 1000,
  },
  { _dur: 2000, _text: '', _season: 1 },
];

function updateIntro(deltaMs, elapsedSinceIntroStartMs) {
  // If intro is not active, do nothing
  if (!isPlayingIntro) {
    return;
  }

  // If we're currently in a fade transition, don't advance the timer/steps.
  if (introIsTransitioning) return;

  introTimeLeft -= deltaMs;

  // Continuous FX during the current step
  if (introFxMask & FX_FLIP) {
    characterFlipHorizontally = elapsedSinceIntroStartMs % 500 < 250;
  }
  if (introFxMask & FX_CYCLE_SEASONS) {
    const i = ((elapsedSinceIntroStartMs / 800) | 0) % seasonList.length;
    currentSeason = seasonList[i];
  }

  if (introTimeLeft <= 0) _introNextStep();
}

// --- Internal ----------------------------------------------------------------

function _introNextStep() {
  ++introStepIndex;
  if (introStepIndex >= INTRO_STEPS.length) {
    currentReadingText = '';
    isPlayingIntro = false;
    return;
  }

  const step = INTRO_STEPS[introStepIndex];

  // Applies the step content and arms the timer AFTER the fade (if any)
  const applyStep = () => {
    if (step._x) {
      characterX = step._x;
    }
    if (step._y) {
      characterY = step._y;
    }
    currentSeason = seasonList[step._season];

    if (step._showChar != null) {
      isCharacterDisplayed = !!step._showChar;
    }

    if (step._orientation) {
      setCharacterDirection(step._orientation);
    }
    if (step._text) {
      startReadingText(step._text);
    }

    introFxMask = step._fx | 0;
    introTimeLeft = step._dur | 0;
  };

  if (step._fade) {
    // Lock progression until the fade completes, then apply and unlock.
    introIsTransitioning = true;
    startFade(step._fade, () => {
      applyStep();
      introIsTransitioning = false;
    });
  } else {
    applyStep();
  }
}
