function handleKeyDown(e) {
  const key = mapKeyToDirection(e.key);
  handleInput(key);
}

function handleKeyUp(e) {
  const key = mapKeyToDirection(e.key);
  handleRelease(key);
}

function handleInput(input) {
  handleGameKeydown(input);
}

function handleRelease(input) {
  handleGameKeyup(input);
}
