/* ============================================================
   Quà 20-10 · script.js
   Pháo hoa nổ thành trái tim, vườn hoa, gấu bông, thư tình,
   những bức vẽ tự vẽ nét và nhạc nền tổng hợp bằng Web Audio.
   ============================================================ */
(() => {
'use strict';

/* ---------------- Tiện ích ---------------- */
const CFG = window.GIFT_CONFIG || {};
const HER = CFG.herName || 'Em';
const HIS = CFG.hisName || 'Anh';
const fill = s => String(s == null ? '' : s).replace(/\{her\}/g, HER).replace(/\{his\}/g, HIS);
const cap = s => (s ? s.charAt(0).toLocaleUpperCase('vi') + s.slice(1) : s);
const get = path => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), CFG);
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const NS = 'http://www.w3.org/2000/svg';
const TAU = Math.PI * 2;
const rand = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const isSmall = () => Math.min(window.innerWidth, window.innerHeight) < 600;

const PINKS = ['#ff4d6d', '#ff6b9d', '#ff8fab', '#ffb3c6', '#f72585', '#ff5c8a', '#ffc2d1'];
const GOLDS = ['#ffd166', '#ffe29a', '#fff1b8', '#ffb703'];
const COOLS = ['#8ecae6', '#c77dff', '#b5e48c', '#90e0ef'];

const rgbCache = {};
function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function hexA(hex, a) {
  const rgb = rgbCache[hex] || (rgbCache[hex] = hexToRgb(hex));
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
}
function shade(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  const f = c => clamp(Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt), 0, 255);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
function el(name, attrs = {}, parent) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

/* Đường trái tim (canvas) – s là nửa chiều rộng */
function heartPath(ctx, x, y, s, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  if (rot) ctx.rotate(rot);
  ctx.scale(s / 16, s / 16);
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.bezierCurveTo(0, -8, -4, -12, -8, -12);
  ctx.bezierCurveTo(-13, -12, -16, -8, -16, -3);
  ctx.bezierCurveTo(-16, 3, -10, 8, 0, 14);
  ctx.bezierCurveTo(10, 8, 16, 3, 16, -3);
  ctx.bezierCurveTo(16, -8, 13, -12, 8, -12);
  ctx.bezierCurveTo(4, -12, 0, -8, 0, -5);
  ctx.closePath();
  ctx.restore();
}
/* Điểm trên đường cong trái tim, chuẩn hoá về [-1, 1] (y dương hướng xuống) */
function heartPoint(t) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x: x / 17, y: -y / 17 };
}

/* ---------------- Đổ chữ từ config ---------------- */
function applyTexts() {
  $$('[data-text]').forEach(node => {
    const v = get(node.dataset.text);
    if (v != null) node.textContent = cap(fill(v));
  });
  $$('[data-lines]').forEach(node => {
    const arr = get(node.dataset.lines) || [];
    node.innerHTML = '';
    arr.forEach((line, i) => {
      const s = document.createElement('span');
      s.textContent = fill(line);
      s.style.transitionDelay = (2.3 + i * .4) + 's';
      node.appendChild(s);
    });
  });
  document.title = cap(fill(get('intro.title') || 'Gửi em')) + ' · 20/10';
}

/* ---------------- Canvas ---------------- */
const bgCanvas = $('#bg-canvas'), fxCanvas = $('#fx-canvas');
const bg = bgCanvas.getContext('2d'), fx = fxCanvas.getContext('2d');
let W = 1, H = 1, DPR = 1;

function resize() {
  DPR = clamp(window.devicePixelRatio || 1, 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  for (const c of [bgCanvas, fxCanvas]) {
    c.width = Math.floor(W * DPR); c.height = Math.floor(H * DPR);
    c.style.width = W + 'px'; c.style.height = H + 'px';
  }
  bg.setTransform(DPR, 0, 0, DPR, 0, 0);
  fx.setTransform(DPR, 0, 0, DPR, 0, 0);
  Background.rebuild();
}

/* ---------------- Nền: sao, bokeh, cánh hoa, tim bay ---------------- */
const Background = (() => {
  let stars = [], petals = [], hearts = [], bokeh = [], shoot = null, shootTimer = 3, time = 0;
  const PETAL_COLORS = ['#ff8fab', '#ffb3c6', '#ffc8dd', '#ff6b9d', '#fde2e4', '#ffd1dc'];

  function rebuild() {
    const area = W * H, d = reduceMotion ? .5 : 1;
    stars = Array.from({ length: Math.round(clamp(area / 9000, 60, 240) * d) }, () => ({ x: rand(W), y: rand(H), r: rand(.4, 1.7), ph: rand(TAU), sp: rand(.6, 2) }));
    petals = Array.from({ length: Math.round(clamp(area / 42000, 10, 36) * d) }, () => newPetal(true));
    hearts = Array.from({ length: Math.round(clamp(area / 90000, 5, 16) * d) }, () => newHeart(true));
    bokeh = Array.from({ length: isSmall() ? 5 : 9 }, () => ({ x: rand(W), y: rand(H), r: rand(50, 150), vx: rand(-.12, .12), vy: rand(-.08, .08), c: pick([...PINKS, ...GOLDS, '#c77dff']), a: rand(.05, .12) }));
  }
  function newPetal(any) {
    return { x: rand(-20, W + 20), y: any ? rand(-H * .2, H) : rand(-80, -20), w: rand(6, 13), h: rand(4, 8), vy: rand(.35, .9), vx: rand(-.25, .25), rot: rand(TAU), vr: rand(-.03, .03), ph: rand(TAU), sw: rand(.01, .025), c: pick(PETAL_COLORS), a: rand(.5, .9) };
  }
  function newHeart(any) {
    return { x: rand(W), y: any ? rand(H) : H + rand(20, 80), s: rand(5, 11), vy: rand(.25, .6), ph: rand(TAU), sw: rand(.008, .02), c: pick(PINKS), a: rand(.25, .55), rot: rand(-.4, .4) };
  }
  function update(dt, k) {
    time += dt;
    for (const b of bokeh) {
      b.x += b.vx * k; b.y += b.vy * k;
      if (b.x < -b.r) b.x = W + b.r; else if (b.x > W + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = H + b.r; else if (b.y > H + b.r) b.y = -b.r;
    }
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.ph += p.sw * k; p.x += (p.vx + Math.sin(p.ph) * .6) * k; p.y += p.vy * k; p.rot += p.vr * k;
      if (p.y > H + 30 || p.x < -60 || p.x > W + 60) petals[i] = newPetal(false);
    }
    for (let i = 0; i < hearts.length; i++) {
      const h = hearts[i];
      h.ph += h.sw * k; h.x += Math.sin(h.ph) * .5 * k; h.y -= h.vy * k;
      if (h.y < -30) hearts[i] = newHeart(false);
    }
    if (shoot) {
      shoot.x += shoot.vx * k; shoot.y += shoot.vy * k; shoot.life -= dt;
      if (shoot.life <= 0) shoot = null;
    } else {
      shootTimer -= dt;
      if (shootTimer <= 0) {
        shootTimer = rand(5, 11);
        const life = rand(.6, 1);
        shoot = { x: rand(W * .1, W * .9), y: rand(H * .05, H * .35), vx: rand(6, 10) * (Math.random() < .5 ? -1 : 1), vy: rand(2.5, 4.5), life, max: life };
      }
    }
  }
  function draw() {
    bg.clearRect(0, 0, W, H);
    bg.globalCompositeOperation = 'lighter';
    for (const b of bokeh) {
      const g = bg.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, hexA(b.c, b.a)); g.addColorStop(1, hexA(b.c, 0));
      bg.fillStyle = g; bg.beginPath(); bg.arc(b.x, b.y, b.r, 0, TAU); bg.fill();
    }
    bg.globalCompositeOperation = 'source-over';
    bg.fillStyle = '#fff';
    for (const s of stars) {
      bg.globalAlpha = .3 + .7 * (.5 + .5 * Math.sin(time * s.sp + s.ph));
      bg.beginPath(); bg.arc(s.x, s.y, s.r, 0, TAU); bg.fill();
    }
    bg.globalAlpha = 1;
    if (shoot) {
      const t = shoot.life / shoot.max, len = 11;
      const ex = shoot.x - shoot.vx * len, ey = shoot.y - shoot.vy * len;
      const g = bg.createLinearGradient(shoot.x, shoot.y, ex, ey);
      g.addColorStop(0, `rgba(255,255,255,${.95 * t})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      bg.strokeStyle = g; bg.lineWidth = 2; bg.lineCap = 'round';
      bg.beginPath(); bg.moveTo(shoot.x, shoot.y); bg.lineTo(ex, ey); bg.stroke();
    }
    for (const p of petals) {
      bg.save(); bg.translate(p.x, p.y); bg.rotate(p.rot); bg.globalAlpha = p.a; bg.fillStyle = p.c;
      bg.beginPath(); bg.moveTo(-p.w, 0); bg.quadraticCurveTo(0, -p.h * 1.5, p.w, 0); bg.quadraticCurveTo(0, p.h * 1.5, -p.w, 0); bg.fill();
      bg.globalAlpha = p.a * .5; bg.strokeStyle = '#fff'; bg.lineWidth = .8;
      bg.beginPath(); bg.moveTo(-p.w * .7, 0); bg.quadraticCurveTo(0, -p.h * .3, p.w * .7, 0); bg.stroke();
      bg.restore();
    }
    for (const h of hearts) {
      bg.globalAlpha = h.a; bg.fillStyle = h.c; heartPath(bg, h.x, h.y, h.s, h.rot); bg.fill();
    }
    bg.globalAlpha = 1;
  }
  return { rebuild, update, draw };
})();

/* ---------------- Hiệu ứng: pháo hoa, hạt, confetti, trái tim lớn ---------------- */
const FX = (() => {
  const rockets = [], parts = [], flashes = [], confetti = [];
  const textCache = {};
  const show = { active: false, t: 0, next: 0, idx: 0, plan: [], loop: 24.5 };
  const finale = { active: false, t: 0, parts: [], rain: 0, fw: 0 };
  let lastTrail = 0;
  const scale = () => clamp(Math.min(W, H) / 720, .55, 1.15);
  const mk = o => { o.max = o.life; return o; };

  function launch(opts = {}) {
    if (rockets.length > 10) return;
    const x = opts.x !== undefined ? clamp(opts.x, 30, W - 30) : rand(W * .15, W * .85);
    const ty = opts.y !== undefined ? clamp(opts.y, H * .08, H * .7) : rand(H * .12, H * .45);
    const g = .085, sy = H + 8;
    rockets.push({
      x, y: sy, vx: rand(-.25, .25), vy: -Math.sqrt(2 * g * (sy - ty)), g,
      type: opts.type || pick(['chrys', 'heart', 'ring', 'heart', 'willow', 'chrys', 'crackle']),
      color: opts.color || pick([...PINKS, ...GOLDS, ...COOLS]), text: opts.text, trail: []
    });
  }
  function salvo(n, gap) { for (let i = 0; i < n; i++) setTimeout(() => launch(), i * gap); }

  function startShow() {
    show.active = true; show.t = 0; show.idx = 0; show.next = 1.4;
    show.plan = [
      { at: .05, fn: () => salvo(5, 170) },
      { at: 2.4, fn: () => launch({ type: 'heart', x: W * .5, y: H * .26, color: '#ff4d6d' }) },
      { at: 4.6, fn: () => launch({ type: 'text', text: '20 · 10', x: W * .5, y: H * .15, color: '#ffd166' }) },
      { at: 8.2, fn: () => { launch({ type: 'heart', x: W * .25, y: H * .33, color: '#ff6b9d' }); launch({ type: 'heart', x: W * .75, y: H * .33, color: '#f72585' }); } },
      { at: 10.8, fn: () => launch({ type: 'text', text: 'I ♥ U', x: W * .5, y: H * .15, color: '#ff8fab' }) },
      { at: 14.2, fn: () => salvo(6, 130) },
      { at: 17.2, fn: () => launch({ type: 'text', text: 'Anh yêu em', x: W * .5, y: H * .15, color: '#ffc2d1' }) },
      { at: 21.2, fn: () => { launch({ type: 'willow', x: W * .5, y: H * .2 }); launch({ type: 'heart', x: W * .5, y: H * .42, color: '#ff4d6d' }); } }
    ];
  }
  function stopShow() { show.active = false; }

  /* --- Nổ --- */
  function burst(x, y, type, color, text) {
    const s = scale();
    flashes.push({ x, y, r: rand(70, 130) * s, life: 1, c: color });
    switch (type) {
      case 'heart': burstHeart(x, y, color, s); break;
      case 'ring': burstRing(x, y, color, s); break;
      case 'willow': burstWillow(x, y, s); break;
      case 'crackle': burstChrys(x, y, color, s, true); break;
      case 'text': burstText(x, y, text || '20 · 10', color, s); break;
      default: burstChrys(x, y, color, s, false);
    }
    Music.boom(type === 'text' ? 1.2 : .8);
  }
  function burstChrys(x, y, color, s, crackle) {
    const n = Math.round(rand(80, 130) * (isSmall() ? .7 : 1));
    const c2 = Math.random() < .5 ? '#ffffff' : pick(GOLDS);
    for (let i = 0; i < n; i++) {
      const a = rand(TAU), sp = rand(1, 7.5) * s;
      parts.push(mk({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: .045, fr: .955, life: rand(55, 95), size: rand(1.4, 2.6), c: Math.random() < .75 ? color : c2, mode: 'dot', tw: Math.random() < .5, ph: rand(TAU), split: crackle && Math.random() < .35 ? rand(20, 40) : 0 }));
    }
  }
  function burstRing(x, y, color, s) {
    const n = 90, sp = rand(4.5, 6.5) * s, squash = rand(.7, 1);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU, r = sp * (1 + rand(-.04, .04));
      parts.push(mk({ x, y, vx: Math.cos(a) * r, vy: Math.sin(a) * r * squash, g: .035, fr: .965, life: rand(60, 80), size: 2.2, c: color, mode: 'dot', tw: true, ph: rand(TAU) }));
    }
    for (let i = 0; i < 40; i++) {
      const a = rand(TAU), r = sp * .45;
      parts.push(mk({ x, y, vx: Math.cos(a) * r, vy: Math.sin(a) * r, g: .035, fr: .965, life: rand(50, 70), size: 1.8, c: '#ffffff', mode: 'dot' }));
    }
  }
  function burstWillow(x, y, s) {
    const n = Math.round(110 * (isSmall() ? .7 : 1));
    for (let i = 0; i < n; i++) {
      const a = rand(TAU), sp = rand(1.5, 5.5) * s;
      parts.push(mk({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, g: .05, fr: .985, life: rand(120, 170), size: rand(1.2, 2), c: pick(GOLDS), mode: 'dot', streak: 3.5, tw: true, ph: rand(TAU) }));
    }
  }
  function burstHeart(x, y, color, s) {
    const n = isSmall() ? 110 : 160, sp = rand(5.2, 6.5) * s;
    for (let i = 0; i < n; i++) {
      const p = heartPoint((i / n) * TAU + rand(-.01, .01)), j = 1 + rand(-.04, .04);
      parts.push(mk({ x, y, vx: p.x * sp * j, vy: p.y * sp * j, g: .028, fr: .972, life: rand(85, 120), size: rand(1.8, 2.8), c: color, mode: 'dot', tw: true, ph: rand(TAU) }));
    }
    const n2 = Math.round(n * .45), c2 = pick(['#ffffff', '#ffe29a', '#ffc2d1']);
    for (let i = 0; i < n2; i++) {
      const p = heartPoint((i / n2) * TAU);
      parts.push(mk({ x, y, vx: p.x * sp * .55, vy: p.y * sp * .55, g: .028, fr: .972, life: rand(70, 100), size: 1.7, c: c2, mode: 'dot' }));
    }
    for (let i = 0; i < 14; i++) {
      const a = rand(TAU), r = rand(.5, 2.5) * s;
      parts.push(mk({ x, y, vx: Math.cos(a) * r, vy: Math.sin(a) * r - 1, g: .03, fr: .98, life: rand(80, 120), size: rand(4, 7), c: pick(PINKS), mode: 'heart', rot: rand(-.5, .5), vr: rand(-.05, .05) }));
    }
  }
  function sampleText(text) {
    if (textCache[text]) return textCache[text];
    const c = document.createElement('canvas'), g = c.getContext('2d');
    const font = '700 72px Quicksand, "Segoe UI", Arial, sans-serif';
    g.font = font;
    const w = Math.ceil(g.measureText(text).width) + 24, h = 110;
    c.width = w; c.height = h;
    g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
    g.fillText(text, w / 2, h / 2);
    const d = g.getImageData(0, 0, w, h).data, pts = [], step = 3;
    for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (d[(y * w + x) * 4 + 3] > 120) pts.push({ x: x - w / 2, y: y - h / 2 });
    return (textCache[text] = { pts, w, h });
  }
  function burstText(x, y, text, color, s) {
    const { pts, w } = sampleText(text);
    const k = Math.min((W * .84) / w, 1.6 * s);
    const cx = clamp(x, (w * k) / 2 + 10, W - (w * k) / 2 - 10);
    const stride = isSmall() ? 2 : 1;
    for (let i = 0; i < pts.length; i += stride) {
      const p = pts[i];
      parts.push(mk({ x, y, ox: x, oy: y, tx: cx + p.x * k, ty: y + p.y * k, t: 0, form: rand(.8, 1.1), hold: rand(1.8, 2.4), mode: 'shape', phase: 0, size: rand(1.6, 2.4), c: Math.random() < .82 ? color : pick(['#ffffff', ...GOLDS]), life: 1, g: .035, fr: .985, vx: 0, vy: 0, tw: true, ph: rand(TAU) }));
    }
  }
  function heartPop(x, y) {
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * TAU, sp = rand(3, 7);
      parts.push(mk({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, g: .08, fr: .97, life: rand(60, 90), size: rand(5, 10), c: pick(PINKS), mode: 'heart', rot: rand(-.6, .6), vr: rand(-.08, .08) }));
    }
    for (let i = 0; i < 40; i++) {
      const a = rand(TAU), sp = rand(2, 9);
      parts.push(mk({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, g: .05, fr: .96, life: rand(30, 60), size: rand(1.4, 2.4), c: pick(GOLDS), mode: 'dot', tw: true, ph: rand(TAU) }));
    }
    flashes.push({ x, y, r: 180, life: 1, c: '#ffd166' });
    Music.boom(1);
  }
  function confettiBurst(x, y, n = 80) {
    for (let i = 0; i < n; i++) {
      const a = rand(-Math.PI, 0), sp = rand(3, 11);
      confetti.push({ x, y, vx: Math.cos(a) * sp * rand(.5, 1), vy: Math.sin(a) * sp, w: rand(5, 9), h: rand(8, 14), rot: rand(TAU), vr: rand(-.2, .2), c: pick([...PINKS, ...GOLDS, '#ffffff', '#c77dff', '#90e0ef']), life: rand(110, 170), ph: rand(TAU) });
    }
  }
  function trail(x, y) {
    const now = performance.now();
    if (now - lastTrail < 45) return;
    lastTrail = now;
    parts.push(mk({ x: x + rand(-4, 4), y: y + rand(-4, 4), vx: rand(-.4, .4), vy: rand(-1.2, -.3), g: -.01, fr: .98, life: rand(30, 50), size: rand(3, 6), c: pick(PINKS), mode: 'heart', rot: rand(-.5, .5), vr: rand(-.05, .05) }));
  }

  /* --- Màn kết: trái tim lớn hội tụ + mưa tim --- */
  function finaleGeom() { return { cx: W / 2, cy: H * .22, R: Math.min(W * .3, H * .15) }; }
  function finaleStart() {
    finale.active = true; finale.t = 0; finale.rain = .3; finale.fw = 1.4; finale.parts = [];
    const n = isSmall() ? 240 : 400, nOutline = Math.round(n * .4);
    for (let i = 0; i < n; i++) {
      const outline = i < nOutline;
      let tx, ty;
      if (outline) { const p = heartPoint((i / nOutline) * TAU); tx = p.x; ty = p.y; }
      else { const p = heartPoint(rand(TAU)), r = Math.sqrt(Math.random()) * .96; tx = p.x * r; ty = p.y * r; }
      finale.parts.push({ tx, ty, outline, x: rand(W), y: rand(-H * .2, H), c: outline ? pick(['#ffffff', '#ffe29a', '#ffd166']) : pick(PINKS), s: outline ? rand(1.8, 2.8) : rand(1.3, 2.6), ph: rand(TAU), sp: rand(.035, .08) });
    }
    confettiBurst(W / 2, H * .45, 120);
  }
  function finaleStop() {
    finale.active = false;
    for (const p of finale.parts) parts.push(mk({ x: p.x, y: p.y, vx: rand(-1.5, 1.5), vy: rand(-2.5, 0), g: .05, fr: .985, life: rand(50, 90), size: p.s, c: p.c, mode: 'dot' }));
    finale.parts = [];
  }
  function updateFinale(dt, k) {
    finale.t += dt;
    const { cx, cy, R } = finaleGeom();
    const pulse = 1 + .05 * Math.sin(finale.t * 2.8) + .025 * Math.sin(finale.t * 5.6 + 1);
    for (const p of finale.parts) {
      const gx = cx + p.tx * R * pulse, gy = cy + p.ty * R * pulse, e = 1 - Math.pow(1 - p.sp, k);
      p.x += (gx - p.x) * e; p.y += (gy - p.y) * e;
    }
    finale.rain -= dt;
    if (finale.rain <= 0) {
      finale.rain = isSmall() ? .22 : .13;
      parts.push(mk({ x: rand(W), y: -20, vx: 0, vy: rand(.7, 1.6), g: 0, fr: 1, life: 1e9, size: rand(4, 10), c: pick(PINKS), mode: 'heart', rot: rand(-.5, .5), vr: rand(-.03, .03), sway: rand(TAU), rain: true }));
    }
    finale.fw -= dt;
    if (finale.fw <= 0) {
      finale.fw = rand(2.2, 3.6);
      launch({ type: pick(['heart', 'heart', 'ring', 'willow']), x: Math.random() < .5 ? rand(W * .05, W * .3) : rand(W * .7, W * .95), y: rand(H * .1, H * .45) });
    }
  }
  function drawFinaleGlow() {
    const { cx, cy, R } = finaleGeom();
    const r = R * 1.5 * (1 + .05 * Math.sin(finale.t * 2.8)), y = cy + R * .15;
    const g = fx.createRadialGradient(cx, y, 0, cx, y, r);
    g.addColorStop(0, 'rgba(255,77,109,.3)'); g.addColorStop(.5, 'rgba(255,77,109,.1)'); g.addColorStop(1, 'rgba(255,77,109,0)');
    fx.fillStyle = g; fx.beginPath(); fx.arc(cx, y, r, 0, TAU); fx.fill();
  }
  function drawFinaleParts(time) {
    for (const p of finale.parts) {
      fx.globalAlpha = .75 + .25 * Math.sin(time * 4 + p.ph);
      fx.fillStyle = p.c; fx.beginPath(); fx.arc(p.x, p.y, p.s, 0, TAU); fx.fill();
    }
  }

  /* --- Cập nhật --- */
  function update(dt, k, time) {
    if (show.active) {
      show.t += dt;
      while (show.idx < show.plan.length && show.plan[show.idx].at <= show.t) show.plan[show.idx++].fn();
      if (show.t >= show.loop) { show.t = 0; show.idx = 0; }
      show.next -= dt;
      if (show.next <= 0) { show.next = rand(.75, 1.4); if (rockets.length < 4) launch(); }
    }
    if (finale.active) updateFinale(dt, k);

    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.trail.push({ x: r.x, y: r.y }); if (r.trail.length > 10) r.trail.shift();
      r.x += r.vx * k; r.vy += r.g * k; r.y += r.vy * k;
      if (Math.random() < .5) parts.push(mk({ x: r.x, y: r.y, vx: rand(-.6, .6), vy: rand(.5, 1.5), g: .02, fr: .96, life: rand(14, 26), size: rand(.8, 1.6), c: '#ffd9a0', mode: 'dot' }));
      if (r.vy >= -.6) { rockets.splice(i, 1); burst(r.x, r.y, r.type, r.color, r.text); }
    }

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (p.mode === 'shape') {
        if (p.phase === 0) {
          p.t += dt / p.form;
          const e = easeOutCubic(Math.min(1, p.t));
          p.x = p.ox + (p.tx - p.ox) * e; p.y = p.oy + (p.ty - p.oy) * e;
          if (p.t >= 1) { p.phase = 1; p.t = 0; }
        } else if (p.phase === 1) {
          p.t += dt;
          p.x = p.tx + Math.sin(time * 3 + p.ph) * .5; p.y = p.ty + Math.cos(time * 2.3 + p.ph) * .5;
          if (p.t >= p.hold) { p.phase = 2; p.vx = rand(-.5, .5); p.vy = rand(-.6, .2); p.life = 1; }
        } else {
          const f = Math.pow(p.fr, k);
          p.vx *= f; p.vy = p.vy * f + p.g * k; p.x += p.vx * k; p.y += p.vy * k; p.life -= dt / 1.5;
          if (p.life <= 0 || p.y > H + 30) parts.splice(i, 1);
        }
        continue;
      }
      if (p.rain) {
        p.sway += .02 * k; p.x += Math.sin(p.sway) * .7 * k; p.y += p.vy * k; p.rot += p.vr * k;
        if (p.y > H + 30) parts.splice(i, 1);
        continue;
      }
      const f = Math.pow(p.fr, k);
      p.vx *= f; p.vy = p.vy * f + p.g * k; p.x += p.vx * k; p.y += p.vy * k; p.life -= k;
      if (p.vr) p.rot += p.vr * k;
      if (p.split && p.life < p.split) {
        p.split = 0;
        for (let j = 0; j < 6; j++) {
          const a = rand(TAU), sp = rand(.5, 2.2);
          parts.push(mk({ x: p.x, y: p.y, vx: p.vx * .3 + Math.cos(a) * sp, vy: p.vy * .3 + Math.sin(a) * sp, g: .04, fr: .96, life: rand(18, 34), size: 1.3, c: '#ffffff', mode: 'dot' }));
        }
      }
      if (p.life <= 0 || p.y > H + 40) parts.splice(i, 1);
    }

    for (let i = flashes.length - 1; i >= 0; i--) { flashes[i].life -= dt * 2.6; if (flashes[i].life <= 0) flashes.splice(i, 1); }
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.vy = c.vy * .97 + .06 * k; c.vx *= .985; c.ph += .12 * k;
      c.x += (c.vx + Math.sin(c.ph) * 1.1) * k; c.y += c.vy * k; c.rot += c.vr * k; c.life -= k;
      if (c.life <= 0 || c.y > H + 30) confetti.splice(i, 1);
    }
  }

  /* --- Vẽ --- */
  function draw(time) {
    fx.clearRect(0, 0, W, H);
    fx.globalCompositeOperation = 'lighter';
    fx.lineCap = 'round';
    for (const f of flashes) {
      const a = f.life * .35;
      const g = fx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      g.addColorStop(0, hexA(f.c, a)); g.addColorStop(.4, hexA(f.c, a * .35)); g.addColorStop(1, hexA(f.c, 0));
      fx.fillStyle = g; fx.beginPath(); fx.arc(f.x, f.y, f.r, 0, TAU); fx.fill();
    }
    for (const r of rockets) {
      for (let i = 1; i < r.trail.length; i++) {
        const a = i / r.trail.length;
        fx.strokeStyle = hexA('#ffd9a0', a * .9); fx.lineWidth = 1 + a * 1.6;
        fx.beginPath(); fx.moveTo(r.trail[i - 1].x, r.trail[i - 1].y); fx.lineTo(r.trail[i].x, r.trail[i].y); fx.stroke();
      }
      fx.fillStyle = '#fff'; fx.beginPath(); fx.arc(r.x, r.y, 2, 0, TAU); fx.fill();
    }
    if (finale.active) drawFinaleGlow();
    for (const p of parts) {
      let a;
      if (p.mode === 'shape') a = p.phase === 2 ? Math.max(0, p.life) : 1;
      else if (p.rain) a = .85;
      else a = clamp(p.life / p.max, 0, 1);
      if (p.tw) a *= .45 + .55 * (.5 + .5 * Math.sin((p.mode === 'shape' ? time * 8 : p.life * .45) + p.ph));
      if (a <= .01) continue;
      fx.globalAlpha = a;
      if (p.mode === 'heart') { fx.fillStyle = p.c; heartPath(fx, p.x, p.y, p.size, p.rot || 0); fx.fill(); continue; }
      if (p.mode === 'shape' || Math.abs(p.vx) + Math.abs(p.vy) < .3) {
        fx.fillStyle = p.c; fx.beginPath(); fx.arc(p.x, p.y, p.size * .9, 0, TAU); fx.fill();
      } else {
        const st = p.streak || 2.4;
        fx.strokeStyle = p.c; fx.lineWidth = p.size;
        fx.beginPath(); fx.moveTo(p.x - p.vx * st, p.y - p.vy * st); fx.lineTo(p.x, p.y); fx.stroke();
      }
      if (p.size >= 2) { fx.globalAlpha = a * .45; fx.fillStyle = '#fff'; fx.beginPath(); fx.arc(p.x, p.y, p.size * .4, 0, TAU); fx.fill(); }
    }
    if (finale.active) drawFinaleParts(time);
    fx.globalAlpha = 1;
    fx.globalCompositeOperation = 'source-over';
    for (const c of confetti) {
      fx.save(); fx.translate(c.x, c.y); fx.rotate(c.rot);
      fx.globalAlpha = clamp(c.life / 30, 0, 1); fx.fillStyle = c.c;
      const hh = c.h * Math.abs(Math.cos(c.ph));
      fx.fillRect(-c.w / 2, -hh / 2, c.w, hh);
      fx.restore();
    }
  }

  return { launch, startShow, stopShow, heartPop, confettiBurst, trail, finaleStart, finaleStop, update, draw };
})();

/* ---------------- Điều hướng các màn ---------------- */
const Scenes = (() => {
  const list = $$('.scene'), dotsEl = $('#dots');
  const names = ['Mở quà', 'Pháo hoa', 'Hoa & gấu', 'Bức thư', 'Những bức vẽ', 'Điều anh yêu ở em', 'Lời cuối'];
  const enter = {}, leave = {};
  let cur = 0;
  list.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.title = names[i] || ''; b.setAttribute('aria-label', names[i] || ('Màn ' + (i + 1)));
    b.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(b);
  });
  const dots = $$('button', dotsEl);
  function updateDots() { dots.forEach((b, i) => b.classList.toggle('is-active', i === cur)); }
  function goTo(n) {
    n = clamp(n, 0, list.length - 1);
    if (n === cur) return;
    const from = list[cur], to = list[n];
    if (leave[cur]) leave[cur]();
    from.classList.remove('is-active'); from.classList.add('is-leaving');
    setTimeout(() => from.classList.remove('is-leaving'), 950);
    cur = n;
    to.classList.remove('is-leaving'); to.classList.add('is-active'); to.scrollTop = 0;
    document.body.dataset.scene = String(n);
    updateDots();
    if (enter[n]) enter[n]();
  }
  updateDots();
  return { goTo, next: () => goTo(cur + 1), prev: () => goTo(cur - 1), enter, leave, get current() { return cur; } };
})();

/* ---------------- Hộp quà ---------------- */
const Gift = (() => {
  const box = $('#gift-box');
  let opened = false;
  box.addEventListener('click', () => {
    if (opened) return;
    opened = true; box.classList.add('is-open');
    Music.start();
    const r = box.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    FX.heartPop(cx, cy); FX.confettiBurst(cx, cy, 90);
    setTimeout(() => FX.launch({ type: 'heart', x: W * .5, y: H * .3, color: '#ff4d6d' }), 300);
    setTimeout(() => Scenes.goTo(1), 1250);
  });
  return { reset() { opened = false; box.classList.remove('is-open'); } };
})();

/* ---------------- Bó hoa (sinh bằng SVG) ---------------- */
const Bouquet = (() => {
  const svg = $('#bouquet'), garden = $('#garden');
  const BUNDLE = { x: 200, y: 440 };
  const FLOWERS = [
    { x: 200, y: 130, r: 58, type: 'rose', c: '#ff2e63' },
    { x: 112, y: 180, r: 48, type: 'rose', c: '#ff6b9d' },
    { x: 292, y: 176, r: 50, type: 'rose', c: '#f72585' },
    { x: 60, y: 258, r: 34, type: 'tulip', c: '#ffb3c6' },
    { x: 342, y: 254, r: 34, type: 'tulip', c: '#ffd166' },
    { x: 150, y: 248, r: 34, type: 'daisy', c: '#fff8fb', core: '#ffd166' },
    { x: 254, y: 250, r: 32, type: 'daisy', c: '#fff8fb', core: '#ffb703' },
    { x: 202, y: 210, r: 42, type: 'rose', c: '#ff758f' },
    { x: 84, y: 222, r: 30, type: 'rose', c: '#ff5c8a' },
    { x: 322, y: 218, r: 28, type: 'daisy', c: '#ffffff', core: '#ffb703' },
    { x: 104, y: 310, r: 30, type: 'rose', c: '#ff8fab' },
    { x: 298, y: 314, r: 30, type: 'rose', c: '#ffc2d1' },
    { x: 200, y: 298, r: 28, type: 'daisy', c: '#ffffff', core: '#ffd166' },
    { x: 46, y: 316, r: 24, type: 'tulip', c: '#c77dff' },
    { x: 356, y: 320, r: 24, type: 'tulip', c: '#ff9e00' }
  ];
  const f1 = n => (+n).toFixed(1);

  function rose(g, f) {
    const layers = [{ n: 8, d: .5, s: 1, k: 0 }, { n: 6, d: .34, s: .78, k: -.12 }, { n: 4, d: .2, s: .58, k: -.24 }, { n: 3, d: .1, s: .42, k: -.34 }];
    layers.forEach((L, li) => {
      for (let i = 0; i < L.n; i++) {
        el('ellipse', { cx: 0, cy: f1(-f.r * L.d), rx: f1(f.r * .46 * L.s), ry: f1(f.r * .6 * L.s), fill: shade(f.c, L.k), stroke: shade(f.c, -.38), 'stroke-width': 1.2, transform: `rotate(${f1((i / L.n) * 360 + li * 25)})` }, g);
      }
    });
    el('circle', { cx: 0, cy: 0, r: f1(f.r * .15), fill: shade(f.c, -.5) }, g);
    el('ellipse', { cx: f1(-f.r * .22), cy: f1(-f.r * .3), rx: f1(f.r * .16), ry: f1(f.r * .08), fill: 'rgba(255,255,255,.35)', transform: 'rotate(-30)' }, g);
  }
  function tulip(g, f) {
    const r = f.r;
    el('ellipse', { cx: f1(-r * .32), cy: 0, rx: f1(r * .4), ry: f1(r * .78), fill: shade(f.c, -.18), transform: 'rotate(-18)' }, g);
    el('ellipse', { cx: f1(r * .32), cy: 0, rx: f1(r * .4), ry: f1(r * .78), fill: shade(f.c, -.18), transform: 'rotate(18)' }, g);
    el('ellipse', { cx: 0, cy: f1(r * .05), rx: f1(r * .46), ry: f1(r * .82), fill: f.c, stroke: shade(f.c, -.3), 'stroke-width': 1 }, g);
    el('path', { d: `M${f1(-r * .46)} ${f1(r * .1)} Q0 ${f1(r * .9)} ${f1(r * .46)} ${f1(r * .1)} Q0 ${f1(r * .5)} ${f1(-r * .46)} ${f1(r * .1)} Z`, fill: shade(f.c, -.28) }, g);
    el('ellipse', { cx: f1(-r * .12), cy: f1(-r * .3), rx: f1(r * .1), ry: f1(r * .3), fill: 'rgba(255,255,255,.35)' }, g);
  }
  function daisy(g, f) {
    const r = f.r, core = f.core || '#ffd166';
    for (let i = 0; i < 12; i++) el('ellipse', { cx: 0, cy: f1(-r * .58), rx: f1(r * .2), ry: f1(r * .44), fill: f.c, stroke: 'rgba(255,170,190,.55)', 'stroke-width': 1, transform: `rotate(${i * 30})` }, g);
    el('circle', { cx: 0, cy: 0, r: f1(r * .3), fill: core, stroke: shade(core, -.3), 'stroke-width': 1.5 }, g);
    for (let i = 0; i < 7; i++) { const a = rand(TAU), d = rand(0, r * .2); el('circle', { cx: f1(Math.cos(a) * d), cy: f1(Math.sin(a) * d), r: 1.4, fill: 'rgba(0,0,0,.2)' }, g); }
  }

  function build() {
    svg.innerHTML = '';
    const defs = el('defs', {}, svg);
    const g1 = el('linearGradient', { id: 'wrapGrad', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#fff1f5' }, g1); el('stop', { offset: 1, 'stop-color': '#f7bfd0' }, g1);
    const g2 = el('linearGradient', { id: 'wrapGrad2', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#ffd6e0' }, g2); el('stop', { offset: 1, 'stop-color': '#f1a0b9' }, g2);

    const root = el('g', { class: 'bouquet-root' }, svg);
    const order = FLOWERS.map(f => ({ ...f })).sort((a, b) => a.y - b.y);

    // thân hoa
    const stems = el('g', {}, root);
    order.forEach((f, idx) => {
      const ex = f.x, ey = f.y + f.r * .5;
      const cx = BUNDLE.x + (ex - BUNDLE.x) * .25, cy = ey + (BUNDLE.y - ey) * .55;
      const p = el('path', { class: 'stem', d: `M${BUNDLE.x} ${BUNDLE.y} Q${f1(cx)} ${f1(cy)} ${ex} ${ey}`, stroke: idx % 2 ? '#3f9a5f' : '#2f7d49', 'stroke-width': 5 }, stems);
      const L = p.getTotalLength();
      p.style.setProperty('--len', L.toFixed(1)); p.style.setProperty('--d', (idx * .06) + 's');
      f.stem = p; f.len = L;
    });

    // giấy gói (lớp sau)
    el('path', { class: 'wrap-layer', d: 'M84 300 C130 262 270 262 316 300 L338 334 C280 356 120 356 62 334 Z', fill: 'url(#wrapGrad2)' }, root).style.setProperty('--d', '.6s');

    // lá
    const leaves = el('g', {}, root);
    order.forEach((f, idx) => {
      if (idx % 3 === 1) return;
      const t = rand(.38, .62), pt = f.stem.getPointAtLength(f.len * t), pt2 = f.stem.getPointAtLength(Math.min(f.len, f.len * t + 1));
      const ang = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI, side = f.x < 200 ? -1 : 1, size = rand(18, 30);
      const g = el('g', { transform: `translate(${f1(pt.x)} ${f1(pt.y)}) rotate(${f1(ang + side * 70)})` }, leaves);
      const leaf = el('path', { class: 'leaf', d: `M0 0 Q${f1(size * .5)} ${f1(-size * .45)} ${f1(size)} 0 Q${f1(size * .5)} ${f1(size * .45)} 0 0 Z`, fill: idx % 2 ? '#3f9a5f' : '#2f7d49' }, g);
      leaf.style.setProperty('--d', (1 + idx * .05) + 's');
    });

    // hoa baby trắng
    const breath = el('g', {}, root);
    for (let i = 0; i < 16; i++) {
      const outer = el('g', { transform: `translate(${f1(rand(70, 330))} ${f1(rand(150, 330))})` }, breath);
      const inner = el('g', { class: 'breath' }, outer);
      inner.style.setProperty('--d', (1.9 + rand(.7)) + 's');
      const n = randInt(5, 8);
      for (let j = 0; j < n; j++) { const a = rand(TAU), r = rand(0, 14); el('circle', { cx: f1(Math.cos(a) * r), cy: f1(Math.sin(a) * r), r: f1(rand(1.6, 3.2)), fill: '#fff', 'fill-opacity': rand(.7, 1).toFixed(2) }, inner); }
    }

    // bông hoa (từ trên xuống → bông thấp hơn nằm trước)
    const flowers = el('g', {}, root);
    order.forEach((f, idx) => {
      const outer = el('g', { transform: `translate(${f.x} ${f.y})` }, flowers);
      const g = el('g', { class: 'flower' }, outer);
      g.style.setProperty('--d', (1.1 + idx * .12) + 's');
      if (f.type === 'rose') rose(g, f); else if (f.type === 'tulip') tulip(g, f); else daisy(g, f);
    });

    // giấy gói (lớp trước) + nếp gấp
    el('path', { class: 'wrap-layer', d: 'M62 334 C120 356 280 356 338 334 L240 470 Q200 484 160 470 Z', fill: 'url(#wrapGrad)' }, root).style.setProperty('--d', '.7s');
    el('path', { class: 'wrap-layer', d: 'M62 334 C120 356 280 356 338 334 L300 372 C240 392 160 392 100 372 Z', fill: 'rgba(255,255,255,.4)' }, root).style.setProperty('--d', '.8s');

    // nơ
    const rOuter = el('g', { transform: 'translate(200 424)' }, root);
    const ribbon = el('g', { class: 'ribbon' }, rOuter);
    ribbon.style.setProperty('--d', '1.5s');
    el('path', { d: 'M-52 -8 C-30 2 30 2 52 -8 L56 10 C30 20 -30 20 -56 10 Z', fill: '#ff4d6d' }, ribbon);
    el('path', { d: 'M-8 8 L-26 54 L-10 50 Z', fill: '#e8396b' }, ribbon);
    el('path', { d: 'M8 8 L26 54 L10 50 Z', fill: '#e8396b' }, ribbon);
    el('ellipse', { cx: -24, cy: -4, rx: 24, ry: 13, fill: '#ff6b9d', transform: 'rotate(-14)' }, ribbon);
    el('ellipse', { cx: 24, cy: -4, rx: 24, ry: 13, fill: '#ff6b9d', transform: 'rotate(14)' }, ribbon);
    el('ellipse', { cx: -22, cy: -4, rx: 12, ry: 6, fill: '#ff8fab', transform: 'rotate(-14)' }, ribbon);
    el('ellipse', { cx: 22, cy: -4, rx: 12, ry: 6, fill: '#ff8fab', transform: 'rotate(14)' }, ribbon);
    el('circle', { cx: 0, cy: 0, r: 9, fill: '#ff8fab', stroke: '#e8396b', 'stroke-width': 2 }, ribbon);
  }
  function bloom() {
    garden.classList.remove('is-bloomed');
    void garden.offsetWidth; // ép reflow để chạy lại animation
    garden.classList.add('is-bloomed');
  }
  return { build, bloom };
})();

/* ---------------- Bức thư ---------------- */
const Letter = (() => {
  const wrap = $('#envelope-wrap'), env = $('#envelope'), openBtn = $('#open-letter-btn');
  const paper = $('#letter-paper'), body = $('#letter-body'), skipBtn = $('#skip-typing'), nextBtn = $('#letter-next');
  let opened = false, typing = false, skip = false, token = 0;

  function reset() {
    token++; opened = false; typing = false; skip = false;
    env.classList.remove('is-open'); wrap.hidden = false; openBtn.disabled = false;
    paper.hidden = true; paper.classList.remove('is-shown', 'is-finished');
    body.innerHTML = ''; nextBtn.hidden = true; skipBtn.hidden = false;
  }
  function open() {
    if (opened) return;
    opened = true; env.classList.add('is-open'); openBtn.disabled = true;
    const r = env.getBoundingClientRect();
    FX.heartPop(r.left + r.width / 2, r.top + r.height / 2);
    const my = ++token;
    setTimeout(() => {
      if (my !== token) return;
      wrap.hidden = true; paper.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => paper.classList.add('is-shown')));
      setTimeout(() => type(my), 500);
    }, 1600);
  }
  async function type(my) {
    typing = true; skip = false; body.innerHTML = '';
    const paras = (get('letter.paragraphs') || []).map(fill);
    const caret = document.createElement('span'); caret.className = 'caret';
    for (const text of paras) {
      if (my !== token) return;
      const p = document.createElement('p'); body.appendChild(p); p.appendChild(caret);
      const chars = Array.from(text);
      for (let i = 0; i < chars.length; i++) {
        if (my !== token) return;
        if (skip) { p.textContent = text; break; }
        const ch = chars[i];
        p.insertBefore(document.createTextNode(ch), caret);
        let d = 26;
        if (',;'.includes(ch)) d = 170; else if ('.!?:'.includes(ch)) d = 380; else if (ch === ' ') d = 38;
        if (i % 30 === 0) caret.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        await sleep(d);
      }
      if (!skip) await sleep(320);
    }
    if (my !== token) return;
    caret.remove(); typing = false;
    paper.classList.add('is-finished'); skipBtn.hidden = true; nextBtn.hidden = false;
    nextBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  skipBtn.addEventListener('click', () => { if (typing) skip = true; });
  env.addEventListener('click', open);
  env.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  openBtn.addEventListener('click', open);
  return { reset };
})();

/* ---------------- Những bức vẽ (tự vẽ nét) ---------------- */
const Drawings = (() => {
  const cards = $$('.drawing-card'), nextBtn = $('#drawings-next'), redraw = $('#redraw-btn');
  const captions = (get('drawings.captions') || []).map(fill);
  let token = 0;

  function prep(svg) {
    const shapes = $$('path', svg);
    shapes.forEach(s => {
      const L = s.getTotalLength();
      s.dataset.len = L;
      s.style.strokeDasharray = `${L} ${L + 4}`; s.style.strokeDashoffset = L;
      s.style.fill = s.dataset.fill || 'none'; s.style.fillOpacity = '0';
    });
    svg.classList.remove('is-done');
    $$('.pen', svg).forEach(p => p.remove());
    return shapes;
  }
  function drawOne(svg, my) {
    const shapes = prep(svg), speed = isSmall() ? 360 : 320;
    const pen = el('circle', { class: 'pen', r: 3 }, svg);
    return new Promise(resolve => {
      let i = 0, start = null;
      const step = now => {
        if (my !== token) { pen.remove(); resolve(false); return; }
        if (start === null) start = now;
        const s = shapes[i], L = +s.dataset.len, dur = Math.max(.2, L / speed) * 1000;
        const t = clamp((now - start) / dur, 0, 1);
        s.style.strokeDashoffset = String(L * (1 - t));
        const p = s.getPointAtLength(L * t);
        pen.setAttribute('cx', p.x.toFixed(2)); pen.setAttribute('cy', p.y.toFixed(2));
        if (t >= 1) {
          i++; start = now;
          if (i >= shapes.length) {
            pen.remove();
            shapes.forEach(sh => { sh.style.fillOpacity = sh.dataset.fo || '0'; });
            svg.classList.add('is-done');
            resolve(true); return;
          }
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  async function typeCaption(node, text, my) {
    node.textContent = '';
    for (const ch of Array.from(text)) { if (my !== token) return; node.textContent += ch; await sleep(26); }
  }
  async function start() {
    const my = ++token;
    nextBtn.hidden = true; redraw.hidden = true;
    cards.forEach(c => { c.classList.remove('is-shown'); $('.drawing-caption', c).textContent = ''; prep($('svg', c)); });
    await sleep(350);
    for (let i = 0; i < cards.length; i++) {
      if (my !== token) return;
      const c = cards[i];
      c.classList.add('is-shown');
      await sleep(380);
      const ok = await drawOne($('svg', c), my);
      if (!ok) return;
      typeCaption($('.drawing-caption', c), captions[i] || '', my);
      await sleep(600);
    }
    if (my !== token) return;
    nextBtn.hidden = false; redraw.hidden = false;
    FX.heartPop(W / 2, H / 2);
  }
  redraw.addEventListener('click', start);
  return { start, stop() { token++; } };
})();

/* ---------------- Những điều anh yêu ở em (chạm vào tim) ---------------- */
const Reasons = (() => {
  const stage = $('#reasons-stage'), card = $('#reason-card'), text = $('#reason-text'), progress = $('#reasons-progress');
  const items = (get('reasons.items') || []).map(fill);
  const SPOTS = [[8, 14], [32, 6], [60, 8], [88, 18], [6, 56], [94, 56], [22, 88], [70, 90], [50, 96], [40, 14]];
  let popped = 0, hearts = [];

  function progressText() {
    const t = get('reasons.progress') || '{n}/{total}';
    return t.replace('{n}', popped).replace('{total}', items.length);
  }
  function build() {
    hearts.forEach(h => h.remove()); hearts = []; popped = 0;
    card.hidden = true; card.classList.remove('is-pop');
    items.forEach((reason, i) => {
      const spot = SPOTS[i % SPOTS.length];
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'reason-heart'; b.setAttribute('aria-label', 'Trái tim ' + (i + 1));
      b.style.setProperty('--x', (spot[0] + rand(-3, 3)).toFixed(1) + '%');
      b.style.setProperty('--y', (spot[1] + rand(-3, 3)).toFixed(1) + '%');
      b.style.setProperty('--s', (isSmall() ? rand(40, 54) : rand(48, 68)).toFixed(0) + 'px');
      b.style.setProperty('--c', pick(['#ff4d6d', '#ff6b9d', '#ff8fab', '#f72585', '#ff5c8a']));
      b.style.setProperty('--dur', rand(2.6, 3.8).toFixed(2) + 's');
      b.style.setProperty('--d', (-rand(0, 3)).toFixed(2) + 's');
      b.style.setProperty('--in', (.3 + i * .12).toFixed(2) + 's');
      b.addEventListener('click', () => pop(b, reason));
      stage.appendChild(b); hearts.push(b);
    });
    progress.textContent = progressText();
  }
  function pop(b, reason) {
    if (b.classList.contains('is-popped')) return;
    b.classList.add('is-popped'); popped++;
    const r = b.getBoundingClientRect();
    FX.heartPop(r.left + r.width / 2, r.top + r.height / 2);
    text.textContent = popped >= items.length ? fill(get('reasons.done') || reason) : reason;
    card.hidden = false; card.classList.remove('is-pop'); void card.offsetWidth; card.classList.add('is-pop');
    progress.textContent = progressText();
    if (popped >= items.length) {
      FX.confettiBurst(W / 2, H * .4, 100);
      setTimeout(() => FX.launch({ type: 'heart', x: W * .5, y: H * .2, color: '#ff4d6d' }), 200);
    }
  }
  return { start: build };
})();

/* ---------------- Màn kết ---------------- */
const Finale = (() => {
  const title = $('#finale-title'), boom = $('#boom-btn'), replay = $('#replay-btn');
  function buildTitle() {
    title.innerHTML = '';
    Array.from(fill(get('finale.title') || 'Anh yêu em')).forEach((ch, i) => {
      const s = document.createElement('span');
      s.style.setProperty('--i', i);
      if (ch === ' ') { s.className = 'space'; s.innerHTML = '&nbsp;'; } else s.textContent = ch;
      title.appendChild(s);
    });
  }
  boom.addEventListener('click', () => {
    for (let i = 0; i < 7; i++) setTimeout(() => FX.launch({ type: i % 2 ? 'heart' : pick(['ring', 'willow', 'chrys', 'crackle']) }), i * 170);
    FX.confettiBurst(W / 2, H * .5, 110);
  });
  replay.addEventListener('click', () => Scenes.goTo(0));
  return { start() { buildTitle(); FX.finaleStart(); }, stop() { FX.finaleStop(); } };
})();

/* ---------------- Nhạc nền (Web Audio, không cần file) ---------------- */
const Music = (() => {
  const btn = $('#music-toggle');
  let ctx = null, master = null, wet = null, noiseBuf = null;
  let started = false, muted = false, timer = null, step = 0, nextTime = 0, lastBoom = 0;
  const BPM = 76, BEAT = 60 / BPM, STEP = BEAT / 2, STEPS = 64;
  // C – G – Am – F
  const CHORDS = [[48, 52, 55, 60], [43, 47, 50, 55], [45, 48, 52, 57], [41, 45, 48, 53]];
  const MELODY = [
    [76, 1], [79, 1], [76, 1], [74, .5], [72, .5],
    [74, 1], [71, 1], [74, 1], [67, 1],
    [69, 1], [72, 1], [76, 1.5], [74, .5],
    [72, 1], [69, 1], [65, 1], [67, 1],
    [76, 1.5], [79, .5], [76, 1], [72, 1],
    [74, 1], [79, 1], [77, .5], [76, .5], [74, 1],
    [76, 2], [72, 1], [69, 1],
    [65, 1], [67, 1], [71, 1], [72, 1]
  ];
  const melodyAt = {};
  (() => { let b = 0; for (const [m, d] of MELODY) { melodyAt[Math.round(b * 2)] = { m, d }; b += d; } })();
  const ARP = [0, 1, 2, 3, 2, 1, 2, 1];
  const freq = m => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const conv = ctx.createConvolver(), len = Math.floor(ctx.sampleRate * 2.4), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    conv.buffer = buf;
    wet = ctx.createGain(); wet.gain.value = .4; wet.connect(conv); conv.connect(master);
    const nl = Math.floor(ctx.sampleRate * .6);
    noiseBuf = ctx.createBuffer(1, nl, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nl; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nl, 2);
    return true;
  }
  function tone({ f, t, dur, type = 'sine', gain = .1, attack = .02, release = .25, filter = 2200, detune = 0 }) {
    const osc = ctx.createOscillator(); osc.type = type; osc.frequency.value = f; osc.detune.value = detune;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = filter;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.setTargetAtTime(gain * .6, t + attack, Math.max(.05, dur * .5));
    g.gain.setTargetAtTime(0, t + dur, release / 3);
    osc.connect(lp); lp.connect(g); g.connect(master); g.connect(wet);
    osc.start(t); osc.stop(t + dur + release + .15);
  }
  function scheduleStep(s, t) {
    const chord = CHORDS[Math.floor(s / 8) % 4];
    if (s % 8 === 0) {
      tone({ f: freq(chord[0] - 12), t, dur: BEAT * 3.6, type: 'sine', gain: .17, attack: .04, release: .5, filter: 500 });
      chord.forEach((m, i) => tone({ f: freq(m), t, dur: BEAT * 3.7, type: 'triangle', gain: .026, attack: .9, release: .9, filter: 900, detune: i % 2 ? 5 : -5 }));
    }
    tone({ f: freq(chord[ARP[s % 8]] + 12), t: t + .005, dur: STEP * .9, type: 'sine', gain: .045, attack: .01, release: .25, filter: 2600 });
    const mel = melodyAt[s % STEPS];
    if (mel) {
      tone({ f: freq(mel.m), t, dur: mel.d * BEAT * .95, type: 'triangle', gain: .12, attack: .015, release: .4, filter: 1900 });
      tone({ f: freq(mel.m) * 2, t, dur: mel.d * BEAT * .9, type: 'sine', gain: .025, attack: .015, release: .3, filter: 3200 });
    }
  }
  function scheduler() {
    if (!ctx) return;
    while (nextTime < ctx.currentTime + .35) { scheduleStep(step, nextTime); nextTime += STEP; step = (step + 1) % STEPS; }
  }
  function setMuted(m) {
    muted = m;
    if (!ctx) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(m ? 0 : .8, now, .35);
    btn.classList.toggle('is-on', !m); btn.classList.toggle('is-off', m);
    btn.textContent = m ? '♪' : '♫'; btn.setAttribute('aria-pressed', String(!m));
  }
  function start() {
    if (!CFG.music || started) return;
    if (!ctx && !init()) return;
    started = true; btn.hidden = false;
    const go = () => { nextTime = ctx.currentTime + .15; step = 0; timer = setInterval(scheduler, 100); setMuted(false); };
    if (ctx.state === 'suspended') ctx.resume().then(go, go); else go();
  }
  function toggle() {
    if (!started) { start(); return; }
    if (ctx.state === 'suspended') ctx.resume();
    setMuted(!muted);
  }
  function boom(intensity = 1) {
    if (!ctx || !started || muted || !noiseBuf) return;
    const t = ctx.currentTime;
    if (t - lastBoom < .12) return;
    lastBoom = t;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(120, t + .5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(.12 * intensity, t); g.gain.exponentialRampToValueAtTime(.001, t + .6);
    src.connect(lp); lp.connect(g); g.connect(master);
    src.start(t); src.stop(t + .65);
  }
  btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  return { start, toggle, boom };
})();

/* ---------------- Vòng lặp & khởi tạo ---------------- */
let last = performance.now(), time = 0;
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000);
  last = now; time += dt;
  const k = dt * 60;
  Background.update(dt, k); Background.draw();
  FX.update(dt, k, time); FX.draw(time);
  requestAnimationFrame(loop);
}

function init() {
  applyTexts();
  Bouquet.build();
  resize();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });

  Scenes.enter[0] = () => Gift.reset();
  Scenes.enter[1] = () => FX.startShow();
  Scenes.leave[1] = () => FX.stopShow();
  Scenes.enter[2] = () => Bouquet.bloom();
  Scenes.enter[3] = () => Letter.reset();
  Scenes.enter[4] = () => Drawings.start();
  Scenes.leave[4] = () => Drawings.stop();
  Scenes.enter[5] = () => Reasons.start();
  Scenes.enter[6] = () => Finale.start();
  Scenes.leave[6] = () => Finale.stop();

  $$('.next-btn').forEach(b => b.addEventListener('click', () => Scenes.next()));

  document.addEventListener('pointerdown', e => {
    Music.start();
    const t = e.target;
    if (t && t.closest && t.closest('button, a, .no-fire, .dots, input, textarea')) return;
    FX.launch({ x: e.clientX, y: e.clientY, type: Math.random() < .6 ? 'heart' : pick(['chrys', 'ring', 'willow', 'crackle']) });
  });
  document.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') FX.trail(e.clientX, e.clientY); });
  document.addEventListener('keydown', e => {
    const t = e.target;
    if (t && t.closest && t.closest('input, textarea')) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); Scenes.next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); Scenes.prev(); }
    else if (e.key === 'm' || e.key === 'M') Music.toggle();
  });

  requestAnimationFrame(loop);
}
init();
})();
