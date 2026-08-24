/* ==========================================================================
   Hero instrument panel: analog clock + hover pointer + sticky nav
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  buildClockFace();
  startClock();
  setupPointer();
  setupPortraitFallback();
  setupStickyNav();
});

/* ---- Build the tick marks and numerals for the clock face ---- */
function buildClockFace() {
  const ticksGroup = document.getElementById('clockTicks');
  const numeralsGroup = document.getElementById('clockNumerals');
  if (!ticksGroup || !numeralsGroup) return;

  const cx = 100, cy = 100;
  const outerR = 94;

  for (let i = 0; i < 60; i++) {
    const angle = (i * 6) * (Math.PI / 180);
    const isMajor = i % 5 === 0;
    const r1 = outerR - (isMajor ? 12 : 6);
    const r2 = outerR - 2;

    const x1 = cx + r1 * Math.sin(angle);
    const y1 = cy - r1 * Math.cos(angle);
    const x2 = cx + r2 * Math.sin(angle);
    const y2 = cy - r2 * Math.cos(angle);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1.toFixed(2));
    line.setAttribute('y1', y1.toFixed(2));
    line.setAttribute('x2', x2.toFixed(2));
    line.setAttribute('y2', y2.toFixed(2));
    line.setAttribute('class', isMajor ? 'clock-tick-major' : 'clock-tick-minor');
    ticksGroup.appendChild(line);
  }

  for (let n = 1; n <= 12; n++) {
    const angle = (n * 30) * (Math.PI / 180);
    const r = outerR - 22;
    const x = cx + r * Math.sin(angle);
    const y = cy - r * Math.cos(angle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x.toFixed(2));
    text.setAttribute('y', y.toFixed(2));
    text.setAttribute('class', 'clock-numeral');
    text.textContent = n;
    numeralsGroup.appendChild(text);
  }
}

/* ---- Live analog + digital clock ---- */
function startClock() {
  const handHour = document.getElementById('handHour');
  const handMinute = document.getElementById('handMinute');
  const handSecond = document.getElementById('handSecond');
  const digital = document.getElementById('clockDigital');
  if (!handHour || !handMinute || !handSecond) return;

  function tick() {
    const now = new Date();
    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds();

    const hourDeg = (h + m / 60) * 30;
    const minuteDeg = (m + s / 60) * 6;
    const secondDeg = s * 6;

    handHour.setAttribute('transform', `rotate(${hourDeg} 100 100)`);
    handMinute.setAttribute('transform', `rotate(${minuteDeg} 100 100)`);
    handSecond.setAttribute('transform', `rotate(${secondDeg} 100 100)`);

    if (digital) {
      const pad = (n) => String(n).padStart(2, '0');
      let displayHour = now.getHours() % 12;
      if (displayHour === 0) displayHour = 12;
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      digital.textContent = `${pad(displayHour)}:${pad(m)}:${pad(s)} ${ampm}`;
    }
  }

  tick();
  setInterval(tick, 1000);
}

/* ---- Pointer arrow tracks whichever nav link is hovered/focused ---- */
function setupPointer() {
  const wrap = document.querySelector('.hero-nav-wrap');
  const pointer = document.getElementById('pointerArrow');
  const links = document.querySelectorAll('.hero-nav-link');
  if (!wrap || !pointer || !links.length) return;

  function pointTo(link) {
    const wrapRect = wrap.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const centerY = linkRect.top + linkRect.height / 2 - wrapRect.top;
    pointer.style.top = `${centerY}px`;

    links.forEach((l) => l.classList.remove('is-active'));
    link.classList.add('is-active');
  }

  links.forEach((link) => {
    link.addEventListener('mouseenter', () => pointTo(link));
    link.addEventListener('focus', () => pointTo(link));
  });

  // Default: point at the first item so the instrument doesn't look idle
  pointTo(links[0]);
  links[0].classList.add('is-active');

  window.addEventListener('resize', () => {
    const active = document.querySelector('.hero-nav-link.is-active') || links[0];
    pointTo(active);
  });
}

/* ---- Show the portrait once it loads, otherwise keep the placeholder ---- */
function setupPortraitFallback() {
  const img = document.getElementById('portraitImg');
  const frame = document.querySelector('.portrait-frame');
  if (!img || !frame) return;

  img.addEventListener('load', () => frame.classList.add('has-image'));
  img.addEventListener('error', () => frame.classList.remove('has-image'));

  // In case the image is already cached and loaded before listeners attach
  if (img.complete && img.naturalWidth > 0) {
    frame.classList.add('has-image');
  }
}

/* ---- Sticky nav fades in once the hero scrolls out of view ---- */
function setupStickyNav() {
  const hero = document.getElementById('hero');
  const stickyNav = document.getElementById('stickyNav');
  if (!hero || !stickyNav) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      stickyNav.classList.toggle('is-visible', !entry.isIntersecting);
    },
    { threshold: 0, rootMargin: '-10% 0px 0px 0px' }
  );

  observer.observe(hero);
}
