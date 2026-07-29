// ─────────────────────────────────────────────────────────────────────
//  Transit-map portfolio — core app
// ─────────────────────────────────────────────────────────────────────
(() => {
const { LINES, STATIONS, CENTRAL, ALERTS } = window.MAP_DATA;

// ════════ Path helpers ═════════════════════════════════════════════
// Smooth Catmull-Rom-to-Bezier path through every waypoint.
// Lines feel alive — gentle curves with no ruler-straight segments.
// Tangent magnitudes are clamped to the local chord length to prevent overshoot.
function buildPath(waypoints, tensionOrLine) {
  if (waypoints.length < 2) return '';
  if (waypoints.length === 2) {
    return `M ${waypoints[0].x} ${waypoints[0].y} L ${waypoints[1].x} ${waypoints[1].y}`;
  }
  const k = 1 / 6;
  let d = `M ${waypoints[0].x} ${waypoints[0].y}`;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p0 = waypoints[i - 1] || waypoints[i];
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const p3 = waypoints[i + 2] || p2;
    let t1x = k * (p2.x - p0.x);
    let t1y = k * (p2.y - p0.y);
    let t2x = k * (p3.x - p1.x);
    let t2y = k * (p3.y - p1.y);
    // Cap tangent magnitudes at ~40% of the segment chord — prevents the
    // curve from ballooning outside the polyline at sharp angle changes.
    const seg = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
    const cap = seg * 0.4;
    const m1 = Math.hypot(t1x, t1y);
    const m2 = Math.hypot(t2x, t2y);
    if (m1 > cap) { t1x *= cap / m1; t1y *= cap / m1; }
    if (m2 > cap) { t2x *= cap / m2; t2y *= cap / m2; }
    const c1x = p1.x + t1x, c1y = p1.y + t1y;
    const c2x = p2.x - t2x, c2y = p2.y - t2y;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// Special-case loop path: connector stub from Central + actual elliptical arc.
// The path is one continuous SVG path so getPointAtLength still works for the train.
function buildLoopPath(line) {
  const { cx, cy, rx, ry } = line.loopGeom;
  // Start at Central, ride east to the loop's west edge, then trace the ellipse.
  const wp = line.waypoints;
  const central = wp[0];
  const entry = wp[1]; // music-portfolio — west side of loop
  let d = `M ${central.x} ${central.y}`;
  d += ` C ${central.x + 80} ${central.y - 4}, ${entry.x - 80} ${entry.y + 4}, ${entry.x} ${entry.y}`;
  // Two half-ellipse arcs to draw a complete loop and return to entry point.
  // sweep-flag 1 = visual clockwise: west → top → east → bottom → west.
  d += ` A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`;
  d += ` A ${rx} ${ry} 0 0 1 ${cx - rx} ${cy}`;
  return d;
}

// Build a Map: stationId → { line, point, lengthOnPath }
// Sampled from the rendered SVG path so the train rides EXACTLY on the stroke.
function indexStationPositions(lineMap) {
  const idx = {};
  for (const line of LINES) {
    const pathEl = lineMap[line.id];
    const total = pathEl.getTotalLength();
    // For each station waypoint, find the length-along-path that's closest to it.
    for (const wp of line.waypoints) {
      if (!wp.station) continue;
      const lenAlong = findLengthForPoint(pathEl, wp, total);
      if (!idx[wp.station]) idx[wp.station] = [];
      idx[wp.station].push({
        lineId: line.id,
        x: wp.x, y: wp.y,
        length: lenAlong,
        totalLength: total,
      });
    }
  }
  return idx;
}

function findLengthForPoint(pathEl, target, total, samples = 200) {
  let bestLen = 0;
  let bestDist = Infinity;
  for (let i = 0; i <= samples; i++) {
    const len = (i / samples) * total;
    const pt = pathEl.getPointAtLength(len);
    const d = (pt.x - target.x) ** 2 + (pt.y - target.y) ** 2;
    if (d < bestDist) { bestDist = d; bestLen = len; }
  }
  // refine
  let step = total / samples;
  for (let iter = 0; iter < 5; iter++) {
    step /= 2;
    for (const off of [-step, step]) {
      const len = Math.max(0, Math.min(total, bestLen + off));
      const pt = pathEl.getPointAtLength(len);
      const d = (pt.x - target.x) ** 2 + (pt.y - target.y) ** 2;
      if (d < bestDist) { bestDist = d; bestLen = len; }
    }
  }
  return bestLen;
}

// ════════ Rendering the map ════════════════════════════════════════
const svg = document.getElementById('map');
const linesLayer  = document.getElementById('lines-layer');
const stationsLayer = document.getElementById('stations-layer');
const labelsLayer = document.getElementById('labels-layer');
const overlayLayer = document.getElementById('overlay-layer');

const pathEls = {};
const stationEls = {};

function renderLines() {
  LINES.forEach(line => {
    const d = line.isLoop ? buildLoopPath(line) : buildPath(line.waypoints);

    // Soft outer halo for the line
    const halo = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    halo.setAttribute('d', d);
    halo.setAttribute('class', 'line-halo');
    halo.setAttribute('stroke', line.color);
    if (!line.secret) linesLayer.appendChild(halo);

    // Main stroke
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    p.setAttribute('class', `line line-${line.id}`);
    p.setAttribute('stroke', line.color);
    p.dataset.lineId = line.id;
    if (line.dashed) p.setAttribute('stroke-dasharray', '14 8');
    if (line.dotted) {
      p.setAttribute('stroke-dasharray', '2 10');
      p.classList.add('line-secret');
    }
    if (line.specialService) {
      // Black with gold dashed accent on top
      p.setAttribute('stroke-dasharray', '10 6');
    }
    p.addEventListener('mouseenter', () => onLineHover(line, true));
    p.addEventListener('mouseleave', () => onLineHover(line, false));
    p.addEventListener('click', e => {
      if (line.secret) e.stopPropagation();
    });
    linesLayer.appendChild(p);
    pathEls[line.id] = p;

    // Inner highlight — a thinner stroke sitting inside the main one, slightly lighter.
    // Gives a subtle, "polished metal rail" feel without changing the line's identity colour.
    if (!line.secret && !line.specialService && !line.doubleStripe) {
      const inner = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      inner.setAttribute('d', d);
      inner.setAttribute('class', 'line-inner');
      inner.setAttribute('stroke', line.color);
      inner.setAttribute('fill', 'none');
      inner.style.pointerEvents = 'none';
      linesLayer.appendChild(inner);
    }

    // Mumbai-style DOUBLE-STRIPE for the Journey line — a paper-coloured
    // gutter down the centre of the stroke makes the single path read as
    // two parallel blue lines running together.
    if (line.doubleStripe) {
      const gutter = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      gutter.setAttribute('d', d);
      gutter.setAttribute('class', 'line-gutter');
      gutter.setAttribute('stroke', 'var(--bg-paper)');
      gutter.setAttribute('fill', 'none');
      gutter.style.pointerEvents = 'none';
      linesLayer.appendChild(gutter);
    }

    // Gold accent overlay for the BACSA Hacks special-service stub
    if (line.specialService && line.accentColor) {
      const accent = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      accent.setAttribute('d', d);
      accent.setAttribute('class', 'line-accent');
      accent.setAttribute('stroke', line.accentColor);
      accent.setAttribute('fill', 'none');
      accent.setAttribute('stroke-dasharray', '2 14');
      accent.style.pointerEvents = 'none';
      linesLayer.appendChild(accent);
    }
  });

}

let hoverLabelEl = null;
function onLineHover(line, on) {
  if (line.secret) return;
  if (on) {
    if (hoverLabelEl) hoverLabelEl.remove();
    hoverLabelEl = document.createElement('div');
    hoverLabelEl.className = 'line-hover-label';
    hoverLabelEl.innerHTML = `
      <span class="dot" style="background:${line.color}"></span>
      <span class="lname">${line.name}</span>
      <span class="lcity" style="font-family:${line.cityFont}">${line.city}</span>
    `;
    document.body.appendChild(hoverLabelEl);
  } else if (hoverLabelEl) {
    hoverLabelEl.remove();
    hoverLabelEl = null;
  }
}
document.addEventListener('mousemove', e => {
  if (hoverLabelEl) {
    hoverLabelEl.style.left = (e.clientX + 16) + 'px';
    hoverLabelEl.style.top  = (e.clientY + 16) + 'px';
  }
});

function renderStations() {
  // Build a quick lookup: stationId → array of {line, point}
  const seen = new Set();
  for (const line of LINES) {
    for (const wp of line.waypoints) {
      if (!wp.station) continue;
      const id = wp.station;
      if (seen.has(id)) continue;
      seen.add(id);
      const station = STATIONS[id];
      if (!station) continue;
      drawStation(id, wp, station, line);
    }
  }
}

// Short codes shown inside the Creative line's pill badges + Journey major badge.
const STATION_CODES = {
  'music-portfolio':  'CL1',
  'banger-generator': 'CL2',
  'ghostnote':        'CL3',
  'drumming':         'CL4',
  'bands':            'CL5',
  'certifications':   'CL6',
  'education':        'VOL',
};

const SVG_NS = 'http://www.w3.org/2000/svg';

// ════════ Station hover ticket ═════════════════════════════════════
const ticketEl = document.createElement('div');
ticketEl.id = 'station-ticket';
ticketEl.setAttribute('aria-hidden', 'true');
document.body.appendChild(ticketEl);

let ticketTimer = null;
let ticketPos = { x: 0, y: 0 };

function ticketPhoto(station) {
  if (station.galleryImages?.[0]?.src) return station.galleryImages[0].src;
  if (station.content?.images?.[0]?.src) return station.content.images[0].src;
  if (station.content?.items) {
    const itemWithImage = station.content.items.find(item => item.images?.[0]?.src);
    if (itemWithImage) return itemWithImage.images[0].src;
  }
  if (station.content?.projects) {
    const projectWithImage = station.content.projects.find(project => project.images?.[0]?.src);
    if (projectWithImage) return projectWithImage.images[0].src;
  }
  return station.postcardImage || null;
}

function ticketBlurbText(station) {
  if (station.ticketBlurb) return station.ticketBlurb;
  const content = station.content || {};
  return content.tagline || content.note || 'A short description of this stop goes here.';
}

function renderTicket(id) {
  const station = STATIONS[id];
  if (!station) return;
  const line = LINES.find(candidate => candidate.id === station.lineIds[0]) || {};
  const lineColor = line.color || 'var(--ink)';
  const origin = STATIONS[currentStation]?.name || 'Central';
  const destination = station.name || '';
  const destinationSub = station.city || line.city || '';
  const code = STATION_CODES[id] || line.short || '';
  const photo = ticketPhoto(station);
  const sameStop = id === currentStation;

  ticketEl.style.setProperty('--line-color', lineColor);
  ticketEl.innerHTML = `
    <div class="tk-head">
      <span class="tk-line"><span class="tk-line-chip">${line.short || ''}</span>${(line.name || '').toUpperCase()}</span>
      <span class="tk-code">${code}</span>
    </div>
    <div class="tk-route">
      <div class="tk-od">
        <div class="tk-od-label">${sameStop ? 'YOU ARE HERE' : 'FROM'}</div>
        <div class="tk-od-name">${sameStop ? '—' : origin}</div>
      </div>
      <div class="tk-arrow">→</div>
      <div class="tk-od tk-od-to">
        <div class="tk-od-label">TO</div>
        <div class="tk-od-name">${destination}</div>
        <div class="tk-od-sub">${destinationSub}</div>
      </div>
    </div>
    <div class="tk-body">
      ${photo ? `<div class="tk-stamp"><img src="${photo}" alt="" /><span class="tk-stamp-ring"></span></div>` : ''}
      <p class="tk-blurb">${ticketBlurbText(station)}</p>
    </div>
    <div class="tk-foot">
      <span>ADMIT ONE</span>
      <span class="tk-foot-code">${code} · ${line.short || ''}</span>
    </div>`;
}

function positionTicket() {
  const pad = 16;
  const width = ticketEl.offsetWidth || 268;
  const height = ticketEl.offsetHeight || 200;
  let x = ticketPos.x + 20;
  let y = ticketPos.y + 20;
  if (x + width + pad > window.innerWidth) x = ticketPos.x - width - 20;
  if (y + height + pad > window.innerHeight) y = window.innerHeight - height - pad;
  ticketEl.style.left = Math.max(pad, x) + 'px';
  ticketEl.style.top = Math.max(pad, y) + 'px';
}

function showTicket(id) {
  renderTicket(id);
  ticketEl.classList.add('on');
  ticketEl.setAttribute('aria-hidden', 'false');
  positionTicket();
}

function hideTicket() {
  if (ticketTimer) {
    clearTimeout(ticketTimer);
    ticketTimer = null;
  }
  ticketEl.classList.remove('on');
  ticketEl.setAttribute('aria-hidden', 'true');
}

function mapStationSketch(station) {
  const key = station?.bgSketch;
  const raw = key && window.STATION_SKETCHES?.[key];
  if (!raw) return null;
  const placement = window.STATION_SKETCH_PLACEMENT?.[key]
    || { w: 190, h: 320, anchor: 'bottom' };
  const { w, h } = placement;
  const y0 = placement.anchor === 'center' ? -h / 2
    : placement.anchor === 'base' ? -h
    : 36 - h;
  const x = -w / 2 + (placement.ox || 0);
  const y = y0 + (placement.oy || 0);
  const inner = raw
    .replace(/pencil-([a-z0-9]+)/g, 'pencil-$1-map')
    .replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
  const wrapper = document.createElementNS(SVG_NS, 'g');
  wrapper.setAttribute('class', 'map-sketch');
  wrapper.innerHTML = inner;
  return wrapper;
}

function drawStation(id, wp, station, primaryLine) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', `station station-${id}` + (station.secret ? ' station-secret' : '') + (station.locked ? ' station-locked' : ''));
  g.setAttribute('transform', `translate(${wp.x} ${wp.y})`);
  g.dataset.stationId = id;

  const mapSketch = mapStationSketch(station);
  if (mapSketch) g.appendChild(mapSketch);

  // Marker visuals live in their own sub-group so the intro can scale-pop
  // them around their own centre without disturbing the group's translate.
  const core = document.createElementNS(SVG_NS, 'g');
  core.setAttribute('class', 'st-core');
  g.appendChild(core);

  const isCentral = station.type === 'central';
  const isMini = station.type === 'mini';
  const isTerminus = station.type === 'terminus';
  const splitDot = station.splitDot;

  // ── Specialty markers (override per-line style) ──
  if (isCentral) {
    drawCentralMarker(core);
  } else if (splitDot) {
    drawSplitDotMarker(core, splitDot);
  } else if (station.secret) {
    drawSecretMarker(core, primaryLine);
  } else if (isMini) {
    drawMiniMarker(core, primaryLine);
  } else if (id === 'education') {
    // Mumbai-style major-station rectangle badge
    drawJourneyMajorMarker(core, STATION_CODES[id]);
  } else if (isTerminus && (primaryLine.id === 'tech-top' || primaryLine.id === 'tech-bottom')) {
    drawTtcTerminusMarker(core, primaryLine);
  } else {
    // ── Per-line default ──
    switch (primaryLine.id) {
      case 'tech-top':
      case 'tech-bottom':
        drawTechStation(core, primaryLine);
        break;
      case 'journey':
        drawJourneyStation(core, primaryLine);
        break;
      case 'creative':
        drawCreativeStation(core, id, primaryLine);
        break;
      case 'founders':
        drawFounderStation(core);
        break;
      default:
        drawDefaultStation(core, primaryLine);
    }
  }

  if (station.markerLogo) {
    drawMarkerLogo(core, id, station.markerLogo);
  }

  // ── Label ──
  drawStationLabel(g, id, station, primaryLine);

  if (station.locked) {
    stationsLayer.appendChild(g);
    stationEls[id] = g;
    return;
  }

  // Hit target (transparent, larger)
  const hit = circle(0, 0, 26, { fill: 'transparent', 'pointer-events': 'all' });
  hit.style.cursor = 'pointer';
  g.appendChild(hit);

  g.addEventListener('click', (e) => {
    e.stopPropagation();
    hideTicket();
    onStationClick(id);
  });
  g.addEventListener('mouseenter', (e) => {
    g.classList.add('hover');
    if (station.type === 'central') return;
    ticketPos = { x: e.clientX, y: e.clientY };
    if (ticketTimer) clearTimeout(ticketTimer);
    ticketTimer = setTimeout(() => showTicket(id), 380);
  });
  g.addEventListener('mousemove', (e) => {
    ticketPos = { x: e.clientX, y: e.clientY };
    if (ticketEl.classList.contains('on')) positionTicket();
  });
  g.addEventListener('mouseleave', () => {
    g.classList.remove('hover');
    hideTicket();
  });

  stationsLayer.appendChild(g);
  stationEls[id] = g;
}

// ════════ Marker variants ═════════════════════════════════════════

function drawCentralMarker(g) {
  // Line colours that meet here — used to colour the four "compass" rays.
  // Order: top, right, bottom, left (clockwise from 12).
  const LINE_COLORS = [
    '#00923F', // tech (north — the two tracks across the top)
    '#F4A024', // creative (east — the loop)
    '#1B6FCB', // journey (south — Mumbai blue)
    '#E03A36', // founder (west — NYC red)
  ];

  // 1) Wide soft halo behind everything
  g.appendChild(circle(0, 0, 86, { fill: 'url(#centralGlow)', 'pointer-events': 'none' }));

  // 2) Outer orbital ring — dashed, very faint. Suggests "city limits".
  const orbital = circle(0, 0, 72, {
    fill: 'none',
    stroke: 'var(--ink)',
    'stroke-width': 0.8,
    'stroke-dasharray': '2 5',
    opacity: 0.30,
    'pointer-events': 'none',
  });
  g.appendChild(orbital);

  // 3) 8-point sunburst — long coloured rays at N/E/S/W (one per line),
  //    short ink-coloured rays at the diagonals.
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45 - 90) * Math.PI / 180;
    const isCardinal = i % 2 === 0;
    const inner = 38;
    const outer = isCardinal ? 64 : 50;
    const halfWidth = isCardinal ? 5 : 2;
    const color = isCardinal ? LINE_COLORS[i / 2] : 'var(--ink)';
    const opacity = isCardinal ? 0.92 : 0.55;
    const px = Math.cos(angle), py = Math.sin(angle);
    const qx = -py, qy = px;            // perpendicular unit vector
    const baseAx = px * inner + qx * halfWidth;
    const baseAy = py * inner + qy * halfWidth;
    const baseBx = px * inner - qx * halfWidth;
    const baseBy = py * inner - qy * halfWidth;
    const tipX = px * outer, tipY = py * outer;
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `${baseAx},${baseAy} ${baseBx},${baseBy} ${tipX},${tipY}`);
    poly.setAttribute('fill', color);
    poly.setAttribute('opacity', opacity);
    poly.style.pointerEvents = 'none';
    g.appendChild(poly);
  }

  // 4) Heavy outer badge — the medallion face
  g.appendChild(circle(0, 0, 40, {
    fill: 'var(--bg-paper)',
    stroke: 'var(--ink)',
    'stroke-width': 5,
  }));

  // 5) Compass-dial tick marks around the badge — 12 short ticks,
  //    with the cardinals emphasised.
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 - 90) * Math.PI / 180;
    const r1 = i % 3 === 0 ? 31 : 33;
    const r2 = 38;
    const x1 = Math.cos(a) * r1, y1 = Math.sin(a) * r1;
    const x2 = Math.cos(a) * r2, y2 = Math.sin(a) * r2;
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', x1); tick.setAttribute('y1', y1);
    tick.setAttribute('x2', x2); tick.setAttribute('y2', y2);
    tick.setAttribute('stroke', 'var(--ink)');
    tick.setAttribute('stroke-width', i % 3 === 0 ? 2.5 : 1);
    tick.setAttribute('stroke-linecap', 'round');
    tick.setAttribute('opacity', 0.85);
    tick.style.pointerEvents = 'none';
    g.appendChild(tick);
  }

  // 6) Inner concentric ring — thin elegance
  g.appendChild(circle(0, 0, 26, {
    fill: 'none',
    stroke: 'var(--ink)',
    'stroke-width': 1.2,
    opacity: 0.55,
    'pointer-events': 'none',
  }));

  // 7) Solid inner disc
  g.appendChild(circle(0, 0, 19, { fill: 'var(--ink)' }));

  // 8) Star at the centre — the heart
  const star = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  star.setAttribute('x', 0);
  star.setAttribute('y', 7);
  star.setAttribute('text-anchor', 'middle');
  star.setAttribute('fill', 'var(--bg-paper)');
  star.setAttribute('font-family', "'Oswald', sans-serif");
  star.setAttribute('font-weight', '700');
  star.setAttribute('font-size', '20');
  star.style.pointerEvents = 'none';
  star.textContent = '★';
  g.appendChild(star);

  // 9) Tiny specular highlight on the inner disc — ink looks like polished enamel
  g.appendChild(circle(-4, -5, 4.5, {
    fill: 'rgba(255,255,255,0.20)',
    'pointer-events': 'none',
  }));
}

function drawSplitDotMarker(g, splitDot) {
  const R = 10;
  const left = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  left.setAttribute('d', `M 0 ${-R} A ${R} ${R} 0 0 0 0 ${R} Z`);
  left.setAttribute('fill', splitDot[0]);
  const right = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  right.setAttribute('d', `M 0 ${-R} A ${R} ${R} 0 0 1 0 ${R} Z`);
  right.setAttribute('fill', splitDot[1]);
  const ring = circle(0, 0, R, { fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.5 });
  const splitLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  splitLine.setAttribute('x1', 0); splitLine.setAttribute('y1', -R);
  splitLine.setAttribute('x2', 0); splitLine.setAttribute('y2', R);
  splitLine.setAttribute('stroke', 'var(--ink)');
  splitLine.setAttribute('stroke-width', 1);
  g.appendChild(left);
  g.appendChild(right);
  g.appendChild(splitLine);
  g.appendChild(ring);
}

function drawSecretMarker(g, line) {
  const c = circle(0, 0, 7, { fill: 'var(--bg-paper)', stroke: line.color, 'stroke-width': 2 });
  c.setAttribute('stroke-dasharray', '2 2');
  g.appendChild(c);
}

function drawMiniMarker(g, line) {
  g.appendChild(circle(0, 0, 6.5, { fill: 'var(--bg-paper)', stroke: line.accentColor || line.color, 'stroke-width': 3 }));
}

// ── Tech (TTC Bloor–Danforth): small filled green dot, no white centre.
function drawTechStation(g, line) {
  g.appendChild(circle(0, 0, 8.5, { fill: line.color, stroke: 'rgba(0,0,0,0.22)', 'stroke-width': 1 }));
}

// ── Tech terminus (Tech Skills): TTC-style numbered circle badge with "T".
function drawTtcTerminusMarker(g, line) {
  g.appendChild(circle(0, 0, 19, { fill: line.color, stroke: 'var(--ink)', 'stroke-width': 2 }));
  const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  txt.setAttribute('x', 0); txt.setAttribute('y', 6);
  txt.setAttribute('text-anchor', 'middle');
  txt.setAttribute('fill', '#fff');
  txt.setAttribute('font-family', "'Oswald', sans-serif");
  txt.setAttribute('font-weight', '700');
  txt.setAttribute('font-size', '17');
  txt.setAttribute('letter-spacing', '0.04em');
  txt.textContent = 'T';
  g.appendChild(txt);
}

// ── Founder (NYC subway / NJ Transit): plain white circle with thin dark outline.
function drawFounderStation(g) {
  g.appendChild(circle(0, 0, 8, { fill: 'var(--bg-paper)', stroke: 'var(--ink)', 'stroke-width': 2.25 }));
}

function drawMarkerLogo(g, id, src) {
  const safeId = String(id).replace(/[^a-z0-9_-]/gi, '-');
  const clipId = `station-logo-clip-${safeId}`;
  const r = 6.5;

  const clip = document.createElementNS(SVG_NS, 'clipPath');
  clip.setAttribute('id', clipId);
  clip.appendChild(circle(0, 0, r, {}));
  g.appendChild(clip);

  g.appendChild(circle(0, 0, r + 0.8, {
    fill: '#fff',
    stroke: 'rgba(0,0,0,0.18)',
    'stroke-width': 0.7,
    'pointer-events': 'none',
  }));

  const image = document.createElementNS(SVG_NS, 'image');
  image.setAttribute('href', src);
  image.setAttribute('x', -r);
  image.setAttribute('y', -r);
  image.setAttribute('width', r * 2);
  image.setAttribute('height', r * 2);
  image.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  image.setAttribute('clip-path', `url(#${clipId})`);
  image.style.pointerEvents = 'none';
  g.appendChild(image);
}

// ── Journey (Mumbai Metro): outline-only stadium pill that the line passes through.
function drawJourneyStation(g, line) {
  const w = 36, h = 24;
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', -w / 2); rect.setAttribute('y', -h / 2);
  rect.setAttribute('width', w); rect.setAttribute('height', h);
  rect.setAttribute('rx', h / 2);
  rect.setAttribute('fill', 'var(--bg-paper)');
  rect.setAttribute('stroke', line.color);
  rect.setAttribute('stroke-width', 3.5);
  g.appendChild(rect);
  g.appendChild(circle(0, 0, 4, { fill: line.color }));
}

// ── Journey major station: black rounded rectangle with white code.
function drawJourneyMajorMarker(g, code) {
  const w = 60, h = 28;
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', -w / 2); rect.setAttribute('y', -h / 2);
  rect.setAttribute('width', w); rect.setAttribute('height', h);
  rect.setAttribute('rx', 5);
  rect.setAttribute('fill', '#0F1418');
  rect.setAttribute('stroke', 'rgba(255,255,255,0.12)');
  rect.setAttribute('stroke-width', 1);
  g.appendChild(rect);
  const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  txt.setAttribute('x', 0); txt.setAttribute('y', 5);
  txt.setAttribute('text-anchor', 'middle');
  txt.setAttribute('fill', '#fff');
  txt.setAttribute('font-family', "'Hind', sans-serif");
  txt.setAttribute('font-weight', '700');
  txt.setAttribute('font-size', '14');
  txt.setAttribute('letter-spacing', '0.14em');
  txt.textContent = code;
  g.appendChild(txt);
}

// ── Creative (Singapore Circle Line): amber pill with "CL#" code, white text.
function drawCreativeStation(g, id, line) {
  const code = STATION_CODES[id] || 'CL?';
  const w = 44, h = 21;
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', -w / 2); rect.setAttribute('y', -h / 2);
  rect.setAttribute('width', w); rect.setAttribute('height', h);
  rect.setAttribute('rx', h / 2);
  rect.setAttribute('fill', line.color);
  rect.setAttribute('stroke', 'rgba(0,0,0,0.15)');
  rect.setAttribute('stroke-width', 1);
  g.appendChild(rect);
  const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  txt.setAttribute('x', 0); txt.setAttribute('y', 4.5);
  txt.setAttribute('text-anchor', 'middle');
  txt.setAttribute('fill', '#fff');
  txt.setAttribute('font-family', "'IBM Plex Mono', monospace");
  txt.setAttribute('font-weight', '700');
  txt.setAttribute('font-size', '12.5');
  txt.setAttribute('letter-spacing', '0.06em');
  txt.textContent = code;
  g.appendChild(txt);
}

function drawDefaultStation(g, line) {
  g.appendChild(circle(0, 0, 9.5, { fill: 'var(--bg-paper)', stroke: line.color, 'stroke-width': 4 }));
}

function drawStationLabel(g, id, station, line) {
  const isCentral = station.type === 'central';
  const isTerminus = station.type === 'terminus';
  let dx = 14, dy = -16;
  const labelHints = LABEL_HINTS[id];
  if (labelHints) { dx = labelHints.dx; dy = labelHints.dy; }

  const labelText = station.secret ? '⌁' : station.name;
  const anchor = labelHints?.anchor || 'start';
  const halo = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  halo.setAttribute('class', `station-label station-label-halo label-${line.id}` + (station.secret ? ' label-secret' : ''));
  halo.setAttribute('x', dx);
  halo.setAttribute('y', dy);
  halo.setAttribute('text-anchor', anchor);
  halo.textContent = labelText;

  const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  lbl.setAttribute('class', `station-label label-${line.id}` + (station.secret ? ' label-secret' : ''));
  lbl.setAttribute('x', dx);
  lbl.setAttribute('y', dy);
  lbl.setAttribute('text-anchor', anchor);
  lbl.textContent = labelText;

  if (isCentral) {
    lbl.classList.add('is-flickering');
    halo.classList.add('is-flickering');
    lbl.style.fontSize = '20px';
    halo.style.fontSize = '20px';
    lbl.style.fontFamily = "'Oswald', sans-serif";
    halo.style.fontFamily = "'Oswald', sans-serif";
    lbl.style.letterSpacing = '0.06em';
    halo.style.letterSpacing = '0.06em';
    lbl.style.textTransform = 'uppercase';
    halo.style.textTransform = 'uppercase';
    startStationNameFlicker([lbl, halo], station.displayNames);
  } else if (isTerminus) {
    lbl.style.fontWeight = '700';
    halo.style.fontWeight = '700';
    lbl.style.fontSize = '13px';
    halo.style.fontSize = '13px';
    lbl.style.textTransform = 'uppercase';
    halo.style.textTransform = 'uppercase';
    lbl.style.letterSpacing = '0.08em';
    halo.style.letterSpacing = '0.08em';
  }
  g.appendChild(halo);
  g.appendChild(lbl);
}

function startStationNameFlicker(labelEls, names = []) {
  if (!names.length) return;
  const els = Array.isArray(labelEls) ? labelEls : [labelEls];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % names.length;
    els.forEach(labelEl => { labelEl.textContent = names[i]; });
  }, 2800);
}

// hand-tuned label positions per station so nothing overlaps
const LABEL_HINTS = {
  // Central — labelled above the medallion, with plenty of room
  'central':              { dx: 0,   dy: -82, anchor: 'middle' },

  // Tech Line — TOP (TTC Bloor–Danforth) — small dots, labels ABOVE the line
  'tech-skills':          { dx: -28, dy: 5,   anchor: 'end'    },
  'stock-trader':         { dx: 0,   dy: -22, anchor: 'middle' },
  'shade':                { dx: 0,   dy: -22, anchor: 'middle' },
  'timetable-builder':    { dx: 0,   dy: -22, anchor: 'middle' },

  // Tech Line — BOTTOM (reserved branch) — labels ABOVE the lower track
  'graviton':             { dx: 0,   dy: -22, anchor: 'middle' },
  'hunters-hollow':       { dx: 0,   dy: -22, anchor: 'middle' },
  'trial-in-error':       { dx: 0,   dy: -22, anchor: 'middle' },
  'green-slot-1':         { dx: 0,   dy: -22, anchor: 'middle' },
  'green-slot-2':         { dx: 0,   dy: -22, anchor: 'middle' },
  'green-slot-3':         { dx: 0,   dy: -22, anchor: 'middle' },
  'lunch-brake':          { dx: 22,  dy: 5,   anchor: 'start'  },

  // Creative Loop (Singapore) — labels offset for the amber pill (40×19)
  'music-portfolio':      { dx: -12, dy: 34,  anchor: 'middle' },
  'banger-generator':     { dx: 0,   dy: -22, anchor: 'middle' },  // split dot
  'ghostnote':            { dx: 22,  dy: -10, anchor: 'start'  },  // split dot
  'drumming':             { dx: 28,  dy: 5,   anchor: 'start'  },
  'bands':                { dx: 28,  dy: 5,   anchor: 'start'  },
  'certifications':       { dx: 0,   dy: 32,  anchor: 'middle' },

  // Journey Line (Mumbai Metro) — L-shape: pills are 32×22, VOL badge is 54×26
  'education':            { dx: 0,   dy: 38,  anchor: 'middle' },  // below the VOL badge
  'shree-mangal':         { dx: 0,   dy: 34,  anchor: 'middle' },  // below pill
  'qifa':                 { dx: 0,   dy: 34,  anchor: 'middle' },  // below pill
  'mindgate':             { dx: -22, dy: 5,   anchor: 'end'    },  // left of pill
  'bacsa':                { dx: -22, dy: 5,   anchor: 'end'    },  // left of pill
  'tides':                { dx: 0,   dy: 30,  anchor: 'middle' },

  // Founder Line (NYC/NJ) — plain small dots
  'prototype-lab':        { dx: 0,   dy: 48,  anchor: 'middle' },
  'hardware-projects':    { dx: 0,   dy: 30,  anchor: 'middle' },
  'hackathons':           { dx: 18,  dy: -8,  anchor: 'start'  },
};

function circle(cx, cy, r, attrs = {}) {
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r);
  for (const [k, v] of Object.entries(attrs)) c.setAttribute(k, v);
  return c;
}

// ════════ Train ════════════════════════════════════════════════════
// Retro steam locomotive. Inner drawing uses original SVG coords from
// the engine sketch — we scale + flip + translate so the rail-bottom-
// center sits at the local (0,0) and the nose points east (+x).
const TRAIN_INNER_SVG = `
<g class="loco">
  <!-- boiler nose -->
  <ellipse cx="122" cy="152" rx="30" ry="28" fill="#c0392b"/>
  <ellipse cx="122" cy="152" rx="20" ry="19" fill="#a93226"/>
  <ellipse cx="122" cy="152" rx="9" ry="9" fill="#c0392b"/>
  <circle cx="122" cy="152" r="4" fill="#e8e0c8"/>
  <rect x="92" y="138" width="18" height="12" rx="2" fill="#636e72"/>
  <rect x="94" y="140" width="14" height="8" rx="1" fill="#f5c518" opacity="0.9"/>

  <!-- boiler barrel -->
  <rect x="120" y="122" width="218" height="64" rx="5" fill="#c0392b"/>
  <rect x="120" y="122" width="218" height="10" rx="4" fill="#e74c3c"/>
  <rect x="120" y="176" width="218" height="10" rx="0" fill="#96281b"/>
  <line x1="160" y1="122" x2="160" y2="186" stroke="#96281b" stroke-width="2"/>
  <line x1="200" y1="122" x2="200" y2="186" stroke="#96281b" stroke-width="2"/>
  <line x1="240" y1="122" x2="240" y2="186" stroke="#96281b" stroke-width="2"/>
  <line x1="280" y1="122" x2="280" y2="186" stroke="#96281b" stroke-width="2"/>

  <!-- steam dome -->
  <ellipse cx="256" cy="122" rx="18" ry="11" fill="#a93226"/>
  <ellipse cx="256" cy="116" rx="12" ry="8" fill="#96281b"/>

  <!-- chimney -->
  <rect x="158" y="88" width="22" height="34" rx="3" fill="#7f8c8d"/>
  <rect x="154" y="82" width="30" height="10" rx="4" fill="#636e72"/>
  <rect x="156" y="76" width="26" height="6" rx="3" fill="#95a5a6"/>

  <!-- smoke puffs -->
  <circle cx="169" cy="76" r="7" fill="#c8d0d0" opacity="0">
    <animate attributeName="cy" from="76" to="30" dur="2s" repeatCount="indefinite" begin="0s"/>
    <animate attributeName="r" from="5" to="16" dur="2s" repeatCount="indefinite" begin="0s"/>
    <animate attributeName="opacity" values="0;0.7;0.5;0" dur="2s" repeatCount="indefinite" begin="0s"/>
  </circle>
  <circle cx="169" cy="76" r="6" fill="#d5dcdc" opacity="0">
    <animate attributeName="cy" from="76" to="22" dur="2s" repeatCount="indefinite" begin="0.65s"/>
    <animate attributeName="r" from="4" to="13" dur="2s" repeatCount="indefinite" begin="0.65s"/>
    <animate attributeName="opacity" values="0;0.6;0.4;0" dur="2s" repeatCount="indefinite" begin="0.65s"/>
  </circle>
  <circle cx="169" cy="76" r="8" fill="#bdc5c5" opacity="0">
    <animate attributeName="cy" from="76" to="18" dur="2s" repeatCount="indefinite" begin="1.3s"/>
    <animate attributeName="r" from="6" to="19" dur="2s" repeatCount="indefinite" begin="1.3s"/>
    <animate attributeName="opacity" values="0;0.65;0.45;0" dur="2s" repeatCount="indefinite" begin="1.3s"/>
  </circle>

  <!-- cab -->
  <rect x="332" y="92" width="62" height="94" rx="4" fill="#96281b"/>
  <rect x="332" y="92" width="62" height="8" rx="3" fill="#c0392b"/>
  <rect x="338" y="102" width="20" height="26" rx="3" fill="#d6eaf8" opacity="0.9"/>
  <rect x="364" y="102" width="22" height="26" rx="3" fill="#d6eaf8" opacity="0.9"/>
  <rect x="332" y="132" width="62" height="5" rx="0" fill="#7f1d1d"/>

  <!-- running board / coupling rod -->
  <rect x="120" y="186" width="278" height="6" rx="1" fill="#7f1d1d"/>
  <rect x="392" y="154" width="8" height="24" rx="2" fill="#7f8c8d"/>
  <rect x="200" y="168" width="140" height="5" rx="2" fill="#7f8c8d"/>

  <!-- Wheel 1 -->
  <g class="w1">
    <circle cx="200" cy="172" r="21" fill="url(#wheelgrad)" stroke="#1a252f" stroke-width="1.5"/>
    <circle cx="200" cy="172" r="16" fill="none" stroke="#4a6278" stroke-width="1"/>
    <circle cx="200" cy="172" r="10" fill="none" stroke="#3d5166" stroke-width="0.75"/>
    <circle cx="200" cy="172" r="4" fill="#95a5a6" stroke="#7f8c8d" stroke-width="1"/>
    <line x1="200" y1="151" x2="200" y2="193" stroke="#8fa8bc" stroke-width="2" stroke-linecap="round"/>
    <line x1="179" y1="172" x2="221" y2="172" stroke="#8fa8bc" stroke-width="2" stroke-linecap="round"/>
    <line x1="185" y1="157" x2="215" y2="187" stroke="#6d8fa6" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="215" y1="157" x2="185" y2="187" stroke="#6d8fa6" stroke-width="1.5" stroke-linecap="round"/>
  </g>
  <!-- Wheel 2 -->
  <g class="w2">
    <circle cx="270" cy="172" r="21" fill="url(#wheelgrad)" stroke="#1a252f" stroke-width="1.5"/>
    <circle cx="270" cy="172" r="16" fill="none" stroke="#4a6278" stroke-width="1"/>
    <circle cx="270" cy="172" r="10" fill="none" stroke="#3d5166" stroke-width="0.75"/>
    <circle cx="270" cy="172" r="4" fill="#95a5a6" stroke="#7f8c8d" stroke-width="1"/>
    <line x1="270" y1="151" x2="270" y2="193" stroke="#8fa8bc" stroke-width="2" stroke-linecap="round"/>
    <line x1="249" y1="172" x2="291" y2="172" stroke="#8fa8bc" stroke-width="2" stroke-linecap="round"/>
    <line x1="255" y1="157" x2="285" y2="187" stroke="#6d8fa6" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="285" y1="157" x2="255" y2="187" stroke="#6d8fa6" stroke-width="1.5" stroke-linecap="round"/>
  </g>
  <!-- Wheel 3 -->
  <g class="w3">
    <circle cx="340" cy="172" r="21" fill="url(#wheelgrad)" stroke="#1a252f" stroke-width="1.5"/>
    <circle cx="340" cy="172" r="16" fill="none" stroke="#4a6278" stroke-width="1"/>
    <circle cx="340" cy="172" r="10" fill="none" stroke="#3d5166" stroke-width="0.75"/>
    <circle cx="340" cy="172" r="4" fill="#95a5a6" stroke="#7f8c8d" stroke-width="1"/>
    <line x1="340" y1="151" x2="340" y2="193" stroke="#8fa8bc" stroke-width="2" stroke-linecap="round"/>
    <line x1="319" y1="172" x2="361" y2="172" stroke="#8fa8bc" stroke-width="2" stroke-linecap="round"/>
    <line x1="325" y1="157" x2="355" y2="187" stroke="#6d8fa6" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="355" y1="157" x2="325" y2="187" stroke="#6d8fa6" stroke-width="1.5" stroke-linecap="round"/>
  </g>
  <!-- Wheel 4 (small) -->
  <g class="w4">
    <circle cx="396" cy="176" r="14" fill="url(#wheelgrad)" stroke="#1a252f" stroke-width="1.5"/>
    <circle cx="396" cy="176" r="10" fill="none" stroke="#4a6278" stroke-width="1"/>
    <circle cx="396" cy="176" r="3.5" fill="#95a5a6" stroke="#7f8c8d" stroke-width="1"/>
    <line x1="396" y1="162" x2="396" y2="190" stroke="#8fa8bc" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="382" y1="176" x2="410" y2="176" stroke="#8fa8bc" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="386" y1="166" x2="406" y2="186" stroke="#6d8fa6" stroke-width="1" stroke-linecap="round"/>
    <line x1="406" y1="166" x2="386" y2="186" stroke="#6d8fa6" stroke-width="1" stroke-linecap="round"/>
  </g>
</g>
`;

let trainNode = null;
let trainSpriteNode = null;
let trainFacingLeft = false;
let stationIndex = {};
let currentStation = 'central';
let currentLineId  = 'journey';

function createTrain() {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('id', 'train');
  g.setAttribute('aria-hidden', 'true');

  const sprite = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  sprite.setAttribute('class', 'train-sprite');

  const squashedSprite = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  // Slight vertical squash, anchored at the wheels/route point (local y=0).
  squashedSprite.setAttribute('transform', 'scale(1 0.92)');

  const leveledSprite = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  // The source drawing rises slightly on the right; this subtle correction
  // levels the wheels while keeping their center-bottom route anchor fixed.
  leveledSprite.setAttribute('transform', 'rotate(1.5 0 0)');

  // Smoke lives in the same mirrored group as the artwork. Its local drift
  // is leftward (behind a right-facing train), so mirroring automatically
  // makes it drift rightward when the train faces left.
  const smoke = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  smoke.setAttribute('class', 'train-smoke');
  for (let puff = 1; puff <= 4; puff++) {
    const anchor = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    anchor.setAttribute('transform', 'translate(43 -96)');

    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    particle.setAttribute('class', `smoke-puff smoke-puff-${puff}`);

    const circles = [
      { cx: 0,    cy: 0,    r: 3.1, className: 'smoke-core' },
      { cx: -2.5, cy: -1.5, r: 2.4, className: 'smoke-mid' },
      { cx: 2.2,  cy: -2.2, r: 1.8, className: 'smoke-light' },
      { cx: -0.4, cy: -4.1, r: 1.5, className: 'smoke-wisp' },
    ];
    for (const circleData of circles) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', circleData.className);
      circle.setAttribute('cx', String(circleData.cx));
      circle.setAttribute('cy', String(circleData.cy));
      circle.setAttribute('r', String(circleData.r));
      particle.appendChild(circle);
    }
    anchor.appendChild(particle);
    smoke.appendChild(anchor);
  }
  leveledSprite.appendChild(smoke);

  // The optimized frames share an identical canvas, so their wheels stay
  // planted on local y=0 while the group follows the route.
  for (let frame = 1; frame <= 4; frame++) {
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('class', `train-frame train-frame-${frame}`);
    image.setAttribute('href', `portfolio-content/train/train-frame-${frame}.png`);
    image.setAttribute('x', '-70');
    image.setAttribute('y', '-100');
    image.setAttribute('width', '140');
    image.setAttribute('height', '100');
    image.setAttribute('preserveAspectRatio', 'xMidYMax meet');
    leveledSprite.appendChild(image);
  }
  squashedSprite.appendChild(leveledSprite);
  sprite.appendChild(squashedSprite);
  g.appendChild(sprite);

  trainNode = g;
  trainSpriteNode = sprite;
  overlayLayer.appendChild(g);
}

function placeTrain(x, y, facingLeft = trainFacingLeft) {
  // Keep the illustrated train upright even when the route bends or runs
  // vertically. Only mirror the sprite to show its direction of travel.
  trainFacingLeft = facingLeft;
  trainNode.setAttribute('transform', `translate(${x} ${y})`);
  trainSpriteNode.setAttribute('transform', trainFacingLeft ? 'scale(-1 1)' : '');
}

// Move along a line from lenA to lenB. Returns false if a newer navigation cancels it.
function animateAlong(lineId, lenStart, lenEnd, durationMs, token = navigationToken) {
  return new Promise(resolve => {
    const path = pathEls[lineId];
    const t0 = performance.now();
    const travelDirection = lenEnd >= lenStart ? 1 : -1;
    const firstPoint = path.getPointAtLength(lenStart);
    const sampleLen = Math.max(0, Math.min(path.getTotalLength(), lenStart + travelDirection * 3));
    const firstSample = path.getPointAtLength(sampleLen);
    if (Math.abs(firstSample.x - firstPoint.x) > 0.25) {
      trainFacingLeft = firstSample.x < firstPoint.x;
    }
    let previousPoint = firstPoint;
    trainNode.classList.add('is-moving');
    function step(t) {
      if (token !== navigationToken) {
        trainNode.classList.remove('is-moving');
        resolve(false);
        return;
      }
      const k = Math.min(1, (t - t0) / durationMs);
      // easeInOut
      const e = k < 0.5 ? 2*k*k : 1 - Math.pow(-2*k+2, 2)/2;
      const len = lenStart + (lenEnd - lenStart) * e;
      const p = path.getPointAtLength(len);
      const horizontalMovement = p.x - previousPoint.x;
      // On near-vertical portions, retain the last clear facing direction
      // instead of flickering between left and right.
      if (Math.abs(horizontalMovement) > 0.05) {
        trainFacingLeft = horizontalMovement < 0;
      }
      placeTrain(p.x, p.y);
      previousPoint = p;
      if (k < 1) requestAnimationFrame(step);
      else {
        trainNode.classList.remove('is-moving');
        resolve(true);
      }
    }
    requestAnimationFrame(step);
  });
}

// Move from current station to target. Routes via Central if needed.
async function moveTrainTo(targetStationId, token = navigationToken) {
  if (targetStationId === currentStation) return true;

  // Build route: a list of {lineId, fromStation, toStation}
  const route = buildRoute(currentStation, targetStationId);

  for (const leg of route) {
    const lineId = leg.lineId;
    const from = stationIndex[leg.from].find(s => s.lineId === lineId);
    const to   = stationIndex[leg.to].find(s => s.lineId === lineId);
    if (!from || !to) continue;
    // Deliberately relaxed pace so the hand-drawn animation is readable.
    const dist = Math.abs(to.length - from.length);
    const dur = Math.max(600, Math.min(3000, dist * 2.15));
    const completed = await animateAlong(lineId, from.length, to.length, dur, token);
    if (!completed || token !== navigationToken) return false;
    currentStation = leg.to;
    currentLineId = lineId;
  }
  return true;
}

function buildRoute(fromId, toId) {
  const fromLines = STATIONS[fromId].lineIds;
  const toLines   = STATIONS[toId].lineIds;

  // 1) Shared line — direct ride
  const shared = fromLines.filter(l => toLines.includes(l));
  if (shared.length > 0) {
    return [{ lineId: shared[0], from: fromId, to: toId }];
  }

  // 2) Single transfer through a hub station. Central connects the main
  // map, while banger-generator / ghostnote bridge Tech and Creative.
  const hubs = ['central', 'tech-skills', 'banger-generator', 'ghostnote', 'education'];
  for (const hub of hubs) {
    if (hub === fromId || hub === toId) continue;
    const hubLines = STATIONS[hub].lineIds;
    const lineA = fromLines.find(l => hubLines.includes(l));
    const lineB = toLines.find(l => hubLines.includes(l));
    if (lineA && lineB) {
      const route = [];
      if (fromId !== hub) route.push({ lineId: lineA, from: fromId, to: hub });
      if (toId !== hub)   route.push({ lineId: lineB, from: hub, to: toId });
      return route;
    }
  }

  // 3) Two-hop via two hubs
  const tryTwoHop = (h1, h2) => {
    if ([h1, h2, fromId, toId].some((v,i,a) => a.indexOf(v) !== i)) return null;
    const h1Lines = STATIONS[h1].lineIds;
    const h2Lines = STATIONS[h2].lineIds;
    const lineA = fromLines.find(l => h1Lines.includes(l));
    const lineB = h1Lines.find(l => h2Lines.includes(l));
    const lineC = toLines.find(l => h2Lines.includes(l));
    if (lineA && lineB && lineC) {
      const route = [];
      if (fromId !== h1) route.push({ lineId: lineA, from: fromId, to: h1 });
      route.push({ lineId: lineB, from: h1, to: h2 });
      if (toId !== h2)   route.push({ lineId: lineC, from: h2, to: toId });
      return route;
    }
    return null;
  };
  for (const h1 of hubs) {
    for (const h2 of hubs) {
      if (h1 === h2) continue;
      const r = tryTwoHop(h1, h2);
      if (r) return r;
    }
  }
  return [{ lineId: fromLines[0], from: fromId, to: 'central' }];
}

// ════════ Flip-board ═══════════════════════════════════════════════
const flipBoard = document.getElementById('flip-board');
const flipLines = {
  l1: document.getElementById('flip-line-1'),
  l2: document.getElementById('flip-line-2'),
  l3: document.getElementById('flip-line-3'),
};
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·'& ";

function buildFlapRow(text, targetEl, charsWide) {
  targetEl.innerHTML = '';
  const t = text.toUpperCase().padEnd(charsWide, ' ').slice(0, charsWide);
  const flaps = [];
  for (const ch of t) {
    const f = document.createElement('span');
    f.className = 'flap';
    f.textContent = ' ';
    targetEl.appendChild(f);
    flaps.push({ el: f, target: ch });
  }
  return flaps;
}

function animateFlaps(flaps, baseDelay = 0, perChar = 38) {
  return new Promise(resolve => {
    let done = 0;
    flaps.forEach((f, i) => {
      setTimeout(() => {
        const total = 8 + Math.floor(Math.random() * 5);
        let count = 0;
        const iv = setInterval(() => {
          if (count >= total) {
            f.el.textContent = f.target;
            f.el.classList.remove('flap-flip');
            void f.el.offsetWidth;
            f.el.classList.add('flap-flip');
            clearInterval(iv);
            done++;
            if (done === flaps.length) setTimeout(resolve, 200);
            return;
          }
          f.el.textContent = CHARSET[Math.floor(Math.random() * CHARSET.length)];
          f.el.classList.remove('flap-flip');
          void f.el.offsetWidth;
          f.el.classList.add('flap-flip');
          count++;
        }, 55);
      }, baseDelay + i * perChar);
    });
  });
}

async function showFlipBoard(station, line) {
  flipBoard.classList.add('on');
  const widths = { l1: 18, l2: 24, l3: 18 };
  const row1 = buildFlapRow('NOW ARRIVING AT', flipLines.l1, widths.l1);
  const row2 = buildFlapRow(station.name, flipLines.l2, widths.l2);
  const row3 = buildFlapRow(`${line.short} · ${line.city || 'TERMINUS'}`, flipLines.l3, widths.l3);
  // animate them in sequence with overlap
  const a = animateFlaps(row1, 0, 28);
  const b = animateFlaps(row2, 350, 36);
  const c = animateFlaps(row3, 850, 30);
  await Promise.all([a, b, c]);
  await sleep(450);
}

function hideFlipBoard() {
  flipBoard.classList.remove('on');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function placeTrainAtStation(stationId) {
  const stops = stationIndex[stationId];
  if (!stops || !stops.length) return;
  const preferredLine = STATIONS[stationId].lineIds[0];
  const stop = stops.find(s => s.lineId === preferredLine) || stops[0];
  const path = pathEls[stop.lineId];
  if (!path) return;
  const p = path.getPointAtLength(stop.length);
  trainNode.classList.remove('is-moving');
  placeTrain(p.x, p.y);
  currentStation = stationId;
  currentLineId = stop.lineId;
}

// ════════ Intro hooks ══════════════════════════════════════════════
// First-train-of-the-day ride used by the intro (intro.js): Journey line,
// express from the western terminus into Central.
async function introRide(durationMs) {
  placeTrainAtStation('shree-mangal');
  const from = stationIndex['shree-mangal'].find(s => s.lineId === 'journey');
  const to   = stationIndex['central'].find(s => s.lineId === 'journey');
  if (!from || !to) return false;
  const ok = await animateAlong('journey', from.length, to.length, durationMs);
  if (ok) { currentStation = 'central'; currentLineId = 'journey'; }
  return ok;
}

// ════════ Content panel ═══════════════════════════════════════════
const panel = document.getElementById('content-panel');
const panelClose = document.getElementById('panel-close');
const panelBody  = document.getElementById('panel-body');
let postcardRotationTimer = null;

panelBody.addEventListener('click', (event) => {
  const link = event.target.closest('[data-station-link]');
  if (!link) return;
  const stationId = link.dataset.stationLink;
  if (!STATIONS[stationId]) return;
  onStationClick(stationId);
});

panelClose.addEventListener('click', () => {
  panel.classList.remove('on');
  stopPostcardRotation();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    panel.classList.remove('on');
    stopPostcardRotation();
  }
});

function stationSketch(station) {
  const key = station?.bgSketch;
  const svg = key && window.STATION_SKETCHES?.[key];
  return svg ? `<div class="station-sketch" aria-hidden="true">${svg}</div>` : '';
}

function renderContentPanel(stationId) {
  stopPostcardRotation();
  const s = STATIONS[stationId];
  const primaryLine = LINES.find(l => l.id === s.lineIds[0]);
  const lineColor = primaryLine.color;
  const city = s.city || primaryLine.city || '';
  const cityFont = primaryLine.cityFont;
  const lineText = primaryLine.id === 'journey'
    ? ''
    : primaryLine.id.startsWith('tech-')
    ? `${primaryLine.name} (Toronto TTC)`
    : primaryLine.name;

  // Scrapbook layout.
  const postmarkDate = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase();
  const postcardSlide = s.postcardSlides?.[0] || null;
  const factText = postcardSlide?.fact || s.funFact || 'Under construction. This station detail is still being built.';
  const funFactLabel = postcardSlide?.factLabel || s.funFactLabel || (s.funFact || postcardSlide ? 'Fun Fact' : 'Under Construction');
  const postcardKicker = postcardSlide?.kicker || s.postcardKicker || 'greetings from';
  const postcardTitle = postcardSlide?.title || s.postcardTitle || s.name;
  const postcardPostmark = postcardSlide?.postmark || city || 'TRANSIT';
  const postcardStamp = primaryLine.id.startsWith('tech-')
    ? 'TTC'
    : postcardSlide?.stamp || city || 'METRO';

  if (s.widePanel) {
    panelBody.innerHTML = `
      <div class="panel-layout panel-layout-wide">
        <main class="content-col content-col-wide" style="--line-color:${lineColor}">
          ${stationSketch(s)}
          <div class="panel-header" style="--line-color:${lineColor}">
            <div class="panel-hdr-left">
              <div class="panel-line">
                <span class="line-chip" style="background:${lineColor}">${primaryLine.short}</span>
                ${lineText ? `<span class="line-text">${lineText}</span>` : ''}
              </div>
              <h1 class="panel-title">${s.name}</h1>
              ${city ? `<div class="panel-city" style="font-family:${cityFont}">${city}</div>` : ''}
            </div>
            <div class="panel-hdr-right">
              <div class="arrival-stamp">
                <div class="stamp-row">ARRIVED</div>
                <div class="stamp-row stamp-time">${nowStamp()}</div>
              </div>
              ${s.interchange ? interchangePill(s) : ''}
            </div>
          </div>
          <div class="panel-content">${renderStationContent(s)}</div>
        </main>
      </div>
    `;
    return;
  }

  let inner = `
    <div class="panel-layout">
      <aside class="postcard-col ${s.postcardSlides ? 'postcard-rotating' : ''}" style="--line-color:${lineColor}">
        <div class="postcard" style="--line-color:${lineColor}">
          <div class="postcard-postmark">
            <div class="pm-city" data-postcard-postmark>${postcardPostmark.toUpperCase().slice(0, 12)}</div>
            <div class="pm-date">${postmarkDate}</div>
          </div>
          <div class="postcard-photo-frame">
            <image-slot
              id="postcard-${stationId}"
              shape="rect"
              ${s.postcardImage ? `src="${s.postcardImage}"` : ''}
              ${s.postcardImage ? `placeholder="${s.name}"` : 'blank'}
            ></image-slot>
          </div>
          <div class="postcard-caption">
            <div class="postcard-greeting">
              <span data-postcard-kicker>${postcardKicker}</span>
              <strong data-postcard-title>${postcardTitle}</strong>
            </div>
            <div class="postcard-stamp">
              <div class="postcard-stamp-inner" style="background:${lineColor}">
                <span class="postcard-stamp-line">${primaryLine.short}</span>
                <span class="postcard-stamp-value" data-postcard-stamp>${postcardStamp.toUpperCase().slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="postcard-fact" style="--line-color:${lineColor}">
          <div class="fact-label" data-postcard-fact-label>${funFactLabel}</div>
          <div class="fact-body ${s.funFact || postcardSlide ? '' : 'empty'}" data-postcard-fact>${factText}</div>
        </div>
      </aside>

      <main class="content-col" style="--line-color:${lineColor}">
        ${stationSketch(s)}
        <div class="panel-header" style="--line-color:${lineColor}">
          <div class="panel-hdr-left">
            <div class="panel-line">
              <span class="line-chip" style="background:${lineColor}">${primaryLine.short}</span>
              ${lineText ? `<span class="line-text">${lineText}</span>` : ''}
            </div>
            <h1 class="panel-title">${s.name}</h1>
            ${city ? `<div class="panel-city" style="font-family:${cityFont}">${city}</div>` : ''}
          </div>
          <div class="panel-hdr-right">
            <div class="arrival-stamp">
              <div class="stamp-row">ARRIVED</div>
              <div class="stamp-row stamp-time">${nowStamp()}</div>
            </div>
            ${s.interchange ? interchangePill(s) : ''}
          </div>
        </div>
        <div class="panel-content">${renderContentWithMedia(s)}</div>
      </main>
    </div>
  `;
  panelBody.innerHTML = inner;
  startPostcardRotation(s.postcardSlides);
}

function startPostcardRotation(slides = []) {
  if (!slides || slides.length < 2) return;
  const col = panelBody.querySelector('.postcard-rotating');
  if (!col) return;
  const targets = {
    postmark: col.querySelector('[data-postcard-postmark]'),
    kicker: col.querySelector('[data-postcard-kicker]'),
    title: col.querySelector('[data-postcard-title]'),
    stamp: col.querySelector('[data-postcard-stamp]'),
    factLabel: col.querySelector('[data-postcard-fact-label]'),
    fact: col.querySelector('[data-postcard-fact]'),
  };
  let i = 0;
  postcardRotationTimer = setInterval(() => {
    i = (i + 1) % slides.length;
    const slide = slides[i];
    col.classList.add('is-changing');
    setTimeout(() => {
      targets.postmark.textContent = (slide.postmark || 'TRANSIT').toUpperCase().slice(0, 12);
      targets.kicker.textContent = slide.kicker || 'station reference';
      targets.title.textContent = slide.title || '';
      targets.stamp.textContent = (slide.stamp || 'METRO').toUpperCase().slice(0, 8);
      targets.factLabel.textContent = slide.factLabel || 'Fun Fact';
      targets.fact.textContent = slide.fact || '';
      col.classList.remove('is-changing');
    }, 280);
  }, 4200);
}

function stopPostcardRotation() {
  if (!postcardRotationTimer) return;
  clearInterval(postcardRotationTimer);
  postcardRotationTimer = null;
}

function interchangePill(s) {
  const others = (s.interchange || []).map(lid => {
    const ln = LINES.find(l => l.id === lid);
    return `<span class="ix-chip" style="background:${ln.color}">${ln.short}</span>`;
  }).join('');
  return `<div class="interchange-tag"><span class="ix-label">INTERCHANGE</span>${others}</div>`;
}

function nowStamp() {
  const d = new Date();
  return d.toTimeString().slice(0,5);
}

function renderContentWithMedia(s) {
  const media = (s.galleryImages || []).filter(image => image?.src);
  const stationContent = renderStationContent(s);
  if (!media.length) return stationContent;

  const [leadImage, ...restImages] = media;
  const c = s.content || {};
  const splitProjectFeatures = c.kind === 'project' && c.featureLayout === 'below-media';
  const leadContent = splitProjectFeatures ? renderProject(c, { includeFeatures: false }) : stationContent;
  if (c.mediaLayout === 'side-by-side') {
    return `
      <div class="content-media-flow">
        <div class="content-copy">${leadContent}</div>
      </div>
      <div class="inline-shot-grid inline-shot-grid-pair">
        ${media.map((image, i) => renderInlineMediaFigure(image, s.name, i + 1)).join('')}
      </div>
      ${splitProjectFeatures ? renderProjectFeatures(c, { standalone: true }) : ''}
    `;
  }
  return `
    <div class="content-media-flow">
      <div class="content-copy">${leadContent}</div>
      ${renderInlineMediaFigure(leadImage, s.name, 1, 'inline-shot-lead')}
    </div>
    ${splitProjectFeatures ? renderProjectFeatures(c, { standalone: true }) : ''}
    ${restImages.length ? `
      <div class="inline-shot-grid">
        ${restImages.map((image, i) => renderInlineMediaFigure(image, s.name, i + 2)).join('')}
      </div>
    ` : ''}
  `;
}

function renderInlineMediaFigure(image, fallbackCaption, index, className = '') {
  const caption = image.caption || fallbackCaption;
  const alt = `${caption} screenshot ${index}`;
  return `
    <figure class="inline-shot ${className}">
      <div class="inline-shot-frame">
        <img src="${image.src}" alt="${alt}" loading="lazy">
      </div>
      <figcaption>
        <span>${caption}</span>
        <span>${String(index).padStart(2, '0')}</span>
      </figcaption>
    </figure>
  `;
}

function renderStationContent(s) {
  const c = s.content;
  if (!c) return '';
  switch (c.kind) {
    case 'central': return renderCentral(c);
    case 'list':    return renderList(c);
    case 'project': return renderProject(c);
    case 'projects':return renderProjects(c);
    case 'lab':     return renderLab(c);
    case 'skills':  return renderSkills(c);
    case 'awards':  return renderAwards(c);
    case 'placeholder': return renderPlaceholder(c);
    case 'secret':  return renderSecret(c);
  }
  return '';
}

function renderLab(c) {
  return `
    <div class="lab-board">
      ${c.intro ? `<p class="lab-intro">${c.intro}</p>` : ''}
      <div class="lab-projects">
        ${(c.projects || []).map(project => `
          <article class="lab-project-card">
            <div class="lab-project-copy">
              <div class="lab-project-kicker">${project.kicker || 'Prototype'}</div>
              <div class="proj-head">
                <h2 class="proj-title">${project.title}</h2>
                ${project.meta ? `<div class="proj-meta">${project.meta}</div>` : ''}
              </div>
              ${project.tagline ? `<p class="proj-tagline">${project.tagline}</p>` : ''}
              ${project.body ? `<p class="proj-body">${project.body}</p>` : ''}
              ${project.stack ? `<div class="stack-row">${project.stack.map(s => `<span class="stack-chip">${s}</span>`).join('')}</div>` : ''}
              ${project.features ? `
                <div class="lab-feature-grid">
                  ${project.features.map(feature => `
                    <div class="lab-feature">
                      <strong>${feature.label}</strong>
                      <span>${feature.detail}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              ${renderProjectLinks(project)}
            </div>
            ${project.images ? `
              <div class="lab-shot-grid">
                ${project.images.map((image, i) => `
                  <figure class="lab-shot ${i === 0 ? 'lab-shot-main' : ''}">
                    <img src="${image.src}" alt="${image.alt || project.title}">
                    ${image.caption ? `<figcaption>${image.caption}</figcaption>` : ''}
                  </figure>
                `).join('')}
              </div>
            ` : ''}
          </article>
        `).join('')}
      </div>
    </div>
  `;
}

function renderCentral(c) {
  return `
    <p class="central-tagline">${c.tagline}</p>
    <p class="central-about">${c.about}</p>
    ${c.image ? `
      <figure class="central-photo">
        <img src="${c.image.src}" alt="${c.image.caption || 'Central station photo'}" loading="lazy">
        ${c.image.caption ? `<figcaption>${c.image.caption}</figcaption>` : ''}
      </figure>
    ` : ''}
    ${(c.hobbies || []).length ? `
      <div class="hobby-row">
        ${c.hobbies.map(h => `<span class="hobby-tag">${h}</span>`).join('')}
      </div>
    ` : ''}
    <h3 class="sect-h">Lines & Connections</h3>
    <div class="socials-grid">
      ${c.socials.map(s => `
        <a class="social-card social-${s.tone || 'default'}" href="${s.url}" target="_blank" rel="noopener">
          <span class="social-icon" aria-hidden="true">${s.icon || s.label[0]}</span>
          <div class="social-copy">
            <div class="social-label">${s.label}</div>
            <div class="social-value">${s.value}</div>
          </div>
        </a>
      `).join('')}
    </div>
    ${(c.personalTags || []).length ? `
      <div class="central-tags">
        ${c.personalTags.map(t => `
          <div class="central-tag">
            <span>${t.label}</span>
            <strong>${t.value}</strong>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
}

function renderList(c) {
  return `<div class="card-stack">
    ${c.items.map(renderListItem).join('')}
  </div>`;
}

function renderListItem(it) {
  const mediaBeside = it.imagesLayout === 'beside-text' && (it.images || []).length;
  const text = `
    <div class="entry-card-main">
        <div class="entry-row">
          <div class="entry-title">${it.title}</div>
          ${it.extra ? `<div class="entry-extra">${it.extra}</div>` : ''}
        </div>
        ${it.subtitle ? `<div class="entry-sub">${it.subtitle}</div>` : ''}
        ${it.meta ? `<div class="entry-meta">${it.meta}</div>` : ''}
        ${it.body ? `<p class="entry-body">${it.body}</p>` : ''}
        ${mediaBeside ? '' : renderEntryImages(it)}
        ${it.url ? `<a class="entry-link" target="_blank" rel="noopener" href="${it.url}">${it.url.replace(/^https?:\/\//,'')} ↗</a>` : ''}
        ${it.stationLink ? `
          <button class="station-entry-link" type="button" data-station-link="${it.stationLink.stationId}">
            ${it.stationLink.label} <span aria-hidden="true">→</span>
          </button>` : ''}
    </div>
  `;
  return `
    <div class="entry-card ${mediaBeside ? 'entry-card-media' : ''}">
      ${text}
      ${mediaBeside ? renderEntryImages(it) : ''}
    </div>
  `;
}

function renderEntryImages(it) {
  const images = it.images || [];
  if (!images.length) return '';
  return `
    <div class="entry-image-grid ${images.length === 1 ? 'entry-image-grid-single' : ''}">
      ${images.map((image, i) => `
        <figure class="entry-image-card">
          <img src="${image.src}" alt="${image.caption || it.title} image ${i + 1}" loading="lazy">
          ${image.caption ? `<figcaption>${image.caption}</figcaption>` : ''}
        </figure>
      `).join('')}
    </div>
  `;
}

function renderProjectLinks(c) {
  const links = c.links || (c.url ? [{ url: c.url }] : []);
  if (!links.length) return '';
  const linkClass = c.playLabel ? 'project-links project-links-play' : 'project-links';
  return `
    <div class="${linkClass}">
      ${links.map(link => {
        const label = c.playLabel || link.label || link.url.replace(/^https?:\/\//,'');
        return `<a class="${c.playLabel ? 'play-link' : 'entry-link'}" target="_blank" rel="noopener" href="${link.url}">
          ${c.playLabel ? '<span class="play-icon" aria-hidden="true">▶</span>' : ''}
          <span>${label}</span>
          ${c.playLabel ? '' : '<span aria-hidden="true">↗</span>'}
        </a>`;
      }).join('')}
    </div>
  `;
}

function renderProjectFeatures(c, options = {}) {
  const sections = c.featureSections || [];
  if (!sections.length) return '';
  return `
    <div class="feature-box ${options.standalone ? 'feature-box-standalone' : ''}">
      <div class="feature-box-title">${c.featuresTitle || 'Features'}</div>
      <div class="feature-section-grid">
        ${sections.map(section => `
          <section class="feature-section">
            <h3>${section.title}</h3>
            <ul>
              ${section.items.map(item => `
                <li>
                  ${item.label ? `<strong>${item.label}</strong>` : ''}
                  ${item.detail ? `<span>${item.detail}</span>` : ''}
                </li>
              `).join('')}
            </ul>
          </section>
        `).join('')}
      </div>
    </div>
  `;
}

function renderProject(c, options = {}) {
  return `
    <div class="project-card">
      <div class="proj-head">
        <h2 class="proj-title">${c.title}</h2>
        ${c.meta ? `<div class="proj-meta">${c.meta}</div>` : ''}
      </div>
      ${c.tagline ? `<p class="proj-tagline">${c.tagline}</p>` : ''}
      ${c.body ? `<p class="proj-body">${c.body}</p>` : ''}
      ${c.stack ? `<div class="stack-row">${c.stack.map(s => `<span class="stack-chip">${s}</span>`).join('')}</div>` : ''}
      ${renderProjectLinks(c)}
      ${renderEntryImages(c)}
      ${options.includeFeatures === false ? '' : renderProjectFeatures(c)}
      ${renderCoursework(c)}
    </div>
  `;
}

function renderCoursework(c) {
  const groups = c.coursework || [];
  if (!groups.length) return '';
  return `
    <section class="coursework-board">
      <div class="coursework-heading">
        <span>Coursework So Far</span>
        <small>UofT transcript map</small>
      </div>
      <div class="coursework-grid">
        ${groups.map(group => `
          <article class="course-group-card">
            <h3>${group.group}</h3>
            ${group.sections.map(section => `
              <div class="course-section">
                <div class="course-status">${section.status}</div>
                <div class="course-list">
                  ${section.items.map(([code, name]) => `
                    <div class="course-row">
                      <span class="course-code">${code}</span>
                      <span class="course-name">${name}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderProjects(c) {
  return `<div class="card-stack">
    ${c.items.map(it => `
      <div class="entry-card ${it.crossRef ? 'cross-ref' : ''}">
        <div class="entry-row">
          <div class="entry-title">${it.title}</div>
        </div>
        <div class="entry-sub">${it.tagline}</div>
        <div class="entry-meta">${it.stack}</div>
      </div>
    `).join('')}
  </div>`;
}

function renderSkills(c) {
  return `<div class="skills-block">
    ${c.groups.map(g => `
      <div class="skill-group">
        <div class="skill-label">${g.label}</div>
        <div class="skill-chips">
          ${g.items.map(i => `<span class="skill-chip">${i}</span>`).join('')}
        </div>
      </div>
    `).join('')}
  </div>`;
}

function renderAwards(c) {
  return `<div class="award-stack">
    ${c.items.map(a => `
      <div class="award-row">
        <span class="award-place">${a.place}</span>
        <span class="award-title">${a.title}</span>
      </div>
    `).join('')}
  </div>`;
}

function renderPlaceholder(c) {
  return `
    <div class="placeholder-card">
      <div class="placeholder-mark">⌛</div>
      <div class="placeholder-title">Coming Soon</div>
      <div class="placeholder-note">${c.note}</div>
    </div>
  `;
}

function renderSecret(c) {
  return `
    <div class="secret-card">
      <div class="secret-tag">UNLISTED · OFF-MAP</div>
      <p class="secret-body">${c.body}</p>
    </div>
  `;
}

// ════════ Station click flow ═══════════════════════════════════════
let busy = false;
let navigationToken = 0;
let activeNavigationStationId = null;
const navSkipHint = document.getElementById('nav-skip-hint');

function showNavSkipHint() {
  navSkipHint?.classList.add('on');
}

function hideNavSkipHint() {
  navSkipHint?.classList.remove('on');
}

function openStationNow(stationId) {
  hideNavSkipHint();
  hideFlipBoard();
  panel.classList.remove('on');
  placeTrainAtStation(stationId);
  renderContentPanel(stationId);
  panel.classList.add('on');
  activeNavigationStationId = null;
  busy = false;
}

async function onStationClick(stationId) {
  if (busy) {
    navigationToken++;
    openStationNow(stationId);
    return;
  }
  const token = ++navigationToken;
  busy = true;
  activeNavigationStationId = stationId;
  panel.classList.remove('on');
  showNavSkipHint();

  // Determine line (use primary)
  const targetLine = LINES.find(l => l.id === STATIONS[stationId].lineIds[0]);

  // 1) Move train
  const moved = await moveTrainTo(stationId, token);
  if (!moved || token !== navigationToken) return;

  // 2) Flip-board
  await showFlipBoard(STATIONS[stationId], targetLine);
  if (token !== navigationToken) return;

  // 3) Render content + open panel
  renderContentPanel(stationId);
  hideFlipBoard();
  hideNavSkipHint();
  panel.classList.add('on');

  if (token === navigationToken) {
    activeNavigationStationId = null;
    busy = false;
  }
}

document.addEventListener('keydown', (event) => {
  const skipKey = event.key === 'Enter' || event.key === ' ' || event.code === 'Space';
  if (!skipKey || event.repeat || !busy || !activeNavigationStationId) return;
  const target = event.target;
  if (target instanceof Element
      && target.closest('input, textarea, select, button, a, [contenteditable="true"]')) return;

  event.preventDefault();
  const stationId = activeNavigationStationId;
  navigationToken++;
  openStationNow(stationId);
});

// ════════ Image preview clipboard ══════════════════════════════════
let imagePreview = null;

function ensureImagePreview() {
  if (imagePreview) return imagePreview;
  imagePreview = document.createElement('div');
  imagePreview.className = 'image-preview';
  imagePreview.setAttribute('aria-hidden', 'true');
  imagePreview.innerHTML = `
    <div class="image-preview-board" role="dialog" aria-modal="true" aria-label="Image preview">
      <button class="image-preview-close" type="button" aria-label="Close preview">✕</button>
      <div class="image-preview-caption"></div>
      <div class="image-preview-frame">
        <img alt="">
      </div>
    </div>
  `;
  document.body.appendChild(imagePreview);
  imagePreview.addEventListener('click', (event) => {
    if (event.target === imagePreview || event.target.closest('.image-preview-close')) {
      closeImagePreview();
    }
  });
  return imagePreview;
}

function openImagePreview(img) {
  const preview = ensureImagePreview();
  const previewImg = preview.querySelector('img');
  const caption = preview.querySelector('.image-preview-caption');
  previewImg.src = img.currentSrc || img.src;
  previewImg.alt = img.alt || 'Project image preview';
  caption.textContent = img.closest('figure')?.querySelector('figcaption span')?.textContent
    || img.closest('figure')?.querySelector('figcaption')?.textContent
    || img.alt
    || 'Project image';
  preview.classList.add('on');
  preview.setAttribute('aria-hidden', 'false');
}

function closeImagePreview() {
  if (!imagePreview) return;
  imagePreview.classList.remove('on');
  imagePreview.setAttribute('aria-hidden', 'true');
}

document.addEventListener('click', (event) => {
  const img = event.target.closest?.('.inline-shot img, .lab-shot img, .entry-image-card img, .central-photo img');
  if (!img) return;
  event.preventDefault();
  openImagePreview(img);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeImagePreview();
});

// ════════ Service alerts ticker ════════════════════════════════════
function startTicker() {
  const ticker = document.getElementById('ticker-text');
  const sevIcon = document.getElementById('ticker-icon');
  let i = 0;
  function show() {
    const a = ALERTS[i % ALERTS.length];
    ticker.style.opacity = '0';
    setTimeout(() => {
      ticker.textContent = a.text;
      sevIcon.className = `ticker-sev ticker-sev-${a.severity}`;
      sevIcon.textContent = a.severity === 'good' ? '●' : a.severity === 'minor' ? '▲' : '◆';
      ticker.style.opacity = '1';
    }, 240);
    i++;
  }
  show();
  setInterval(show, 5600);
}

// ════════ Night mode ═══════════════════════════════════════════════
const nightToggle = document.getElementById('night-toggle');
nightToggle.addEventListener('click', () => {
  document.body.classList.toggle('night');
  nightToggle.textContent = document.body.classList.contains('night') ? '☀ DAY' : '☾ NIGHT';
});

// ════════ Boot ═════════════════════════════════════════════════════
function boot() {
  renderLines();
  // Defer until paths are in DOM; use setTimeout so it fires even if rAF
  // is throttled (preview iframes / background tabs).
  setTimeout(() => {
    stationIndex = indexStationPositions(pathEls);
    renderStations();
    createTrain();
    // Park the train at Central
    const c = stationIndex['central'].find(s => s.lineId === 'journey');
    placeTrain(c.x, c.y, 0);
    startTicker();

    // Expose a minimal surface for the intro sequence (intro.js).
    window.__TRANSIT = {
      LINES, STATIONS, pathEls, stationEls, stationIndex,
      placeTrainAtStation,
      introRide,
      abortNav: () => { navigationToken++; },
    };
    document.dispatchEvent(new CustomEvent('transit:ready'));
  }, 0);
}
boot();

})();
