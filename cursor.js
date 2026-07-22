// Lightweight custom cursor.
// Keeps the dot exact and lets the ring follow gently without map geometry work.
(() => {
  const coarsePointer = matchMedia('(pointer: coarse)').matches;
  const disabled = document.documentElement.classList.contains('cursor-disabled')
    || document.body?.classList.contains('cursor-disabled');
  if (coarsePointer || disabled) return;

  document.documentElement.classList.add('custom-cursor-on');
  document.body.classList.add('custom-cursor-on');

  const cursor = document.createElement('div');
  cursor.className = 'cur cur-hidden';
  cursor.innerHTML = `
    <div class="cur-ring"></div>
    <div class="cur-dot"></div>
  `;
  document.body.appendChild(cursor);

  const ring = cursor.querySelector('.cur-ring');
  const dot = cursor.querySelector('.cur-dot');

  let pointerX = innerWidth / 2;
  let pointerY = innerHeight / 2;
  let ringX = pointerX;
  let ringY = pointerY;
  let raf = 0;
  let firstMove = true;

  function place(el, x, y) {
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  }

  function isInteractive(target) {
    return target instanceof Element && Boolean(target.closest(
      'a, button, .station, .line, .iconbtn, .key-item, .pill-btn, .tab, [role="button"], input, textarea, select, [contenteditable="true"]',
    ));
  }

  function tick() {
    ringX += (pointerX - ringX) * 0.18;
    ringY += (pointerY - ringY) * 0.18;

    place(ring, ringX, ringY);

    if (Math.abs(pointerX - ringX) < 0.1 && Math.abs(pointerY - ringY) < 0.1) {
      ringX = pointerX;
      ringY = pointerY;
      place(ring, ringX, ringY);
      raf = 0;
      return;
    }

    raf = requestAnimationFrame(tick);
  }

  addEventListener('pointermove', (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;

    pointerX = event.clientX;
    pointerY = event.clientY;
    place(dot, pointerX, pointerY);

    if (firstMove) {
      ringX = pointerX;
      ringY = pointerY;
      firstMove = false;
      place(ring, ringX, ringY);
    }

    cursor.classList.remove('cur-hidden');
    cursor.classList.toggle('is-interactive', isInteractive(event.target));

    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => {
    cursor.classList.add('cur-hidden');
  });

  addEventListener('pointerdown', () => {
    cursor.classList.add('is-down');
  }, { passive: true });

  addEventListener('pointerup', () => {
    cursor.classList.remove('is-down');
  }, { passive: true });
})();
