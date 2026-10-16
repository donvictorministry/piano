/* 1. Base Note Frequencies & Harmonic Engine */
    const baseFrequencies = {
      'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81,
      'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
      'A#3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
      'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
      'A#4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25,
      'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00,
      'A#5': 932.33, 'B5': 987.77,
      'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91
    };

    /* Triad Chord Definitions (Root, Third, Fifth) */
    const triadChordMap = {
      'C4': ['C4', 'E4', 'G4'],
      'C#4': ['C#4', 'F4', 'G#4'],
      'D4': ['D4', 'F4', 'A4'],
      'D#4': ['D#4', 'G4', 'A#4'],
      'E4': ['E4', 'G4', 'B4'],
      'F4': ['F4', 'A4', 'C5'],
      'F#4': ['F#4', 'A#4', 'C#5'],
      'G4': ['G4', 'B4', 'D5'],
      'G#4': ['G#4', 'C5', 'D#5'],
      'A4': ['A4', 'C5', 'E5'],
      'A#4': ['A#4', 'D5', 'F5'],
      'B4': ['B4', 'D5', 'F#5'],
      'C5': ['C5', 'E5', 'G5'],
      'C#5': ['C#5', 'F5', 'G#5'],
      'D5': ['D5', 'F5', 'A5'],
      'D#5': ['D#5', 'G5', 'A#5'],
      'E5': ['E5', 'G5', 'B5'],
      'F5': ['F5', 'A5', 'C6']
    };

    /* 2. State Management for Advanced Features */
    let currentOctaveShift = 0; // -1, 0, or +1
    let isSustainActive = false; // Damper pedal
    let currentInstrument = 'acoustic'; // 'acoustic', 'rhodes', 'organ', 'synth'
    let isChordModeActive = false; // Triad chord mode
    let isTutorModeActive = false; // Interactive wait-for-key tutor
    let tutorSong = null;
    let tutorCurrentIndex = 0;
    
    // Performance Recorder state
    let isRecording = false;
    let recordedEvents = [];
    let recordStartTime = 0;

    /* 3. Song Library */
    const songLibrary = {
      'Happy Birthday': {
        title: 'Happy Birthday',
        notes: [
          {note: 'C4', duration: 0.4, time: 0.0}, {note: 'C4', duration: 0.3, time: 0.4},
          {note: 'D4', duration: 0.7, time: 0.8}, {note: 'C4', duration: 0.7, time: 1.6},
          {note: 'F4', duration: 0.7, time: 2.4}, {note: 'E4', duration: 1.2, time: 3.2},
          {note: 'C4', duration: 0.4, time: 4.6}, {note: 'C4', duration: 0.3, time: 5.0},
          {note: 'D4', duration: 0.7, time: 5.4}, {note: 'C4', duration: 0.7, time: 6.2},
          {note: 'G4', duration: 0.7, time: 7.0}, {note: 'F4', duration: 1.2, time: 7.8},
          {note: 'C4', duration: 0.4, time: 9.2}, {note: 'C4', duration: 0.3, time: 9.6},
          {note: 'C5', duration: 0.8, time: 10.0}, {note: 'A4', duration: 0.7, time: 10.9},
          {note: 'F4', duration: 0.7, time: 11.7}, {note: 'E4', duration: 0.7, time: 12.5},
          {note: 'D4', duration: 1.0, time: 13.3}, {note: 'A#4', duration: 0.4, time: 14.5},
          {note: 'A#4', duration: 0.3, time: 15.0}, {note: 'A4', duration: 0.7, time: 15.5},
          {note: 'F4', duration: 0.7, time: 16.3}, {note: 'G4', duration: 0.7, time: 17.1},
          {note: 'F4', duration: 1.5, time: 17.9}
        ]
      },
      'Twinkle Twinkle': {
        title: 'Twinkle Twinkle',
        notes: [
          {note: 'C4', duration: 0.4, time: 0.0}, {note: 'C4', duration: 0.4, time: 0.5},
          {note: 'G4', duration: 0.4, time: 1.0}, {note: 'G4', duration: 0.4, time: 1.5},
          {note: 'A4', duration: 0.4, time: 2.0}, {note: 'A4', duration: 0.4, time: 2.5},
          {note: 'G4', duration: 0.8, time: 3.0}, {note: 'F4', duration: 0.4, time: 4.0},
          {note: 'F4', duration: 0.4, time: 4.5}, {note: 'E4', duration: 0.4, time: 5.0},
          {note: 'E4', duration: 0.4, time: 5.5}, {note: 'D4', duration: 0.4, time: 6.0},
          {note: 'D4', duration: 0.4, time: 6.5}, {note: 'C4', duration: 0.8, time: 7.0},
          {note: 'G4', duration: 0.4, time: 8.0}, {note: 'G4', duration: 0.4, time: 8.5},
          {note: 'F4', duration: 0.4, time: 9.0}, {note: 'F4', duration: 0.4, time: 9.5},
          {note: 'E4', duration: 0.4, time: 10.0}, {note: 'E4', duration: 0.4, time: 10.5},
          {note: 'D4', duration: 0.8, time: 11.0}, {note: 'C4', duration: 0.4, time: 12.0},
          {note: 'C4', duration: 0.4, time: 12.5}, {note: 'G4', duration: 0.4, time: 13.0},
          {note: 'G4', duration: 0.4, time: 13.5}, {note: 'A4', duration: 0.4, time: 14.0},
          {note: 'A4', duration: 0.4, time: 14.5}, {note: 'G4', duration: 0.8, time: 15.0},
          {note: 'F4', duration: 0.4, time: 16.0}, {note: 'F4', duration: 0.4, time: 16.5},
          {note: 'E4', duration: 0.4, time: 17.0}, {note: 'E4', duration: 0.4, time: 17.5},
          {note: 'D4', duration: 0.4, time: 18.0}, {note: 'D4', duration: 0.4, time: 18.5},
          {note: 'C4', duration: 1.2, time: 19.0}
        ]
      },
      'Jingle Bells': {
        title: 'Jingle Bells',
        notes: [
          {note: 'E4', duration: 0.3, time: 0.0}, {note: 'E4', duration: 0.3, time: 0.4},
          {note: 'E4', duration: 0.6, time: 0.8}, {note: 'E4', duration: 0.3, time: 1.6},
          {note: 'E4', duration: 0.3, time: 2.0}, {note: 'E4', duration: 0.6, time: 2.4},
          {note: 'E4', duration: 0.3, time: 3.2}, {note: 'G4', duration: 0.3, time: 3.6},
          {note: 'C4', duration: 0.4, time: 4.0}, {note: 'D4', duration: 0.3, time: 4.5},
          {note: 'E4', duration: 1.0, time: 5.0}, {note: 'F4', duration: 0.3, time: 6.2},
          {note: 'F4', duration: 0.3, time: 6.6}, {note: 'F4', duration: 0.4, time: 7.0},
          {note: 'F4', duration: 0.3, time: 7.5}, {note: 'F4', duration: 0.3, time: 7.9},
          {note: 'E4', duration: 0.3, time: 8.3}, {note: 'E4', duration: 0.3, time: 8.7},
          {note: 'D4', duration: 0.3, time: 9.1}, {note: 'D4', duration: 0.3, time: 9.5},
          {note: 'E4', duration: 0.3, time: 9.9}, {note: 'D4', duration: 0.6, time: 10.3},
          {note: 'G4', duration: 0.6, time: 11.0}, {note: 'C4', duration: 1.4, time: 11.8}
        ]
      },
      'Amazing Grace': {
        title: 'Amazing Grace',
        notes: [
          {note: 'C4', duration: 0.6, time: 0.0}, {note: 'F4', duration: 1.0, time: 0.7},
          {note: 'A4', duration: 0.4, time: 1.8}, {note: 'F4', duration: 0.4, time: 2.3},
          {note: 'A4', duration: 1.0, time: 2.8}, {note: 'G4', duration: 0.6, time: 3.9},
          {note: 'F4', duration: 1.0, time: 4.6}, {note: 'D4', duration: 0.6, time: 5.7},
          {note: 'C4', duration: 1.2, time: 6.4}, {note: 'C4', duration: 0.6, time: 7.8},
          {note: 'F4', duration: 1.0, time: 8.5}, {note: 'A4', duration: 0.4, time: 9.6},
          {note: 'F4', duration: 0.4, time: 10.1}, {note: 'A4', duration: 1.0, time: 10.6},
          {note: 'C5', duration: 1.6, time: 11.8}, {note: 'A4', duration: 0.6, time: 13.6},
          {note: 'C5', duration: 1.0, time: 14.3}, {note: 'A4', duration: 0.4, time: 15.4},
          {note: 'F4', duration: 0.4, time: 15.9}, {note: 'A4', duration: 1.0, time: 16.4},
          {note: 'G4', duration: 0.6, time: 17.5}, {note: 'F4', duration: 1.0, time: 18.2},
          {note: 'D4', duration: 0.6, time: 19.3}, {note: 'C4', duration: 1.2, time: 20.0},
          {note: 'F4', duration: 1.8, time: 21.4}
        ]
      },
      'Silent Night': {
        title: 'Silent Night',
        notes: [
          {note: 'G4', duration: 0.8, time: 0.0}, {note: 'A4', duration: 0.4, time: 0.9},
          {note: 'G4', duration: 0.7, time: 1.4}, {note: 'E4', duration: 1.6, time: 2.2},
          {note: 'G4', duration: 0.8, time: 4.0}, {note: 'A4', duration: 0.4, time: 4.9},
          {note: 'G4', duration: 0.7, time: 5.4}, {note: 'E4', duration: 1.6, time: 6.2},
          {note: 'D5', duration: 0.9, time: 8.0}, {note: 'D5', duration: 0.6, time: 9.0},
          {note: 'B4', duration: 1.6, time: 9.8}, {note: 'C5', duration: 0.9, time: 11.6},
          {note: 'C5', duration: 0.6, time: 12.6}, {note: 'G4', duration: 1.6, time: 13.4},
          {note: 'A4', duration: 0.8, time: 15.2}, {note: 'A4', duration: 0.4, time: 16.1},
          {note: 'C5', duration: 0.6, time: 16.6}, {note: 'B4', duration: 0.4, time: 17.3},
          {note: 'A4', duration: 0.6, time: 17.8}, {note: 'G4', duration: 0.8, time: 18.5},
          {note: 'E4', duration: 1.6, time: 19.5}, {note: 'C5', duration: 1.5, time: 21.2}
        ]
      }
    };

    /* 4. Realtime Audio Engine with Dynamics Compressor & Presets */
    let audioCtx = null;
    let masterCompressor = null;
    let activeTimeouts = [];
    let currentPlaying = false;

    function getAudioContext() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass({ latencyHint: 'interactive' });
        
        // Studio Dynamics Compressor (Prevents polyphonic clipping on mobile speakers)
        masterCompressor = audioCtx.createDynamicsCompressor();
        masterCompressor.threshold.setValueAtTime(-14, audioCtx.currentTime);
        masterCompressor.knee.setValueAtTime(20, audioCtx.currentTime);
        masterCompressor.ratio.setValueAtTime(8, audioCtx.currentTime);
        masterCompressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
        masterCompressor.release.setValueAtTime(0.2, audioCtx.currentTime);
        masterCompressor.connect(audioCtx.destination);
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function getTransposedFrequency(note) {
      if (currentOctaveShift === 0) {
        return baseFrequencies[note] || 440;
      }
      const match = note.match(/^([A-G]#?)([0-9])$/);
      if (!match) return baseFrequencies[note] || 440;
      const pitch = match[1];
      const oct = parseInt(match[2], 10) + currentOctaveShift;
      const targetNote = pitch + oct;
      return baseFrequencies[targetNote] || (baseFrequencies[note] * Math.pow(2, currentOctaveShift));
    }

    function playTone(freq, duration = 0.6, isSustain = false) {
      const ctx = getAudioContext();
      if (!ctx || !freq) return;

      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      const actualDuration = isSustain ? Math.max(duration, 2.4) : duration;

      if (currentInstrument === 'rhodes') {
        // Electric Rhodes: FM warmth
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2.01, now);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.3, now);
        osc2.connect(subGain);
        subGain.connect(gainNode);
        osc1.connect(gainNode);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(0.32, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + actualDuration);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + actualDuration + 0.05);
        osc2.stop(now + actualDuration + 0.05);

      } else if (currentInstrument === 'organ') {
        // Gospel Organ: 3 drawbars
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, now);
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(freq * 3, now);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        osc3.connect(gainNode);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(0.18, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + actualDuration);

        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        osc1.stop(now + actualDuration + 0.05);
        osc2.stop(now + actualDuration + 0.05);
        osc3.stop(now + actualDuration + 0.05);

      } else if (currentInstrument === 'synth') {
        // Poly Synth: Filtered Sawtooth
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, now);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now);
        filter.frequency.exponentialRampToValueAtTime(600, now + actualDuration);

        osc1.connect(filter);
        filter.connect(gainNode);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(0.24, now + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + actualDuration);

        osc1.start(now);
        osc1.stop(now + actualDuration + 0.05);

      } else {
        // Acoustic Grand Piano
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, now);

        const overtoneGain = ctx.createGain();
        overtoneGain.gain.setValueAtTime(0.22, now);
        osc2.connect(overtoneGain);
        overtoneGain.connect(gainNode);
        osc1.connect(gainNode);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.linearRampToValueAtTime(0.35, now + 0.012);
        gainNode.gain.exponentialRampToValueAtTime(0.15, now + (actualDuration * 0.3));
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + actualDuration);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + actualDuration + 0.05);
        osc2.stop(now + actualDuration + 0.05);
      }

      gainNode.connect(masterCompressor || ctx.destination);
    }

    /* 5. Touch & Visual Interaction Engine with Glissando */
    const keyboardEl = document.getElementById('keyboard');

    function highlightKey(note, durationMs = 250) {
      const keyEl = keyboardEl.querySelector(`[data-note="${note}"]`) || keyboardEl.querySelector(`[data-base-note="${note}"]`);
      if (!keyEl) return;
      keyEl.classList.add('active');
      setTimeout(() => {
        keyEl.classList.remove('active');
      }, durationMs);
    }

    function triggerManualNote(note) {
      getAudioContext();

      // Feature 4: Record note if recording is active
      if (isRecording) {
        const timeOffset = (performance.now() - recordStartTime) / 1000;
        recordedEvents.push({ note, duration: 0.5, time: Math.max(0, timeOffset) });
      }

      // Feature 5: Follow-Me Practice Tutor check
      if (isTutorModeActive && tutorSong) {
        const expectedNote = tutorSong.notes[tutorCurrentIndex]?.note;
        if (expectedNote && (note === expectedNote || note.startsWith(expectedNote[0]))) {
          advanceTutorStep();
        }
      }

      // Feature 6: Triad Chord Mode
      if (isChordModeActive && triadChordMap[note]) {
        const chordNotes = triadChordMap[note];
        chordNotes.forEach(chordNote => {
          const freq = getTransposedFrequency(chordNote);
          if (freq) {
            playTone(freq, 0.7, isSustainActive);
            highlightKey(chordNote, 280);
          }
        });
        return;
      }

      // Single Note
      const freq = getTransposedFrequency(note);
      if (freq) {
        playTone(freq, 0.7, isSustainActive);
        highlightKey(note, 250);
      }
    }

    // Touch Glissando Implementation
    let activeTouchNotes = new Map();

    function getNoteElementFromPoint(x, y) {
      const elements = document.elementsFromPoint(x, y);
      for (const el of elements) {
        if (el.classList && el.classList.contains('key-black') && el.dataset.note) {
          return el;
        }
      }
      for (const el of elements) {
        if (el.classList && el.classList.contains('key-white') && el.dataset.note) {
          return el;
        }
      }
      return null;
    }

    keyboardEl.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const keyEl = getNoteElementFromPoint(touch.clientX, touch.clientY);
        if (keyEl && keyEl.dataset && keyEl.dataset.note) {
          activeTouchNotes.set(touch.identifier, keyEl.dataset.note);
          triggerManualNote(keyEl.dataset.note);
        }
      }
    }, { passive: false });

    keyboardEl.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const keyEl = getNoteElementFromPoint(touch.clientX, touch.clientY);
        if (keyEl && keyEl.dataset && keyEl.dataset.note) {
          const currentNote = keyEl.dataset.note;
          const previousNote = activeTouchNotes.get(touch.identifier);
          if (currentNote !== previousNote) {
            activeTouchNotes.set(touch.identifier, currentNote);
            triggerManualNote(currentNote);
          }
        }
      }
    }, { passive: false });

    keyboardEl.addEventListener('touchend', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        activeTouchNotes.delete(e.changedTouches[i].identifier);
      }
    });

    keyboardEl.addEventListener('mousedown', (e) => {
      const target = e.target.closest('[data-note]');
      if (target && target.dataset.note) {
        triggerManualNote(target.dataset.note);
      }
    });

    /* 6. Advanced Features Event Wiring */
    // Feature 1: Octave Transpose Switcher
    const octaveDownBtn = document.getElementById('octaveDownBtn');
    const octaveNormalBtn = document.getElementById('octaveNormalBtn');
    const octaveUpBtn = document.getElementById('octaveUpBtn');

    function updateOctaveUI() {
      octaveDownBtn.classList.toggle('active', currentOctaveShift === -1);
      octaveNormalBtn.classList.toggle('active', currentOctaveShift === 0);
      octaveUpBtn.classList.toggle('active', currentOctaveShift === 1);

      document.querySelectorAll('.key-white, .key-black').forEach(key => {
        const base = key.dataset.baseNote;
        const match = base.match(/^([A-G]#?)([0-9])$/);
        if (match) {
          const pitch = match[1];
          const oct = parseInt(match[2], 10) + currentOctaveShift;
          const newNote = pitch + oct;
          key.dataset.note = newNote;
          const label = key.querySelector('.key-label');
          if (label) label.textContent = newNote;
        }
      });
    }

    octaveDownBtn.addEventListener('click', () => { currentOctaveShift = -1; updateOctaveUI(); });
    octaveNormalBtn.addEventListener('click', () => { currentOctaveShift = 0; updateOctaveUI(); });
    octaveUpBtn.addEventListener('click', () => { currentOctaveShift = 1; updateOctaveUI(); });

    // Feature 2: Sustain Pedal
    const sustainPedalBtn = document.getElementById('sustainPedalBtn');
    sustainPedalBtn.addEventListener('click', () => {
      isSustainActive = !isSustainActive;
      sustainPedalBtn.textContent = isSustainActive ? 'PEDAL: ON' : 'PEDAL: OFF';
      sustainPedalBtn.classList.toggle('btn-active-toggle', isSustainActive);
    });

    // Feature 3: Instrument Timbre Selector
    const instrumentSelect = document.getElementById('instrumentSelect');
    instrumentSelect.addEventListener('change', (e) => {
      currentInstrument = e.target.value;
    });

    // Feature 4: Performance Recorder
    const recordBtn = document.getElementById('recordBtn');
    const replayBtn = document.getElementById('replayBtn');

    recordBtn.addEventListener('click', () => {
      if (!isRecording) {
        getAudioContext();
        isRecording = true;
        recordedEvents = [];
        recordStartTime = performance.now();
        recordBtn.textContent = '■ STOP REC';
        recordBtn.classList.add('btn-rec-active');
        statusLabel.textContent = 'Recording live keys...';
      } else {
        isRecording = false;
        recordBtn.textContent = '● REC';
        recordBtn.classList.remove('btn-rec-active');
        if (recordedEvents.length > 0) {
          replayBtn.style.display = 'inline-flex';
          statusLabel.textContent = `Recorded ${recordedEvents.length} notes!`;
        } else {
          statusLabel.textContent = 'No notes recorded';
        }
      }
    });

    replayBtn.addEventListener('click', () => {
      if (recordedEvents.length > 0) {
        playSequence({ title: 'My Recording', notes: [...recordedEvents] });
      }
    });

    // Feature 5: Follow-Me Practice Tutor
    const tutorBtn = document.getElementById('tutorBtn');

    function clearTutorHighlights() {
      document.querySelectorAll('.tutor-target').forEach(el => el.classList.remove('tutor-target'));
    }

    function setTutorTarget(note) {
      clearTutorHighlights();
      const keyEl = keyboardEl.querySelector(`[data-note="${note}"]`) || keyboardEl.querySelector(`[data-base-note="${note}"]`);
      if (keyEl) {
        keyEl.classList.add('tutor-target');
      }
    }

    function advanceTutorStep() {
      tutorCurrentIndex++;
      if (tutorSong && tutorCurrentIndex < tutorSong.notes.length) {
        const nextNote = tutorSong.notes[tutorCurrentIndex].note;
        statusLabel.textContent = `Tutor: Play ${nextNote} (${tutorCurrentIndex + 1}/${tutorSong.notes.length})`;
        setTutorTarget(nextNote);
      } else {
        statusLabel.textContent = 'Tutor: Song Completed! Great job!';
        clearTutorHighlights();
        tutorSong = null;
      }
    }

    tutorBtn.addEventListener('click', () => {
      isTutorModeActive = !isTutorModeActive;
      tutorBtn.textContent = isTutorModeActive ? 'TUTOR: ON' : 'TUTOR: OFF';
      tutorBtn.classList.toggle('btn-active-toggle', isTutorModeActive);
      if (!isTutorModeActive) {
        clearTutorHighlights();
        tutorSong = null;
        statusLabel.textContent = 'Ready';
      } else {
        statusLabel.textContent = 'Tutor: Select any song chip';
      }
    });

    // Feature 6: Triad Chord Mode
    const chordModeBtn = document.getElementById('chordModeBtn');
    chordModeBtn.addEventListener('click', () => {
      isChordModeActive = !isChordModeActive;
      chordModeBtn.textContent = isChordModeActive ? 'CHORD: ON' : 'CHORD: OFF';
      chordModeBtn.classList.toggle('btn-active-toggle', isChordModeActive);
    });

    /* 7. Sequence Player */
    const statusLabel = document.getElementById('statusLabel');
    const stopBtn = document.getElementById('stopBtn');
    const speedSelect = document.getElementById('speedSelect');

    function stopSong() {
      activeTimeouts.forEach(clearTimeout);
      activeTimeouts = [];
      currentPlaying = false;
      stopBtn.style.display = 'none';
      statusLabel.textContent = 'Stopped';
      document.querySelectorAll('.key-white.active, .key-black.active').forEach(k => k.classList.remove('active'));
    }

    stopBtn.addEventListener('click', stopSong);

    function playSequence(songData) {
      stopSong();
      getAudioContext();

      if (isTutorModeActive) {
        tutorSong = songData;
        tutorCurrentIndex = 0;
        const firstNote = songData.notes[0].note;
        statusLabel.textContent = `Tutor: Play ${firstNote} (1/${songData.notes.length})`;
        setTutorTarget(firstNote);
        return;
      }

      currentPlaying = true;
      stopBtn.style.display = 'inline-flex';
      statusLabel.textContent = 'Playing: ' + songData.title;

      const speed = parseFloat(speedSelect.value) || 1.25;
      const notes = songData.notes;
      let maxDuration = 0;

      notes.forEach((item) => {
        const adjustedTime = (item.time / speed) * 1000;
        const adjustedDuration = item.duration / speed;
        const endTime = adjustedTime + (adjustedDuration * 1000);
        if (endTime > maxDuration) maxDuration = endTime;

        const timer = setTimeout(() => {
          if (!currentPlaying) return;
          const freq = getTransposedFrequency(item.note);
          if (freq) {
            playTone(freq, adjustedDuration, isSustainActive);
            highlightKey(item.note, Math.max(160, adjustedDuration * 800));
          }
        }, adjustedTime);

        activeTimeouts.push(timer);
      });

      const finishTimer = setTimeout(() => {
        if (currentPlaying) {
          statusLabel.textContent = 'Done: ' + songData.title;
          currentPlaying = false;
          stopBtn.style.display = 'none';
        }
      }, maxDuration + 300);

      activeTimeouts.push(finishTimer);
    }

    /* 8. Offline Input Parser */
    function parseOfflineInput(rawText) {
      const text = rawText.trim();
      if (!text) return null;

      const lower = text.toLowerCase();
      for (const [key, song] of Object.entries(songLibrary)) {
        if (lower.includes(key.toLowerCase())) {
          return song;
        }
      }

      const noteRegex = /\b([A-G][#]?[3-6])\b/gi;
      const matched = text.toUpperCase().match(noteRegex);
      if (matched && matched.length > 0) {
        let t = 0;
        const seq = matched.map((n) => {
          const item = { note: n, duration: 0.5, time: t };
          t += 0.5;
          return item;
        });
        return { title: 'Custom Sequence', notes: seq };
      }

      return null;
    }

    const songForm = document.getElementById('songForm');
    const songInput = document.getElementById('songInput');

    songForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const songData = parseOfflineInput(songInput.value);
      if (songData) {
        playSequence(songData);
      } else {
        statusLabel.textContent = 'Song not found';
      }
    });

    /* Populate Library Chips */
    const chipList = document.getElementById('chipList');
    Object.keys(songLibrary).forEach((songTitle) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = songTitle;
      chip.addEventListener('click', () => {
        songInput.value = songTitle;
        playSequence(songLibrary[songTitle]);
      });
      chipList.appendChild(chip);
    });

    /* 9. Theme Mode Switcher */
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    let isDarkMode = false;

    themeToggleBtn.addEventListener('click', () => {
      isDarkMode = !isDarkMode;
      document.body.classList.toggle('dark', isDarkMode);

      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', isDarkMode ? '#090d16' : '#f8f9fa');
      }

      if (isDarkMode) {
        themeIcon.innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>';
      } else {
        themeIcon.innerHTML = '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>';
      }
    });

    /* 10. Sidebar & Modals Navigation */
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarOpenBtn = document.getElementById('sidebarOpenBtn');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

    function openSidebar() {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('open');
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('open');
    }

    sidebarOpenBtn.addEventListener('click', openSidebar);
    sidebarCloseBtn.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    document.querySelectorAll('.sidebar-item').forEach((item) => {
      item.addEventListener('click', () => {
        const modalId = item.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
          closeSidebar();
          modal.classList.add('active');
        }
      });
    });

    document.querySelectorAll('.modal-back-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.closest('.full-modal').classList.remove('active');
      });
    });

    /* 11. Bios Show More Toggles */
    const devBioText = document.getElementById('devBioText');
    const bioToggleBtn = document.getElementById('bioToggleBtn');
    let isBioExpanded = false;

    bioToggleBtn.addEventListener('click', () => {
      isBioExpanded = !isBioExpanded;
      devBioText.classList.toggle('expanded', isBioExpanded);
      bioToggleBtn.textContent = isBioExpanded ? 'Show less' : 'Show more';
    });

    const teamBioText = document.getElementById('teamBioText');
    const teamBioToggleBtn = document.getElementById('teamBioToggleBtn');
    let isTeamBioExpanded = false;

    teamBioToggleBtn.addEventL21⁵⁶stener('click', () => {
      isTeamBioExpanded = !isTeamBioExpanded;
      teamBioText.classList.toggle('expanded', isTeamBioExpanded);
66      teamBioToggleBtn.textContent = isTeamBioExpanded ? 'Show less' : 'Show more';
    });

    /* 12. PWA Service Worker Registration */
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }