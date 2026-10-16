(function () {
  'use strict';

  function isDesktopEnvironment() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
    const isAndroid = /android/i.test(userAgent);
    const isWindows = /windows nt/i.test(userAgent);
    const isMac = /macintosh|mac os x/i.test(userAgent) && !/iphone|ipad|ipod/i.test(userAgent);
    const isLinuxDesktop = /linux/i.test(userAgent) && !/android/i.test(userAgent);
    const hasTouch = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    const isWideScreen = window.innerWidth > 1024;

    if (!isAndroid && (isWindows || isMac || (isLinuxDesktop && !hasTouch) || (isWideScreen && !hasTouch))) {
      return true;
    }
    return false;
  }

  function enforceAndroidOnly() {
    if (isDesktopEnvironment()) {
      const appShell = document.querySelector('.app-shell');
      if (appShell) appShell.style.display = 'none';

      const blocker = document.createElement('div');
      blocker.className = 'desktop-block-overlay';
      blocker.id = 'desktopBlockOverlay';
      blocker.innerHTML = `
        <div class="desktop-block-card">
          <div style="font-size: 42px;">📱</div>
          <h1 class="desktop-block-title">Android Device Required</h1>
          <div class="desktop-block-badge">Proprietary Software: DV-Piano</div>
          <p class="desktop-block-text">
            DV-Piano is an ultra-low latency acoustic audio engine built exclusively for native Android handheld touchscreens.
          </p>
          <p class="desktop-block-text">
            Access from desktop computers and non-Android environments is strictly disabled by architectural policy.
          </p>
          <p class="desktop-block-text" style="color: #60a5fa; font-weight: 700;">
            Please open this URL directly from your Android smartphone or tablet to play.
          </p>
        </div>
      `;
      document.body.appendChild(blocker);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enforceAndroidOnly);
  } else {
    enforceAndroidOnly();
  }
})();