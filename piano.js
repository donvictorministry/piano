/**
 * DV-PIANO: Piano Core Audio & Keyboard Engine (piano.js)
 * High-performance Web Audio DSP synthesis & touch glissando for Android
 */

(function () {
  'use strict';

  // 1. Complete Frequency Register (C3 to F6)
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

  let audioCtx = null;
  let masterCompressor = null;

  // 2. Audio Context & Master Dynamics Compressor Initialization
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass({ latencyHint: 'interactive' });

      // Hardware dynamics compressor to safeguard mobile speakers
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

  // 3. Transposed Frequency Calculator
  function getNoteFrequency(note) {
    const shift = (window.DVPianoPremium && window.DVPianoPremium.getOctaveShift)
      ? window.DVPianoPremium.getOctaveShift()
      : 0;

    if (shift === 0) {
      return baseFrequencies[note] || 440;
    }
    const match = note.match(/^([A-G]#?)([0-9])$/);
    if (!match) return baseFrequencies[note] || 440;
    const pitch = match[1];
    const oct = parseInt(match[2], 10) + shift;
    const targetNote = pitch + oct;
    return baseFrequencies[targetNote] || (baseFrequencies[note] * Math.pow(2, shift));
  }

  // 4. Multi-Timbre Sound Synthesis
  function playTone(freq, duration = 0.6) {
    const ctx = getAudioContext();
    if (!ctx || !freq) return;

    const instrument = (window.DVPianoPremium && window.DVPianoPremium.getInstrument)
      ? window.DVPianoPremium.getInstrument()
      : 'acoustic';

    const isSustain = (window.DVPianoPremium && window.DVPianoPremium.isSustainOn)
      ? window.DVPianoPremium.isSustainOn()
      : false;

    const actualDuration = isSustain ? Math.max(duration, 2.4) : duration;
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();

    if (instrument === 'rhodes') {
      // Electric Rhodes FM
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

    } else if (instrument === 'organ') {
      // Church / Gospel Organ (Multi-Drawbars)
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

    } else if (instrument === 'synth') {
      // Poly Synth
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

  // 5. Visual Key Highlighting
  function highlightKey(note, durationMs = 250) {
    const kbd = document.getElementById('keyboard');
    if (!kbd) return;
    const keyEl = kbd.querySelector(`[data-note="${note}"]`) || kbd.querySelector(`[data-base-note="${note}"]`);
    if (!keyEl) return;
    keyEl.classList.add('active');
    setTimeout(() => {
      keyEl.classList.remove('active');
    }, durationMs);
  }

  // 6. Manual Note Triggering
  function triggerManualNote(note) {
    getAudioContext();

    // Check recorder hook
    if (window.DVPianoPremium && window.DVPianoPremium.onNoteTriggered) {
      window.DVPianoPremium.onNoteTriggered(note);
    }

    // Check chord mode
    if (window.DVPianoPremium && window.DVPianoPremium.isChordModeOn && window.DVPianoPremium.isChordModeOn()) {
      const chord = window.DVPianoPremium.getChordNotes(note);
      if (chord) {
        chord.forEach(cNote => {
          const freq = getNoteFrequency(cNote);
          if (freq) {
            playTone(freq, 0.7);
            highlightKey(cNote, 280);
          }
        });
        return;
      }
    }

    // Single Note
    const freq = getNoteFrequency(note);
    if (freq) {
      playTone(freq, 0.7);
      highlightKey(note, 250);
    }
  }

  // 7. Touch Glissando Implementation
  const activeTouchNotes = new Map();

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

  function initKeyboardTouchEvents() {
    const kbd = document.getElementById('keyboard');
    if (!kbd) return;

    kbd.addEventListener('touchstart', (e) => {
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

    kbd.addEventListener('touchmove', (e) => {
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

    kbd.addEventListener('touchend', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        activeTouchNotes.delete(e.changedTouches[i].identifier);
      }
    });

    kbd.addEventListener('mousedown', (e) => {
      const target = e.target.closest('[data-note]');
      if (target && target.dataset.note) {
        triggerManualNote(target.dataset.note);
      }
    });
  }

  // Export to global scope
  window.DVPiano = {
    getAudioContext,
    getNoteFrequency,
    playTone,
    highlightKey,
    triggerManualNote,
    init: initKeyboardTouchEvents
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeyboardTouchEvents);
  } else {
    initKeyboardTouchEvents();
  }
})();