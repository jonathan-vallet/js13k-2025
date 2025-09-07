// Generates music to preloaded audio element
function generateMusic(song) {
  musicplayer.init(song);
  while (musicplayer.generate() < 1) {} // Générer la musique
  return musicplayer.createWave(); // Retourner l'onde audio générée
}

/**
 * Play the music
 * @param {Uint8Array} wave - The wave audio data
 * @param {boolean} loop - Loop the music or not
 */
let musicChangeStartTime = 0;
function playMusic(wave, loop = false) {
  const currentPos = musicAudio.currentTime || 0; // récupérer position
  musicChangeStartTime = performance.now();
  musicAudio.src = URL.createObjectURL(new Blob([wave], { type: 'audio/wav' }));
  musicAudio.loop = loop; // Indiquer si la musique doit boucler ou non

  musicAudio.onloadedmetadata = () => {
    // si la position est plus grande que la durée, on module
    musicAudio.currentTime = (currentPos + (performance.now() - musicChangeStartTime) / 100) % musicAudio.duration;
    musicAudio.volume = isSoundActive ? 0.2 : 0;
    musicAudio.play();
  };
}

/**
 * Play the music control
 */
function playMusicControl() {
  musicAudio.play();
}

/**
 * Stop the music
 */
function stopMusic() {
  musicAudio.pause();
}
