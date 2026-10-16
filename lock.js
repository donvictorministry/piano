(function () {
  'use strict';

  const CORRECT_PIN = 'aA4b';       // ← CHANGE THIS
  const STORAGE_KEY = 'pianobar-auth';
  const SESSION_HRS = 24;

  function isUnlocked() {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return s.ts && (Date.now() - s.ts) < SESSION_HRS * 3_600_000;
    } catch { return false; }
  }

  function grantAccess() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now() }));
    document.getElementById('lock-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
  }

  function lockToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }

  if (isUnlocked()) { grantAccess(); return; }

  const pinInput  = document.getElementById('pin-input');
  const pinSubmit = document.getElementById('pin-submit');

  pinSubmit.addEventListener('click', () => {
    if (pinInput.value === CORRECT_PIN) {
      grantAccess();
    } else {
      lockToast('Incorrect PIN. Please try again.');
      pinInput.value = '';
      pinInput.focus();
    }
  });

  pinInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') pinSubmit.click();
  });

  pinInput.focus();
}());
