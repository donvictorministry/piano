/* patch-keyboard-extend.js — rebuilds the keyboard with a wider, scrollable
   range (C3 to C6) instead of the original single-octave C4–F5 strip.
   Reuses the SAME data-note / data-base-note pattern app.js already
   listens for via event delegation, so no other file needs to change. */
(function () {
  'use strict';

  const WHITE_W = 58;   // px
  const BLACK_W = 38;   // px
  const WHITE_ORDER = ['C','D','E','F','G','A','B'];
  const BLACK_AFTER = { 'C#':'D', 'D#':'E', 'F#':'G', 'G#':'A', 'A#':'B' };

  function buildRange(startOct, endOct) {
    const white = [];
    for (let oct = startOct; oct <= endOct; oct++) {
      WHITE_ORDER.forEach(n => {
        if (oct === endOct && n !== 'C') return; // stop at C of last octave
        white.push(n + oct);
      });
    }
    return white;
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .piano-wrapper { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      .piano-keys { width: max-content !important; touch-action: pan-x; }
      .key-white { width: ${WHITE_W}px !important; flex: 0 0 ${WHITE_W}px !important; }
      .key-black { width: ${BLACK_W}px !important; }
      .keyboard-scroll-hint {
        font-size: 19px; text-align: center; color: var(--text-muted);
        padding: 2px 0; flex-shrink: 0;
      }
    `;
    document.head.appendChild(style);
  }

  function rebuildKeyboard() {
    const keyboardEl = document.getElementById('keyboard');
    if (!keyboardEl) return;

    const whiteNotes = buildRange(3, 6); // C3 ... C6
    keyboardEl.innerHTML = '';

    whiteNotes.forEach((note, idx) => {
      const el = document.createElement('div');
      el.className = 'key-white';
      el.dataset.baseNote = note;
      el.dataset.note = note;
      el.innerHTML = `<span class="key-label">${note}</span>`;
      keyboardEl.appendChild(el);
    });

    Object.entries(BLACK_AFTER).forEach(([sharp, upper]) => {
      whiteNotes.forEach((wNote, idx) => {
        const octave = wNote.slice(-1);
        if (wNote === upper + octave) {
          const blackNote = sharp + octave;
          const el = document.createElement('div');
          el.className = 'key-black';
          el.dataset.baseNote = blackNote;
          el.dataset.note = blackNote;
          el.style.left = `${idx * WHITE_W - BLACK_W / 2}px`;
          el.innerHTML = `<span class="key-label">${blackNote}</span>`;
          keyboardEl.appendChild(el);
        }
      });
    });

    // Auto-scroll to middle C4 on load so the app opens centered, not at bass end
    const pianoWrapper = document.querySelector('.piano-wrapper');
    const c4 = keyboardEl.querySelector('[data-base-note="C4"]');
    if (pianoWrapper && c4) {
      requestAnimationFrame(() => {
        pianoWrapper.scrollLeft = c4.offsetLeft - 40;
      });
    }
  }

  function addScrollHint() {
    const wrapper = document.querySelector('.piano-wrapper');
    if (!wrapper || !wrapper.parentElement) return;
    const hint = document.createElement('div');
    hint.className = 'keyboard-scroll-hint';
    hint.textContent = 'Swipe keyboard left or right — full range C3 to C6';
    wrapper.insertAdjacentElement('afterend', hint);
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    rebuildKeyboard();
    addScrollHint();
  });
})();