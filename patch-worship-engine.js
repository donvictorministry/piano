/* patch-worship-engine.js — replaces patch-song-length-dynamics.js AND
   patch-christmas-harmony.js. Must load last, after patch-lyrics-sync.js.

   Previously those two patches ran independent timing schedules against
   the same audio graph — dynamics swelled on one clock, harmony chords
   changed on a different clock, so they drifted out of phase with each
   other musically (not technically broken, just uncoordinated).

   This version computes ONE schedule: each repeat-pass of a song gets a
   single velocity level AND a single harmony chord assigned together,
   so the volume swell and the chord change always land on the same
   musical boundary. */
(function () {
  'use strict';

  const TARGET_SECONDS = 130;
  const GAP_SECONDS = 0.7;
  const RAMP_SECONDS = 1.8;

  // Each entry = one pass: { velocity, chordDegree }
  // Pass 1: soft, tonic. Pass 2: building, subdominant. Pass 3: full, tonic.
  // Pass 4: receding, dominant (resolves outward before looping/ending).
  const PASS_PLAN = [
    { velocity: 0.62, chord: 'I'  },
    { velocity: 0.82, chord: 'IV' },
    { velocity: 1.00, chord: 'I'  },
    { velocity: 0.72, chord: 'V'  }
  ];

  const CHRISTMAS_SONGS = [
    'Silent Night', 'O Holy Night', 'Joy to the World',
    'Hark the Herald Angels Sing', 'O Come All Ye Faithful',
    'Away in a Manger', 'What Child Is This',
    'Go Tell It on the Mountain', 'Deck the Halls',
    'We Wish You a Merry Christmas', 'Jingle Bells',
    'It Came Upon the Midnight Clear'
  ];

  const KEY_MAP = {
    'Silent Night': { tonic: 'C', mode: 'major' },
    'O Holy Night': { tonic: 'C', mode: 'major' },
    'Joy to the World': { tonic: 'C', mode: 'major' },
    'Hark the Herald Angels Sing': { tonic: 'G', mode: 'major' },
    'O Come All Ye Faithful': { tonic: 'G', mode: 'major' },
    'Away in a Manger': { tonic: 'F', mode: 'major' },
    'What Child Is This': { tonic: 'D', mode: 'minor' },
    'Go Tell It on the Mountain': { tonic: 'C', mode: 'major' },
    'Deck the Halls': { tonic: 'C', mode: 'major' },
    'We Wish You a Merry Christmas': { tonic: 'G', mode: 'major' },
    'Jingle Bells': { tonic: 'C', mode: 'major' },
    'It Came Upon the Midnight Clear': { tonic: 'D', mode: 'major' },
    // Non-Christmas hymns still get harmony if Christmas Mode is off
    'Amazing Grace': { tonic: 'F', mode: 'major' },
    'How Great Thou Art': { tonic: 'C', mode: 'major' },
    'Blessed Assurance': { tonic: 'F', mode: 'major' },
    'Great Is Thy Faithfulness': { tonic: 'C', mode: 'major' },
    "It Is Well With My Soul": { tonic: 'C', mode: 'major' },
    'Crown Him With Many Crowns': { tonic: 'D', mode: 'major' },
    "All Hail the Power of Jesus Name": { tonic: 'G', mode: 'major' }
  };

  const SEMITONE = { C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11 };
  const CHORD_INTERVALS = { major: [0, 4, 7], minor: [0, 3, 7] };
  const DEGREE_OFFSET = { I: 0, IV: 5, V: 7 };

  let worshipEnabled = true;     // master toggle: extend + dynamics + harmony together
  let christmasModeEnabled = true;
  let _scheduleTimeouts = [];

  function noteFreq(semitoneFromC, octave) {
    const n = (semitoneFromC - 9) + (octave - 4) * 12;
    return 440 * Math.pow(2, n / 12);
  }

  function chordFrequencies(tonicLetter, mode, degree, octave) {
    const tonicSemitone = SEMITONE[tonicLetter];
    const rootSemitone = (tonicSemitone + DEGREE_OFFSET[degree]) % 12;
    return CHORD_INTERVALS[mode].map(iv => {
      const s = (rootSemitone + iv) % 12;
      const octAdjust = (rootSemitone + iv) >= 12 ? 1 : 0;
      return noteFreq(s, octave + octAdjust);
    });
  }

  function playPadChord(freqs, duration) {
    const ctx = getAudioContext();
    if (!ctx || !masterGain) return;
    const now = ctx.currentTime;

    freqs.forEach(freq => {
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      const gain = ctx.createGain();
      o1.type = 'triangle';
      o1.frequency.setValueAtTime(freq, now);
      o2.type = 'sine';
      o2.frequency.setValueAtTime(freq * 2, now);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.15, now);
      o2.connect(og); og.connect(gain); o1.connect(gain);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      o1.start(now); o2.start(now);
      o1.stop(now + duration + 0.1);
      o2.stop(now + duration + 0.1);

      gain.connect(masterGain);
      if (typeof reverbSend !== 'undefined' && reverbSend) gain.connect(reverbSend);
    });
  }

  function rawSongDuration(songData) {
    let max = 0;
    songData.notes.forEach(n => {
      const end = n.time + n.duration;
      if (end > max) max = end;
    });
    return max;
  }

  function currentSpeed() {
    const bpmVal = parseInt(document.getElementById('bpmInput')?.value) || 150;
    return bpmVal / 120;
  }

  function buildExtendedSong(original) {
    const rawDur = rawSongDuration(original);
    if (rawDur <= 0) return { extended: original, passPlanTimed: [] };

    const speed = currentSpeed();
    const realDurPerPass = rawDur / speed;
    const passesNeeded = Math.max(2, Math.ceil(TARGET_SECONDS / realDurPerPass));

    const newNotes = [];
    const passPlanTimed = [];

    for (let p = 0; p < passesNeeded; p++) {
      const offset = p * (rawDur + GAP_SECONDS);
      const realOffset = p * (realDurPerPass + GAP_SECONDS / speed);
      const plan = PASS_PLAN[p % PASS_PLAN.length];

      original.notes.forEach(n => {
        newNotes.push({ note: n.note, time: n.time + offset, duration: n.duration });
      });

      passPlanTimed.push({
        realStart: realOffset,
        realDur: realDurPerPass,
        velocity: plan.velocity,
        chord: plan.chord
      });
    }

    const totalRealSeconds = passPlanTimed.length
      ? passPlanTimed[passPlanTimed.length - 1].realStart + passPlanTimed[passPlanTimed.length - 1].realDur
      : realDurPerPass;

    return {
      extended: { title: original.title, notes: newNotes },
      passPlanTimed,
      totalRealSeconds
    };
  }

  function clearSchedule() {
    _scheduleTimeouts.forEach(clearTimeout);
    _scheduleTimeouts = [];
    if (masterGain && audioCtx) {
      const sliderVal = parseFloat(document.getElementById('volSlider')?.value) || 0.8;
      try {
        masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
        masterGain.gain.setValueAtTime(sliderVal, audioCtx.currentTime);
      } catch (e) { /* ignore */ }
    }
  }

  function runCoordinatedSchedule(songTitle, passPlanTimed) {
    clearSchedule();
    if (!worshipEnabled) return;

    const ctx = getAudioContext();
    const sliderVal = parseFloat(document.getElementById('volSlider')?.value) || 0.8;
    const key = KEY_MAP[songTitle];

    passPlanTimed.forEach(pass => {
      const tid = setTimeout(() => {
        // Dynamics: ramp volume to this pass's velocity level
        if (masterGain && audioCtx) {
          try {
            const target = Math.min(1.0, sliderVal * pass.velocity);
            masterGain.gain.linearRampToValueAtTime(target, audioCtx.currentTime + RAMP_SECONDS);
          } catch (e) { /* ignore */ }
        }
        // Harmony: play the chord assigned to THIS SAME pass, same duration
        if (key) {
          const freqs = chordFrequencies(key.tonic, key.mode, pass.chord, 3);
          playPadChord(freqs, pass.realDur * 0.95);
        }
      }, pass.realStart * 1000);
      _scheduleTimeouts.push(tid);
    });

    // Return to user's set volume after the final pass
    const last = passPlanTimed[passPlanTimed.length - 1];
    if (last && masterGain && audioCtx) {
      const endTid = setTimeout(() => {
        try {
          masterGain.gain.linearRampToValueAtTime(sliderVal, audioCtx.currentTime + RAMP_SECONDS);
        } catch (e) { /* ignore */ }
      }, (last.realStart + last.realDur) * 1000);
      _scheduleTimeouts.push(endTid);
    }
  }

  function formatDuration(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.round(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const _origPlaySequence = playSequence; // wraps whatever chain already exists (loop + lyrics)

  playSequence = function (songData) {
    getAudioContext();

    if (!worshipEnabled) {
      return _origPlaySequence(songData);
    }

    const { extended, passPlanTimed, totalRealSeconds } = buildExtendedSong(songData);
    runCoordinatedSchedule(songData.title, passPlanTimed);

    const result = _origPlaySequence(extended);

    const statusLabel = document.getElementById('statusLabel');
    if (statusLabel && totalRealSeconds) {
      statusLabel.textContent = `Playing: ${songData.title} (${formatDuration(totalRealSeconds)})`;
    }

    return result;
  };

  function applyChristmasFilter() {
    const chips = document.querySelectorAll('#chipList .chip');
    chips.forEach(chip => {
      const isChristmas = CHRISTMAS_SONGS.includes(chip.textContent.trim());
      chip.style.display = (!christmasModeEnabled || isChristmas) ? '' : 'none';
    });
  }

  function injectToggles() {
    const bar = document.querySelector('.keyboard-features-bar');
    if (!bar) return;

    const christmasBtn = document.createElement('button');
    christmasBtn.type = 'button';
    christmasBtn.id = 'christmasModeBtn';
    christmasBtn.className = 'feature-chip-btn active';
    christmasBtn.textContent = 'CHRISTMAS: ON';
    bar.appendChild(christmasBtn);

    christmasBtn.addEventListener('click', () => {
      christmasModeEnabled = !christmasModeEnabled;
      christmasBtn.textContent = christmasModeEnabled ? 'CHRISTMAS: ON' : 'CHRISTMAS: OFF';
      christmasBtn.classList.toggle('active', christmasModeEnabled);
      applyChristmasFilter();
      if (typeof showToast === 'function') {
        showToast(christmasModeEnabled ? 'Showing carols only' : 'Showing all songs');
      }
    });

    const worshipBtn = document.createElement('button');
    worshipBtn.type = 'button';
    worshipBtn.id = 'worshipBtn';
    worshipBtn.className = 'feature-chip-btn active';
    worshipBtn.textContent = 'WORSHIP MODE: ON';
    bar.appendChild(worshipBtn);

    worshipBtn.addEventListener('click', () => {
      worshipEnabled = !worshipEnabled;
      worshipBtn.textContent = worshipEnabled ? 'WORSHIP MODE: ON' : 'WORSHIP MODE: OFF';
      worshipBtn.classList.toggle('active', worshipEnabled);
      if (!worshipEnabled) clearSchedule();
      if (typeof showToast === 'function') {
        showToast(worshipEnabled
          ? 'Worship Mode On — full length, dynamics & harmony'
          : 'Worship Mode Off — short, original songs');
      }
    });
  }

  function wireStopClear() {
    document.getElementById('stopBtn')?.addEventListener('click', clearSchedule);
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectToggles();
    applyChristmasFilter();
    wireStopClear();
  });
})();