(function() {
  // Inject UI styles directly to keep it fully self-contained
  const style = document.createElement('style');
  style.textContent = `
    #pwa-install-container {
      display: none; position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      z-index: 9999; align-items: center; gap: 12px; background: rgba(30, 30, 30, 0.95);
      padding: 8px 16px 8px 20px; border-radius: 50px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px); font-family: sans-serif;
    }
    #pwa-install-container.show { display: flex; }
    .pwa-timer-wrap { position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
    .pwa-ring-svg { position: absolute; top: 0; left: 0; transform: rotate(-90deg); }
    .pwa-ring-bg { fill: none; stroke: rgba(255,255,255,0.2); stroke-width: 3; }
    .pwa-ring-progress { fill: none; stroke: #adc6ff; stroke-width: 3; stroke-dasharray: 100.5; stroke-dashoffset: 0; transition: stroke-dashoffset 1s linear; }
    #pwa-timer-text { color: #fff; font-size: 14px; font-weight: bold; }
    #pwa-install-btn { background: #adc6ff; color: #002e69; border: none; padding: 8px 16px; border-radius: 50px; font-weight: bold; font-size: 14px; cursor: pointer; }
  `;
  document.head.appendChild(style);

  // Inject HTML structure
  const container = document.createElement('div');
  container.id = 'pwa-install-container';
  container.innerHTML = `
    <div class="pwa-timer-wrap">
      <svg class="pwa-ring-svg" width="36" height="36" viewBox="0 0 36 36">
        <circle class="pwa-ring-bg" cx="18" cy="18" r="16"></circle>
        <circle id="pwa-timer-ring" class="pwa-ring-progress" cx="18" cy="18" r="16"></circle>
      </svg>
      <span id="pwa-timer-text">10</span>
    </div>
    <button id="pwa-install-btn">Install App</button>
  `;
  document.body.appendChild(container);

  // Logic
  let deferredPrompt;
  const installBtn = document.getElementById('pwa-install-btn');
  const timerText = document.getElementById('pwa-timer-text');
  const timerRing = document.getElementById('pwa-timer-ring');
  let countdownInterval;
  let timeLeft = 10;
  const maxOffset = 100.5; // 2 * PI * 16

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    container.classList.add('show');
    timeLeft = 10;
    timerText.textContent = timeLeft;
    timerRing.style.strokeDashoffset = '0';
    
    countdownInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft >= 0) {
        timerText.textContent = timeLeft;
        timerRing.style.strokeDashoffset = maxOffset - ((timeLeft / 10) * maxOffset);
      }
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        container.classList.remove('show');
      }
    }, 1000);
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    clearInterval(countdownInterval);
    container.classList.remove('show');
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    clearInterval(countdownInterval);
    container.classList.remove('show');
    deferredPrompt = null;
  });
})();