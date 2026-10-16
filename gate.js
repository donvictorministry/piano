
(function () {
  'use strict';

  var CONFIG = {
    ENDPOINT: 'https://script.google.com/macros/s/AKfycbxL0s590nsILqRu3pHfDq3h9NJAUo4Fs65KtJrZzmjwPs38vBfM3GbrGxVZlQhB-dDDkQ/exec',    
    STATUS_CSV: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR56DgPzQNm5SJ7j1N3u2LE81FEwI2b9rIZfJny5XhyfERtqW57ODjiLH6HdO-MRsN-wZlUb7jAH4bM/pub?gid=1497147489&single=true&output=csv', 
    GATE_ID: 'APP-001',                             
    PREFIX_OBF: 'ODg3Nw==',
    POLL_MS: 5000,
    ADMIN_EMAIL: 'admin@example.com',
    ADMIN_WHATSAPP: '2340000000000'                
  };

  if (document.getElementById('dv-gate-host')) return;

  var K_AUTH = 'dvg_auth', K_DEV = 'dvg_dev', K_THEME = 'dvg_theme';
  var MSG = {
    INVALID_PIN: 'This PIN is not valid.',
    USED: 'This PIN has already been used.',
    EXPIRED: 'Your access has expired. Enter a new PIN.',
    UNAVAILABLE: 'Service is unavailable. Try again later.',
    NETWORK: 'Network error. Check your connection and try again.',
    ERROR: 'Something went wrong. Try again.',
    REMOVED: 'Your access is no longer available.'
  };

  function prefix() { return atob(CONFIG.PREFIX_OBF).split('').reverse().join(''); }

  /* ---------- storage ---------- */
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function rand() {
    var a = new Uint8Array(16); crypto.getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  function deviceId() {
    var d = lsGet(K_DEV);
    if (!d || !/^[\w-]{16,64}$/.test(d)) { d = rand(); lsSet(K_DEV, d); }
    return d;
  }
  function readAuth() {
    try {
      var a = JSON.parse(lsGet(K_AUTH));
      return a && typeof a.pid === 'string' && typeof a.exp === 'number' ? a : null;
    } catch (e) { return null; }
  }
  async function sha(s) {
    var b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
  }

  /* ---------- icons (inline SVG) ---------- */
  function svg(inner) {
    return '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }
  var ICON = {
    eye: svg('<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>'),
    eyeOff: svg('<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
    moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
    wa: svg('<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.8-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2z" fill="currentColor"/>')
  };

  /* ---------- styles (Shadow DOM, no breakpoints, every size >= 19px) ---------- */
  var CSS =
    ':host{all:initial;position:fixed;inset:0;z-index:2147483647;display:block;font-family:Roboto,sans-serif;' +
    'font-size:clamp(19px,5.2vw,26px);line-height:1.4}' +
    '*{box-sizing:border-box;margin:0;font-family:inherit;font-size:inherit}' +
    '.root{--bg:#FFFFFF;--fg:#1C1E21;--muted:#4B4F56;--card:#F0F2F5;--line:#CED0D4;--brand:#1877F2;--onbrand:#FFFFFF;--err:#C62828;' +
    'position:relative;width:100dvw;height:100dvh;display:flex;flex-direction:column;background:var(--bg);color:var(--fg);overflow:hidden;' +
    'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}' +
    '.root[data-theme=dark]{--bg:#18191A;--fg:#E4E6EB;--muted:#B0B3B8;--card:#242526;--line:#3E4042;--brand:#4599FF;--onbrand:#101010;--err:#FF7B7B}' +
    '.tick{overflow:hidden;white-space:nowrap;background:var(--card);border-bottom:1px solid var(--line);flex:none}' +
    '.track{display:inline-flex;padding:.25em 0;animation:tick var(--d,20s) linear infinite}' +
    '.item{padding:.2em .8em;margin-right:1em;border-radius:.4em}' +
    '@keyframes tick{from{transform:translateX(100dvw)}to{transform:translateX(-100%)}}' +
    '.bar{display:flex;justify-content:flex-end;padding:.5em;flex:none}' +
    '.ib{width:56px;height:56px;flex:none;border-radius:50%;border:1px solid var(--line);background:var(--card);color:var(--fg);' +
    'display:grid;place-items:center;cursor:pointer;padding:0}' +
    '.main{flex:1;width:100%;display:flex;flex-direction:column;justify-content:center;gap:1em;padding:1.2em;overflow:auto}' +
    '.title{font-size:1.5em;font-weight:700;text-align:center}' +
    '.sub{color:var(--muted);text-align:center}' +
    '.btn{width:100%;min-height:3em;border:0;border-radius:.6em;background:var(--brand);color:var(--onbrand);font-weight:700;cursor:pointer}' +
    '.btn.alt{background:var(--card);color:var(--fg);border:1px solid var(--line)}' +
    '.field{display:flex;align-items:center;gap:.25em;border:2px solid var(--line);border-radius:.6em;background:var(--card);padding-right:.25em}' +
    '.field:focus-within{border-color:var(--brand)}' +
    '.field input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--fg);padding:.8em;letter-spacing:.15em}' +
    '.field .ib{border:0;background:transparent}' +
    '.msg{min-height:1.4em;color:var(--err);text-align:center;font-weight:500}' +
    '.contact{display:flex;flex-wrap:wrap;gap:1em;justify-content:center}' +
    '.contact a{display:flex;align-items:center;gap:.5em;min-height:56px;padding:.5em 1em;border-radius:.6em;' +
    'background:var(--card);border:1px solid var(--line);color:var(--fg);text-decoration:none;font-weight:500}' +
    '.load{position:absolute;inset:0;display:none;place-items:center;background:rgba(0,0,0,.4);z-index:5}' +
    '.load.on{display:grid}' +
    '.spin{width:64px;height:64px;border-radius:50%;border:8px solid rgba(255,255,255,.55);border-top-color:var(--brand);animation:spin .9s linear infinite}' +
    '@keyframes spin{to{transform:rotate(360deg)}}';

  /* ---------- DOM helpers ---------- */
  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function clear(e) { while (e.firstChild) e.removeChild(e.firstChild); }
  function ibtn(icon, label, fn) {
    var b = h('button', 'ib'); b.type = 'button'; b.innerHTML = icon;
    b.setAttribute('aria-label', label); b.onclick = fn; return b;
  }
  function btn(label, fn, alt) {
    var b = h('button', 'btn' + (alt ? ' alt' : ''), label); b.type = 'button'; b.onclick = fn; return b;
  }

  /* ---------- shell ---------- */
  var theme = lsGet(K_THEME) === 'dark' ? 'dark' : 'light';
  var host = h('div'); host.id = 'dv-gate-host';
  var shadow = host.attachShadow({ mode: 'open' });
  var style = h('style'); style.textContent = CSS;
  var app = h('div', 'root'); app.setAttribute('data-theme', theme);
  var tickEl = h('div', 'tick'); tickEl.hidden = true;
  var bar = h('div', 'bar');
  var themeBtn = ibtn(theme === 'dark' ? ICON.sun : ICON.moon, 'Toggle dark mode', function () {
    theme = theme === 'dark' ? 'light' : 'dark';
    app.setAttribute('data-theme', theme); lsSet(K_THEME, theme);
    themeBtn.innerHTML = theme === 'dark' ? ICON.sun : ICON.moon;
  });
  bar.appendChild(themeBtn);
  var main = h('div', 'main');
  var loader = h('div', 'load'); loader.setAttribute('role', 'status'); loader.setAttribute('aria-label', 'Loading');
  loader.appendChild(h('div', 'spin'));
  app.appendChild(tickEl); app.appendChild(bar); app.appendChild(main); app.appendChild(loader);
  shadow.appendChild(style); shadow.appendChild(app);

  // >>> ATTENTION: the gate is attached to the page only when needed (unauthorised, expired or revoked).
  var isOpen = false, prevOverflow = '';
  function open() {
    if (isOpen) return;
    isOpen = true;
    prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(host);
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    document.documentElement.style.overflow = prevOverflow;
    host.remove();
  }

  var busy = 0;
  function load(d) { busy += d; loader.className = 'load' + (busy > 0 ? ' on' : ''); }

  function setTicker(list) {
    if (!list || !list.length) return;
    clear(tickEl);
    var tr = h('div', 'track'), chars = 0;
    list.forEach(function (m) {
      var s = h('span', 'item', m.t);
      if (m.bg) s.style.background = m.bg;
      if (m.fg) s.style.color = m.fg;
      tr.appendChild(s); chars += m.t.length;
    });
    tr.style.setProperty('--d', Math.max(15, Math.round(chars * 0.3)) + 's');
    tickEl.appendChild(tr); tickEl.hidden = false;
  }

  /* ---------- GAS calls (always show the spinner) ---------- */
  async function call(body) {
    load(1);
    try {
      var res = await fetch(CONFIG.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body)
      });
      if (!res.ok) return { ok: false, code: 'NETWORK' };
      return await res.json();
    } catch (e) {
      return { ok: false, code: 'NETWORK' };
    } finally {
      load(-1);
    }
  }

  function originOf(u) { try { return u ? new URL(u).origin : ''; } catch (e) { return ''; } }

  async function telemetry() {
    var t = {
      ua: navigator.userAgent,
      screen: screen.width + 'x' + screen.height,
      tz: (Intl.DateTimeFormat().resolvedOptions().timeZone) || '',
      ref: originOf(document.referrer)
    };
    var timer;
    try {
      var c = new AbortController();
      timer = setTimeout(function () { c.abort(); }, 4000);
      var res = await fetch('https://ipapi.co/json/', { signal: c.signal });
      var j = await res.json();
      t.country = j.country_name || ''; t.city = j.city || ''; t.isp = j.org || '';
      t.tz = j.timezone || t.tz;
      var n = navigator.connection;
      t.mobile = [j.asn, n && n.effectiveType].filter(Boolean).join(' ');
    } catch (e) { /* telemetry is best effort */ } finally { clearTimeout(timer); }
    return t;
  }

  /* ---------- views ---------- */
  function viewStart() {
    clear(main);
    main.appendChild(h('h1', 'title', 'Access Required'));
    main.appendChild(h('p', 'sub', 'Tap Get Started to enter your PIN.'));
    main.appendChild(btn('Get Started', function () { viewPin(''); }));
  }

  function viewPin(note) {
    clear(main);
    var inp = h('input');
    inp.type = 'password'; inp.inputMode = 'numeric'; inp.maxLength = 12;
    inp.autocomplete = 'off'; inp.spellcheck = false; inp.placeholder = '12-digit PIN';
    inp.setAttribute('aria-label', 'PIN');
    var shown = false;
    var eye = ibtn(ICON.eye, 'Show PIN', function () {
      shown = !shown; inp.type = shown ? 'text' : 'password';
      eye.innerHTML = shown ? ICON.eyeOff : ICON.eye;
      eye.setAttribute('aria-label', shown ? 'Hide PIN' : 'Show PIN');
    });
    var field = h('div', 'field'); field.appendChild(inp); field.appendChild(eye);
    var msg = h('p', 'msg', note || ''); msg.setAttribute('role', 'alert');
    function say(t) { msg.textContent = t; }

    inp.oninput = function () { inp.value = inp.value.replace(/\D/g, ''); say(''); };
    inp.onkeydown = function (e) { if (e.key === 'Enter') submit(); };

    async function submit() {
      var pin = inp.value;
      if (pin.length !== 12) return say('Enter all 12 digits of your PIN.');
      if (pin.slice(0, 4) !== prefix()) return say(MSG.INVALID_PIN);   // never reaches the server
      var r, did = deviceId();
      load(1);
      try {
        var tel = await telemetry();
        r = await call({ a: 'activate', pin: pin, did: did, gid: CONFIG.GATE_ID, t: tel });
      } finally { load(-1); }

      if (r.ok) {
        inp.value = '';
        var hh = '';
        try { hh = await sha(r.pid + ':' + did); } catch (e) {}
        lsSet(K_AUTH, JSON.stringify({ pid: r.pid, exp: r.exp, h: hh, seen: false }));
        close();
        return watch();
      }
      if (r.code === 'NETWORK' || r.code === 'ERROR' || r.code === 'UNAVAILABLE') return say(MSG[r.code]);
      inp.value = '';
      if (r.code === 'REVOKED') return viewBlocked(r.msg || 'Access Denied', true);
      say(MSG[r.code] || MSG.ERROR);
    }

    main.appendChild(h('h1', 'title', 'Enter PIN'));
    main.appendChild(h('p', 'sub', 'Type the 12-digit PIN you received.'));
    main.appendChild(field);
    main.appendChild(msg);
    main.appendChild(btn('Verify', submit));
    inp.focus();
  }

  function contact() {
    var w = h('div', 'contact');
    var m = h('a'); m.href = 'mailto:' + CONFIG.ADMIN_EMAIL + '?subject=' + encodeURIComponent('Access request');
    m.setAttribute('aria-label', 'Email administrator'); m.innerHTML = ICON.mail; m.appendChild(h('span', '', 'Email'));
    var a = h('a'); a.href = 'https://wa.me/' + CONFIG.ADMIN_WHATSAPP + '?text=' + encodeURIComponent('Hello, I need help with my access.');
    a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('aria-label', 'WhatsApp administrator'); a.innerHTML = ICON.wa; a.appendChild(h('span', '', 'WhatsApp'));
    w.appendChild(m); w.appendChild(a);
    return w;
  }

  function viewBlocked(text, canRetry) {
    clear(main);
    main.appendChild(h('h1', 'title', 'Access Restricted'));
    main.appendChild(h('p', 'sub', text));
    main.appendChild(h('p', 'sub', 'Contact the administrator:'));
    main.appendChild(contact());
    if (canRetry) main.appendChild(btn('Enter PIN', function () { viewPin(''); }, true));
  }

  /* ---------- revocation watch: reads the published CSV (not GAS) every POLL_MS ---------- */
  // >>> ATTENTION: returns null (no change) or { msg } (lock the user out).
  // A BLOCKED row always locks. A missing row locks only after this device has seen its own OK row once,
  // so Google's publish delay right after activation can never lock out a new user.
  function judge(text, a) {
    var lines = text.split(/\r?\n/);
    if (lines[0].indexOf('TokenHash') !== 0) return null;          // not our CSV (error page): ignore
    for (var i = 1; i < lines.length; i++) {
      var f = lines[i].split(',');
      if (f[0] !== a.h) continue;
      if (f[1] === 'OK') {
        if (!a.seen) { a.seen = true; lsSet(K_AUTH, JSON.stringify(a)); }
        return null;
      }
      return { msg: f[2] || MSG.REMOVED };
    }
    return a.seen ? { msg: MSG.REMOVED } : null;
  }

  function lockOut(msg) {
    lsDel(K_AUTH);
    open();
    viewBlocked(msg, true);
  }

  async function poll() {
    var a = readAuth();
    if (!a) return;
    if (a.exp <= Date.now()) return lockOut(MSG.EXPIRED);
    if (a.h && CONFIG.STATUS_CSV.indexOf('http') === 0) {
      try {
        var res = await fetch(CONFIG.STATUS_CSV + '&_=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
          var v = judge(await res.text(), a);
          if (v) return lockOut(v.msg);
        }
      } catch (e) { /* offline: keep access, try again */ }
    }
    setTimeout(poll, CONFIG.POLL_MS);
  }

  function watch() { poll(); }

  /* ---------- start ---------- */
  async function start() {
    var a = readAuth();
    if (a && a.exp > Date.now()) return watch();      // authorised: zero GAS calls, gate never shown
    var expired = false;
    if (a) { lsDel(K_AUTH); expired = true; }

    open();
    var r = await call({ a: 'ticker' });
    if (r.ticker) setTicker(r.ticker);
    if (expired) viewBlocked(MSG.EXPIRED, true); else viewStart();
  }

  start();
})();
