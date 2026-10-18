/* patch-organ-boost.js — The original organ voice was 3 static sine waves
   peaking at gain 0.18 (half the loudness of acoustic piano's 0.35),
   with no movement — hence "not loud, not dynamic." This patch adds:
     - 5 harmonic drawbars instead of 3 (fundamental, octave, 12th, 2nd
       octave, major 10th) for a fuller, brighter gospel-organ timbre
     - roughly 2.3x louder peak gain (0.42 vs 0.18)
     - a 5.5Hz tremolo (Leslie-speaker-style amplitude wobble) so
       sustained chords feel alive instead of flat */
(function () {
  'use strict';

  const _origPlayTone = playTone; // keep original for every other instrument

  playTone = function (freq, duration, isSustain) {
    if (currentInstrument !== 'organ') {
      return _origPlayTone(freq, duration, isSustain);
    }

    const ctx = getAudioContext();
    if (!ctx || !freq) return;

    const now = ctx.currentTime;
    const dur = isSustain ? Math.max(duration, 2.4) : duration;
    const gain = ctx.createGain();

    const partials = [1, 2, 3, 4, 6];          // drawbar harmonics
    const partialGains = [0.30, 0.22, 0.16, 0.12, 0.08];
    const oscList = [];

    partials.forEach((mult, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq * mult, now);
      const pg = ctx.createGain();
      pg.gain.setValueAtTime(partialGains[i], now);
      o.connect(pg);
      pg.connect(gain);
      oscList.push(o);
    });

    // Tremolo — amplitude LFO for dynamic, alive sustain
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(5.5, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.12, now);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start(now);
    lfo.stop(now + dur + 0.1);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.42, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    oscList.forEach(o => {
      o.start(now);
      o.stop(now + dur + 0.05);
    });

    gain.connect(masterGain);
    gain.connect(reverbSend);
  };
})();