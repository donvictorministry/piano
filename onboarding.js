(function() {
  const ONBOARDING_KEY = 'dv_studio_onboarded_v4';

  // 1. Check if already onboarded
  if (localStorage.getItem(ONBOARDING_KEY) === 'true') return;

  // 2. Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes dv-gear-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    #dv-onboarding-overlay {
      position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
      background: var(--surface, #fdfcff); z-index: 99999;
      display: flex; flex-direction: column; box-sizing: border-box;
      font-family: Roboto, sans-serif; color: var(--on-surface, #1a1b1f);
      overflow-y: auto; padding: 40px 0 40px 0; /* No horizontal padding to ensure full edge-to-edge background */
    }

    .dv-ob-inner {
      width: 100%; display: flex; flex-direction: column; align-items: center;
      padding: 0 20px; box-sizing: border-box; /* Only the content gets padding, not the full page background */
      flex: 1;
    }

    .dv-ob-top {
      display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 20px; width: 100%;
    }

    .dv-profile-wrap {
      position: relative; width: 160px; height: 160px;
    }
    
    .dv-profile-img {
      width: 160px; height: 160px; border-radius: 50%;
      object-fit: cover; position: absolute; top: 0; left: 0;
      z-index: 1; border: 4px solid var(--surface, #fdfcff);
    }

    .dv-profile-gear {
      position: absolute; top: -10px; left: -10px; width: 180px; height: 180px;
      z-index: 2; pointer-events: none;
      animation: dv-gear-spin 10s linear infinite;
    }

    .dv-profile-gear svg { width: 100%; height: 100%; }
    .dv-profile-gear circle {
      fill: none; stroke: var(--primary, #1a5fb4); stroke-width: 4;
      stroke-dasharray: 12 10; stroke-linecap: round;
    }

    .dv-profile-name {
      font-size: 24px; font-weight: 800; margin: 8px 0 0 0; letter-spacing: 0.5px; text-align: center; width: 100%;
    }
    
    .dv-profile-role {
      font-size: 20px; font-weight: 600; margin: 0; color: var(--primary, #1a5fb4); text-align: center; line-height: 1.4; width: 100%;
    }

    .dv-ob-middle {
      flex: 1; display: flex; flex-direction: column; justify-content: center;
      margin: 32px 0; width: 100%; text-align: center;
    }

    .dv-onboarding-text {
      font-size: 20px; line-height: 1.6; margin: 0; opacity: 0.9; width: 100%;
    }

    .dv-ob-bottom {
      width: 100%; padding: 0 20px; box-sizing: border-box;
      display: flex; flex-direction: column; align-items: center;
    }

    .dv-onboarding-btn {
      background: var(--primary, #1a5fb4); color: #ffffff;
      border: none; border-radius: 16px; padding: 18px; width: 100%; /* Stretches fully edge-to-edge within padding */
      font-size: 22px; font-weight: bold; cursor: pointer;
      transition: opacity 0.1s, transform 0.1s;
    }
    .dv-onboarding-btn:active { opacity: 0.8; transform: scale(0.98); }
  `;
  document.head.appendChild(style);

  // 3. Inject HTML
  const overlay = document.createElement('div');
  overlay.id = 'dv-onboarding-overlay';
  overlay.innerHTML = `
    <div class="dv-ob-inner">
      
      <div class="dv-ob-top">
        <div class="dv-profile-wrap">
          <!-- Swap the src below with your real hosted image URL -->
          <img src="https://i.ibb.co/84dRKY60/Screenshot-20260103-005841.png/160" class="dv-profile-img" alt="Profile Photo">
          <div class="dv-profile-gear">
            <svg viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="86"></circle>
            </svg>
          </div>
        </div>
        <h2 class="dv-profile-name">Rev. Don Victor, PhD</h2>
        <p class="dv-profile-role">Prophet of God | Founder & Visionary | Trainer | Researcher | Full Stack Developer</p>
      </div>

      <div class="dv-ob-middle">
        <p class="dv-onboarding-text">
          On behalf of Don Victor Ministries Online Community! I warmly welcome you to DV-Piano App. Enjoy five premium musical instruments: Piano, Drums, Kalimba, Handpan, and Tabla. Remember our vision of reaching six million souls for the Lord is more urgent now than ever before.
        </p>
        <p class="dv-onboarding-text" style="margin-top: 20px;">
          Tap the menu icon ☰ at the top right to explore the sidebar and switch instruments. Your feedback helps us serve you better.
        </p>
      </div>

      <div class="dv-ob-bottom">
        <button class="dv-onboarding-btn" id="dvOnboardingDismiss">Thank you</button>
      </div>

    </div>
  `;
  document.body.appendChild(overlay);

  // 4. Dismiss Logic
  document.getElementById('dvOnboardingDismiss').addEventListener('click', () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    overlay.remove();
  });

})();