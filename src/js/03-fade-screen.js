// --- Fade overlay ---
let isFading = false;
let fadePhase = 0; // 0=none, 1=out, 2=in
let fadeStartTime = 0;
let fadeDuration = 1000; // ms
let fadeOnMid = null; // callback appelé au switch (milieu)

function startFade(duration, onMidpoint) {
  fadeDuration = duration || 1000;
  fadeOnMid = onMidpoint || null;
  isFading = true;
  fadePhase = 1; // out
  fadeStartTime = performance.now();
}

function updateFade() {
  if (!isFading) return;

  const now = performance.now();
  const p = Math.min(1, (now - fadeStartTime) / fadeDuration);

  let alpha = fadePhase === 1 ? p : 1 - p;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  // arrivé en fin de phase
  if (p >= 1) {
    if (fadePhase === 1) {
      // out -> switch -> in
      if (typeof fadeOnMid === 'function') fadeOnMid();
      fadePhase = 0;
      fadeStartTime = now;
    } else {
      // in -> fin
      isFading = false;
      fadePhase = 0;
      fadeOnMid = null;
    }
  }
}
