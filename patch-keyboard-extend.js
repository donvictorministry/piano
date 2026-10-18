/* patch-keyboard-extend.js (v2) — fixes horizontal scroll by intercepting
   touch events BEFORE app.js's own handlers run (capture phase), since
   app.js calls preventDefault() on touchstart/touchmove which silently
   blocks any native or CSS-based scrolling no matter what. This version
   manually drives scrollLeft so scrolling works regardless of app.js. */
(function () {
  'use strict';

  const WHITE_W = 58;
  const BLACK_W = 38;
  const WHITE_ORDER = ['C','D','E','F','G','A','B'];
  const BLACK_AFTER = { 'C#':'D', 'D#':'E', 'F#':'G', 'G#':'A', 'A#':'B' };
  const DRAG_THRESHOLD = 10; // px before a touch counts as "scrolling" not "tap"

  function buildRange(startOct, endOct) {
    const white = [];
    for (let oct = startOct; oct <= endOct; oct++) {
      WHITE_ORDER.forEach(n => {
        if (oct === endOct && n !== 'C') return;
        white.push(n + oct);
      });
    }
    return white;
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .piano-wrapper { overflow-x: hidden; position: relative; }
      .piano-keys { width: max-content !important; }
      .key-white { width: ${WHITE_W}px !important; flex: 0 0 ${WHITE_W}px !important; }
      .key-black { width: ${BLACK_W}px !important; }
      .keyboard-scroll-row {
        display: flex; align-items: center; gap: 8px;
        padding: 4px 0; flex-shrink: 0;
      }
      .scroll-arrow-btn {
        width: 44px; height: 44px; border-radius: 10px;
        background: var(--bg-surface); border: 1px solid var(--border-color);
        color: var(--text-main); font-size: 19px; font-weight: 900;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0;
      }
      .scroll-arrow-btn:active { transform: scale(.92); }
      .keyboard-scroll-hint {
        font-size: 19px; text-align: center; color: var(--text-muted);
        flex: 1;
      }
      /* Vertical safety net: if content ever exceeds viewport height on a
         small device, allow the page to scroll instead of clipping content.
         Horizontal page scroll stays locked. */
      html, body { overflow-y: auto !important; overflow-x: hidden !important; }
    `;
    document.head.appendChild(style);
  }

  function rebuildKeyboard() {
    const keyboardEl = document.getElementById('keyboard');
    if (!keyboardEl) return null;

    const whiteNotes = buildRange(3, 6);
    keyboardEl.innerHTML = '';

    whiteNotes.forEach(note => {
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

    return keyboardEl;
  }

  function getNoteElAtPoint(x, y) {
    const els = document.elementsFromPoint(x, y);
    for (const el of els) if (el.classList?.contains('key-black') && el.dataset.note) return el;
    for (const el of els) if (el.classList?.contains('key-white') && el.dataset.note) return el;
    return null;
  }

  /* Takes over ALL touch handling on the keyboard. Runs in the CAPTURE
     phase so it executes before app.js's bubble-phase listeners, and
     calls stopPropagation() so app.js's own (scroll-blocking) handlers
     never fire. Tap = play note. Horizontal drag = scroll. */
  function installCustomTouchHandling(keyboardEl, wrapperEl) {
    let state = null;

    keyboardEl.addEventListener('touchstart', e => {
      const t = e.changedTouches[0];
      const el = getNoteElAtPoint(t.clientX, t.clientY);
      state = {
        id: t.identifier,
        startX: t.clientX,
        startY: t.clientY,
        scrollStart: wrapperEl.scrollLeft,
        dragging: false,
        note: el ? el.dataset.note : null
      };
      e.stopPropagation();
    }, { capture: true, passive: true });

    keyboardEl.addEventListener('touchmove', e => {
      if (!state) return;
      const t = [...e.changedTouches].find(tt => tt.identifier === state.id);
      if (!t) return;
      const dx = t.clientX - state.startX;
      const dy = t.clientY - state.startY;

      if (!state.dragging && Math.abs(dx) > DRAG_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        state.dragging = true;
      }

      if (state.dragging) {
        wrapperEl.scrollLeft = state.scrollStart - dx;
        e.preventDefault();
      } else {
        const el = getNoteElAtPoint(t.clientX, t.clientY);
        if (el?.dataset?.note && el.dataset.note !== state.note) {
          state.note = el.dataset.note;
          if (typeof triggerManualNote === 'function') triggerManualNote(el.dataset.note);
        }
      }
      e.stopPropagation();
    }, { capture: true, passive: false });

    keyboardEl.addEventListener('touchend', e => {
      if (!state) return;
      if (!state.dragging && state.note && typeof triggerManualNote === 'function') {
        triggerManualNote(state.note);
      }
      state = null;
      e.stopPropagation();
    }, { capture: true, passive: true });

    // Mouse support (desktop testing only — does not affect Android behavior)
    keyboardEl.addEventListener('mousedown', e => {
      const el = e.target.closest('[data-note]');
      if (el && typeof triggerManualNote === 'function') triggerManualNote(el.dataset.note);
      e.stopPropagation();
    }, { capture: true });
  }

  function injectScrollControls(wrapperEl, keyboardEl) {
    const row = document.createElement('div');
    row.className = 'keyboard-scroll-row';
    row.innerHTML = `
      <button type="button" class="scroll-arrow-btn" id="scrollLeftBtn">&#9664;</button>
      <span class="keyboard-scroll-hint">Swipe or tap arrows — full range C3 to C6</span>
      <button type="button" class="scroll-arrow-btn" id="scrollRightBtn">&#9654;</button>
    `;
    wrapperEl.insertAdjacentElement('afterend', row);

    document.getElementById('scrollLeftBtn').addEventListener('click', () => {
      wrapperEl.scrollBy({ left: -WHITE_W * 3, behavior: 'smooth' });
    });
    document.getElementById('scrollRightBtn').addEventListener('click', () => {
      wrapperEl.scrollBy({ left: WHITE_W * 3, behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    const keyboardEl = rebuildKeyboard();
    const wrapperEl = document.querySelector('.piano-wrapper');
    if (!keyboardEl || !wrapperEl) return;

    installCustomTouchHandling(keyboardEl, wrapperEl);
    injectScrollControls(wrapperEl, keyboardEl);

    const c4 = keyboardEl.querySelector('[data-base-note="C4"]');
    if (c4) requestAnimationFrame(() => { wrapperEl.scrollLeft = c4.offsetLeft - 40; });
  });
})();