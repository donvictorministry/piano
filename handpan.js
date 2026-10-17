(function() {
  // 1. Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes dv-pan-ripple {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(26, 95, 180, 0.4); }
      100% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(26, 95, 180, 0); }
    }

    #dv-handpan-modal {
      position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
      background: var(--surface, #fdfcff); z-index: 99999;
      display: none; flex-direction: column; font-family: Roboto, sans-serif;
      color: var(--on-surface, #1a1b1f); overflow: hidden;
    }
    #dv-handpan-modal.active { display: flex; }
    
    .dv-handpan-header {
      display: flex; align-items: center; padding: 16px 20px;
      border-bottom: 1px solid var(--outline, #c4c6d0); gap: 16px;
    }
    .dv-handpan-header h2 { margin: 0; font-size: 22px; font-weight: 700; }
    .dv-handpan-back {
      background: none; border: none; color: inherit; padding: 0; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    
    .dv-handpan-content {
      padding: 24px 20px; flex: 1; display: flex; flex-direction: column; 
      justify-content: center; align-items: center; gap: 30px; overflow-y: auto;
    }
    
    /* Handpan Circular Layout */
    .dv-handpan-board {
      position: relative; width: 320px; height: 320px;
      border-radius: 50%; background: var(--surface-container-high, #e4e4e9);
      border: 4px solid var(--outline, #c4c6d0);
      box-shadow: inset 0 8px 16px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1);
      display: flex; justify-content: center; align-items: center;
    }
    
    .dv-handpan-dimple {
      position: absolute; width: 64px; height: 64px;
      border-radius: 50%; background: var(--surface-container, #f0f0f4);
      border: 2px solid var(--outline, #c4c6d0);
      display: flex; justify-content: center; align-items: center;
      font-size: 19px; font-weight: bold; cursor: pointer;
      user-select: none; transition: background 0.1s;
      box-shadow: inset 0 2px 4px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.2);
    }
    
    .dv-handpan-dimple.active {
      background: var(--primary, #1a5fb4); color: #ffffff; border-color: var(--primary);
      animation: dv-pan-ripple 0.4s ease-out;
    }
    
    .dv-handpan-dimple.center {
      width: 90px; height: 90px; font-size: 22px;
    }
  `;
  document.head.appendChild(style);

  // 2. Inject Modal DOM
  const modal = document.createElement('div');
  modal.id = 'dv-handpan-modal';
  modal.innerHTML = `
    <div class="dv-handpan-header">
      <button class="dv-handpan-back" id="dvHandpanClose">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <h2>Virtual Handpan</h2>
    </div>
    <div class="dv-handpan-content">
      <div class="dv-handpan-board" id="dvHandpanBoard">
        <!-- Dimples injected via JS -->
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
      <span>Virtual Handpan</span>
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

  document.getElementById('dvHandpanClose').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // 4. Audio Engine & Logic
  let audioCtx = null;
  let delayNode = null;
  let feedbackGain = null;

  // D Minor Pentatonic Scale (Classic Handpan Tuning)
  const ding = { note: 'D3', freq: 146.83 }; // Center note
  const dimples = [
    { note: 'A3', freq: 220.00, angle: 0 },
    { note: 'C4', freq: 261.63, angle: 45 },
    { note: 'D4', freq: 293.66, angle: 90 },
    { note: 'E4', freq: 329.63, angle: 135 },
    { note: 'G4', freq: 392.00, angle: 180 },
    { note: 'A4', freq: 440.00, angle: 225 },
    { note: 'C5', freq: 523.25, angle: 270 },
    { note: 'D5', freq: 587.33, angle: 315 }
  ];

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
      
      // Create a spatial delay effect for the metallic resonance
      delayNode = audioCtx.createDelay();
      delayNode.delayTime.value = 0.3; // 300ms echo
      
      feedbackGain = audioCtx.createGain();
      feedbackGain.gain.value = 0.3; // 30% feedback
      
      // Connect delay loop
      delayNode.connect(feedbackGain);
      feedbackGain.connect(delayNode);
      
      // Connect to output
      delayNode.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playHandpan(freq, isCenter = false) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    // FM Synthesis for metallic "bloom"
    const carrier = audioCtx.createOscillator();
    const modulator = audioCtx.createOscillator();
    const modGain = audioCtx.createGain();
    const carrierGain = audioCtx.createGain();

    // The center note (Ding) is lower and has deeper modulation
    const modRatio = isCenter ? 1.5 : 2.0;
    const modIndex = isCenter ? 300 : 150;

    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(freq, now);

    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(freq * modRatio, now);
    
    modGain.gain.setValueAtTime(modIndex, now);
    // Modulator envelope: fast decay
    modGain.gain.exponentialRampToValueAtTime(1, now + 0.1);

    // Carrier envelope: long bloom
    carrierGain.gain.setValueAtTime(0.0001, now);
    carrierGain.gain.linearRampToValueAtTime(0.8, now + 0.05);
    carrierGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    // Routing
    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    
    carrier.connect(carrierGain);
    carrierGain.connect(audioCtx.destination);
    carrierGain.connect(delayNode); // Send to reverb/delay

    carrier.start(now);
    modulator.start(now);
    
    carrier.stop(now + 2.5);
    modulator.stop(now + 2.5);
  }

  // Build UI
  const board = document.getElementById('dvHandpanBoard');
  
  // Center Ding
  const centerEl = document.createElement('div');
  centerEl.className = 'dv-handpan-dimple center';
  centerEl.textContent = ding.note;
  centerEl.style.transform = 'translate(0, 0)';
  
  const triggerCenter = (e) => {
    e.preventDefault();
    initAudio();
    playHandpan(ding.freq, true);
    centerEl.classList.add('active');
    setTimeout(() => centerEl.classList.remove('active'), 150);
  };
  centerEl.addEventListener('touchstart', triggerCenter, { passive: false });
  centerEl.addEventListener('mousedown', triggerCenter);
  board.appendChild(centerEl);

  // Outer Dimples
  const radius = 110; // Distance from center
  dimples.forEach(d => {
    const el = document.createElement('div');
    el.className = 'dv-handpan-dimple';
    el.textContent = d.note;
    
    // Calculate X/Y position based on angle
    const rad = (d.angle - 90) * (Math.PI / 180);
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;
    
    el.style.transform = `translate(${x}px, ${y}px)`;
    
    const trigger = (e) => {
      e.preventDefault();
      initAudio();
      playHandpan(d.freq, false);
      el.classList.add('active');
      setTimeout(() => el.classList.remove('active'), 150);
    };

    el.addEventListener('touchstart', trigger, { passive: false });
    el.addEventListener('mousedown', trigger);
    board.appendChild(el);
  });

})();