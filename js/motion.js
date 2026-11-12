/*
 * Motion: cards ease in when you change page, numbers count up, and confetti
 * in brand colours marks a reached goal or target.
 * Everything is skipped when the system asks for reduced motion.
 */
window.SN = window.SN || {};

(function () {
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = t => 1 - Math.pow(1 - t, 3);

  // Cards rise in one after another
  function enter(container) {
    if (reduced()) return;
    const cards = container.querySelectorAll('.card:not(.in-report), .rp-shell');
    cards.forEach((c, i) => {
      c.style.animationDelay = Math.min(i * 55, 600) + 'ms';
      c.classList.add('enter');
      c.addEventListener('animationend', () => { c.classList.remove('enter'); c.style.animationDelay = ''; }, { once: true });
    });
  }

  // Count up the first number inside an element, keeping its formatting (42,752 · 386K · 10.17% · £7,260)
  function countUp(el, delay) {
    const node = [...el.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent));
    if (!node) return;
    const text = node.textContent;
    const m = text.match(/-?[\d,]*\.?\d+/);
    if (!m) return;
    const raw = m[0];
    const target = parseFloat(raw.replace(/,/g, ''));
    if (!isFinite(target) || target === 0) return;
    const dp = (raw.split('.')[1] || '').length;
    const commas = raw.includes(',') || (Math.abs(target) >= 1000 && !/[KM]/.test(text));
    const before = text.slice(0, m.index);
    const after = text.slice(m.index + raw.length);
    const format = v => {
      let s = v.toFixed(dp);
      if (commas) s = Number(s).toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
      return before + s + after;
    };
    const duration = 900;
    let start = null;
    node.textContent = format(0);
    const step = ts => {
      if (start === null) start = ts + (delay || 0);
      const t = Math.max(0, Math.min(1, (ts - start) / duration));
      node.textContent = t >= 1 ? text : format(target * ease(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function numbers(container) {
    if (reduced()) return;
    container.querySelectorAll('.stat-value, .fval, .goal-top b').forEach((el, i) => countUp(el, Math.min(i * 30, 400)));
  }

  // ---------------------------------------------------------------
  // Confetti
  // ---------------------------------------------------------------
  const COLORS = ['#e4fd9c', '#1b3417', '#9ba898', '#c4968c', '#e4c578', '#b2c8c5', '#f8cba4'];
  let canvas = null;
  let ctx = null;
  let pieces = [];
  let running = false;

  function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.className = 'confetti';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    const size = () => { canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; };
    size();
    addEventListener('resize', size);
  }

  function burst(x, y, count = 90) {
    if (reduced()) return;
    ensureCanvas();
    const dpr = devicePixelRatio;
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const speed = 6 + Math.random() * 9;
      pieces.push({
        x: x * dpr, y: y * dpr,
        vx: Math.cos(angle) * speed * dpr, vy: Math.sin(angle) * speed * dpr,
        w: (5 + Math.random() * 6) * dpr, h: (8 + Math.random() * 8) * dpr,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[i % COLORS.length], life: 0, max: 90 + Math.random() * 50,
        shape: Math.random() < 0.3 ? 'circle' : 'rect'
      });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dpr = devicePixelRatio;
    pieces.forEach(p => {
      p.life++;
      p.vy += 0.32 * dpr;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.max);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)) + dpr);
      ctx.restore();
    });
    pieces = pieces.filter(p => p.life < p.max && p.y < canvas.height + 40);
    if (pieces.length) requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  function burstFrom(el, count) {
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, count);
  }

  // Celebrate each reached goal once per visit; clicking its chip celebrates again
  const celebrated = new Set();
  function celebrate(container) {
    const els = [...container.querySelectorAll('[data-celebrate]')];
    let delay = 500;
    els.forEach(el => {
      el.addEventListener('click', () => burstFrom(el, 70));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); burstFrom(el, 70); } });
      el.setAttribute('title', 'Reached. Click to celebrate again');
      const key = el.dataset.celebrate;
      if (celebrated.has(key)) return;
      celebrated.add(key);
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return; // only celebrate what's on screen
      setTimeout(() => burstFrom(el, 60), delay);
      delay += 220;
    });
  }

  SN.motion = { enter, numbers, countUp, burst, burstFrom, celebrate, reduced };
})();
