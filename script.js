// 💾 LOVE.exe — a retro installer that installs love. Made by @hack.n.code
(() => {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const CAPTURE = params.has('capture');

  // ---------- pixel art ----------
  const HEART = [
    '..XXX...XXX..',
    '.XoXXX.XXXXX.',
    'XooXXXXXXXXXX',
    'XoXXXXXXXXXXX',
    'XXXXXXXXXXXXX',
    '.XXXXXXXXXXX.',
    '..XXXXXXXXX..',
    '...XXXXXXX...',
    '....XXXXX....',
    '.....XXX.....',
    '......X......',
  ];
  const MINI = ['.X.X.', 'XXXXX', 'XXXXX', '.XXX.', '..X..'];

  function heartIcon(size = 4) {
    const c = document.createElement('canvas');
    c.width = 13 * size; c.height = 11 * size;
    const g = c.getContext('2d');
    HEART.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === '.') return;
      g.fillStyle = ch === 'o' ? '#ffd6e8' : (y < 5 ? '#ff4f93' : '#e8114f');
      g.fillRect(x * size, y * size, size, size);
    }));
    return c.toDataURL();
  }
  const ICON = heartIcon(4);
  $('ico').style.backgroundImage = `url(${ICON})`;
  $('ico2').style.backgroundImage = `url(${ICON})`;
  { const g = $('sideHeart').getContext('2d'); const im = new Image(); im.onload = () => { g.imageSmoothingEnabled = false; g.drawImage(im, 0, 0, 13, 11); }; im.src = heartIcon(1); }

  // ---------- install script (seconds) ----------
  const STEPS = [
    { t: 0.0, text: 'Scanning heart…',            res: 'found 1 crush ❤️', cls: 'pk' },
    { t: 1.1, text: 'Removing ego.dll…',          res: 'deleted ✔',        cls: 'ok' },
    { t: 2.1, text: 'Deleting overthinking.tmp…', res: 'done ✔',           cls: 'ok' },
    { t: 3.0, text: 'Installing butterflies.sys 🦋', res: 'ok ✔',          cls: 'ok' },
    { t: 3.9, text: 'Installing hugs…',           res: '99%… 🥺',          cls: 'wa' },
    { t: 5.3, text: 'Syncing heartbeats 💓',       res: '100% ✔',           cls: 'pk' },
  ];
  const INSTALL = 6.6;                       // total install time
  const PROG = [[0, 0], [1.1, 18], [2.1, 37], [3.0, 55], [3.9, 74], [4.6, 99], [5.5, 99], [6.2, 100]];
  function progress(t) {
    for (let i = 1; i < PROG.length; i++) {
      const [t0, p0] = PROG[i - 1], [t1, p1] = PROG[i];
      if (t <= t1) return p0 + (p1 - p0) * Math.max(0, (t - t0) / (t1 - t0));
    }
    return 100;
  }

  // ---------- deterministic randomness ----------
  const rnd = (a, b = 0) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const back = (x) => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

  // ---------- state ----------
  const S = { phase: 'idle', t: 0, name: params.get('name') || '' };
  const input = $('name');
  input.value = S.name.slice(0, 18);
  if (S.name) $('welcome').textContent = 'Someone wants to install LOVE.exe for you 💌';

  const displayName = () => (S.name.trim() || '');

  // ---------- render ----------
  const fx = $('fx'), g = fx.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2.5);
    W = innerWidth; H = innerHeight;
    fx.width = Math.round(W * DPR); fx.height = Math.round(H * DPR);
  }
  resize(); addEventListener('resize', resize);

  let lastLogKey = '';
  function renderInstall(t) {
    $('forName').textContent = displayName() || 'you';
    const p = progress(t);
    $('fill').style.width = p.toFixed(1) + '%';
    $('pct').textContent = Math.floor(p) + '%';
    let cur = 0; STEPS.forEach((s, i) => { if (t >= s.t) cur = i; });
    const st = STEPS[cur];
    const stall = t > 4.6 && t < 5.5;
    $('step').textContent = stall ? 'Installing hugs 99%… 🥺' : st.text;
    $('eta').textContent = t > 6.2 ? 'time left: 0s ✔' : (stall ? 'time left: 1 more hug' : 'time left: forever ♾️');
    // log
    const lines = [];
    STEPS.forEach((s, i) => {
      if (t < s.t) return;
      const next = STEPS[i + 1] ? STEPS[i + 1].t : 6.2;
      const showRes = t >= next - 0.25 || (i === 0 && t >= 0.7);
      lines.push(`<div>&gt; ${s.text} ${showRes ? `<span class="${s.cls}">${s.res}</span>` : '<span class="blink">▌</span>'}</div>`);
    });
    if (t >= 6.2) lines.push('<div class="ok">&gt; LOVE.exe installed successfully ❤</div>');
    const key = lines.join('');
    if (key !== lastLogKey) { $('log').innerHTML = key; lastLogKey = key; }
  }

  function drawPixelHeart(cx, cy, px, t, glow) {
    const cells = [];
    HEART.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') cells.push([x, y, ch]); }));
    const w = 13 * px, h = 11 * px;
    g.save();
    g.shadowColor = 'rgba(255,40,120,0.95)';
    g.shadowBlur = glow * px * 1.6 * DPR;
    for (const [x, y, ch] of cells) {
      // pixels pop in along a diagonal wave
      const d = (x + y) / 22;
      const k = back((t - 0.15 - d * 0.55) / 0.35);
      if (k <= 0.001) continue;
      const s = px * Math.min(k, 1.25) * 0.92;
      const X = cx - w / 2 + x * px + px / 2, Y = cy - h / 2 + y * px + px / 2;
      const grad = y / 10;
      g.fillStyle = ch === 'o' ? '#ffe3f0' : `rgb(255,${Math.round(95 - grad * 70)},${Math.round(160 - grad * 80)})`;
      g.fillRect((X - s / 2) * DPR, (Y - s / 2) * DPR, s * DPR, s * DPR);
    }
    g.restore();
  }

  function drawMini(x, y, s, color, a) {
    g.globalAlpha = a; g.fillStyle = color;
    MINI.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'X') g.fillRect((x + (i - 2.5) * s) * DPR, (y + (j - 2.5) * s) * DPR, s * DPR + 0.5, s * DPR + 0.5); }));
    g.globalAlpha = 1;
  }

  const COLORS = ['#ff4f93', '#ff8fc0', '#ffd1e6', '#ffd166', '#ffffff', '#c39bff', '#ff2e63'];
  function renderDone(t) {
    const done = $('done');
    const a = clamp(t / 0.45);
    done.style.opacity = a;
    done.classList.toggle('on', a > 0.5);
    // window closes
    const win = $('win');
    const wk = clamp(t / 0.35);
    win.style.opacity = 1 - wk;
    win.style.transform = `translateX(-50%) scale(${1 - 0.25 * wk})`;

    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, fx.width, fx.height);
    const u = Math.min(W / 100, H / 177.8);
    // rising background hearts
    for (let i = 0; i < 26; i++) {
      const sp = 0.05 + rnd(i, 1) * 0.06;
      const y = ((rnd(i, 2) - t * sp) % 1 + 1) % 1;
      const x = rnd(i, 3) * W + Math.sin(t * 1.2 + i) * 8;
      drawMini(x, y * H * 1.1 - 0.05 * H, (0.5 + rnd(i, 4) * 0.7) * u * 0.55, i % 3 ? '#ff4f93' : '#c39bff', 0.18 * clamp(t / 1.2));
    }
    // heartbeat
    const ph = (t % 1.05) / 1.05;
    const beat = Math.exp(-Math.pow((ph - 0.08) / 0.05, 2)) + 0.6 * Math.exp(-Math.pow((ph - 0.28) / 0.05, 2));
    const cx = W / 2, cy = H * 0.44;
    const px = Math.min(W * 0.62, H * 0.34) / 13 * (1 + 0.07 * beat * clamp((t - 1) / 0.5));
    drawPixelHeart(cx, cy, px, t, 10 + 14 * beat);
    // fireworks: bursts of tiny pixel hearts
    const T0 = 0.8, GAP = 0.6, LIFE = 1.9;
    const kMin = Math.max(0, Math.ceil((t - T0 - LIFE) / GAP)), kMax = Math.floor((t - T0) / GAP);
    for (let k = kMin; k <= kMax; k++) {
      const tb = T0 + k * GAP, dt = t - tb;
      if (dt < 0 || dt > LIFE) continue;
      const side = k % 2 ? 1 : -1;
      const bx = W * (0.5 + side * (0.12 + rnd(k, 7) * 0.26));
      const by = H * (0.13 + rnd(k, 8) * 0.22) + (k === 0 ? H * 0.2 : 0);
      const N = 18;
      for (let i = 0; i < N; i++) {
        const ang = (i / N) * Math.PI * 2 + rnd(k, i) * 0.4;
        const v = (110 + rnd(k, i + 50) * 120) * u / 4;
        const x = bx + Math.cos(ang) * v * dt;
        const y = by + Math.sin(ang) * v * dt + 0.5 * 55 * u / 4 * dt * dt;
        const al = clamp(1 - dt / LIFE) * clamp(dt / 0.08);
        drawMini(x, y, u * (0.8 + rnd(k, i + 9) * 0.5), COLORS[(i + k) % COLORS.length], al);
      }
      // flash
      g.globalAlpha = clamp(1 - dt / 0.25) * 0.8; g.fillStyle = '#fff';
      g.fillRect((bx - u) * DPR, (by - u) * DPR, 2 * u * DPR, 2 * u * DPR); g.globalAlpha = 1;
    }
    // texts
    $('dTop').style.opacity = clamp((t - 0.6) / 0.3);
    const nm = displayName();
    const full = 'I LOVE YOU' + (nm ? ',' : ' ❤');
    const nChars = Math.floor(clamp((t - 0.9) / 0.6) * full.length + 0.001);
    $('dMsg').querySelector('.a').textContent = full.slice(0, nChars) || '\u00a0';
    const n = $('dName');
    n.textContent = nm || 'For you';
    const nk = clamp((t - 1.55) / 0.35);
    n.style.opacity = nk; n.style.transform = `scale(${0.6 + 0.4 * back(nk)})`;
    $('dBtns').style.opacity = clamp((t - 2.0) / 0.3);
  }

  function render() {
    const idle = S.phase === 'idle';
    $('pIdle').style.display = idle ? 'block' : 'none';
    $('pInst').style.display = idle ? 'none' : 'block';
    if (S.phase === 'install' || S.phase === 'done') renderInstall(Math.min(S.t, INSTALL));
    if (S.phase === 'done') renderDone(S.t - INSTALL);
    else { $('done').style.opacity = 0; $('done').classList.remove('on'); const w = $('win'); w.style.opacity = 1; w.style.transform = 'translateX(-50%)'; }
    const now = new Date(); $('clock').textContent = CAPTURE ? '12:00 AM' : now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  // ---------- live controller ----------
  let t0 = 0;
  function startInstall() {
    S.name = input.value.trim();
    S.phase = 'install'; S.t = 0; t0 = performance.now();
    $('go').classList.add('press'); setTimeout(() => $('go').classList.remove('press'), 150);
    const u = new URL(location.href); if (S.name) u.searchParams.set('name', S.name); else u.searchParams.delete('name');
    history.replaceState(null, '', u);
  }
  function loop(now) {
    if (S.phase !== 'idle') {
      S.t = (now - t0) / 1000;
      if (S.t >= INSTALL && S.phase === 'install') S.phase = 'done';
      render();
    }
    requestAnimationFrame(loop);
  }
  input.addEventListener('input', () => { S.name = input.value; });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') startInstall(); });
  $('go').addEventListener('click', startInstall);
  $('replay').addEventListener('click', () => { S.phase = 'install'; S.t = 0; t0 = performance.now(); lastLogKey = ''; });
  $('cancel').addEventListener('click', () => {
    const w = $('win'); w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake');
    toast('Cancel is not an option 😌');
  });
  $('start').addEventListener('click', () => toast('Start ➜ falling in love ❤'));
  function toast(msg) { const el = $('toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 1800); }
  async function share() {
    const u = new URL(location.origin + location.pathname);
    const nm = (S.phase === 'idle' ? input.value : S.name).trim();
    if (nm) u.searchParams.set('name', nm);
    const data = { title: 'LOVE.exe 💾❤️', text: 'I installed something for you… press Install 💌', url: u.toString() };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(data.url); toast('Link copied! Send it 💌');
    } catch (e) { if (e && e.name !== 'AbortError') { prompt('Copy this link:', data.url); } }
  }
  $('share').addEventListener('click', share);
  $('share2').addEventListener('click', share);

  // ---------- capture hooks (used to record the reel frame by frame) ----------
  window.__render = (st) => {
    Object.assign(S, st);
    input.value = st.typed !== undefined ? st.typed : input.value;
    const c = $('caret');
    if (st.caret) {
      c.style.display = 'block';
      const m = document.createElement('span'); m.style.cssText = 'visibility:hidden;position:absolute;white-space:pre;font:' + getComputedStyle(input).font; m.textContent = input.value; document.body.appendChild(m);
      c.style.left = (parseFloat(getComputedStyle(input).paddingLeft) + m.offsetWidth + 3) + 'px'; m.remove();
    } else c.style.display = 'none';
    $('go').classList.toggle('press', !!st.press);
    render();
  };
  window.__rect = (id) => { const r = $(id).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };

  render();
  if (CAPTURE) document.fonts.ready.then(() => setTimeout(() => { window.__ready = true; }, 300));
  else requestAnimationFrame(loop);
})();
