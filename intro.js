// ─────────────────────────────────────────────────────────────────────
//  Intro — “Commencing Service”
//  Act 1  A split-flap departures board wakes up on a dark screen
//  Act 2  Lights on — the paper map is revealed, chrome slides in
//  Act 3  Lines ink themselves across the map behind a glowing pen nib
//         that sprays ink; stations pop as the nib passes; the topbar
//         line key lights up line by line
//  Act 4  The first train of the day rides the Journey line into
//         Central — the medallion bursts in. Good service on all lines.
//
//  Skippable (ESC / ENTER / SPACE / button). Gated off entirely for
//  prefers-reduced-motion and ?nointro by the inline script in <head>.
//  Repeat visits in the same session run an express (faster) service.
// ─────────────────────────────────────────────────────────────────────
(() => {
  const root = document.documentElement;
  if (!root.classList.contains('intro-prep')) return;

  let seen = false;
  try { seen = sessionStorage.getItem('pta-intro') === '1'; } catch (e) {}
  const SPEED = seen ? 0.62 : 1;
  const S = ms => Math.round(ms * SPEED);

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·' ";

  function init() {
    const TR = window.__TRANSIT;
    if (!TR) { root.classList.remove('intro-prep'); return; }
    root.classList.add('intro-run');

    const svgEl = document.getElementById('map');
    const overlayLayer = document.getElementById('overlay-layer');
    const trainEl = document.getElementById('train');
    const keys = [...document.querySelectorAll('.topbar .key-item')];
    const hintEl = document.querySelector('.bottom-strip .hint');
    const routeWords = {
      journey: [document.getElementById('route-word-experience')],
      founders: [document.getElementById('route-word-ventures')],
      tech: [
        document.getElementById('route-word-projects'),
        document.getElementById('route-word-games'),
      ],
      creative: [document.getElementById('route-word-music')],
    };

    // ── bookkeeping so SKIP can tear the whole show down ──
    const timers = [], intervals = [], rafs = [];
    const dashed = [];   // { el, anim } — stroke-draw animations
    const loose = [];    // DOM nodes removed on finish
    let done = false;
    const st = (ms, fn) => timers.push(setTimeout(fn, ms));

    // ── prep beneath the blackout: hide stations, dim keys, park dashes ──
    const stations = [...document.querySelectorAll('#stations-layer .station')];
    stations.forEach(g => g.classList.add('st-hide'));
    Object.values(routeWords).flat().filter(Boolean).forEach(el => el.classList.remove('route-word-reveal'));
    keys.forEach(k => k.classList.add('key-off'));
    trainEl.classList.add('intro-hidden');

    const allPaths = [...document.querySelectorAll('#lines-layer path')];
    const families = {};   // lineId → { paths, length, main }
    for (const [lineId, main] of Object.entries(TR.pathEls)) {
      const d = main.getAttribute('d');
      const fam = allPaths.filter(p => p.getAttribute('d') === d);
      const L = main.getTotalLength();
      fam.forEach(p => {
        if (p.hasAttribute('stroke-dasharray')) { p.style.opacity = '0'; return; }
        p.style.strokeDasharray = `${L}px`;
        p.style.strokeDashoffset = `${L}px`;
      });
      families[lineId] = { paths: fam, length: L, main };
    }

    // ── overlay: the departures board ──
    const now = new Date();
    const hour = now.getHours();
    const greeting =
      hour < 5 ? 'NIGHT SERVICE' :
      hour < 12 ? 'GOOD MORNING' :
      hour < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
    const hh = String(hour).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    const overlay = document.createElement('div');
    overlay.id = 'intro-overlay';
    overlay.innerHTML = `
      <div class="intro-kicker">Portfolio Transit Authority</div>
      <div class="intro-rows">
        <div class="flip-line flip-line-sub"></div>
        <div class="flip-line"></div>
        <div class="flip-line flip-line-sub"></div>
      </div>
      <div class="intro-clock">ALL LINES · FIRST DEPARTURE ${hh}:${mm}</div>`;
    document.body.appendChild(overlay);
    loose.push(overlay);

    const [row1, row2, row3] = overlay.querySelectorAll('.flip-line');
    buildRow(row1, greeting);
    buildRow(row2, 'ABISH KULKARNI');
    buildRow(row3, 'COMMENCING SERVICE');

    const skip = document.createElement('button');
    skip.id = 'intro-skip';
    skip.type = 'button';
    skip.textContent = 'SKIP INTRO ⏵';
    skip.addEventListener('click', () => finish(true));
    document.body.appendChild(skip);
    loose.push(skip);

    const caption = document.createElement('div');
    caption.id = 'intro-caption';
    document.body.appendChild(caption);
    loose.push(caption);

    const ink = document.createElement('div');
    ink.id = 'intro-ink';
    document.body.appendChild(ink);
    loose.push(ink);

    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        finish(true);
      }
    };
    window.addEventListener('keydown', onKey);

    // ── split-flap helpers ──
    function buildRow(rowEl, text) {
      for (const ch of text) {
        const f = document.createElement('span');
        f.className = 'flap';
        f.dataset.ch = ch;
        f.textContent = ' ';
        rowEl.appendChild(f);
      }
    }
    function flip(el, ch) {
      el.textContent = ch;
      el.classList.remove('flap-flip');
      void el.offsetWidth;
      el.classList.add('flap-flip');
    }
    function runRow(rowEl) {
      [...rowEl.children].forEach((f, i) => st(i * S(30), () => {
        let n = 6 + Math.floor(Math.random() * 5);
        const iv = setInterval(() => {
          if (n-- > 0) { flip(f, CHARSET[Math.floor(Math.random() * CHARSET.length)]); return; }
          flip(f, f.dataset.ch);
          clearInterval(iv);
        }, 52);
        intervals.push(iv);
      }));
    }

    function setCaption(text) {
      caption.classList.remove('on');
      st(180, () => {
        caption.textContent = text;
        caption.classList.add('on');
      });
    }

    // ── ink spray at the drawing tip ──
    let ctm = null;
    function toClient(p) {
      return { x: ctm.a * p.x + ctm.c * p.y + ctm.e, y: ctm.b * p.x + ctm.d * p.y + ctm.f };
    }
    function splat(pt, color) {
      if (!ctm) return;
      const c = toClient(pt);
      const size = 5 + Math.random() * 11;
      const el = document.createElement('div');
      el.className = 'intro-ink-mark';
      el.style.left = c.x + 'px';
      el.style.top = c.y + 'px';
      el.style.width = size + 'px';
      el.style.height = size * (0.85 + Math.random() * 0.3) + 'px';
      el.style.background = color;
      el.style.borderRadius =
        `${45 + Math.random() * 15}% ${40 + Math.random() * 20}% ` +
        `${45 + Math.random() * 15}% ${40 + Math.random() * 20}%`;
      ink.appendChild(el);
      const a = el.animate([
        { transform: 'translate(-50%,-50%) scale(0.3)', opacity: 0.6 },
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 0.4, offset: 0.25 },
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 },
      ], { duration: 1100 + Math.random() * 700, easing: 'ease-out', fill: 'forwards' });
      a.onfinish = () => el.remove();
    }

    // ── line drawing ──
    function lineColorOf(lineId) {
      const l = TR.LINES.find(x => x.id === lineId);
      return l ? l.color : '#1a1815';
    }

    function drawLine(lineId, dur) {
      const fam = families[lineId];
      const L = fam.length;
      fam.paths.forEach(p => {
        if (p.hasAttribute('stroke-dasharray')) {
          // pre-dashed decorative stroke — just fade it in at the end
          st(dur, () => { p.style.transition = 'opacity .5s ease'; p.style.opacity = ''; });
          return;
        }
        const anim = p.animate(
          [{ strokeDashoffset: `${L}px` }, { strokeDashoffset: '0px' }],
          { duration: dur, easing: 'linear', fill: 'forwards' });
        anim.onfinish = () => {
          anim.cancel();
          p.style.strokeDasharray = '';
          p.style.strokeDashoffset = '';
        };
        dashed.push({ el: p, anim });
      });

      // glowing pen nib rides the tip of the freshly-inked line
      const color = lineColorOf(lineId);
      const nib = document.createElementNS(SVG_NS, 'circle');
      nib.setAttribute('class', 'intro-nib');
      nib.setAttribute('r', '7');
      nib.setAttribute('fill', color);
      nib.style.filter = `drop-shadow(0 0 7px ${color})`;
      overlayLayer.appendChild(nib);
      loose.push(nib);

      const t0 = performance.now();
      let lastPt = fam.main.getPointAtLength(0);
      let travelled = 0, nextGap = 30;
      const tick = (t) => {
        if (done) return;
        const k = Math.min(1, (t - t0) / dur);
        const p = fam.main.getPointAtLength(k * L);
        nib.setAttribute('cx', p.x);
        nib.setAttribute('cy', p.y);
        travelled += Math.hypot(p.x - lastPt.x, p.y - lastPt.y);
        lastPt = p;
        if (travelled >= nextGap) {
          travelled = 0;
          nextGap = 26 + Math.random() * 22;
          splat(p, color);
        }
        if (k < 1) rafs.push(requestAnimationFrame(tick));
        else {
          const fade = nib.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: 'forwards' });
          fade.onfinish = () => nib.remove();
          st(600, () => nib.remove());   // fallback for throttled tabs
        }
      };
      rafs.push(requestAnimationFrame(tick));
    }

    // ── station reveals ──
    const revealed = new Set(['central']);   // Central is saved for the finale
    function revealStation(id) {
      if (revealed.has(id)) return;
      revealed.add(id);
      const g = TR.stationEls[id];
      if (!g) return;
      g.classList.remove('st-hide');
      g.classList.add('st-pop');
      st(700, () => g.classList.remove('st-pop'));
    }
    function revealCentral() {
      const g = TR.stationEls['central'];
      if (!g) return;
      g.classList.remove('st-hide');
      g.classList.add('st-pop-central');
      st(1000, () => g.classList.remove('st-pop-central'));
    }
    function revealRouteWords(key) {
      (routeWords[key] || []).filter(Boolean).forEach((el, i) => {
        st(i * S(130), () => {
          el.classList.remove('route-word-reveal');
          void el.getBoundingClientRect();
          el.classList.add('route-word-reveal');
        });
      });
    }
    function burstRings() {
      const c = TR.stationIndex['central'][0];
      const colors = ['#00923F', '#F4A024', '#1B6FCB', '#E03A36'];
      colors.forEach((col, i) => st(i * S(130), () => {
        const ring = document.createElementNS(SVG_NS, 'circle');
        ring.setAttribute('class', 'burst-ring');
        ring.setAttribute('cx', c.x);
        ring.setAttribute('cy', c.y);
        ring.setAttribute('r', '30');
        ring.setAttribute('stroke', col);
        ring.setAttribute('stroke-width', '3');
        overlayLayer.appendChild(ring);
        loose.push(ring);
        const a = ring.animate([
          { transform: 'scale(0.4)', opacity: 0.65 },
          { transform: 'scale(3.4)', opacity: 0 },
        ], { duration: S(950), easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
        a.onfinish = () => ring.remove();
      }));
    }

    // ════════ Timeline ════════════════════════════════════════════
    // Act 1 — the board wakes up
    st(S(140), () => overlay.querySelector('.intro-kicker').classList.add('on'));
    st(S(300), () => runRow(row1));
    st(S(700), () => runRow(row2));
    st(S(1150), () => runRow(row3));
    st(S(1400), () => overlay.querySelector('.intro-clock').classList.add('on'));

    // Act 2 — lights on
    const lightsAt = S(2750);
    st(lightsAt, () => {
      root.classList.remove('intro-prep');   // chrome slides in behind the fading board
      const a = overlay.animate(
        [{ opacity: 1 }, { opacity: 0.35 }, { opacity: 0.9 }, { opacity: 0.12 }, { opacity: 0.5 }, { opacity: 0 }],
        { duration: S(620), easing: 'ease-out', fill: 'forwards' });
      a.onfinish = () => overlay.remove();
    });
    // belt-and-braces: onfinish can fire late in throttled/background tabs
    st(lightsAt + S(1400), () => overlay.remove());

    // Act 3 — lines ink themselves in
    const SEQ = [
      { ids: ['journey'],                 key: 0, word: 'journey',  label: 'Laying track · L1 Journey Line — Mumbai Metro' },
      { ids: ['founders'],                key: 3, word: 'founders', label: 'Laying track · L4 Founder Line — NYC · NJ Transit' },
      { ids: ['tech-top', 'tech-bottom'], key: 1, word: 'tech',     label: 'Laying track · L2 Tech Line — TTC Bloor–Danforth' },
      { ids: ['creative'],                key: 2, word: 'creative', label: 'Laying track · L3 Creative Loop — Singapore MRT' },
    ];
    const linesAt = lightsAt + S(780);
    st(linesAt - 30, () => { ctm = svgEl.getScreenCTM(); });

    let cursorMs = 0;
    let journeyEnd = 0;
    let linesEnd = 0;
    for (const seq of SEQ) {
      const start = linesAt + cursorMs;
      let groupDur = 0;
      st(start, () => setCaption(seq.label));
      for (const id of seq.ids) {
        const dur = Math.round(Math.max(S(950), Math.min(S(2250), families[id].length * 1.35 * SPEED)));
        groupDur = Math.max(groupDur, dur);
        st(start, () => drawLine(id, dur));
        // stations pop as the nib passes their spot on the path
        const total = families[id].length;
        for (const [sid, entries] of Object.entries(TR.stationIndex)) {
          for (const e of entries) {
            if (e.lineId !== id) continue;
            st(start + Math.round((e.length / total) * dur), () => revealStation(sid));
          }
        }
      }
      st(start + groupDur, () => {
        const k = keys[seq.key];
        if (!k) return;
        k.classList.remove('key-off');
        k.animate(
          [{ filter: 'brightness(1)' }, { filter: 'brightness(2)' }, { filter: 'brightness(1)' }],
          { duration: 500 });
        revealRouteWords(seq.word);
      });
      const end = cursorMs + groupDur;
      if (seq.ids[0] === 'journey') journeyEnd = end;
      linesEnd = Math.max(linesEnd, end);
      cursorMs += Math.round(groupDur * 0.58);
    }

    // Act 4 — first train of the day
    const rideDur = S(2100);
    const rideAt = linesAt + Math.max(journeyEnd + S(250), linesEnd + S(400) - rideDur);
    st(rideAt, () => {
      setCaption('First service departing — next stop, Central');
      trainEl.classList.remove('intro-hidden');
      TR.introRide(rideDur).then(ok => {
        if (done || !ok) return;
        revealCentral();
        burstRings();
        setCaption('● Good service on all lines');
        if (hintEl) {
          hintEl.classList.add('hint-flash');
          st(3600, () => hintEl.classList.remove('hint-flash'));
        }
        st(S(1700), () => finish(false));
      });
    });

    // ── teardown (shared by SKIP and natural completion) ──
    function finish(skipped) {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      rafs.forEach(cancelAnimationFrame);
      window.removeEventListener('keydown', onKey);
      TR.abortNav();
      dashed.forEach(({ anim }) => { try { anim.cancel(); } catch (e) {} });
      // clear prep styles on EVERY path — lines whose draw never started
      // would otherwise stay invisible after an early skip
      allPaths.forEach(p => {
        p.style.strokeDasharray = '';
        p.style.strokeDashoffset = '';
        p.style.opacity = '';
      });
      stations.forEach(g => g.classList.remove('st-hide', 'st-pop', 'st-pop-central'));
      Object.values(routeWords).flat().filter(Boolean).forEach(el => el.classList.add('route-word-reveal'));
      keys.forEach(k => k.classList.remove('key-off'));
      loose.forEach(el => el.remove());
      trainEl.classList.remove('intro-hidden');
      TR.placeTrainAtStation('central');
      root.classList.remove('intro-prep', 'intro-run');
      if (hintEl && skipped) hintEl.classList.remove('hint-flash');
      try { sessionStorage.setItem('pta-intro', '1'); } catch (e) {}
    }
  }

  if (window.__TRANSIT) init();
  else document.addEventListener('transit:ready', init, { once: true });
})();
