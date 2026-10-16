/**
 * DV-PIANO: Application Controller & Sequencer (app.js)
 * Manages Songs Library, Sequence Player, Theme Switcher, Input Parser, and PWA Service Worker
 */

(function () {
  'use strict';

  // 1. Built-in Song Library
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

  let activeTimeouts = [];
  let currentPlaying = false;

  function stopSong() {
    activeTimeouts.forEach(clearTimeout);
    activeTimeouts = [];
    currentPlaying = false;

    const stopBtn = document.getElementById('stopBtn');
    const statusLabel = document.getElementById('statusLabel');

    if (stopBtn) stopBtn.style.display = 'none';
    if (statusLabel) statusLabel.textContent = 'Stopped';
    document.querySelectorAll('.key-white.active, .key-black.active').forEach(k => k.classList.remove('active'));
  }

  function playSequence(songData) {
    stopSong();
    if (window.DVPiano) window.DVPiano.getAudioContext();

    // Check if Tutor mode is active
    if (window.DVPianoPremium && window.DVPianoPremium.isTutorOn && window.DVPianoPremium.isTutorOn()) {
      window.DVPianoPremium.startTutorWithSong(songData);
      return;
    }

    currentPlaying = true;
    const stopBtn = document.getElementById('stopBtn');
    const statusLabel = document.getElementById('statusLabel');
    const speedSelect = document.getElementById('speedSelect');

    if (stopBtn) stopBtn.style.display = 'inline-flex';
    if (statusLabel) statusLabel.textContent = 'Playing: ' + songData.title;

    const speed = speedSelect ? (parseFloat(speedSelect.value) || 1.25) : 1.25;
    const notes = songData.notes;
    let maxDuration = 0;

    notes.forEach((item) => {
      const adjustedTime = (item.time / speed) * 1000;
      const adjustedDuration = item.duration / speed;
      const endTime = adjustedTime + (adjustedDuration * 1000);
      if (endTime > maxDuration) maxDuration = endTime;

      const timer = setTimeout(() => {
        if (!currentPlaying) return;
        const freq = window.DVPiano ? window.DVPiano.getNoteFrequency(item.note) : 440;
        if (freq && window.DVPiano) {
          window.DVPiano.playTone(freq, adjustedDuration);
          window.DVPiano.highlightKey(item.note, Math.max(160, adjustedDuration * 800));
        }
      }, adjustedTime);

      activeTimeouts.push(timer);
    });

    const finishTimer = setTimeout(() => {
      if (currentPlaying) {
        if (statusLabel) statusLabel.textContent = 'Done: ' + songData.title;
        currentPlaying = false;
        if (stopBtn) stopBtn.style.display = 'none';
      }
    }, maxDuration + 300);

    activeTimeouts.push(finishTimer);
  }

  // 2. Input Parser (Library Songs & Raw Notes C4 E4 G4)
  function parseInput(rawText) {
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

  // 3. Theme Toggle & State
  function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    let isDarkMode = false;

    if (!themeToggleBtn || !themeIcon) return;

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
  }

  // 4. Main Initialization
  function initApp() {
    initTheme();

    const songForm = document.getElementById('songForm');
    const songInput = document.getElementById('songInput');
    const stopBtn = document.getElementById('stopBtn');
    const chipList = document.getElementById('chipList');
    const statusLabel = document.getElementById('statusLabel');

    if (stopBtn) stopBtn.addEventListener('click', stopSong);

    if (songForm && songInput) {
      songForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const songData = parseInput(songInput.value);
        if (songData) {
          playSequence(songData);
        } else {
          if (statusLabel) statusLabel.textContent = 'Song not found';
        }
      });
    }

    // Populate library chips
    if (chipList) {
      chipList.innerHTML = '';
      Object.keys(songLibrary).forEach((songTitle) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip';
        chip.textContent = songTitle;
        chip.addEventListener('click', () => {
          if (songInput) songInput.value = songTitle;
          playSequence(songLibrary[songTitle]);
        });
        chipList.appendChild(chip);
      });
    }

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }

  // Export
  window.DVPianoApp = {
    songLibrary,
    playSequence,
    stopSong,
    init: initApp
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();