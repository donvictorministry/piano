/**
 * DV-PIANO: Premium Features Module (premium.js)
 * Octave shifting, Sustain Pedal, Instrument Timbres, Recorder, Follow-Me Tutor, and Triad Chords
 */

(function () {
  'use strict';

  let octaveShift = 0; // -1, 0, or +1
  let sustainActive = false;
  let currentInstrument = 'acoustic';
  let chordModeActive = false;
  let tutorActive = false;
  let tutorSong = null;
  let tutorStepIndex = 0;

  // Performance Recorder state
  let isRecording = false;
  let recordedNotes = [];
  let recordStartTime = 0;

  // Triad Harmonic Definitions
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

  function updateOctaveUI() {
    const downBtn = document.getElementById('octaveDownBtn');
    const normalBtn = document.getElementById('octaveNormalBtn');
    const upBtn = document.getElementById('octaveUpBtn');

    if (downBtn) downBtn.classList.toggle('active', octaveShift === -1);
    if (normalBtn) normalBtn.classList.toggle('active', octaveShift === 0);
    if (upBtn) upBtn.classList.toggle('active', octaveShift === 1);

    document.querySelectorAll('.key-white, .key-black').forEach(key => {
      const base = key.dataset.baseNote;
      if (!base) return;
      const match = base.match(/^([A-G]#?)([0-9])$/);
      if (match) {
        const pitch = match[1];
        const oct = parseInt(match[2], 10) + octaveShift;
        const newNote = pitch + oct;
        key.dataset.note = newNote;
        const label = key.querySelector('.key-label');
        if (label) label.textContent = newNote;
      }
    });
  }

  function clearTutorHighlights() {
    document.querySelectorAll('.tutor-target').forEach(el => el.classList.remove('tutor-target'));
  }

  function setTutorTarget(note) {
    clearTutorHighlights();
    const kbd = document.getElementById('keyboard');
    if (!kbd) return;
    const keyEl = kbd.querySelector(`[data-note="${note}"]`) || kbd.querySelector(`[data-base-note="${note}"]`);
    if (keyEl) {
      keyEl.classList.add('tutor-target');
    }
  }

  function advanceTutorStep() {
    tutorStepIndex++;
    const statusLabel = document.getElementById('statusLabel');
    if (tutorSong && tutorStepIndex < tutorSong.notes.length) {
      const nextNote = tutorSong.notes[tutorStepIndex].note;
      if (statusLabel) {
        statusLabel.textContent = `Tutor: Play ${nextNote} (${tutorStepIndex + 1}/${tutorSong.notes.length})`;
      }
      setTutorTarget(nextNote);
    } else {
      if (statusLabel) {
        statusLabel.textContent = 'Tutor: Song Completed! 100% Correct';
      }
      clearTutorHighlights();
      tutorSong = null;
    }
  }

  function initPremiumFeatures() {
    // 1. Octave Shift
    const downBtn = document.getElementById('octaveDownBtn');
    const normalBtn = document.getElementById('octaveNormalBtn');
    const upBtn = document.getElementById('octaveUpBtn');

    if (downBtn) downBtn.addEventListener('click', () => { octaveShift = -1; updateOctaveUI(); });
    if (normalBtn) normalBtn.addEventListener('click', () => { octaveShift = 0; updateOctaveUI(); });
    if (upBtn) upBtn.addEventListener('click', () => { octaveShift = 1; updateOctaveUI(); });

    // 2. Sustain Pedal
    const pedalBtn = document.getElementById('sustainPedalBtn');
    if (pedalBtn) {
      pedalBtn.addEventListener('click', () => {
        sustainActive = !sustainActive;
        pedalBtn.textContent = sustainActive ? 'PEDAL: ON' : 'PEDAL: OFF';
        pedalBtn.classList.toggle('btn-active-toggle', sustainActive);
      });
    }

    // 3. Instrument Timbre
    const instSelect = document.getElementById('instrumentSelect');
    if (instSelect) {
      instSelect.addEventListener('change', (e) => {
        currentInstrument = e.target.value;
      });
    }

    // 4. Performance Recorder
    const recordBtn = document.getElementById('recordBtn');
    const replayBtn = document.getElementById('replayBtn');
    const statusLabel = document.getElementById('statusLabel');

    if (recordBtn) {
      recordBtn.addEventListener('click', () => {
        if (!isRecording) {
          if (window.DVPiano) window.DVPiano.getAudioContext();
          isRecording = true;
          recordedNotes = [];
          recordStartTime = performance.now();
          recordBtn.textContent = '■ STOP REC';
          recordBtn.classList.add('btn-rec-active');
          if (statusLabel) statusLabel.textContent = 'Recording live keys...';
        } else {
          isRecording = false;
          recordBtn.textContent = '● REC';
          recordBtn.classList.remove('btn-rec-active');
          if (recordedNotes.length > 0) {
            if (replayBtn) replayBtn.style.display = 'inline-flex';
            if (statusLabel) statusLabel.textContent = `Recorded ${recordedNotes.length} notes!`;
          } else {
            if (statusLabel) statusLabel.textContent = 'No notes recorded';
          }
        }
      });
    }

    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        if (recordedNotes.length > 0 && window.DVPianoApp && window.DVPianoApp.playSequence) {
          window.DVPianoApp.playSequence({ title: 'My Recording', notes: [...recordedNotes] });
        }
      });
    }

    // 5. Follow-Me Tutor
    const tutorBtn = document.getElementById('tutorBtn');
    if (tutorBtn) {
      tutorBtn.addEventListener('click', () => {
        tutorActive = !tutorActive;
        tutorBtn.textContent = tutorActive ? 'TUTOR: ON' : 'TUTOR: OFF';
        tutorBtn.classList.toggle('btn-active-toggle', tutorActive);
        if (!tutorActive) {
          clearTutorHighlights();
          tutorSong = null;
          if (statusLabel) statusLabel.textContent = 'Ready';
        } else {
          if (statusLabel) statusLabel.textContent = 'Tutor: Select any song chip';
        }
      });
    }

    // 6. Triad Chord Mode
    const chordBtn = document.getElementById('chordModeBtn');
    if (chordBtn) {
      chordBtn.addEventListener('click', () => {
        chordModeActive = !chordModeActive;
        chordBtn.textContent = chordModeActive ? 'CHORD: ON' : 'CHORD: OFF';
        chordBtn.classList.toggle('btn-active-toggle', chordModeActive);
      });
    }
  }

  // Hook called on every manual key strike
  function onNoteTriggered(note) {
    if (isRecording) {
      const timeOffset = (performance.now() - recordStartTime) / 1000;
      recordedNotes.push({ note, duration: 0.5, time: Math.max(0, timeOffset) });
    }

    if (tutorActive && tutorSong) {
      const expectedNote = tutorSong.notes[tutorStepIndex]?.note;
      if (expectedNote && (note === expectedNote || note.startsWith(expectedNote[0]))) {
        advanceTutorStep();
      }
    }
  }

  function startTutorWithSong(songData) {
    tutorSong = songData;
    tutorStepIndex = 0;
    const firstNote = songData.notes[0]?.note;
    const statusLabel = document.getElementById('statusLabel');
    if (statusLabel && firstNote) {
      statusLabel.textContent = `Tutor: Play ${firstNote} (1/${songData.notes.length})`;
    }
    if (firstNote) setTutorTarget(firstNote);
  }

  // Export
  window.DVPianoPremium = {
    getOctaveShift: () => octaveShift,
    isSustainOn: () => sustainActive,
    getInstrument: () => currentInstrument,
    isChordModeOn: () => chordModeActive,
    getChordNotes: (rootNote) => triadChordMap[rootNote] || null,
    isTutorOn: () => tutorActive,
    startTutorWithSong,
    onNoteTriggered,
    init: initPremiumFeatures
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPremiumFeatures);
  } else {
    initPremiumFeatures();
  }
})();