(function() {
  const ONBOARDING_KEY = 'dv_studio_onboarded_v2';

  // 1. Check if already onboarded
  if (localStorage.getItem(ONBOARDING_KEY) === 'true') return;

  // 2. Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes dv-fade-in {
      from { opacity: 0; transform: translateY(20px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes dv-gear-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    #dv-onboarding-overlay {
      position: fixed; top: 0; left: 0; width: 100dvw; height: 100dvh;
      background: rgba(0, 0, 0, 0.65); z-index: 99998;
      display: flex; justify-content: center; align-items: center;
      font-family: Roboto, sans-serif; padding: 24px; box-sizing: border-box;
      backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    }

    .dv-onboarding-card {
      background: var(--surface, #fdfcff); color: var(--on-surface, #1a1b1f);
      width: 100%; max-width: 380px; border-radius: 32px; padding: 40px 24px 32px 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4); text-align: center;
      border: 1px solid var(--outline, #c4c6d0);
      animation: dv-fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      position: relative; overflow: hidden;
    }

    /* Premium Profile Wrap */
    .dv-profile-wrap {
      position: relative; width: 160px; height: 160px; margin-bottom: 8px;
    }
    
    .dv-profile-img {
      width: 160px; height: 160px; border-radius: 50%;
      object-fit: cover; position: absolute; top: 0; left: 0;
      z-index: 1; border: 4px solid var(--surface, #fdfcff);
    }

    .dv-profile-gear {
      position: absolute; top: -8px; left: -8px; width: 176px; height: 176px;
      z-index: 2; pointer-events: none;
      animation: dv-gear-spin 8s linear infinite;
    }

    .dv-profile-gear svg {
      width: 100%; height: 100%;
    }
    .dv-profile-gear circle {
      fill: none; stroke: var(--primary, #1a5fb4); stroke-width: 4;
      stroke-dasharray: 12 8; stroke-linecap: round;
    }

    .dv-profile-name {
      font-size: 24px; font-weight: 800; margin: 8px 0 0 0; letter-spacing: 0.5px;
    }
    
    .dv-profile-role {
      font-size: 19px; font-weight: 500; margin: 0; color: var(--primary, #1a5fb4);
    }

    .dv-onboarding-text {
      font-size: 19px; line-height: 1.5; margin: 16px 0 24px 0; opacity: 0.9;
    }

    .dv-onboarding-btn {
      background: var(--primary, #1a5fb4); color: #ffffff;
      border: none; border-radius: 20px; padding: 16px 32px; width: 100%;
      font-size: 20px; font-weight: bold; cursor: pointer;
      transition: opacity 0.1s, transform 0.1s;
    }
    .dv-onboarding-btn:active { opacity: 0.8; transform: scale(0.98); }
  `;
  document.head.appendChild(style);

  // 3. Inject HTML
  const overlay = document.createElement('div');
  overlay.id = 'dv-onboarding-overlay';
  overlay.innerHTML = `
    <div class="dv-onboarding-card">
      
      <div class="dv-profile-wrap">
        <!-- Swap the src below with your real hosted image URL -->
        <img src="https://i.ibb.co/84dRKY60/Screenshot-20260103-005841.png/160" class="dv-profile-img" alt="Profile Photo">
        
        <div class="dv-profile-gear">
          <svg viewBox="0 0 176 176">
            <circle cx="88" cy="88" r="84"></circle>
          </svg>
        </div>
      </div>

      <h2 class="dv-profile-name">Rev. Don Victor, PhD</h2>
      <p class="dv-profile-role">Prophet of God | Founder & Visionary | Trainer | Researcher | Full Stack Developer</p>

      <p class="dv-onboarding-text">
        On behalf of Don Victor Ministries Online Community, I warmly welcome you to DV-Piano App. Enjoy five premium musical instruments: Piano, Drums, Kalimba, Handpan, and Tabla. Remember our vision of reaching six million souls for the Lord is more urgent now than ever before.
        <br><br>
        Tap the menu icon <strong>☰</strong> at the top right to explore the sidebar and switch instruments. Your feedback helps us serve you better.
      </p>

      <button class="dv-onboarding-btn" id="dvOnboardingDismiss">Thank you</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // 4. Dismiss Logic
  document.getElementById('dvOnboardingDismiss').addEventListener('click', () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    overlay.remove(); // Completely remove from DOM to prevent interference
  });

})();