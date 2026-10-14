(function () {
  'use strict';

  /* ── Audio ─────────────────────────────────────────── */
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  document.addEventListener('touchstart', initAudio, { once: true });
  document.addEventListener('click',      initAudio, { once: true });

  const FREQ = {
    'C4' :261.63,'C#4':277.18,'D4' :293.66,'D#4':311.13,'E4' :329.63,
    'F4' :349.23,'F#4':369.99,'G4' :392.00,'G#4':415.30,'A4' :440.00,
    'A#4':466.16,'B4' :493.88,'C5' :523.25,'C#5':554.37,'D5' :587.33,
    'D#5':622.25,'E5' :659.25,'F5' :698.46,'F#5':739.99,'G5' :783.99
  };

  function playTone(freq, dur) {
    if (!audioCtx) return;
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0,    audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.30, audioCtx.currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0.20, audioCtx.currentTime + dur * 0.1);
    gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + dur * 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + dur);
  }

  /* ── Piano layout ──────────────────────────────────── */
  const KEYS = [
    {note:'C4', type:'white'},{note:'C#4',type:'black'},
    {note:'D4', type:'white'},{note:'D#4',type:'black'},
    {note:'E4', type:'white'},{note:'F4', type:'white'},
    {note:'F#4',type:'black'},{note:'G4', type:'white'},
    {note:'G#4',type:'black'},{note:'A4', type:'white'},
    {note:'A#4',type:'black'},{note:'B4', type:'white'},
    {note:'C5', type:'white'},{note:'C#5',type:'black'},
    {note:'D5', type:'white'},{note:'D#5',type:'black'},
    {note:'E5', type:'white'},{note:'F5', type:'white'},
    {note:'F#5',type:'black'},{note:'G5', type:'white'}
  ];

  const WW = 56;
  const BW = 38;

  const pianoEl = document.getElementById('piano');
  const keyEls  = {};
  let   wIdx    = -1;

  KEYS.forEach(k => {
    const el = document.createElement('div');
    el.dataset.note = k.note;

    if (k.type === 'white') {
      wIdx++;
      el.className = 'white-key';
      el.innerHTML = `<span class="key-label">${k.note}</span>`;
      pianoEl.appendChild(el);
    } else {
      el.className = 'black-key';
      el.innerHTML = `<span class="key-label">${k.note}</span>`;
      el.style.left = `${wIdx * WW + WW - BW / 2}px`;
      pianoEl.appendChild(el);
    }
    keyEls[k.note] = el;
  });

  /* ── Key press ─────────────────────────────────────── */
  function pressKey(note, dur) {
    dur = dur || 0.6;
    const freq = FREQ[note];
    if (!freq) return;
    playTone(freq, dur);
    const el = keyEls[note];
    if (el) {
      el.classList.add('active');
      setTimeout(() => el.classList.remove('active'),
                 Math.max(dur * 900, 200));
    }
  }

  pianoEl.addEventListener('touchstart', e => {
    e.preventDefault();
    initAudio();
    [...e.changedTouches].forEach(t => {
      const el = document.elementFromPoint(t.clientX, t.clientY);
      if (el && el.dataset.note) pressKey(el.dataset.note);
    });
  }, { passive: false });

  pianoEl.addEventListener('touchmove', e => {
    e.preventDefault();
    [...e.changedTouches].forEach(t => {
      const el = document.elementFromPoint(t.clientX, t.clientY);
      if (el && el.dataset.note) pressKey(el.dataset.note, 0.25);
    });
  }, { passive: false });

  pianoEl.addEventListener('mousedown', e => {
    initAudio();
    const el = e.target.closest('[data-note]');
    if (el) pressKey(el.dataset.note);
  });

  /* ── Playback ──────────────────────────────────────── */
  let timers  = [];
  let playing = false;

  function getSpeed() {
    return parseFloat(document.getElementById('speed-range').value) || 1.25;
  }

  function stopSong() {
    timers.forEach(clearTimeout);
    timers  = [];
    playing = false;
    Object.values(keyEls).forEach(el => el.classList.remove('active'));
    document.getElementById('play-btn').classList.remove('hidden');
    document.getElementById('stop-btn').classList.add('hidden');
  }

  function playSong(song) {
    if (!song || !song.notes.length) return;
    initAudio();
    stopSong();
    playing = true;
    document.getElementById('play-btn').classList.add('hidden');
    document.getElementById('stop-btn').classList.remove('hidden');

    const spd = getSpeed();
    let   end = 0;

    song.notes.forEach(n => {
      const t   = (n.time / spd) * 1000;
      const dur = n.duration / spd;
      if (t + dur * 1000 > end) end = t + dur * 1000;
      timers.push(setTimeout(() => pressKey(n.note, dur), t));
    });

    timers.push(setTimeout(() => {
      stopSong();
      showToast(song.title + ' — done');
    }, end + 400));
  }

  /* ── Melody search ─────────────────────────────────── */
  let currentSong = null;

  function findMelody(q) {
    q = (q || '').toLowerCase().trim();
    if (!q) return null;
    return MELODIES.find(m =>
      m.title.toLowerCase().includes(q) ||
      (m.aliases || []).some(a => a.includes(q))
    ) || null;
  }

  function loadSong(song) {
    if (!song) {
      showToast('Melody not found.\nTry one of the suggestions.');
      return;
    }
    currentSong = song;
    document.getElementById('song-title').textContent = song.title;
    document.getElementById('now-playing').classList.remove('hidden');
    stopSong();
    document.getElementById('play-btn').classList.remove('hidden');
    document.getElementById('stop-btn').classList.add('hidden');
  }

  document.getElementById('search-btn').addEventListener('click', () => {
    loadSong(findMelody(document.getElementById('song-input').value));
  });

  document.getElementById('song-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') loadSong(findMelody(e.target.value));
  });

  document.getElementById('play-btn').addEventListener('click', () => {
    if (currentSong) playSong(currentSong);
  });

  document.getElementById('stop-btn').addEventListener('click', stopSong);

  /* ── Speed label ───────────────────────────────────── */
  const speedRange = document.getElementById('speed-range');
  const speedLabel = document.getElementById('speed-label');
  speedRange.addEventListener('input', () => {
    speedLabel.textContent = parseFloat(speedRange.value).toFixed(2) + '×';
  });

  /* ── Suggestion chips ──────────────────────────────── */
  const chipsEl = document.getElementById('chips');
  MELODIES.forEach(m => {
    const btn = document.createElement('button');
    btn.className   = 'chip';
    btn.textContent = m.title;
    btn.addEventListener('click', () => { loadSong(m); playSong(m); });
    chipsEl.appendChild(btn);
  });

  /* ── Dark mode — inline SVG, no emoji ─────────────── */
  const MOON_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>`;

  const SUN_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"     x2="12" y2="3"/>
    <line x1="12" y1="21"    x2="12" y2="23"/>
    <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1"  y1="12"    x2="3"  y2="12"/>
    <line x1="21" y1="12"    x2="23" y2="12"/>
    <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
  </svg>`;

  const darkBtn = document.getElementById('dark-toggle');

  function applyTheme(t) {
    if (t === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      darkBtn.innerHTML = SUN_SVG;
      darkBtn.setAttribute('aria-label', 'Switch to light mode');
    } else {
      document.documentElement.removeAttribute('data-theme');
      darkBtn.innerHTML = MOON_SVG;
      darkBtn.setAttribute('aria-label', 'Switch to dark mode');
    }
    localStorage.setItem('pianobar-theme', t);
  }

  applyTheme(localStorage.getItem('pianobar-theme') || 'light');

  darkBtn.addEventListener('click', () => {
    applyTheme(
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'light' : 'dark'
    );
  });

  /* ── Toast ─────────────────────────────────────────── */
  let toastTimer = null;

  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  }

  window.showToast = showToast;

}());
