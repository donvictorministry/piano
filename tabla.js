(function() {
  // 1. Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes dv-tabla-hit {
      0% { transform: scale(1); background: var(--primary); color: #fff; }
      50% { transform: scale(0.95); }
      100% { transform: scale(1); background: var(--surface-container); color: var(--on-surface); }
    }

    #dv-tabla-modal {
      position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
      background: var(--surface, #fdfcff); z-index: 99999;
      display: none; flex-direction: column; font-family: Roboto, sans-serif;
      color: var(--on-surface, #1a1b1f); overflow: hidden;
    }
    #dv-tabla-modal.active { display: flex; }
    
    .dv-tabla-header {
      display: flex; align-items: center; padding: 16px 20px;
      border-bottom: 1px solid var(--outline, #c4c6d0); gap: 16px;
    }
    .dv-tabla-header h2 { margin: 0; font-size: 22px; font-weight: 700; }
    .dv-tabla-back {
      background: none; border: none; color: inherit; padding: 0; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    
    .dv-tabla-content {
      padding: 24px 20px; flex: 1; display: flex; flex-direction: column; 
      justify-content: flex-start; align-items: center; gap: 24px; overflow-y: auto;
    }
    
    /* Tabla Pair Layout */
    .dv-tabla-drums {
      display: flex; justify-content: space-between; width: 100%; max-width: 400px; gap: 20px;
    }
    
    .dv-tabla-drum {
      flex: 1; aspect-ratio: 1; border-radius: 50%;
      background: var(--surface-container-high, #e4e4e9);
      border: 4px solid var(--outline, #c4c6d0);
      display: flex; justify-content: center; align-items: center;
      font-size: 24px; font-weight: 900; cursor: pointer;
      user-select: none; box-shadow: inset 0 10px 20px rgba(0,0,0,0.1);
      transition: background 0.1s;
    }
    
    /* Bayan (Left - Bass) is slightly larger in real life */
    .dv-tabla-bayan { border-radius: 40% 60% 60% 40% / 50% 50% 50% 50%; }
    .dv-tabla-dayan { border-radius: 50%; }
    
    .dv-tabla-drum.active { animation: dv-tabla-hit 0.2s ease-out; }
    
    /* Bols Grid */
    .dv-tabla-bols {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; width: 100%; max-width: 400px;
    }
    .dv-tabla-bol-btn {
      background: var(--surface-container, #f0f0f4); color: var(--on-surface);
      border: 2px solid var(--outline, #c4c6d0); border-radius: 12px;
      font-size: 20px; font-weight: bold; padding: 16px 0; cursor: pointer;
      transition: transform 0.1s;
    }
    .dv-tabla-bol-btn:active { transform: scale(0.9); background: var(--primary); color: #fff; }
    
    /* Sequencer */
    .dv-tabla-controls {
      display: flex; gap: 16px; width: 100%; max-width: 400px; margin-top: auto;
    }
    .dv-tabla-btn {
      background: var(--primary, #1a5fb4); color: #ffffff;
      border: none; border-radius: 16px; font-size: 19px; font-weight: bold;
      padding: 16px; flex: 1; cursor: pointer; transition: opacity 0.1s;
    }
    .dv-tabla-btn.running { background: #e53935; }
  `;
  document.head.appendChild(style);

  // 2. Inject Modal DOM
  const modal = document.createElement('div');
  modal.id = 'dv-tabla-modal';
  modal.innerHTML = `
    <div class="dv-tabla-header">
      <button class="dv-tabla-back" id="dvTablaClose">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <h2>Virtual Tabla</h2>
    </div>
    <div class="dv-tabla-content">
      
      <div class="dv-tabla-drums">
        <div class="dv-tabla-drum dv-tabla-bayan" id="dvTablaBayan">GE</div>
        <div class="dv-tabla-drum dv-tabla-dayan" id="dvTablaDayan">NA</div>
      </div>

      <div class="dv-tabla-bols">
        <button class="dv-tabla-bol-btn" data-bol="na">NA</button>
        <button class="dv-tabla-bol-btn" data-bol="tin">TIN</button>
        <button class="dv-tabla-bol-btn" data-bol="ge">GE</button>
        <button class="dv-tabla-bol-btn" data-bol="dha">DHA</button>
      </div>

      <div class="dv-tabla-controls">
        <button class="dv-tabla-btn" id="dvTablaToggle">START TINTAAL</button>
      </div>

    </div>
  `;
  document.body.appendChild(modal);

  // 3. Inject Sidebar Item
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (sidebarNav) {
    const navItem = document.createElement('div');
    navItem.className = 'sidebar-item';
    navItem.innerHTML = `
      <span>Virtual Tabla</span>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
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

  document.getElementById('dvTablaClose').addEventListener('click', () => {
    modal.classList.remove('active');
    stopSequencer();
  });

  // 4. Audio Engine
  let audioCtx = null;
  let isSeqRunning = false;
  let seqInterval = null;
  let currentStep = 0;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playBol(type) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    if (type === 'ge') {
      // Bayan (Bass) - Low pitch bend
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'na') {
      // Dayan (Treble) - Sharp membrane
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'tin') {
      // Dayan - High pitched ring
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(now); osc.stop(now + 0.1);
    } else if (type === 'dha') {
      // Both drums simultaneously
      playBol('ge');
      setTimeout(() => playBol('na'), 10);
    }
  }

  // 5. Interactive UI
  const bayanEl = document.getElementById('dvTablaBayan');
  const dayanEl = document.getElementById('dvTablaDayan');

  const triggerBayan = (e) => {
    e.preventDefault(); initAudio(); playBol('ge');
    bayanEl.classList.add('active');
    setTimeout(() => bayanEl.classList.remove('active'), 150);
  };
  bayanEl.addEventListener('touchstart', triggerBayan, { passive: false });
  bayanEl.addEventListener('mousedown', triggerBayan);

  const triggerDayan = (e) => {
    e.preventDefault(); initAudio(); playBol('na');
    dayanEl.classList.add('active');
    setTimeout(() => dayanEl.classList.remove('active'), 150);
  };
  dayanEl.addEventListener('touchstart', triggerDayan, { passive: false });
  dayanEl.addEventListener('mousedown', triggerDayan);

  // Bols Grid
  document.querySelectorAll('.dv-tabla-bol-btn').forEach(btn => {
    const trigger = (e) => {
      e.preventDefault(); initAudio();
      playBol(btn.dataset.bol);
    };
    btn.addEventListener('touchstart', trigger, { passive: false });
    btn.addEventListener('mousedown', trigger);
  });

  // 6. Sequencer (Teentaal Pattern)
  const toggleBtn = document.getElementById('dvTablaToggle');
  const teentaal = ['dha', 'dhin', 'dhin', 'dha', 'dha', 'dhin', 'dhin', 'dha', 'dha', 'tin', 'tin', 'ta', 'ta', 'dhin', 'dhin', 'dha'];
  
  function runSequencer() {
    if (!isSeqRunning) return;
    const bol = teentaal[currentStep % 16];
    if (bol === 'dha') playBol('dha');
    else if (bol === 'dhin') { playBol('ge'); setTimeout(() => playBol('tin'), 10); }
    else if (bol === 'tin') playBol('tin');
    else if (bol === 'ta') playBol('na');

    // Visual flash for the Bayan
    bayanEl.classList.add('active');
    setTimeout(() => bayanEl.classList.remove('active'), 100);

    currentStep++;
  }

  function stopSequencer() {
    isSeqRunning = false;
    clearInterval(seqInterval);
    toggleBtn.textContent = 'START TEENTAAL';
    toggleBtn.classList.remove('running');
  }

  toggleBtn.addEventListener('click', () => {
    initAudio();
    isSeqRunning = !isSeqRunning;
    if (isSeqRunning) {
      toggleBtn.textContent = 'STOP TEENTAAL';
      toggleBtn.classList.add('running');
      currentStep = 0;
      seqInterval = setInterval(runSequencer, 200); // ~75 BPM
    } else {
      stopSequencer();
    }
  });

})();