function handleKeyDown(e) {
  const key = mapKeyToDirection(e.key);
  handleInput(key);
}

function handleKeyUp(e) {
  const key = mapKeyToDirection(e.key);
  handleRelease(key);
}

function handleInput(input) {
  if (currentScreen === 'game') {
    handleGameKeydown(input);
  }
  if (currentScreen === 'menu') {
    handleMenuKeydown(input);
  }
}

function handleRelease(input) {
  if (currentScreen === 'game') {
    handleGameKeyup(input);
  }
}
