/* patch-haptic-feedback.js — adds native Android vibration feedback on
   every key press (including glissando slides and chord taps) plus a
   lighter pulse on control buttons. Uses the standard Vibration API,
   which is Android/Chrome-only by design — exactly matching your
   Android-only target. Silently no-ops on unsupported browsers. */
(function () {
  'use strict';

  let hapticsEnabled = true;
  let _lastVibrateAt = 0;
  const MIN_INTERVAL_MS = 30; // throttle so fast glissando slides don't flood the vibrator

  function supportsVibration() {
    return 'vibrate' in navigator;
  }

  function hapticPulse(ms) {
    if (!hapticsEnabled || !supportsVibration()) return;
    const now = performance.now();
    if (now - _lastVibrateAt < MIN_INTERVAL_MS) return;
    _lastVibrateAt = now;
    try { navigator.vibrate(ms); } catch (e) { /* ignore */ }
  }

  /* Hook into triggerManualNote — the single global function app.js
     calls for every key press, chord trigger, and glissando note.
     It does NOT recurse into itself for chords, so this fires exactly
     once per physical touch/slide-step, not once per chord note. */
  const _origTriggerManualNote = triggerManualNote;
  triggerManualNote = function (note) {
    hapticPulse(isChordModeActive ? 18 : 14);
    return _origTriggerManualNote(note);
  };

  function wireButtonHaptics() {
    const ids = [
      'octaveDownBtn', 'octaveNormalBtn', 'octaveUpBtn',
      'sustainPedalBtn', 'recordBtn', 'replayBtn', 'tutorBtn',
      'chordModeBtn', 'reverbBtn', 'labelsBtn', 'stopBtn',
      'themeToggleBtn', 'sidebarOpenBtn', 'sidebarCloseBtn',
      'scrollLeftBtn', 'scrollRightBtn', 'loopBtn', 'lyricsBtn'
    ];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => hapticPulse(10));
    });

    const playBtn = document.querySelector('#songForm button[type="submit"]');
    if (playBtn) playBtn.addEventListener('click', () => hapticPulse(10));
  }

  function injectToggleButton() {
    const bar = document.querySelector('.keyboard-features-bar');
    if (!bar) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'hapticBtn';
    btn.className = 'feature-chip-btn active';
    btn.textContent = 'HAPTIC: ON';
    bar.appendChild(btn);

    btn.addEventListener('click', () => {
      hapticsEnabled = !hapticsEnabled;
      btn.textContent = hapticsEnabled ? 'HAPTIC: ON' : 'HAPTIC: OFF';
      btn.classList.toggle('active', hapticsEnabled);
      if (hapticsEnabled) hapticPulse(10);
      if (typeof showToast === 'function') {
        showToast(hapticsEnabled ? 'Haptics On' : 'Haptics Off');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!supportsVibration()) {
      console.info('Vibration API not supported on this device — haptics disabled silently.');
    }
    wireButtonHaptics();
    injectToggleButton();
  });
})();