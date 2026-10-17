(function() {
  // 1. Inject CSS & Inline SVG Layout
  const style = document.createElement('style');
  style.textContent = `
    #dv-drum-modal {
      position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
      background: var(--surface, #fdfcff); z-index: 99999;
      display: none; flex-direction: column; font-family: Roboto, sans-serif;
      color: var(--on-surface, #1a1b1f); overflow: hidden;
    }
    #dv-drum-modal.active { display: flex; }
    
    .dv-drum-header {
      display: flex; align-items: center; padding: 16px 20px;
      border-bottom: 1px solid var(--outline, #c4c6d0); gap: 16px;
    }
    .dv-drum-header h2 { margin: 0; font-size: 22px; font-weight: 700; }
    .dv-drum-back {
      background: none; border: none; color: inherit; padding: 0; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    
    .dv-drum-content {
      padding: 24px 20px; flex: 1; display: flex; flex-direction: column; gap: 20px; overflow-y: auto;
    }
    
    .dv-drum-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; flex: 1; min-height: 320px;
    }
    
    .dv-drum-pad {
      background: var(--surface-container, #f0f0f4);
      border: 2px solid var(--outline, #c4c6d0);
      border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-size: 19px; font-weight: bold; color: var(--on-surface);
      user-select: none; -webkit-user-select: none; transition: transform 0.1s, background 0.1s;
      padding: 16px; gap: 12px;
    }
    .dv-drum-pad.active {
      background: var(--primary); color: #ffffff; border-color: var(--primary);
      transform: scale(0.95);
    }
    .dv-drum-pad svg {
      width: 64px; height: 64px; fill: currentColor; pointer-events: none;
    }
    
    .dv-drum-controls {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px; background: var(--surface-container); border-radius: 16px;
      border: 1px solid var(--outline);
    }
    .dv-drum-controls label { font-size: 19px; font-weight: 500; }
    .dv-drum-controls input[type="range"] { width: 50%; accent-color: var(--primary); }
    
    .dv-drum-btn {
      background: var(--primary); color: #ffffff; border: none;
      padding: 16px; border-radius: 16px; font-size: 20px; font-weight: bold;
      width: 100%; cursor: pointer; margin-top: auto;
      transition: opacity 0.2s;
    }
    .dv-drum-btn.running { background: var(--outline); color: var(--on-surface); }
  `;
  document.head.appendChild(style);

  // 2. Inject Modal DOM
  const modal = document.createElement('div');
  modal.id = 'dv-drum-modal';
  modal.innerHTML = `
    <div class="dv-drum-header">
      <button class="dv-drum-back" id="dvDrumClose">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <h2>Studio Drums</h2>
    </div>
    <div class="dv-drum-content">
      <div class="dv-drum-grid" id="dvDrumGrid"></div>
      <div class="dv-drum-controls">
        <label>Volume</label>
        <input type="range" id="dvDrumVol" min="0" max="1" step="0.1" value="0.8">
      </div>
      <button class="dv-drum-btn" id="dvDrumSeqBtn">Start Sequencer</button>
    </div>
  `;
  document.body.appendChild(modal);

  // 3. Inject Sidebar Item
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (sidebarNav) {
    const navItem = document.createElement('div');
    navItem.className = 'sidebar-item';
    navItem.innerHTML = `
      <span>Studio Drums</span>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
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

  document.getElementById('dvDrumClose').addEventListener('click', () => {
    modal.classList.remove('active');
    stopSequencer();
  });

  // 4. SVG Icons for "Pure Drum Musical Images"
  const icons = {
    kick: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>`,
    snare: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`,
    hihat: `<svg viewBox="0 0 24 24"><path d="M4 7h16v2H4zm0 4h16v2H4zm0 4h16v2H4z"/></svg>`,
    clap: `<svg viewBox="0 0 24 24"><path d="M18 11c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-4-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-4 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-4-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm8-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`
  };

  // 5. Audio Engine
  let audioCtx = null;
  let masterGain = null;
  let isSeqRunning = false;
  let seqInterval = null;
  let currentStep = 0;

  const padsData = [
    { id: 'kick', label: 'KICK', icon: icons.kick },
    { id: 'snare', label: 'SNARE', icon: icons.snare },
    { id: 'hihat', label: 'HI-HAT', icon: icons.hihat },
    { id: 'clap', label: 'CLAP', icon: icons.clap }
  ];

  const pattern = {
    kick:  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    clap:  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
  };

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = document.getElementById('dvDrumVol').value;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playSound(type) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    if (type === 'kick') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.4);
      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain); gain.connect(masterGain);
      osc.start(now); osc.stop(now + 0.4);
    } else if (type === 'snare') {
      const bufferSize = audioCtx.sampleRate * 0.2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass'; filter.frequency.value = 1000;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      noise.connect(filter); filter.connect(gain); gain.connect(masterGain);
      noise.start(now);
    } else if (type === 'hihat') {
      const bufferSize = audioCtx.sampleRate * 0.05;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass'; filter.frequency.value = 7000;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      noise.connect(filter); filter.connect(gain); gain.connect(masterGain);
      noise.start(now);
    } else if (type === 'clap') {
      const bufferSize = audioCtx.sampleRate * 0.3;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass'; filter.frequency.value = 1500;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      noise.connect(filter); filter.connect(gain); gain.connect(masterGain);
      noise.start(now);
    }
  }

  // Build Pads
  const grid = document.getElementById('dvDrumGrid');
  padsData.forEach(pad => {
    const el = document.createElement('div');
    el.className = 'dv-drum-pad';
    el.innerHTML = `${pad.icon}<span>${pad.label}</span>`;
    
    const trigger = (e) => {
      e.preventDefault();
      initAudio();
      playSound(pad.id);
      el.classList.add('active');
      setTimeout(() => el.classList.remove('active'), 100);
    };

    el.addEventListener('touchstart', trigger, { passive: false });
    el.addEventListener('mousedown', trigger);
    grid.appendChild(el);
  });

  // Volume Control
  document.getElementById('dvDrumVol').addEventListener('input', (e) => {
    if (masterGain) masterGain.gain.value = e.target.value;
  });

  // Sequencer
  const seqBtn = document.getElementById('dvDrumSeqBtn');
  
  function runSequencer() {
    if (!isSeqRunning) return;
    const step = currentStep % 16;
    
    if (pattern.kick[step]) playSound('kick');
    if (pattern.snare[step]) playSound('snare');
    if (pattern.hihat[step]) playSound('hihat');
    if (pattern.clap[step]) playSound('clap');

    if (pattern.kick[step]) {
      const pads = grid.children;
      pads[0].classList.add('active');
      setTimeout(() => pads[0].classList.remove('active'), 100);
    }

    currentStep++;
  }

  function stopSequencer() {
    isSeqRunning = false;
    clearInterval(seqInterval);
    seqBtn.textContent = 'Start Sequencer';
    seqBtn.classList.remove('running');
  }

  seqBtn.addEventListener('click', () => {
    initAudio();
    isSeqRunning = !isSeqRunning;
    if (isSeqRunning) {
      seqBtn.textContent = 'Stop Sequencer';
      seqBtn.classList.add('running');
      currentStep = 0;
      seqInterval = setInterval(runSequencer, 150); // ~100 BPM
    } else {
      stopSequencer();
    }
  });

})();