(function() {
  // 1. Inject CSS (Inherits app theming, strict mobile edge-to-edge, no text < 19px)
  const style = document.createElement('style');
  style.textContent = `
    @keyframes install-spin { 100% { transform: rotate(360deg); } }
    
    #dv-install-overlay {
      display: none; 
      position: fixed; 
      top: 0; 
      left: 0; 
      width: 100dvw; 
      height: 100dvh; 
      background: var(--surface, #fdfcff); 
      z-index: 99999; 
      align-items: center; 
      justify-content: center; 
      flex-direction: column; 
      color: var(--on-surface, #1a1b1f); 
      font-family: Roboto, sans-serif;
      text-align: center;
      padding: 24px;
      box-sizing: border-box;
    }
    
    .dv-install-spinner {
      width: 56px; 
      height: 56px; 
      border: 5px solid var(--outline, #c4c6d0); 
      border-top-color: var(--primary, #1a5fb4); 
      border-radius: 50%; 
      animation: install-spin 1s linear infinite; 
      margin-bottom: 24px;
    }
    
    #dv-install-msg {
      font-size: 20px; 
      line-height: 1.5;
      font-weight: 500;
      max-width: 90%;
    }
  `;
  document.head.appendChild(style);

  // 2. Inject Overlay HTML
  const overlay = document.createElement('div');
  overlay.id = 'dv-install-overlay';
  overlay.innerHTML = `
    <div id="dv-install-spinner" class="dv-install-spinner" style="display: none;"></div>
    <div id="dv-install-msg"></div>
  `;
  document.body.appendChild(overlay);

  // 3. Inject Sidebar Button
  const sidebarNav = document.querySelector('.sidebar-nav');
  if (!sidebarNav) return;

  const installItem = document.createElement('div');
  installItem.className = 'sidebar-item';
  installItem.innerHTML = `
    <span>Install App</span>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
  `;
  sidebarNav.appendChild(installItem);

  // 4. Logic & State
  let deferredPrompt = null;
  const msg = document.getElementById('dv-install-msg');
  const spinner = document.getElementById('dv-install-spinner');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  installItem.addEventListener('click', async () => {
    // Close sidebar
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('open');

    // Show Overlay
    overlay.style.display = 'flex';

    if (!deferredPrompt) {
      // Message if prompt not ready
      spinner.style.display = 'none';
      msg.innerHTML = 'This app will install on your phone once your phone is ready.<br>Please tap again after a few minutes later. God bless.';
      
      // Auto vanish after 5 seconds
      setTimeout(() => {
        if (!deferredPrompt) overlay.style.display = 'none';
      }, 5000);
      return;
    }

    // Prompt is ready: Show Play Store style spinner
    spinner.style.display = 'block';
    msg.textContent = 'Installing...';

    // Trigger native prompt in background
    deferredPrompt.prompt();
    
    // Check outcome
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'dismissed') {
      overlay.style.display = 'none';
    }
    
    deferredPrompt = null;
  });

  // 5. Success Event
  window.addEventListener('appinstalled', () => {
    spinner.style.display = 'none';
    msg.textContent = 'Installation Successful!';
    
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 2000);
  });
})();