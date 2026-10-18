/* patch-loop-engine.js — None of the hymns are long enough to run for two
   minutes on their own (longest is ~38s). Rather than artificially
   padding every song in melody.js, this adds a LOOP toggle that
   seamlessly re-triggers the current song when it finishes, so any
   hymn can run continuously for as long as the user wants. */
(function () {
  'use strict';

  let isLoopActive = false;
  let loopSongData = null;
  let _loopTimeout = null;

  const _origPlaySequence = playSequence; // capture original before override

  function computeDurationMs(songData) {
    const bpmVal = parseInt(document.getElementById('bpmInput').value) || 150;
    const speed = bpmVal / 120;
    let maxEnd = 0;
    songData.notes.forEach(item => {
      const t = (item.time / speed) * 1000;
      const dur = item.duration / speed;
      if (t + dur * 1000 > maxEnd) maxEnd = t + dur * 1000;
    });
    return maxEnd;
  }

  playSequence = function (songData) {
    loopSongData = songData;
    _origPlaySequence(songData);

    clearTimeout(_loopTimeout);
    const durMs = computeDurationMs(songData);

    _loopTimeout = setTimeout(() => {
      if (isLoopActive && loopSongData === songData) {
        playSequence(songData); // seamless re-trigger
      }
    }, durMs + 500);
  };

  function injectLoopButton() {
    const bar = document.querySelector('.keyboard-features-bar');
    if (!bar) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'loopBtn';
    btn.className = 'feature-chip-btn';
    btn.textContent = 'LOOP: OFF';
    bar.appendChild(btn);

    btn.addEventListener('click', () => {
      isLoopActive = !isLoopActive;
      btn.textContent = isLoopActive ? 'LOOP: ON' : 'LOOP: OFF';
      btn.classList.toggle('active', isLoopActive);
      showToast(isLoopActive ? 'Loop On — plays continuously' : 'Loop Off');
    });

    // Manual stop should also cancel the loop, not just the current pass
    document.getElementById('stopBtn')?.addEventListener('click', () => {
      isLoopActive = false;
      clearTimeout(_loopTimeout);
      btn.textContent = 'LOOP: OFF';
      btn.classList.remove('active');
    });
  }

  document.addEventListener('DOMContentLoaded', injectLoopButton);
})();