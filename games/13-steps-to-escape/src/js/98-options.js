const languages = ['ENGLISH', 'FRANCAIS'];

const VOLUME_STEP = 10;
const BAR_WIDTH = 50;
const BAR_HEIGHT = 5;

const optionsMenuOptions = [
  { textKey: 'language', action: 'language' },
  { textKey: 'volume', action: 'volume' },
  { textKey: 'sound', action: 'sound' },
  { textKey: 'back', action: 'back' },
];
let currentOptionsIndex = 3;

function drawOptionsScreen() {
  drawBackground();

  const menuStartX = 30;
  const menuStartY = 30;
  const menuSpacing = 12;

  optionsMenuOptions.forEach((option, index) => {
    const yPosition = menuStartY + index * menuSpacing;
    const isHighlighted = index === currentOptionsIndex;

    writeText({
      ctx: ctx,
      x: menuStartX,
      y: yPosition,
      hspacing: 2,
      text: t(option.textKey),
      color: isHighlighted ? COLOR_SELECTED : COLOR_TEXT,
      scale: 1.5,
    });

    if (option.action === 'language') {
      writeText({
        ctx: ctx,
        x: menuStartX + 80,
        y: yPosition,
        hspacing: 2,
        text: '< ' + languages[currentLanguageIndex] + ' >',
        color: isHighlighted ? COLOR_SELECTED : COLOR_TEXT,
        scale: 1.5,
      });
    }

    if (option.action === 'volume' || option.action === 'sound') {
      let value = option.action === 'volume' ? musicVolume : soundVolume;
      let color = isHighlighted ? COLOR_SELECTED : '#fff';
      let s = zoomFactor * 1.5; // same scale as text
      let barX = (menuStartX + 85) * s;
      let barY = yPosition * s;
      let barW = BAR_WIDTH * s;
      let barH = BAR_HEIGHT * s;

      writeText({
        ctx: ctx,
        x: menuStartX + 80,
        y: yPosition,
        hspacing: 2,
        text: '<',
        color,
        scale: 1.5,
      });

      ctx.strokeStyle = color;
      ctx.lineWidth = s;
      ctx.strokeRect(barX, barY, barW, barH);

      let fillW = (barW - s * 2) * (value / 100);
      if (fillW > 0) {
        ctx.fillStyle = color;
        ctx.fillRect(barX + s, barY + s, fillW, barH - s * 2);
      }

      writeText({
        ctx: ctx,
        x: menuStartX + 85 + BAR_WIDTH + 3,
        y: yPosition,
        hspacing: 2,
        text: '>',
        color,
        scale: 1.5,
      });
    }
  });
}

function handleOptionsAction(action) {
  switch (action) {
    case 'back':
      switchMode('menu');
      break;
  }
}

function handleOptionsKeydown(key) {
  switch (key) {
    case 'up':
      currentOptionsIndex = (currentOptionsIndex - 1 + optionsMenuOptions.length) % optionsMenuOptions.length;
      break;
    case 'down':
      currentOptionsIndex = (currentOptionsIndex + 1) % optionsMenuOptions.length;
      break;
    case 'left':
    case 'right': {
      let action = optionsMenuOptions[currentOptionsIndex].action;
      let delta = key === 'right' ? VOLUME_STEP : -VOLUME_STEP;
      if (action === 'language') {
        currentLanguageIndex = (currentLanguageIndex + (key === 'right' ? 1 : languages.length - 1)) % languages.length;
        setLocalStorage('language', currentLanguageIndex);
      }
      if (action === 'volume') {
        musicVolume = max(0, min(100, musicVolume + delta));
        setLocalStorage('musicVolume', musicVolume);
        musicAudio.volume = toVolume(musicVolume);
      }
      if (action === 'sound') {
        soundVolume = max(0, min(100, soundVolume + delta));
        setLocalStorage('soundVolume', soundVolume);
        playActionSound('menuMove');
      }
      break;
    }
    case 'action':
      handleOptionsAction(optionsMenuOptions[currentOptionsIndex].action);
      break;
  }
}
