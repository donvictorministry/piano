(function() {
  // 1. Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes dv-kalimba-pluck {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(26, 95, 180, 0.4); }
      50% { transform: scale(0.95); box-shadow: 0 0 0 10px rgba(26, 95, 180, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(26, 95, 180, 0); }
    }

    #dv-kalimba-modal {
      position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
      background: var(--surface, #fdfcff); z-index: 99999;
      display: none; flex-direction: column; font-family: Roboto, sans-serif;
      color: var(--on-surface, #1a1b1f); overflow: hidden;
    }
    #dv-kalimba-modal.active { display: flex; }
    
    .dv-kalimba-header {
      display: flex; align-items: center; padding: 16px 20px;
      border-bottom: 1px solid var(--outline, #c4c6d0); gap: 16px;
    }
    .dv-kalimba-header h2 { margin: 0; font-size: 22px; font-weight: 700; }
    .dv-kalimba-back {
      background: none; border: none; color: inherit; padding: 0; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    
    .dv-kalimba-content {
      padding: 24px 20px; flex: 1; display: flex; flex-direction: column; 
      justify-content: center; align-items: center; gap: 40px; overflow-y: auto;
    }
    
    /* V-shape container */
    .dv-kalimba-board {
      display: flex; justify-content: center; align-items: flex-start; gap: 12px;
      width: 100%; max-width: 400px; margin: 0 auto;
    }
    
    .dv-kalimba-tine {
      flex: 1; background: var(--surface-container-high, #e4e4e9);
      border: 2px solid var(--outline, #c4c6d0); border-radius: 8px;
      display: flex; flex-direction: column; align-items: center;
      padding: 16px 8px; cursor: pointer; user-select: none;
      transition: background 0.1s; position: relative;
    }
    
    .dv-kalimba-tine.active {
      background: var(--primary, #1a5fb4); color: #ffffff; border-color: var(--primary);
      animation: dv-kalimba-pluck 0.3s ease-out;
    }
    
    .dv-kalimba-tine-label {
      font-size: 19px; font-weight: 700; pointer-events: none; margin-top: auto; margin-bottom: 8px;
    }
    
    .dv-kalimba-actions {
      display: flex; gap: 16px; width: 100%; max-width: 400px;
    }
    .dv-kalimba-btn {
      background: var(--primary, #1a5fb4); color: #ffffff;
      border: none; border-radius: 16px; font-size: 19px; font-weight: bold;
      padding: 16px; flex: 1; cursor: pointer; transition: opacity 0.1s;
    }
    .dv-kalimba-btn:active { opacity: 0.8; }
    .dv-kalimba-btn.recording { background: #e53935; }
    .dv-kalimba-btn.play { background: #43a047; }
  `;
  document.head.appendChild(style);

  // 2. Inject Modal DOM
  const modal = document.createElement('div');
  modal.id = 'dv-kalimba-modal';
  modal.innerHTML = `
    <div class="dv-kalimba-header">
      <button class="dv-kalimba-back" id="dvKalimbaClose">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <h2>Virtual Kalimba</h2>
    </div>
    <div class="dv-kalimba-content">
      
      <div class="dv-kalimba-board" id="dvKalimbaBoard">
        <!-- Tines injected via JS -->
      </div>

      <div class="dv-kalimba-actions">
        <button class="dv-kalimba-btn" id="dvKalimbaRec">● REC</button>
        <button class="dv-kalimba-btn" id="dvKalimbaPlay" style="display:none;">▶ PLAY</button>
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
      <span>Virtual Kalimba</span>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
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

  document.getElementById('dvKalimbaClose').addEventListener('click', () => {
    modal.classList.remove('active');
    stopPlayback();
  });

  // 4. Audio & Logic Engine
  let audioCtx = null;
  
  // 10-note Kalimba (C Major scale arranged in V-shape)
  // Central tine (C4) is longest, moving outward gets higher
  const kalimbaTines = [
    { note: 'D5', freq: 587.33, height: 70 },
    { note: 'B4', freq: 493.88, height: 90 },
    { note: 'G4', freq: 392.00, height: 110 },
    { note: 'E4', freq: 329.63, height: 130 },
    { note: 'C4', freq: 261.63, height: 150 }, // Center
    { note: 'D4', freq: 293.66, height: 130 },
    { note: 'F4', freq: 349.23, height: 110 },
    { note: 'A4', freq: 440.00, height: 90 },
    { note: 'C5', freq: 523.25, height: 70 }
  ];

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playNote(freq, time = null) {
    if (!audioCtx) return;
    const now = time || audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Kalimba sound: sine wave mixed with a slight harmonic
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 3, now); // Harmonic
    const gain2 = audioCtx.createGain();
    gain2.gain.setValueAtTime(0.1, now);
    
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.8, now + 0.02); // Fast attack
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // Long decay

    osc.connect(gain);
    osc2.connect(gain2);
    gain2.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now); osc2.start(now);
    osc.stop(now + 1.5); osc2.stop(now + 1.5);
  }

  // Build Tines
  const board = document.getElementById('dvKalimbaBoard');
  let activeTines = {};

  kalimbaTines.forEach((tine, index) => {
    const el = document.createElement('div');
    el.className = 'dv-kalimba-tine';
    el.style.height = `${tine.height}px`;
    el.innerHTML = `<span class="dv-kalimba-tine-label">${tine.note}</span>`;
    
    const trigger = (e) => {
      e.preventDefault();
      initAudio();
      playNote(tine.freq);
      
      // Record logic
      if (isRecording) {
        const timeOffset = (performance.now() - recordStartTime) / 1000;
        recordedNotes.push({ freq: tine.freq, time: Math.max(0, timeOffset) });
      }

      // Visual feedback
      el.classList.add('active');
      setTimeout(() => el.classList.remove('active'), 150);
    };

    el.addEventListener('touchstart', trigger, { passive: false });
    el.addEventListener('mousedown', trigger);
    board.appendChild(el);
    activeTines[index] = el;
  });

  // 5. Recorder & Player Logic
  let isRecording = false;
  let recordedNotes = [];
  let recordStartTime = 0;
  let playbackTimeouts = [];

  const recBtn = document.getElementById('dvKalimbaRec');
  const playBtn = document.getElementById('dvKalimbaPlay');

  recBtn.addEventListener('click', () => {
    if (!isRecording) {
      // Start recording
      initAudio();
      isRecording = true;
      recordedNotes = [];
      recordStartTime = performance.now();
      recBtn.textContent = '■ STOP';
      recBtn.classList.add('recording');
      playBtn.style.display = 'none';
    } else {
      // Stop recording
      isRecording = false;
      recBtn.textContent = '● REC';
      recBtn.classList.remove('recording');
      if (recordedNotes.length > 0) {
        playBtn.style.display = 'block';
      }
    }
  });

  function stopPlayback() {
    playbackTimeouts.forEach(clearTimeout);
    playbackTimeouts = [];
    playBtn.textContent = '▶ PLAY';
    playBtn.classList.remove('play');
  }

  playBtn.addEventListener('click', () => {
    if (playbackTimeouts.length > 0) {
      stopPlayback();
      return;
    }
    
    initAudio();
    playBtn.textContent = '■ STOP';
    playBtn.classList.add('play');
    
    recordedNotes.forEach(note => {
      const tId = setTimeout(() => {
        playNote(note.freq);
        // Visual sync for playback
        kalimbaTines.forEach((t, i) => {
          if (t.freq === note.freq) {
            activeTines[i].classList.add('active');
            setTimeout(() => activeTines[i].classList.remove('active'), 150);
          }
        });
      }, note.time * 1000);
      playbackTimeouts.push(tId);
    });

    // Auto-reset button after playback finishes
    const maxTime = Math.max(...recordedNotes.map(n => n.time)) * 1000;
    const endId = setTimeout(() => {
      stopPlayback();
    }, maxTime + 500);
    playbackTimeouts.push(endId);
  });

})();