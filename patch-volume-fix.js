/* patch-volume-fix.js — The original volSlider listener in app.js only
   works AFTER the user has touched a piano key, because masterGain is
   created lazily inside getAudioContext(), which only runs on first
   note press. If a user drags the volume slider before playing
   anything, masterGain is null and the slider silently does nothing.
   This patch forces audio-graph creation on load and adds a visible
   volume readout so users get feedback immediately. */
(function () {
  'use strict';

  function primeAudioGraph() {
    try {
      getAudioContext(); // safe to call without gesture — just creates nodes, won't play sound
    } catch (e) {
      console.warn('Audio priming deferred:', e);
    }
  }

  function injectVolumeHUD() {
    const wrapper = document.getElementById('volSlider')?.closest('.vol-wrapper');
    if (!wrapper) return;

    const badge = document.createElement('span');
    badge.id = 'volReadout';
    badge.style.cssText = `
      font-size: 19px; font-weight: 800; color: var(--primary);
      min-width: 34px; text-align: right;
    `;
    const initial = Math.round((parseFloat(document.getElementById('volSlider').value) || 0.8) * 100);
    badge.textContent = initial + '%';
    wrapper.appendChild(badge);

    document.getElementById('volSlider').addEventListener('input', e => {
      const pct = Math.round(parseFloat(e.target.value) * 100);
      badge.textContent = pct + '%';

      // Safety net: if masterGain still isn't ready for any reason, force it
      if (!masterGain) primeAudioGraph();
      if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(parseFloat(e.target.value), audioCtx.currentTime);
      }
      showToast('Volume ' + pct + '%');
    });
  }

  // Unlock audio on first ANY touch, in case mobile browser still blocks priming
  function unlockOnFirstTouch() {
    const unlock = () => {
      primeAudioGraph();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('click', unlock);
    };
    document.addEventListener('touchstart', unlock, { once: true });
    document.addEventListener('click', unlock, { once: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    primeAudioGraph();
    injectVolumeHUD();
    unlockOnFirstTouch();
  });
})();