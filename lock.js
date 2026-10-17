(function () {
    'use strict';

    var LOCK_CODE = [100, 120, 22, 78];
    var CFG = { SESSION_KEY: 'dvFrontLock', REMEMBER: 'session', TITLE: 'Enter Access Code' };
    var M = 7, A = 13, K = 90;

    function ok(s) {
        if (!/^\d{4}$/.test(s)) return false;
        for (var i = 0; i < 4; i++) { if ((((+s.charAt(i)) * M + A) ^ K) !== LOCK_CODE[i]) return false; }
        return true;
    }
    function store() { try { return CFG.REMEMBER === 'session' ? sessionStorage : localStorage; } catch (e) { return null; } }
    function unlocked() { var s = store(); try { return !!s && s.getItem(CFG.SESSION_KEY) === '1'; } catch (e) { return false; } }
    function remember() { var s = store(); try { if (s) s.setItem(CFG.SESSION_KEY, '1'); } catch (e) {} }

    if (unlocked()) return;

    var css = document.createElement('style');
    css.textContent =
        'html.dvl-on body{visibility:hidden!important}' +
        '#dvl{position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;background:#1877F2;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Roboto,sans-serif;font-size:19px;-webkit-tap-highlight-color:transparent;visibility:visible}' +
        '#dvl .b{width:100%;max-width:420px;background:#fff;color:#1f2937;border-radius:20px;padding:28px 24px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,.4)}' +
        '#dvl .s{width:76px;height:76px;margin:0 auto 16px;border-radius:50%;background:#dbeafe;color:#1877F2;display:flex;align-items:center;justify-content:center}' +
        '#dvl h1{font-size:26px;font-weight:900;margin:0 0 4px;line-height:1.2}' +
        '#dvl p{color:#6b7280;margin:0 0 20px;line-height:1.5}' +
        '#dvl .c{display:flex;justify-content:center;gap:12px;margin:8px 0 8px}' +
        '#dvl input{width:60px;height:72px;box-sizing:border-box;padding:0;margin:0;text-align:center;font:900 32px Roboto,sans-serif;color:#1f2937;background:#fff;border:2px solid #d1d5db;border-radius:14px;outline:0}' +
        '#dvl input:focus{border-color:#1877F2;box-shadow:0 0 0 4px rgba(24,119,242,.18)}' +
        '#dvl .c.x{animation:dvlx .35s}' +
        '#dvl .m{min-height:28px;color:#dc2626;font-weight:700;margin:0}' +
        '@keyframes dvlx{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}';
    document.head ? document.head.appendChild(css) : document.documentElement.appendChild(css);
    document.documentElement.classList.add('dvl-on');

    var box = document.createElement('div');
    box.id = 'dvl';
    box.innerHTML =
        '<div class="b"><div class="s"><svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg></div>' +
        '<h1>' + CFG.TITLE + '</h1><p>This app is private.</p>' +
        '<div class="c"><input type="tel" inputmode="numeric" maxlength="1" pattern="[0-9]*" aria-label="Digit"><input type="tel" inputmode="numeric" maxlength="1" pattern="[0-9]*" aria-label="Digit"><input type="tel" inputmode="numeric" maxlength="1" pattern="[0-9]*" aria-label="Digit"><input type="tel" inputmode="numeric" maxlength="1" pattern="[0-9]*" aria-label="Digit"></div>' +
        '<p class="m" id="dvl-m"></p></div>';

    function mount() {
        document.documentElement.appendChild(box);
        var ins = box.querySelectorAll('input'), row = box.querySelector('.c'), msg = box.querySelector('#dvl-m');
        function val() { return [].map.call(ins, function (i) { return i.value; }).join(''); }
        function clear() { for (var i = 0; i < 4; i++) ins[i].value = ''; ins[0].focus(); }
        function check(code) {
            if (ok(code)) {
                remember();
                box.parentNode.removeChild(box);
                document.documentElement.classList.remove('dvl-on');
            } else {
                msg.textContent = 'Incorrect code.';
                row.classList.add('x');
                setTimeout(function () { row.classList.remove('x'); clear(); }, 400);
                setTimeout(function () { msg.textContent = ''; }, 2000);
            }
        }
        [].forEach.call(ins, function (inp, i) {
            inp.addEventListener('input', function () {
                inp.value = inp.value.replace(/\D/g, '').slice(-1);
                if (inp.value && i < 3) ins[i + 1].focus();
                if (val().length === 4) check(val());
            });
            inp.addEventListener('keydown', function (e) {
                if (e.key === 'Backspace' && !inp.value && i > 0) { ins[i - 1].value = ''; ins[i - 1].focus(); }
            });
            inp.addEventListener('paste', function (e) {
                var t = ((e.clipboardData && e.clipboardData.getData('text')) || '').replace(/\D/g, '').slice(0, 4);
                if (!t) return;
                e.preventDefault();
                for (var j = 0; j < t.length; j++) ins[j].value = t.charAt(j);
                if (t.length === 4) check(t); else ins[t.length].focus();
            });
        });
        ins[0].focus();
    }

    if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();