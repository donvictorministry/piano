/* patch-lyrics-sync.js — displays time-synced lyric lines as each hymn
   plays, turning the app from a piano toy into a worship/practice tool.
   Must load AFTER patch-loop-engine.js so lyric scheduling re-triggers
   correctly on every loop repeat, not just the first pass. */
(function () {
  'use strict';

  let lyricsEnabled = true;
  let _lyricTimeouts = [];

  /* Line-level timing (seconds, at the song's AUTHORED tempo — same
     timeline the notes in melody.js use). Scaled by BPM speed at
     playback time, same as note timing. */
  const lyricsLibrary = {
    'Amazing Grace': [
      { time: 0,    text: 'Amazing grace, how sweet the sound' },
      { time: 5.4,  text: 'That saved a wretch like me' },
      { time: 10.8, text: 'I once was lost, but now am found' },
      { time: 16.2, text: 'Was blind, but now I see' }
    ],
    'Silent Night': [
      { time: 0,    text: 'Silent night, holy night' },
      { time: 4.6,  text: 'All is calm, all is bright' },
      { time: 9.2,  text: "Round yon virgin mother and child" },
      { time: 13.8, text: 'Holy infant so tender and mild' },
      { time: 18.4, text: 'Sleep in heavenly peace' }
    ],
    'O Holy Night': [
      { time: 0,   text: 'O holy night, the stars are brightly shining' },
      { time: 4.4, text: "It is the night of the dear Savior's birth" },
      { time: 8.8, text: 'Long lay the world in sin and error pining' }
    ],
    'Joy to the World': [
      { time: 0,    text: 'Joy to the world, the Lord is come' },
      { time: 3.9,  text: 'Let earth receive her King' },
      { time: 7.8,  text: 'Let every heart prepare Him room' },
      { time: 11.7, text: 'And heaven and nature sing' }
    ],
    'Hark the Herald Angels Sing': [
      { time: 0,    text: 'Hark! The herald angels sing' },
      { time: 4.7,  text: 'Glory to the newborn King' },
      { time: 9.4,  text: 'Peace on earth, and mercy mild' },
      { time: 14.1, text: 'God and sinners reconciled' }
    ],
    'O Come All Ye Faithful': [
      { time: 0,    text: 'O come, all ye faithful' },
      { time: 4.1,  text: 'Joyful and triumphant' },
      { time: 8.2,  text: 'O come ye, O come ye to Bethlehem' },
      { time: 12.3, text: 'Come and behold Him, born the King of angels' }
    ],
    'Away in a Manger': [
      { time: 0,   text: 'Away in a manger, no crib for a bed' },
      { time: 5.2, text: 'The little Lord Jesus laid down His sweet head' },
      { time: 10.4,text: 'The stars in the bright sky looked down where He lay' }
    ],
    'What Child Is This': [
      { time: 0,    text: 'What child is this, who, laid to rest' },
      { time: 4.1,  text: "On Mary's lap is sleeping?" },
      { time: 8.2,  text: 'Whom angels greet with anthems sweet' },
      { time: 12.3, text: 'While shepherds watch are keeping?' }
    ],
    'Go Tell It on the Mountain': [
      { time: 0,   text: 'Go, tell it on the mountain' },
      { time: 4.7, text: 'Over the hills and everywhere' },
      { time: 9.4, text: 'Go, tell it on the mountain, that Jesus Christ is born' }
    ],
    'How Great Thou Art': [
      { time: 0,    text: 'O Lord my God, when I in awesome wonder' },
      { time: 5.1,  text: 'Consider all the worlds Thy hands have made' },
      { time: 10.2, text: 'I see the stars, I hear the rolling thunder' },
      { time: 15.3, text: 'Thy power throughout the universe displayed' }
    ],
    'Blessed Assurance': [
      { time: 0,    text: 'Blessed assurance, Jesus is mine' },
      { time: 3.9,  text: 'Oh, what a foretaste of glory divine' },
      { time: 7.8,  text: 'Heir of salvation, purchase of God' },
      { time: 11.7, text: "Born of His Spirit, washed in His blood" }
    ],
    'Great Is Thy Faithfulness': [
      { time: 0,    text: 'Great is Thy faithfulness, O God my Father' },
      { time: 4.1,  text: 'There is no shadow of turning with Thee' },
      { time: 8.2,  text: 'Thou changest not, Thy compassions they fail not' },
      { time: 12.3, text: 'As Thou hast been Thou forever wilt be' }
    ],
    'It Is Well With My Soul': [
      { time: 0,   text: 'When peace like a river attendeth my way' },
      { time: 3.5, text: 'When sorrows like sea billows roll' },
      { time: 7.0, text: 'Whatever my lot, Thou hast taught me to say' },
      { time: 10.5,text: 'It is well, it is well with my soul' }
    ],
    'Deck the Halls': [
      { time: 0,   text: 'Deck the halls with boughs of holly' },
      { time: 4.5, text: "'Tis the season to be jolly" }
    ],
    'We Wish You a Merry Christmas': [
      { time: 0,   text: 'We wish you a merry Christmas' },
      { time: 4.4, text: 'We wish you a merry Christmas' },
      { time: 8.8, text: 'And a happy New Year' }
    ],
    'Jingle Bells': [
      { time: 0,   text: 'Dashing through the snow' },
      { time: 4.5, text: 'In a one-horse open sleigh' },
      { time: 9.0, text: 'Jingle bells, jingle bells, jingle all the way' }
    ],
    'It Came Upon the Midnight Clear': [
      { time: 0,    text: 'It came upon the midnight clear' },
      { time: 4.6,  text: 'That glorious song of old' },
      { time: 9.2,  text: 'From angels bending near the earth' },
      { time: 13.8, text: 'To touch their harps of gold' }
    ],
    'Crown Him With Many Crowns': [
      { time: 0,   text: 'Crown Him with many crowns' },
      { time: 4.5, text: 'The Lamb upon His throne' },
      { time: 9.0, text: 'Hark, how the heavenly anthem drowns all music but its own' }
    ],
    "All Hail the Power of Jesus Name": [
      { time: 0,   text: "All hail the power of Jesus' name" },
      { time: 4.8, text: 'Let angels prostrate fall' },
      { time: 9.6, text: 'Bring forth the royal diadem, and crown Him Lord of all' }
    ]
  };

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .lyric-display {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 14px 16px;
        margin: 2px 0;
        box-shadow: var(--shadow);
        min-height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        flex-shrink: 0;
      }
      .lyric-display span {
        font-size: 21px;
        font-weight: 700;
        color: var(--primary);
        line-height: 1.4;
        opacity: 0;
        transition: opacity .25s ease;
      }
      .lyric-display span.show { opacity: 1; }
      .lyric-display.hidden-mode { display: none; }
    `;
    document.head.appendChild(style);
  }

  function injectDisplay() {
    const chipList = document.getElementById('chipList');
    if (!chipList || !chipList.parentElement) return null;

    const wrap = document.createElement('div');
    wrap.className = 'lyric-display';
    wrap.id = 'lyricDisplay';
    wrap.innerHTML = '<span id="lyricText"></span>';
    chipList.insertAdjacentElement('afterend', wrap);
    return wrap;
  }

  function setLyricLine(text) {
    const span = document.getElementById('lyricText');
    if (!span) return;
    span.classList.remove('show');
    setTimeout(() => {
      span.textContent = text || '';
      if (text) span.classList.add('show');
    }, 120);
  }

  function clearLyricSchedule() {
    _lyricTimeouts.forEach(clearTimeout);
    _lyricTimeouts = [];
    setLyricLine('');
  }

  function scheduleLyrics(songData) {
    clearLyricSchedule();
    if (!lyricsEnabled) return;
    if (isTutorModeActive) return; // tutor mode waits on user input — timing wouldn't match

    const lines = lyricsLibrary[songData.title];
    if (!lines || !lines.length) return;

    const bpmVal = parseInt(document.getElementById('bpmInput').value) || 150;
    const speed = bpmVal / 120;

    lines.forEach(line => {
      const t = (line.time / speed) * 1000;
      const tid = setTimeout(() => setLyricLine(line.text), t);
      _lyricTimeouts.push(tid);
    });
  }

  /* Wrap whatever playSequence currently is — if loaded after
     patch-loop-engine.js, this wraps the loop-aware version, so lyrics
     correctly restart on every loop repeat as well as the first play. */
  const _origPlaySequence = playSequence;
  playSequence = function (songData) {
    scheduleLyrics(songData);
    return _origPlaySequence(songData);
  };

  function injectToggleButton() {
    const bar = document.querySelector('.keyboard-features-bar');
    if (!bar) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'lyricsBtn';
    btn.className = 'feature-chip-btn active';
    btn.textContent = 'LYRICS: ON';
    bar.appendChild(btn);

    btn.addEventListener('click', () => {
      lyricsEnabled = !lyricsEnabled;
      btn.textContent = lyricsEnabled ? 'LYRICS: ON' : 'LYRICS: OFF';
      btn.classList.toggle('active', lyricsEnabled);
      const display = document.getElementById('lyricDisplay');
      if (display) display.classList.toggle('hidden-mode', !lyricsEnabled);
      if (!lyricsEnabled) clearLyricSchedule();
      if (typeof showToast === 'function') {
        showToast(lyricsEnabled ? 'Lyrics On' : 'Lyrics Off');
      }
    });
  }

  function wireStopClear() {
    document.getElementById('stopBtn')?.addEventListener('click', clearLyricSchedule);
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    injectDisplay();
    injectToggleButton();
    wireStopClear();
  });
})();