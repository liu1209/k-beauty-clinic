(() => {
const $ = (s, r = document) => [...r.querySelectorAll(s)], root = document.documentElement, body = document.body;
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
requestAnimationFrame(() => body.classList.add('ready'));

/* ---------- nav ---------- */
const nav = document.querySelector('.nav'); let lastY = 0;
const onScroll = () => {
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  nav.classList.toggle('solid', y > 40);
  nav.classList.toggle('hide', y > 500 && y > lastY + 4 && !body.classList.contains('menuopen'));
  if (y < lastY - 4) nav.classList.remove('hide');
  lastY = y; root.style.setProperty('--sp', h > 0 ? (y / h).toFixed(4) : 0);
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const burger = document.querySelector('.burger');
burger && burger.addEventListener('click', () => body.classList.toggle('menuopen'));
$('.mi > button').forEach(b => b.addEventListener('click', () => { if (innerWidth <= 1100) b.parentElement.classList.toggle('open'); }));
$('.menu a').forEach(a => a.addEventListener('click', () => body.classList.remove('menuopen')));

/* ---------- reveal on scroll ---------- */
const targets = $('.band .wrap > .stack > *, .band .wrap > .stack > .it > .cols > *, .band .wrap > .cols > *, .card, .qa, .slot, .principle, .tcard, .cgroup, .sechead, .bleed-text .inner > .stack > *, .accrow, .qlist li, .voice, .spec > div, .bul li, .pillar');
const seen = new Set();
targets.forEach(el => { if (!seen.has(el) && !el.closest('.hero')) { seen.add(el); el.classList.add('rv'); } });
const io = new IntersectionObserver(es => {
  const batch = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
  batch.forEach((e, i) => { e.target.style.setProperty('--d', Math.min(i * 0.07, 0.5) + 's'); e.target.classList.add('in'); io.unobserve(e.target); });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
seen.forEach(el => io.observe(el));

/* ---------- pointer: tilt + glow ---------- */
if (matchMedia('(hover:hover)').matches && !reduce) {
  $('[data-tilt]').forEach(el => {
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg'); el.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg'); });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); });
  });
  $('.hero, .bg-brown, .panel.bg-brown').forEach(el => el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); }));
  $('.btn').forEach(b => { b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.translate = `${((e.clientX - r.left) / r.width - .5) * 8}px ${((e.clientY - r.top) / r.height - .5) * 6}px`; }); b.addEventListener('pointerleave', () => b.style.translate = ''); });
}

/* ---------- dots: a field of dots that follows the pointer ---------- */
const DOT = { hero: ['255,236,222', .17, '255,214,190'], dark: ['236,205,188', .10, '232,180,152'], light: ['122,85,70', .16, '154,102,80'] };
$('canvas.silk').forEach(cv => {
  const cx = cv.getContext('2d'); if (!cx) return;
  const host = cv.parentElement, tone = DOT[cv.dataset.tone] || DOT.hero, big = cv.dataset.tone !== 'dark' || host.classList.contains('band');
  let W = 0, H = 0, dpr = 1, gap = 26, vis = false, raf = 0, t0 = Math.random() * 50;
  const P = { x: -999, y: -999, tx: -999, ty: -999, on: false, last: -9e9 }, rip = [];
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; gap = W < 700 ? 22 : 27; const w = W * dpr | 0, h = H * dpr | 0; if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } };
  const at = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  host.addEventListener('pointermove', e => { const [x, y] = at(e); if (!P.on) { P.x = x; P.y = y; } P.tx = x; P.ty = y; P.on = true; P.last = performance.now(); });
  host.addEventListener('pointerdown', e => { const [x, y] = at(e); rip.push({ x, y, t: performance.now(), k: 1 }); if (rip.length > 6) rip.shift(); });
  host.addEventListener('pointerleave', () => { P.last = -9e9; });
  new IntersectionObserver(e => { vis = e[0].isIntersecting; if (vis) loop(); }).observe(cv);
  let lastRip = 0;
  function loop(now) {
    cancelAnimationFrame(raf); if (!vis) return; size(); now = now || performance.now(); const t = t0 + now / 1000;
    // when nobody is pointing (phones, idle), a slow ghost pointer keeps the field alive
    if (now - P.last > 2600) { P.tx = W * (.5 + .34 * Math.sin(t * .23)); P.ty = H * (.46 + .28 * Math.sin(t * .31 + 1.3)); if (!P.on) { P.x = P.tx; P.y = P.ty; P.on = true; } }
    const vx = P.tx - P.x, vy = P.ty - P.y; P.x += vx * .12; P.y += vy * .12;
    if (Math.hypot(vx, vy) > 46 && now - lastRip > 260) { rip.push({ x: P.x, y: P.y, t: now, k: .55 }); lastRip = now; if (rip.length > 6) rip.shift(); }
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, W, H);
    const R = big ? Math.min(250, W * .34) : 170, R2 = R * R, ox = (W % gap) / 2, oy = (H % gap) / 2;
    for (let y = oy; y < H; y += gap) for (let x = ox; x < W; x += gap) {
      const wave = .5 + .5 * Math.sin(x * .011 + y * .017 - t * .7) * Math.sin(y * .009 - x * .004 + t * .41);
      let px = x, py = y, r = .85 + wave * .55, al = tone[1] * (.45 + wave * .75), hot = 0;
      const dx = x - P.x, dy = y - P.y, d2 = dx * dx + dy * dy;
      if (d2 < R2) { const d = Math.sqrt(d2) || 1, f = 1 - d / R, e = f * f * (3 - 2 * f); hot = e; px += dx / d * e * 13; py += dy / d * e * 13; r += e * 3.4; al += e * .62; }
      for (const q of rip) { const age = (now - q.t) / 1000, rad = age * 330, d = Math.hypot(x - q.x, y - q.y), band = Math.exp(-((d - rad) * (d - rad)) / 900) * Math.max(0, 1 - age / 1.5) * q.k; if (band > .02) { r += band * 2.6; al += band * .5; hot = Math.max(hot, band); } }
      cx.fillStyle = 'rgba(' + (hot > .25 ? tone[2] : tone[0]) + ',' + Math.min(al, .95).toFixed(3) + ')';
      if (r < 1.3) cx.fillRect(px - r, py - r, r * 2, r * 2); else { cx.beginPath(); cx.arc(px, py, r, 0, 6.2832); cx.fill(); }
    }
    while (rip.length && now - rip[0].t > 1600) rip.shift();
    if (!reduce) raf = requestAnimationFrame(loop);
  }
  addEventListener('resize', () => { size(); if (reduce) loop(); });
});

/* ---------- fx: energy animation over the skin render ---------- */
$('canvas.fx').forEach(cv => {
  const ctx = cv.getContext('2d'), mode = cv.dataset.mode || 'heat'; let W = 0, H = 0, vis = false, parts = [], last = 0;
  const size = () => { const s = Math.min(devicePixelRatio, 2); W = cv.width = cv.clientWidth * s; H = cv.height = cv.clientHeight * s; };
  const R = (a, b) => a + Math.random() * (b - a);
  // depth lines in the skin image (fraction of height): surface, dermis, deep dermis, fat
  const Y = { surf: .2, epi: .27, derm: .48, deep: .66, fat: .84 };
  const glow = (x, y, r, col, a) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
  const spawn = t => {
    const x = R(.42, .96) * W;
    if (mode === 'hifu') { parts.push({ k: 'dot', x, y: Y.deep * H + R(-8, 8), t, life: 2.2, c: 'rgba(255,236,200,A)', r: R(10, 18) }); if (Math.random() < .5) parts.push({ k: 'band', x, y: Y.derm * H, t, life: 2.6, c: 'rgba(255,170,120,A)', r: R(60, 110) }); }
    else if (mode === 'heat') parts.push({ k: 'band', x, y: R(Y.derm - .06, Y.derm + .08) * H, t, life: 3, c: 'rgba(255,160,110,A)', r: R(70, 140) });
    else if (mode === 'fat') { parts.push({ k: 'band', x, y: Y.fat * H + R(-20, 20), t, life: 3, c: 'rgba(255,214,140,A)', r: R(80, 150) }); parts.push({ k: 'rise', x, y: Y.fat * H, t, life: 2.4, c: 'rgba(255,240,200,A)', r: 5, vy: -R(20, 50) }); }
    else if (mode === 'laser') { parts.push({ k: 'beam', x, y: Y.derm * H + R(-30, 30), t, life: .9, c: 'rgba(190,255,220,A)' }); for (let i = 0; i < 6; i++) parts.push({ k: 'spark', x, y: Y.derm * H + R(-30, 30), t: t + .25, life: 1.4, c: 'rgba(255,244,210,A)', vx: R(-60, 60), vy: R(-60, 40), r: R(2, 4) }); }
    else if (mode === 'fractional') { for (let i = -2; i <= 2; i++) parts.push({ k: 'col', x: x + i * 26, y: Y.derm * H + R(0, 40), t: t + Math.abs(i) * .06, life: 1.8, c: 'rgba(255,220,170,A)' }); }
    else if (mode === 'needle') { for (let i = -2; i <= 2; i++) parts.push({ k: 'pin', x: x + i * 22, y: R(Y.derm, Y.deep) * H, t: t + (i + 2) * .05, life: 2.2, c: 'rgba(255,190,140,A)' }); }
    else if (mode === 'inject') { const y = R(Y.derm, Y.deep) * H; parts.push({ k: 'pin', x, y, t, life: 2.6, c: 'rgba(255,255,255,A)', one: 1 }); for (let i = 0; i < 9; i++) parts.push({ k: 'spark', x, y, t: t + .5, life: 2.6, c: 'rgba(255,246,236,A)', vx: R(-34, 34), vy: R(-22, 22), r: R(2.5, 5) }); }
    else if (mode === 'thread') parts.push({ k: 'thread', x: R(.45, .7) * W, y: R(Y.derm, Y.deep) * H, t, life: 3.4, c: 'rgba(255,250,240,A)', len: R(.16, .26) * W });
    else if (mode === 'care') { parts.push({ k: 'sweep', x: 0, y: Y.surf * H, t, life: 3.2, c: 'rgba(255,255,255,A)' }); for (let i = 0; i < 5; i++) parts.push({ k: 'rise', x: R(.4, .96) * W, y: Y.epi * H, t: t + R(0, 1.5), life: 2.2, c: 'rgba(220,245,255,A)', r: 4, vy: R(14, 36) }); }
    else parts.push({ k: 'rise', x: R(0, 1) * W, y: H * R(.3, 1.05), t, life: R(4, 7), c: 'rgba(255,255,255,A)', r: R(2, 6), vy: -R(14, 40), vx: R(-10, 10) });
  };
  const rate = { laser: .5, fractional: .9, needle: 1.1, inject: 1.4, thread: 1.6, care: 2.4, flow: .12 }[mode] || .55; let acc = 0;
  function frame(now) {
    if (!vis) return; const t = now / 1000, dt = Math.min(.05, t - last || .016); last = t; acc += dt;
    while (acc > rate) { acc -= rate; spawn(t); }
    ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter'; const s = W / 1200;
    parts = parts.filter(p => t - p.t < p.life);
    for (const p of parts) {
      const k = (t - p.t) / p.life; if (k < 0) continue; const a = Math.sin(Math.PI * Math.min(1, k)) ** 1.2;
      if (p.k === 'dot') { glow(p.x, p.y, p.r * s * (1 + k * 2.5), p.c, .9 * a); glow(p.x, p.y, 4 * s, 'rgba(255,255,255,A)', a); }
      else if (p.k === 'band') glow(p.x, p.y, p.r * s * (.7 + k * .6), p.c, .38 * a);
      else if (p.k === 'rise' || p.k === 'spark') { const x = p.x + (p.vx || 0) * s * (t - p.t), y = p.y + (p.vy || 0) * s * (t - p.t); glow(x, y, p.r * s * 3.2, p.c, .55 * a); glow(x, y, p.r * s, 'rgba(255,255,255,A)', .9 * a); }
      else if (p.k === 'beam') { const g = ctx.createLinearGradient(0, 0, 0, p.y); g.addColorStop(0, p.c.replace('A', 0)); g.addColorStop(1, p.c.replace('A', .8 * a)); ctx.fillStyle = g; ctx.fillRect(p.x - 3 * s, 0, 6 * s, p.y); glow(p.x, p.y, 46 * s, p.c, .7 * a); }
      else if (p.k === 'col') { const y0 = Y.surf * H; ctx.fillStyle = p.c.replace('A', .5 * a); ctx.fillRect(p.x - 2.5 * s, y0, 5 * s, (p.y - y0) * Math.min(1, k * 3)); glow(p.x, y0 + (p.y - y0) * Math.min(1, k * 3), 18 * s, p.c, .6 * a); }
      else if (p.k === 'pin') { const y0 = (p.one ? -0.02 : Y.surf - .05) * H, d = Math.min(1, k * 2.4) * (k > .7 ? Math.max(0, 1 - (k - .7) / .3) : 1), y = y0 + (p.y - y0) * d; ctx.strokeStyle = 'rgba(235,240,246,' + (.9 * Math.min(1, a * 2)) + ')'; ctx.lineWidth = (p.one ? 3 : 1.6) * s; ctx.beginPath(); ctx.moveTo(p.x - (p.one ? (p.y - y0) * .35 * (1 - d) + (y - y0) * -.0 : 0), y0); ctx.lineTo(p.x, y); ctx.stroke(); if (d > .95) glow(p.x, y, (p.one ? 30 : 22) * s, p.c, .7 * a); }
      else if (p.k === 'thread') { const d = Math.min(1, k * 1.6), lift = Math.max(0, (k - .5) * 2) * 14 * s; ctx.strokeStyle = p.c.replace('A', .85 * a); ctx.lineWidth = 2 * s; ctx.setLineDash([10 * s, 5 * s]); ctx.beginPath(); ctx.moveTo(p.x, p.y - lift); ctx.quadraticCurveTo(p.x + p.len * d * .5, p.y - 18 * s - lift * 1.6, p.x + p.len * d, p.y - 34 * s - lift); ctx.stroke(); ctx.setLineDash([]); glow(p.x + p.len * d, p.y - 34 * s - lift, 16 * s, p.c, .7 * a); }
      else if (p.k === 'sweep') { const x = (-.1 + 1.2 * k) * W; const g = ctx.createLinearGradient(x - 160 * s, 0, x + 160 * s, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - 160 * s, p.y - 26 * s, 320 * s, 52 * s); }
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  new IntersectionObserver(e => { vis = e[0].isIntersecting; if (vis) { size(); last = 0; requestAnimationFrame(frame); } }).observe(cv);
  addEventListener('resize', size);
});

/* ---------- smooth anchor offset ---------- */
if (location.hash) setTimeout(() => { const el = document.getElementById(location.hash.slice(1)); el && el.scrollIntoView({ block: 'start' }); }, 350);
})();
