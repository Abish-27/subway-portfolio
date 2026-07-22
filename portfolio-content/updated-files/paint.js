// ─────────────────────────────────────────────────────────────────────
//  Ink paint trail
//  Drag to draw on the map like a fountain pen / ink brush on old paper.
//  • Spawns irregular ink/watercolour marks along the pressed pointer path
//  • Reuses the cursor's active line colour, muted toward map ink
//  • Distance-based spawning → continuous trail on fast moves, even spacing
//  • Marks scale in (100–200ms), edges soften (paper absorption), slow fade
//  • Mouse + touch, capped DOM, rAF-driven
// ─────────────────────────────────────────────────────────────────────
(() => {
  // ── Tunables ──
  const STEP        = 28;    // px of travel between dabs (spaced → distinct splotches)
  const MAX_INTERP  = 8;     // max dabs synthesised per frame on fast jumps
  const MAX_MARKS   = 90;    // hard cap on live DOM marks
  const SPREAD      = 6;     // random jitter around the path (px)
  const BLOT_EVERY  = [4, 8];// every N marks, drop a fat ink blot (random in range)

  const rand  = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));

  // ── Paint layer + organic-edge filter ──
  const layer = document.createElement('div');
  layer.id = 'paint-layer';
  document.body.appendChild(layer);

  const style = document.createElement('style');
  style.textContent = `
    #paint-layer {
      position: fixed; inset: 0;
      pointer-events: none;
      z-index: 9990;               /* under the marker cursor (9999) */
      overflow: hidden;
    }
    .ink-mark {
      position: absolute;
      will-change: transform, opacity, filter;
      border-radius: 50%;
      mix-blend-mode: multiply;    /* sits into the paper, like real ink */
      filter: blur(0.4px);
    }
    body.night .ink-mark { mix-blend-mode: screen; }
    @media (prefers-reduced-motion: reduce) {
      .ink-mark { filter: blur(0.4px); }
    }`;
  document.head.appendChild(style);

  // SVG turbulence → displacement gives each mark a rough, hand-inked edge
  const svgNS = 'http://www.w3.org/2000/svg';
  const fsvg = document.createElementNS(svgNS, 'svg');
  fsvg.setAttribute('width', '0');
  fsvg.setAttribute('height', '0');
  fsvg.style.position = 'absolute';
  fsvg.innerHTML = `
    <defs>
      <filter id="ink-rough" x="-40%" y="-40%" width="180%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.02"
                      numOctaves="2" seed="7" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3"
                           xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>`;
  document.body.appendChild(fsvg);

  // ── Colour: each splotch takes the colour of the NEAREST transit line,
  //    so the paint is vivid and changes as you move across the map. ──
  const LINE_COLORS = {
    'tech-top': '#00923F', 'tech-bottom': '#00923F',
    journey: '#1B6FCB', founders: '#E03A36', creative: '#F4A024',
  };
  function hexToRgb(h) {
    h = (h || '').trim().replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    if (isNaN(n) || h.length !== 6) return [26, 24, 21];
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // Sample every line path once into SVG-space points (rebuilt on resize)
  let lineCache = null;
  function lineSamples() {
    if (lineCache && lineCache.length) return lineCache;
    lineCache = [...document.querySelectorAll('#map .line[data-line-id]')]
      .filter((p) => LINE_COLORS[p.dataset.lineId])
      .map((p) => {
        const total = p.getTotalLength();
        const n = Math.max(32, Math.min(120, Math.ceil(total / 18)));
        return {
          color: hexToRgb(LINE_COLORS[p.dataset.lineId]),
          pts: Array.from({ length: n + 1 }, (_, i) => p.getPointAtLength((i / n) * total)),
        };
      });
    return lineCache;
  }
  addEventListener('resize', () => { lineCache = null; });

  function nearestColor(clientX, clientY) {
    const svg = document.getElementById('map');
    const ctm = svg && svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    const sp = pt.matrixTransform(ctm.inverse());
    let best = null, bd = Infinity;
    for (const ln of lineSamples()) {
      for (const p of ln.pts) {
        const d = (p.x - sp.x) * (p.x - sp.x) + (p.y - sp.y) * (p.y - sp.y);
        if (d < bd) { bd = d; best = ln.color; }
      }
    }
    return best;
  }

  function inkRgb(x, y) {
    const night = document.body.classList.contains('night');
    const base = night ? [236, 234, 216] : [26, 24, 21];
    const c = nearestColor(x, y) || base;
    // keep it vivid — barely toward ink so the paint stays bright on paper
    return mix(c, base, 0.05);
  }

  // ── Mark spawning ──
  const marks = [];   // { el } in spawn order, for the cap

  // Smooth organic blob outline — random polar points joined by bézier curves
  // (Catmull-Rom → cubic), so edges curve instead of forming a polygon.
  function blobPath(w, h) {
    const cx = w / 2, cy = h / 2, base = Math.min(w, h) / 2;
    const n = randi(8, 11);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand(-0.10, 0.10);
      const r = base * rand(0.84, 1.0);     // gentle variance → smooth lobes, no cusps
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    const p = (i) => pts[(i + n) % n];
    let d = `M ${p(0)[0].toFixed(1)} ${p(0)[1].toFixed(1)} `;
    for (let i = 0; i < n; i++) {
      const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += `C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
    }
    return `path('${d}Z')`;
  }

  function popOldest() {
    if (marks.length >= MAX_MARKS) {
      const old = marks.shift();
      old.el.remove();
      old.anim && old.anim.cancel();
    }
  }

  // Create one mark (blob or droplet) with the shared scale-in / fade.
  function addMark(x, y, w, h, clip, bg, peak, dur, opts) {
    opts = opts || {};
    popOldest();
    const rot = opts.rotDeg != null ? opts.rotDeg : rand(0, 360);
    const el = document.createElement('div');
    el.className = 'ink-mark';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.style.background = bg;
    if (clip) el.style.clipPath = clip;          // blob silhouette
    else el.style.borderRadius = opts.radius || '50%';  // organic / round droplet
    layer.appendChild(el);

    const grow = rand(110, 200) / dur;
    const base = `translate(-50%,-50%) rotate(${rot}deg)`;
    const anim = el.animate([
      { transform: `${base} scale(0.3)`,  opacity: 0,    filter: 'blur(0.15px)', offset: 0 },
      { transform: `${base} scale(1.06)`, opacity: peak, filter: 'blur(0.2px)',  offset: grow },
      { transform: `${base} scale(1)`,    opacity: peak, filter: 'blur(0.3px)',  offset: Math.min(grow * 2.4, 0.14) },
      { transform: `${base} scale(1)`,    opacity: peak, filter: 'blur(0.35px)', offset: 0.62 },
      { transform: `${base} scale(1)`,    opacity: 0,    filter: 'blur(1.0px)',  offset: 1 },
    ], { duration: dur, easing: 'ease-out', fill: 'forwards' });

    const rec = { el, anim };
    marks.push(rec);
    anim.onfinish = () => {
      el.remove();
      const i = marks.indexOf(rec);
      if (i !== -1) marks.splice(i, 1);
    };
  }

  function spawn(x, y, blot) {
    const night = document.body.classList.contains('night');
    const c = inkRgb(x, y);
    // deeper core of the SAME hue (or lighter in night) → punchy splash, not muddy
    const dark = night ? mix(c, [255, 255, 255], 0.12) : mix(c, [0, 0, 0], 0.20);
    const size = blot ? rand(42, 62) : rand(16, 40);
    const peak = rand(0.82, blot ? 0.92 : 1.0);
    const cx = randi(38, 60), cy = randi(36, 56);
    const bg = `radial-gradient(circle at ${cx}% ${cy}%, ${rgba(dark, 1)} 0%, ${rgba(c, 1)} 34%, ${rgba(c, 1)} 100%)`;
    const w = size, h = size * rand(0.82, 1.18);
    const dur = blot ? rand(5200, 6800) : rand(3800, 5200);

    addMark(x, y, w, h, blobPath(w, h), bg, peak, dur);

    // organic paint droplets — some stretch outward along the fling direction
    const drops = blot ? randi(4, 7) : randi(2, 4);
    const dropBg = `radial-gradient(circle at 50% 45%, ${rgba(dark, 1)} 0%, ${rgba(c, 1)} 60%, ${rgba(c, 1)} 100%)`;
    for (let i = 0; i < drops; i++) {
      const ang = rand(0, Math.PI * 2);
      const dist = size * rand(0.5, 1.5);
      const ds = rand(3, blot ? 8 : 5.5);
      const elong = Math.random() < 0.5 ? rand(1.3, 2.1) : rand(1, 1.2);  // some streak
      const radius =
        `${randi(45, 60)}% ${randi(40, 55)}% ${randi(45, 60)}% ${randi(40, 55)}% / ` +
        `${randi(48, 60)}% ${randi(45, 58)}% ${randi(42, 55)}% ${randi(45, 58)}%`;
      addMark(
        x + Math.cos(ang) * dist,
        y + Math.sin(ang) * dist,
        ds * elong, ds,
        null, dropBg,
        rand(0.5, peak), dur * rand(0.7, 1.0),
        { rotDeg: ang * 180 / Math.PI, radius },   // long axis points outward
      );
    }
  }

  let sinceBlot = 0;
  let blotAt = randi(BLOT_EVERY[0], BLOT_EVERY[1]);
  function dab(x, y) {
    const jx = x + rand(-SPREAD, SPREAD);
    const jy = y + rand(-SPREAD, SPREAD);
    const blot = ++sinceBlot >= blotAt;
    if (blot) { sinceBlot = 0; blotAt = randi(BLOT_EVERY[0], BLOT_EVERY[1]); }
    spawn(jx, jy, blot);
  }

  // ── Pointer tracking + rAF spawn loop ──
  let pressed = false;
  let curX = 0, curY = 0;
  let last = null;          // last spawn anchor

  function isFormTarget(t) {
    return t instanceof Element &&
      t.closest('input, textarea, select, [contenteditable="true"]');
  }

  addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;  // left / touch / pen only
    if (isFormTarget(e.target)) return;
    pressed = true;
    curX = e.clientX; curY = e.clientY;
    last = { x: curX, y: curY };
    dab(curX, curY);                                          // single click → one splat
  }, { passive: true });

  addEventListener('pointermove', (e) => {
    curX = e.clientX; curY = e.clientY;
  }, { passive: true });

  function release() { pressed = false; last = null; }       // stop immediately
  addEventListener('pointerup', release, { passive: true });
  addEventListener('pointercancel', release, { passive: true });
  addEventListener('blur', release);

  function loop() {
    if (pressed && last) {
      const dx = curX - last.x, dy = curY - last.y;
      const dist = Math.hypot(dx, dy);
      if (dist >= STEP) {
        const steps = Math.min(Math.floor(dist / STEP), MAX_INTERP);
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          dab(last.x + dx * t, last.y + dy * t);             // fill the gap → continuous
        }
        last = { x: curX, y: curY };
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
