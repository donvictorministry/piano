(function() {
  // 1. Inject CSS (Clones your app's modal, card, and typography design)
  const style = document.createElement('style');
  style.textContent = `
    @keyframes dv-spin { 100% { transform: rotate(360deg); } }
    
    #dv-install-modal {
      position: fixed; 
      top: 0; left: 0; 
      width: 100dvw; height: 100dvh;
      background: var(--surface, #fdfcff); 
      z-index: 99999;
      display: none; 
      flex-direction: column;
      font-family: Roboto, sans-serif;
      color: var(--on-surface, #1a1b1f);
      overflow: hidden;
    }
    #dv-install-modal.active { display: flex; }
    
    .dv-modal-header {
      display: flex; align-items: center; padding: 16px 20px;
      border-bottom: 1px solid var(--outline, #c4c6d0);
      gap: 16px;
    }
    .dv-modal-header h2 { margin: 0; font-size: 22px; font-weight: 700; }
    .dv-back-btn {
      background: none; border: none; color: inherit; padding: 0; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }
    
    .dv-modal-content {
      padding: 24px 20px; overflow-y: auto; flex: 1;
      display: flex; flex-direction: column; gap: 20px;
    }
    
    .dv-card {
      background: var(--surface-container, #f0f0f4);
      border: 1px solid var(--outline, #c4c6d0);
      border-radius: 16px; padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      display: flex; flex-direction: column; align-items: center; text-align: center;
    }
    .dv-card h3 {
      margin: 0 0 12px 0; font-size: 21px; font-weight: 700; color: var(--primary, #1a5fb4);
    }
    .dv-card p {
      margin: 0; font-size: 20px; line-height: 1.6; color: inherit;
    }
    
    .dv-spinner {
      width: 50px; height: 50px; border: 4px solid var(--outline, #c4c6d0); 
      border-top-color: var(--primary, #1a5fb4); border-radius: 50%;
      animation: dv-spin 1s linear infinite; margin-bottom: 20px;
    }
  `;
  document.head.appendChild(style);

  // 2. Inject Modal DOM
  const modal = document.createElement('div');
  modal.id = 'dv-install-modal';
  modal.innerHTML = `
    <div class="dv-modal-header">
      <button class="dv-back-btn" id="dvCloseBtn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <h2>Install App</h2>
    </div>
    <div class="dv-modal-content">
      <div class="dv-card" id="dvInstallCard">
        <div class="dv-spinner" id="dvSpinner" style="display: none;"></div>
        <h3 id="dvCardTitle">Ready to Install</h3>
        <p id="dvCardMsg">Tap the button below to add this app to your home screen.</p>
      </div>
      <button id="dvActionBtn" style="background: var(--primary); color: var(--on-primary); border: none; padding: 16px; border-radius: 16px; font-size: 20px; font-weight: bold; width: 100%; display: none;">
        Install Now
      </button>
    </div>
  `;
  document.body.appendChild(modal);

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

  // 4. Logic
  let deferredPrompt = null;
  const title = document.getElementById('dvCardTitle');
  const msg = document.getElementById('dvCardMsg');
  const spinner = document.getElementById('dvSpinner');
  const actionBtn = document.getElementById('dvActionBtn');
  const closeBtn = document.getElementById('dvCloseBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  installItem.addEventListener('click', () => {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('open');

    modal.classList.add('active');
    spinner.style.display = 'none';
    
    if (!deferredPrompt) {
      title.textContent = 'Please Wait';
      msg.innerHTML = 'This app will install on your phone once your phone is ready.<br><br>Please tap again after a few minutes later. God bless.';
      actionBtn.style.display = 'none';
    } else {
      title.textContent = 'Ready to Install';
      msg.textContent = 'Tap the button below to add the app to your phone.';
      actionBtn.style.display = 'block';
    }
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  actionBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    actionBtn.style.display = 'none';
    spinner.style.display = 'block';
    title.textContent = 'Installing...';
    msg.textContent = 'Please wait while the app is added to your device.';

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'dismissed') {
      modal.classList.remove('active');
    }
    deferredPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    spinner.style.display = 'none';
    title.textContent = 'Success!';
    msg.textContent = 'The app has been successfully installed on your phone.';
    actionBtn.style.display = 'none';

    setTimeout(() => {
      modal.classList.remove('active');
    }, 2000);
  });
})();