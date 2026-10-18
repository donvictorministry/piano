(function() {
  const ONBOARDING_KEY = 'dv_studio_onboarded_v1';

  // 1. Check if already onboarded
  if (localStorage.getItem(ONBOARDING_KEY) === 'true') return;

  // 2. Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes dv-fade-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    #dv-onboarding-overlay {
      position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
      background: rgba(0, 0, 0, 0.6); z-index: 99998;
      display: flex; justify-content: center; align-items: center;
      font-family: Roboto, sans-serif; padding: 24px; box-sizing: border-box;
      backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
    }

    .dv-onboarding-card {
      background: var(--surface, #fdfcff); color: var(--on-surface, #1a1b1f);
      width: 100%; max-width: 400px; border-radius: 24px; padding: 32px 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3); text-align: center;
      border: 1px solid var(--outline, #c4c6d0);
      animation: dv-fade-in 0.3s ease-out;
      display: flex; flex-direction: column; gap: 20px;
    }

    .dv-onboarding-icon {
      width: 64px; height: 64px; margin: 0 auto;
      background: var(--surface-container-high, #e4e4e9);
      border-radius: 50%; display: flex; justify-content: center; align-items: center;
    }
    .dv-onboarding-icon svg {
      width: 32px; height: 32px; fill: var(--primary, #1a5fb4);
    }

    .dv-onboarding-title {
      font-size: 24px; font-weight: 800; margin: 0;
    }

    .dv-onboarding-text {
      font-size: 19px; line-height: 1.5; margin: 0; opacity: 0.9;
    }

    .dv-onboarding-btn {
      background: var(--primary, #1a5fb4); color: #ffffff;
      border: none; border-radius: 16px; padding: 16px;
      font-size: 20px; font-weight: bold; cursor: pointer;
      transition: opacity 0.1s;
    }
    .dv-onboarding-btn:active { opacity: 0.8; }
  `;
  document.head.appendChild(style);

  // 3. Inject HTML
  const overlay = document.createElement('div');
  overlay.id = 'dv-onboarding-overlay';
  overlay.innerHTML = `
    <div class="dv-onboarding-card">
      <div class="dv-onboarding-icon">
        <svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
      </div>
      <h2 class="dv-onboarding-title">DV-Piano Studio</h2>
      <p class="dv-onboarding-text">
        On behalf of Don Victor Ministries Online Community, I warmly welcome you to DV-Piano App. Enjoy five premium musical instruments: Piano, Drums, Kalimba, Handpan, and Tabla. Remember our vision of reaching six million souls for the Lord is more urgent now than ever before.
        <br><br>
        Tap the menu icon <strong>☰</strong> at the top right to explore the sidebar and switch instruments. Your feedback helps us serve you better.
         <br><br>
           Rev. Don Victor, PhD .
         </p>
      <button class="dv-onboarding-btn" id="dvOnboardingDismiss">Got it</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // 4. Dismiss Logic
  document.getElementById('dvOnboardingDismiss').addEventListener('click', () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    overlay.remove(); // Completely remove from DOM to prevent any interference
  });

})();