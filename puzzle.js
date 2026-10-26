/* puzzle.js — gated entry screen for DV-Piano. Blocks the full app
   behind a simple pick-the-answer puzzle until solved once per
   session. HONESTY NOTE: this is a client-side friction gate only —
   the answers live in this file as plain JavaScript, so it deters
   casual/scripted traffic and makes the app feel native and gated,
   but it is NOT real bot security. A determined bot can read this
   source and bypass it. Genuine protection requires a server-side
   check (reCAPTCHA/hCaptcha/backend token).

   Self-contained. Loads BEFORE melody.js and app.js so the gate
   appears first. 100dvw/100dvh edge-to-edge, no max-width anywhere,
   Android-only mobile layout. */
(function () {
  'use strict';

  const SESSION_KEY = 'dvpiano_puzzle_solved';
  let wrongAttempts = 0;
  const MAX_ATTEMPTS_BEFORE_SWAP = 2;

  if (sessionStorage.getItem(SESSION_KEY) === 'true') {
    return; // already solved this session — skip gate entirely
  }

  /* ============================================================
     SVG ICON PATHS — simple, self-drawn, no external assets
     ============================================================ */
  const ICONS = {
    cross: `<rect x="10" y="2" width="4" height="20" rx="1"/><rect x="3" y="9" width="18" height="4" rx="1"/>`,
    book: `<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2V4z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7V4z"/>`,
    dove: `<path d="M3 12c3-4 7-5 9-5 1 0 1 1 0 2-3 1-5 3-5 3s4-1 7 0c2 .7 3 2 3 2s-2 .5-4 .2c1 1 3 3 3 5 0 0-3-1-5-3-1 2-3 3-5 3 1-2 2-4 2-6-2 .5-4-.2-5-1.2z"/>`,
    fish: `<path d="M2 12c4-6 12-6 16 0-4 6-12 6-16 0z"/><path d="M18 12l4-3v6z"/>`,
    heart: `<path d="M12 21s-6.7-4.35-9.3-8.1C.8 10.1 1.4 6.6 4.4 5.1 6.9 3.9 9.6 5 12 7.6 14.4 5 17.1 3.9 19.6 5.1c3 1.5 3.6 5 1.7 7.8C18.7 16.65 12 21 12 21z"/>`,
    star: `<path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.2 21 12 17.6 5.8 21 7 14.14l-5-4.87 7.1-1.01z"/>`
  };

  function svgIcon(iconKey, extraClass) {
    return `<svg class="puzzle-icon ${extraClass || ''}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${ICONS[iconKey]}</svg>`;
  }

  /* ============================================================
     PUZZLE POOL
     ============================================================ */
  const TEXT_PUZZLES = [
    { type: 'text', question: 'For God so loved the...?', options: ['World', 'Angels', 'Animals', 'Nations'], correct: 'World' },
    { type: 'text', question: 'God the Father, God the Son, God the...?', options: ['Spirit', 'Prophet', 'Angel', 'Apostle'], correct: 'Spirit' },
    { type: 'text', question: 'In the beginning, God created the heavens and the...?', options: ['Earth', 'Stars', 'Sea', 'Sun'], correct: 'Earth' },
    { type: 'text', question: 'The Lord is my..., I shall not want', options: ['Shepherd', 'King', 'Friend', 'Teacher'], correct: 'Shepherd' },
    { type: 'text', question: 'Joy to the world, the Lord is...?', options: ['Come', 'Near', 'Risen', 'Here'], correct: 'Come' }
  ];

  const IMAGE_PUZZLES = [
    { type: 'image', question: 'Tap the image that matches this pattern', target: 'cross', options: ['cross', 'fish', 'dove'] },
    { type: 'image', question: 'Tap the image that matches this pattern', target: 'book', options: ['heart', 'book', 'star'] },
    { type: 'image', question: 'Tap the image that matches this pattern', target: 'dove', options: ['dove', 'cross', 'book'] },
    { type: 'image', question: 'Tap the image that matches this pattern', target: 'fish', options: ['fish', 'star', 'heart'] }
  ];

  const ALL_PUZZLES = [...TEXT_PUZZLES, ...IMAGE_PUZZLES];

  function pickRandomPuzzle(excludeQuestion) {
    const pool = ALL_PUZZLES.filter(p => p.question + JSON.stringify(p.options) !== excludeQuestion);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ============================================================
     STYLES — 100dvw / 100dvh edge-to-edge, no max-width anywhere
     ============================================================ */
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #puzzleGate {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        width: 100dvw; height: 100dvh;
        margin: 0; padding: 0;
        background: var(--bg-page, #f8f9fa);
        z-index: 999999;
        display: flex; flex-direction: column;
        align-items: stretch; justify-content: center;
        font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
        overflow: hidden;
      }
      #puzzleGate * { box-sizing: border-box; font-size: 19px; }
      .puzzle-inner {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0 20px;
      }
      .puzzle-card {
        background: var(--bg-surface, #fff);
        border: 1px solid var(--border-color, #cbd5e1);
        border-radius: 16px;
        padding: 28px 22px;
        width: 100%;
        box-shadow: var(--shadow, 0 4px 6px rgba(0,0,0,.1));
        text-align: center;
      }
      .puzzle-badge {
        font-size: 19px; font-weight: 900; letter-spacing: .5px;
        text-transform: uppercase; color: var(--primary, #1e40af);
        margin-bottom: 10px;
      }
      .puzzle-question {
        font-size: 22px; font-weight: 800;
        color: var(--text-main, #0f172a);
        margin-bottom: 22px; line-height: 1.4;
      }
      .puzzle-options {
        display: flex; flex-direction: column; gap: 12px;
        width: 100%;
      }
      .puzzle-options.image-row {
        flex-direction: row; justify-content: center; gap: 16px;
        flex-wrap: wrap;
      }
      .puzzle-option-btn {
        background: var(--bg-page, #f8f9fa);
        border: 2px solid var(--border-color, #cbd5e1);
        border-radius: 12px;
        padding: 16px;
        font-size: 19px; font-weight: 700;
        color: var(--text-main, #0f172a);
        cursor: pointer;
        font-family: inherit;
        width: 100%;
      }
      .puzzle-option-btn:active { transform: scale(.96); }
      .puzzle-option-btn.image-btn {
        width: 84px; height: 84px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .puzzle-icon { width: 38px; height: 38px; color: var(--primary, #1e40af); }
      .puzzle-target-icon {
        width: 64px; height: 64px; margin: 0 auto 18px;
        color: var(--text-muted, #475569);
        opacity: .5;
        display: block;
      }
      .puzzle-feedback {
        min-height: 26px; font-size: 19px; font-weight: 700;
        margin-top: 14px; color: #dc2626;
      }
      .puzzle-feedback.correct { color: #16a34a; }
      .puzzle-shake { animation: puzzleShake .35s; }
      @keyframes puzzleShake {
        0%,100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        75% { transform: translateX(8px); }
      }
      .puzzle-footer {
        margin-top: 18px; font-size: 19px; color: var(--text-muted, #475569);
        text-align: center;
      }
      body.dark #puzzleGate { background: var(--bg-page, #090d16); }
    `;
    document.head.appendChild(style);
  }

  /* ============================================================
     RENDER
     ============================================================ */
  let gateEl = null;
  let currentPuzzle = null;

  function render(puzzle) {
    currentPuzzle = puzzle;
    const card = gateEl.querySelector('.puzzle-card');

    let optionsHtml = '';
    if (puzzle.type === 'text') {
      const shuffled = shuffle(puzzle.options);
      optionsHtml = `
        <div class="puzzle-options">
          ${shuffled.map(opt => `<button type="button" class="puzzle-option-btn" data-answer="${opt}">${opt}</button>`).join('')}
        </div>
      `;
      card.innerHTML = `
        <div class="puzzle-badge">Verify you're human</div>
        <div class="puzzle-question">${puzzle.question}</div>
        ${optionsHtml}
        <div class="puzzle-feedback" id="puzzleFeedback" role="status" aria-live="polite"></div>
      `;
    } else {
      const shuffledOptions = shuffle(puzzle.options);
      optionsHtml = `
        <div class="puzzle-options image-row">
          ${shuffledOptions.map(iconKey => `
            <button type="button" class="puzzle-option-btn image-btn" data-answer="${iconKey}">
              ${svgIcon(iconKey)}
            </button>
          `).join('')}
        </div>
      `;
      card.innerHTML = `
        <div class="puzzle-badge">Verify you're human</div>
        <div class="puzzle-question">${puzzle.question}</div>
        ${svgIcon(puzzle.target, 'puzzle-target-icon')}
        ${optionsHtml}
        <div class="puzzle-feedback" id="puzzleFeedback" role="status" aria-live="polite"></div>
      `;
    }

    card.querySelectorAll('.puzzle-option-btn').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn.dataset.answer, card));
    });
  }

  function handleAnswer(answer, card) {
    const feedback = document.getElementById('puzzleFeedback');
    const correctValue = currentPuzzle.type === 'text' ? currentPuzzle.correct : currentPuzzle.target;

    if (answer === correctValue) {
      feedback.textContent = 'Correct — welcome!';
      feedback.classList.add('correct');
      card.querySelectorAll('.puzzle-option-btn').forEach(b => b.disabled = true);
      setTimeout(unlockApp, 500);
    } else {
      wrongAttempts++;
      feedback.textContent = 'Not quite — try again';
      feedback.classList.remove('correct');
      card.classList.add('puzzle-shake');
      setTimeout(() => card.classList.remove('puzzle-shake'), 350);

      if (wrongAttempts >= MAX_ATTEMPTS_BEFORE_SWAP) {
        wrongAttempts = 0;
        const next = pickRandomPuzzle(currentPuzzle.question + JSON.stringify(currentPuzzle.options));
        setTimeout(() => render(next), 500);
      }
    }
  }

  function unlockApp() {
    sessionStorage.setItem(SESSION_KEY, 'true');
    if (gateEl) {
      gateEl.style.transition = 'opacity .3s ease';
      gateEl.style.opacity = '0';
      setTimeout(() => gateEl.remove(), 320);
    }
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  /* ============================================================
     INIT
     ============================================================ */
  function buildGate() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    gateEl = document.createElement('div');
    gateEl.id = 'puzzleGate';
    gateEl.innerHTML = `
      <div class="puzzle-inner">
        <div class="puzzle-card"></div>
        <div class="puzzle-footer">DV-Piano — tap the correct answer to continue</div>
      </div>
    `;
    document.body.appendChild(gateEl);

    const firstPuzzle = pickRandomPuzzle(null);
    render(firstPuzzle);
  }

  injectStyles();

  if (document.body) {
    buildGate();
  } else {
    document.addEventListener('DOMContentLoaded', buildGate);
  }
})();