(function() {
  // 1. Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes dv-pulse { 
      0% { transform: scale(1); opacity: 1; } 
      100% { transform: scale(1.3); opacity: 0; } 
    }
    
    #dv-metro-modal {
      position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
      background: var(--surface, #fdfcff); z-index: 99999;
      display: none; flex-direction: column; font-family: Roboto, sans-serif;
      color: var(--on-surface, #1a1b1f); overflow: hidden;
    }
    #dv-metro-modal.active { display: flex; }
    
    .dv-metro-header {
      display: flex; align-items: center; padding: 16px 20px;
      border-bottom: 1px solid var(--outline, #c4c6d0); gap: 16px;
    }
    .dv-metro-header h2 { margin: 0; font-size: 22px; font-weight: 700; }
    .dv-metro-back {
      background: none; border: none; color: inherit; padding: 0; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    
    .dv-metro-content {
      padding: 24px 20px; flex: 1; display: flex; flex-direction: column; 
      align-items: center; justify-content: space-evenly;
    }
    
    .dv-metro-display {
      display: flex; flex-direction: column; align-items: center; gap: 16px;
    }
    
    .dv-metro-orb {
      width: 80px; height: 80px; border-radius: 50%;
      background: var(--surface-container-high, #e4e4e9);
      position: relative;
    }
    .dv-metro-orb::after {
      content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      border-radius: 50%; background: var(--primary, #1a5fb4); 
      opacity: 0; pointer-events: none;
    }
    .dv-metro-orb.beat::after {
      animation: dv-pulse 0.4s ease-out;
    }
    .dv-metro-orb.beat.accent::after {
      background: #e53935; /* Accent color for 1st beat */
    }
    
    .dv-metro-bpm {
      font-size: 64px; font-weight: 900; margin: 0; line-height: 1;
    }
    .dv-metro-label { font-size: 19px; font-weight: 500; opacity: 0.7; margin: 0; }
    
    .dv-metro-controls {
      display: flex; gap: 16px; width: 100%;
    }
    .dv-metro-btn {
      background: var(--surface-container, #f0f0f4); color: var(--on-surface);
      border: 2px solid var(--outline, #c4c6d0); border-radius: 16px;
      font-size: 20px; font-weight: bold; padding: 16px; flex: 1;
      cursor: pointer; transition: background 0.1s, transform 0.1s;
      display: flex; justify-content: center; align-items: center;
    }
    .dv-metro-btn:active { transform: scale(0.95); background: var(--surface-container-high); }
    
    .dv-metro-btn.primary {
      background: var(--primary); color: #ffffff; border-color: var(--primary);
    }
    .dv-metro-btn.primary:active { background: var(--primary); opacity: 0.9; }
    
    .dv-metro-tap {
      width: 100%; padding: 24px; border-radius: 24px;
      font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;
    }
  `;
  document.head.appendChild(style);

  // 2. Inject Modal DOM
  const modal = document.createElement('div');
  modal.id = 'dv-metro-modal';
  modal.innerHTML = `
    <div class="dv-metro-header">
      <button class="dv-metro-back" id="dvMetroClose">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <h2>Studio Metronome</h2>
    </div>
    <div class="dv-metro-content">
      
      <div class="dv-metro-display">
        <div class="dv-metro-orb" id="dvMetroOrb"></div>
        <h1 class="dv-metro-bpm" id="dvMetroBpm">120</h1>
        <p class="dv-metro-label">BPM &bull; 4/4 Time</p>
      </div>

      <div class="dv-metro-controls">
        <button class="dv-metro-btn" id="dvMetroMinus">- 5</button>
        <button class="dv-metro-btn" id="dvMetroPlus">+ 5</button>
      </div>

      <button class="dv-metro-btn primary dv-metro-tap" id="dvMetroToggle">START</button>
      
      <button class="dv-metro-btn" id="dvMetroTap">Tap Tempo</button>

    </div>
  `;
  document.body.appendChild(modal);

  // 3. Inject Sidebar Item
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (sidebarNav) {
    const navItem = document.createElement('div');
    navItem.className = 'sidebar-item';
    navItem.innerHTML = `
      <span>Studio Metronome</span>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
    `;
    sidebarNav.appendChild(navItem);

    navItem.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      const sidebarOverlay = document.getElementById('sidebarOverlay');
      if (sidebar) sidebar.classList.remove('open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('open');
      modal.classList.add('active');
    });
  }

  document.getElementById('dvMetroClose').addEventListener('click', () => {
    modal.classList.remove('active');
    stopMetronome();
  });

  // 4. Audio & Logic Engine
  let audioCtx = null;
  let isRunning = false;
  let bpm = 120;
  let nextNoteTime = 0.0;
  let currentBeat = 0; // 0 to 3
  let timerId = null;

  // Tap Tempo variables
  let tapTimes = [];
  
  const bpmDisplay = document.getElementById('dvMetroBpm');
  const orb = document.getElementById('dvMetroOrb');
  const toggleBtn = document.getElementById('dvMetroToggle');
  const tapBtn = document.getElementById('dvMetroTap');

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function scheduleNote(beatNumber, time) {
    // Audio Click
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Accent the first beat (beatNumber 0)
    osc.frequency.value = (beatNumber === 0) ? 880.0 : 440.0; 
    
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + 0.1);

    // UI Flash (using setTimeout to sync roughly with visual)
    const delay = (time - audioCtx.currentTime) * 1000;
    if (delay >= 0) {
      setTimeout(() => {
        if (!isRunning) return;
        orb.classList.remove('beat', 'accent');
        void orb.offsetWidth; // Trigger reflow to restart animation
        orb.classList.add('beat');
        if (beatNumber === 0) orb.classList.add('accent');
      }, delay);
    }
  }

  function nextNote() {
    const secondsPerBeat = 60.0 / bpm;
    nextNoteTime += secondsPerBeat;
    currentBeat = (currentBeat + 1) % 4;
  }

  function scheduler() {
    while (nextNoteTime < audioCtx.currentTime + 0.1) {
      scheduleNote(currentBeat, nextNoteTime);
      nextNote();
    }
    timerId = setTimeout(scheduler, 25);
  }

  function startMetronome() {
    initAudio();
    isRunning = true;
    currentBeat = 0;
    nextNoteTime = audioCtx.currentTime + 0.05;
    toggleBtn.textContent = 'STOP';
    toggleBtn.style.background = '#e53935'; // Red for stop
    scheduler();
  }

  function stopMetronome() {
    isRunning = false;
    clearTimeout(timerId);
    toggleBtn.textContent = 'START';
    toggleBtn.style.background = 'var(--primary)';
    orb.classList.remove('beat', 'accent');
  }

  // 5. Controls
  toggleBtn.addEventListener('click', () => {
    if (isRunning) stopMetronome();
    else startMetronome();
  });

  function updateBpm(newBpm) {
    bpm = Math.max(40, Math.min(240, newBpm));
    bpmDisplay.textContent = bpm;
  }

  document.getElementById('dvMetroPlus').addEventListener('click', () => updateBpm(bpm + 5));
  document.getElementById('dvMetroMinus').addEventListener('click', () => updateBpm(bpm - 5));

  // Tap Tempo Logic
  tapBtn.addEventListener('click', () => {
    const now = performance.now();
    
    // Reset if last tap was over 2 seconds ago
    if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > 2000) {
      tapTimes = [];
    }
    
    tapTimes.push(now);
    if (tapTimes.length > 4) tapTimes.shift(); // Keep last 4 taps

    if (tapTimes.length > 1) {
      let sum = 0;
      for (let i = 1; i < tapTimes.length; i++) {
        sum += (tapTimes[i] - tapTimes[i - 1]);
      }
      const avgMs = sum / (tapTimes.length - 1);
      const newBpm = Math.round(60000 / avgMs);
      updateBpm(newBpm);
    }
  });

})();