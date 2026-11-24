const COPY = ['Jack Gao', 'A collection of myself displayed in orbit.'];
const homeRoute = () => !location.hash || /^#\/?$/.test(location.hash);

// The overlay is present in HTML so neither the atlas nor its controls flash first.
export function createEntrance({ reduced, onEnter, onComplete }) {
  const overlay = document.getElementById('entrance');
  const button = document.getElementById('enter-orbit');
  const name = document.getElementById('intro-name');
  const sentence = document.getElementById('intro-sentence');
  const canvas = document.getElementById('birth-canvas');
  const surfaces = ['.masthead', '#atlas', '#page', '.skip-link'].map(s => document.querySelector(s));
  let stage = homeRoute() ? 'typing' : 'done', raf = 0, timer = 0, touchY = null;
  let enteredAt = 0, wheelUntil = 0, ready = false, typingDone = false;
  let resolveReady;
  const sceneReady = new Promise(resolve => { resolveReady = resolve; });
  const active = () => stage !== 'done';
  function setStage(value) { stage = value; overlay.dataset.stage = value; }
  function releaseSurfaces() { for (const surface of surfaces) surface.inert = false; }
  function complete() {
    if (!active()) return;
    clearTimeout(timer); cancelAnimationFrame(raf);
    setStage('done'); overlay.hidden = true;
    document.body.classList.remove('entering');
    releaseSurfaces(); onComplete?.();
    if (overlay.contains(document.activeElement)) document.querySelector('.signature').focus({ preventScroll: true });
  }
  function markWaiting() {
    if (stage !== 'typing' || !typingDone || !ready) return;
    setStage('waiting'); button.disabled = false;
  }
  function type() {
    if (stage !== 'typing') return;
    let index = 0;
    const text = COPY.join('\n');
    const tick = () => {
      if (stage !== 'typing') return;
      index += 1;
      name.textContent = text.slice(0, Math.min(index, COPY[0].length));
      sentence.textContent = text.slice(COPY[0].length + 1, index);
      if (index < text.length) timer = setTimeout(tick, index < COPY[0].length ? 42 : 22);
      else { typingDone = true; markWaiting(); }
    };
    if (reduced) { name.textContent = COPY[0]; sentence.textContent = COPY[1]; typingDone = true; markWaiting(); }
    else timer = setTimeout(tick, 240);
  }
  // A deterministic outward cloud: the same birth of light at every visit.
  let seed = 983;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const particles = Array.from({ length: 270 }, () => {
    return { angle: random() * Math.PI * 2, spread: Math.pow(random(), 1.5), radius: .35 + random() * 1.3, warm: random() > .24, drift: (random() - .5) * .22, light: .2 + random() * .8 };
  });
  function drawBirth(progress) {
    const c = canvas.getContext('2d'); if (!c) return;
    const dpr = Math.min(devicePixelRatio, 1.75), w = innerWidth, h = innerHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
    const x = w / 2, y = h / 2, scale = Math.max(w, h), expansion = Math.max(0, (progress - .22) / .78);
    const bloom = Math.sin(Math.min(1, progress / .72) * Math.PI / 2), fade = 1 - Math.pow(Math.max(0, (progress - .62) / .38), 2);
    c.globalCompositeOperation = 'lighter';
    const radius = Math.max(2, (progress < .22 ? .014 * progress / .22 : .014 + Math.pow(expansion, .72) * .72) * scale);
    const halo = c.createRadialGradient(x, y, 0, x, y, radius);
    halo.addColorStop(0, `rgba(255,253,239,${bloom * fade})`);
    halo.addColorStop(.07, `rgba(255,235,190,${bloom * fade * .94})`);
    halo.addColorStop(.26, `rgba(239,164,97,${bloom * fade * .25})`);
    halo.addColorStop(.53, `rgba(128,148,218,${bloom * fade * .09})`);
    halo.addColorStop(1, 'rgba(25,36,90,0)');
    c.fillStyle = halo; c.fillRect(0, 0, w, h);
    const coreRadius = Math.max(3, scale * (.004 + expansion * .032));
    const core = c.createRadialGradient(x, y, 0, x, y, coreRadius);
    core.addColorStop(0, `rgba(255,255,247,${bloom * fade})`);
    core.addColorStop(.25, `rgba(255,247,218,${bloom * fade * .88})`);
    core.addColorStop(1, 'rgba(255,225,172,0)');
    c.fillStyle = core; c.fillRect(x - coreRadius, y - coreRadius, coreRadius * 2, coreRadius * 2);
    if (expansion > 0) {
      for (const p of particles) {
        const distance = Math.pow(expansion, .68) * scale * (.045 + p.spread * .66), curl = p.angle + expansion * p.drift;
        const px = x + Math.cos(curl) * distance, py = y + Math.sin(curl) * distance * .78;
        const alpha = Math.min(1, expansion * 12) * Math.pow(1 - expansion, 1.4) * p.light;
        c.fillStyle = p.warm ? `rgba(255,224,176,${alpha})` : `rgba(170,205,255,${alpha})`;
        c.shadowColor = p.warm ? '#ffc987' : '#9cbfff'; c.shadowBlur = 7;
        c.beginPath(); c.arc(px, py, p.radius * (1 + expansion), 0, Math.PI * 2); c.fill();
      }
      c.shadowBlur = 0;
      c.save(); c.translate(x, y); c.rotate(-.22); c.scale(1, .84);
      const waveRadius = Math.max(1, scale * Math.pow(expansion, .65) * .5), waveAlpha = Math.pow(1 - expansion, 1.7);
      const wave = c.createRadialGradient(0, 0, waveRadius * .78, 0, 0, waveRadius * 1.12);
      wave.addColorStop(0, 'rgba(255,211,148,0)');
      wave.addColorStop(.42, `rgba(255,221,172,${waveAlpha * .06})`);
      wave.addColorStop(.64, `rgba(255,244,215,${waveAlpha * .24})`);
      wave.addColorStop(.78, `rgba(193,211,255,${waveAlpha * .09})`);
      wave.addColorStop(1, 'rgba(151,178,242,0)');
      c.fillStyle = wave; c.fillRect(-waveRadius * 1.12, -waveRadius * 1.12, waveRadius * 2.24, waveRadius * 2.24); c.restore();
    }
    c.globalCompositeOperation = 'source-over';
  }
  async function enter() {
    if (stage !== 'waiting') return;
    setStage('burst'); button.disabled = true; enteredAt = performance.now();
    // Keep consuming the triggering gesture until its momentum has ended.
    wheelUntil = enteredAt + 500;
    await sceneReady;
    if (!active()) return;
    if (reduced) { await onEnter(); complete(); return; }
    const start = performance.now();
    let cameraStarted = false;
    const animate = now => {
      if (!active()) return;
      const elapsed = now - start;
      drawBirth(Math.min(1, elapsed / 2200));
      if (elapsed >= 1400 && !cameraStarted) {
        cameraStarted = true; setStage('zoom');
        Promise.resolve(onEnter()).then(() => { if (active()) complete(); });
      }
      if (elapsed < 2350) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
  }
  function wheel(event) {
    if (active() || performance.now() < wheelUntil) {
      event.preventDefault(); event.stopImmediatePropagation();
      wheelUntil = performance.now() + 220;
      if (stage === 'waiting' && event.deltaY > 0) enter();
    }
  }
  function keydown(event) {
    if (!active()) return;
    if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(event.key)) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (stage === 'waiting') enter();
    }
  }
  function touchstart(event) { if (active()) touchY = event.touches[0]?.clientY; }
  function touchmove(event) {
    if (!active()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (stage === 'waiting' && touchY != null && touchY - event.touches[0].clientY > 24) enter();
  }
  function routeChanged() { if (active() && !homeRoute()) complete(); }
  window.addEventListener('wheel', wheel, { capture: true, passive: false });
  window.addEventListener('keydown', keydown, true);
  window.addEventListener('touchstart', touchstart, { capture: true, passive: true });
  window.addEventListener('touchmove', touchmove, { capture: true, passive: false });
  window.addEventListener('hashchange', routeChanged);
  button.addEventListener('click', enter);
  if (active()) { for (const surface of surfaces) surface.inert = true; type(); }
  else { overlay.hidden = true; document.body.classList.remove('entering'); }
  return { active, ready() { ready = true; resolveReady(); markWaiting(); }, skip: complete };
}
