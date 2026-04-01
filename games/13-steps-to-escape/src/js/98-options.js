const languages = ['ENGLISH', 'FRANCAIS'];

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
    case 'right':
      if (optionsMenuOptions[currentOptionsIndex].action === 'language') {
        currentLanguageIndex = (currentLanguageIndex + (key === 'right' ? 1 : languages.length - 1)) % languages.length;
        setLocalStorage('language', currentLanguageIndex);
      }
      break;
    case 'action':
      handleOptionsAction(optionsMenuOptions[currentOptionsIndex].action);
      break;
  }
}
