import { MOONS } from './moons.js';
import { createEntrance } from './intro.js';
const planets = [
 {id:'mercury',name:'Mercury',title:'Posts',slug:'posts',color:'#ada397',symbol:'☿',radius:'2,440 km',year:'88 Earth days',fact:'The smallest planet, and the closest to the Sun. Its cratered surface holds a record of ancient impacts.'},
 {id:'venus',name:'Venus',title:'Favourite pictures',slug:'pictures',color:'#dbb98d',symbol:'♀',radius:'6,052 km',year:'225 Earth days',fact:'Wrapped in thick clouds, Venus is the hottest planet in our solar system.'},
 {id:'earth',name:'Earth',title:'Diep Genie',slug:'diep-genie',color:'#71a9b4',symbol:'⊕',radius:'6,371 km',year:'365.25 days',fact:'Our ocean-covered home is the only world known to support life.'},
 {id:'mars',name:'Mars',title:'Work experience',slug:'work',color:'#bc7358',symbol:'♂',radius:'3,390 km',year:'687 Earth days',fact:'A rocky world with enormous volcanoes, deep canyons and evidence of ancient water.'},
 {id:'jupiter',name:'Jupiter',title:'Starred projects',slug:'projects',color:'#d7b69c',symbol:'♃',radius:'69,911 km',year:'11.86 Earth years',fact:'The largest planet: a gas giant with banded clouds and immense storms.'},
 {id:'saturn',name:'Saturn',title:'Favourites',slug:'favourites',color:'#d3bf8f',symbol:'♄',radius:'58,232 km',year:'29.45 Earth years',fact:'Saturn’s spectacular rings are made of countless pieces of ice and rock.'},
 {id:'uranus',name:'Uranus',title:'Uranus',color:'#98c8c9',symbol:'♅',radius:'25,362 km',year:'84 Earth years',fact:'An ice giant that rotates on its side. Methane in its atmosphere gives Uranus its blue-green colour.'},
 {id:'neptune',name:'Neptune',title:'Neptune',color:'#5381bc',symbol:'♆',radius:'24,622 km',year:'165 Earth years',fact:'Dark, cold and swept by powerful winds, Neptune is the outermost of the eight planets.'},
 {id:'pluto',name:'Pluto',title:'Pluto',color:'#b6a28c',symbol:'♇',radius:'1,188 km',year:'248 Earth years',fact:'A dwarf planet in the Kuiper Belt, with mountains of water ice and a vast heart-shaped region.',source:'https://science.nasa.gov/dwarf-planets/pluto/facts/'}
];
const byId=Object.fromEntries(planets.map(p=>[p.id,p]));
const $=s=>document.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = reduced;
let scene;
let selected = null;
let focusTime = 0;
let fallback = false;
let readySelection = null;
let keyboardSelection = false;
let fallbackTimer;
const entrance = createEntrance({
  reduced,
  onEnter: () => { scene?.setSuspended?.(false); return scene?.playIntro(); },
  onComplete: () => { scene?.setSuspended?.(false); announce('Select a planet to explore.'); }
});
if(reduced) document.body.classList.add('reduced-motion');
const external=(url,label,cls='card-link')=>`<a class="${cls}" href="${url}" target="_blank" rel="noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>`;
const card=(meta,title,copy,url,label='Explore project')=>`<article class="content-card"><span class="card-meta">${meta}</span><h2>${title}</h2><p>${copy}</p>${url?external(url,label):''}</article>`;
const orbitArt=`<div class="empty-art" aria-hidden="true"><svg viewBox="0 0 150 120"><ellipse cx="75" cy="60" rx="64" ry="24" transform="rotate(-25 75 60)"/><ellipse cx="75" cy="60" rx="45" ry="44"/><circle cx="75" cy="60" r="14"/><circle cx="129" cy="35" r="4" fill="currentColor"/><path d="M75 3v8m0 98v8M10 60H2m146 0h-8"/></svg></div>`;
const pages={
 'diep-genie':{planet:'earth',title:'Diep Genie',deck:'Exploring what a model can learn from watching a game.',body:`<div class="page-grid">${card('01 / RESEARCH PROJECT','A world-model prototype','A small Genie-style video world-model research prototype for diep.io, with local validation and latent-action experiments.','https://github.com/jackgao1540/Diep-Genie','Read the repository')}${card('02 / EARLIER EXPLORATION','Genie, in MiniGrid','A toy implementation of Google’s GENIE paper, exploring video tokenization and dynamics in MiniGrid.','https://github.com/jackgao1540/Google-GENIE-MiniGrid-Video-Tokenizer-and-Dynamics-Model','Explore the MiniGrid project')}</div><p class="page-note">This is an ongoing research prototype. Implementation details and documented results are available in the public repository.</p>`},
 'projects':{planet:'jupiter',title:'Starred projects',deck:'A few things I am building. And a bookmark from the wider universe.',body:`<div class="page-grid">${card('BOOKMARK / ML EXPLORE','MLX','An array framework for Apple silicon, by the ML Explore team. A public GitHub star, kept here as a useful reference.','https://github.com/ml-explore/mlx','Visit MLX')}${card('COLLECTION / GITHUB','The stars collection','Browse the current public collection directly on GitHub. ','https://github.com/jackgao1540?tab=stars','Browse starred repositories')}</div><p class="page-eyebrow">MY PUBLIC PROJECTS</p><div class="page-grid">${card('PYTHON / MACHINE LEARNING','Genie in MiniGrid','A toy implementation of Google’s GENIE paper.','https://github.com/jackgao1540/Google-GENIE-MiniGrid-Video-Tokenizer-and-Dynamics-Model')}${card('C++ / INVERSE KINEMATICS','FABRIK · SFML','A segmented arm using FABRIK, with dynamic joint addition and removal.','https://github.com/jackgao1540/FABRIK_SFML')}${card('C++ / EXPLORATION','Mandelbrot','A public C++ repository for exploring the Mandelbrot set.','https://github.com/jackgao1540/mandelbrot')}${card('C++ / PROBLEM SOLVING','DMOJ solutions','Solutions to DMOJ problems over the years.','https://github.com/jackgao1540/dmoj-solutions')}</div>`},
 'work':{planet:'mars',title:'Work experience',deck:'A place for the work, the teams, and the lessons along the way.',body:`${orbitArt}<p class="page-prose">A detailed work history has not been published here yet. Until it is, my public projects offer a view of the things I have been exploring.</p><div class="page-grid">${card('PUBLIC WORK','Explore my projects','Code, experiments and small explorations, in their own words.','https://github.com/jackgao1540','Visit GitHub')}</div>`},
 'posts':{planet:'mercury',title:'Notes from orbit',deck:'A future home for longer thoughts, small discoveries, and videos.',body:`${orbitArt}<div class="page-grid">${card('WRITING / COMING LATER','The notebook','No blog posts have been published here yet. This space is reserved for notes and longer-form writing.')}${card('VIDEO / COMING LATER','The moving picture','A place for future YouTube videos and visual explanations. No channel or videos are linked yet.')}</div>`},
 'pictures':{planet:'venus',title:'Favourite pictures',deck:'A place to pause. To notice the light. To look a little longer.',body:`${orbitArt}<p class="page-prose">The personal photo collection is still being put together. No photographs have been published here yet.</p>`},
 'favourites':{planet:'saturn',title:'Things worth keeping',deck:'Papers, blog posts, and videos to return to.',body:`<div class="page-grid">${card('01 / PAPERS','The reading shelf','A personal selection of papers will live here. The list is not published yet.')}${card('02 / BLOGS','Good ideas, in words','A future collection of essays and technical writing worth revisiting.')}${card('03 / VIDEOS','Worth a watch','A future collection of talks, explanations, and videos.')}${card('04 / AN OPEN WINDOW','Explore the solar system','Planet facts in this atlas are drawn from NASA’s public solar system resources.','https://science.nasa.gov/solar-system/planets/','Visit NASA')}</div>`}
};
// Keep the existing public showcase linked without copying its media.
pages['diep-genie'].body = pages['diep-genie'].body.replace(
  '</article>',
  external('https://jackgao1540.github.io/Diep-Genie/', 'View data and reconstructions') + '</article>'
);

// Every destination has a direct text route in the table of contents.
for (const planet of planets.filter(planet => !planet.slug)) {
  pages['about/' + planet.id] = {
    planet: planet.id,
    title: planet.name,
    deck: planet.fact,
    body: '<dl class="science-facts"><dt>Classification</dt><dd>' + (planet.id === 'pluto' ? 'Dwarf planet' : 'Ice giant') + '</dd><dt>Mean radius</dt><dd>' + planet.radius + '</dd><dt>Orbital period</dt><dd>' + planet.year + '</dd></dl><p class="page-note">Rounded values. ' + external(planet.source || 'https://science.nasa.gov/' + planet.id + '/', 'Read more at NASA', '') + '</p>'
  };
}
$('#destination-list').innerHTML = planets.map(planet => '<li><a class="contents-destination" href="#/' + (planet.slug || 'about/' + planet.id) + '" style="--planet:' + planet.color + '"><span class="planet-dot ' + planet.id + '" aria-hidden="true"></span><span class="destination-copy"><span class="destination-name">' + planet.title + '</span><span class="planet-name">' + (planet.id === 'pluto' ? 'DWARF PLANET' : planet.slug ? planet.name : 'PLANET FACTS') + '</span></span><span aria-hidden="true">↗</span></a></li>').join('');

// Identification stays transient; it never creates another click target.
const moonName = document.createElement('div');
moonName.className = 'moon-name';
moonName.hidden = true;
moonName.setAttribute('aria-hidden', 'true');
$('#atlas').append(moonName);
const moonSummary = document.createElement('p');
moonSummary.id = 'moon-summary';
moonSummary.className = 'sr-only';
$('#atlas').append(moonSummary);
const moonAnnouncement = document.createElement('p');
moonAnnouncement.className = 'sr-only';
moonAnnouncement.setAttribute('role', 'status');
moonAnnouncement.setAttribute('aria-live', 'polite');
$('#atlas').append(moonAnnouncement);
let identifiedMoon = null;
let moonFrame = null;
let moonPointerType = 'mouse';
let moonLabelTimer;

function hideMoonName() {
  clearTimeout(moonLabelTimer);
  identifiedMoon = null;
  moonName.hidden = true;
  moonAnnouncement.textContent = '';
}

function positionMoonName() {
  if (!identifiedMoon || !moonFrame || !$('#page').hidden || document.body.classList.contains('contents-open')) return;
  const projected = moonFrame.moons?.find(moon => moon.id === identifiedMoon.id);
  if (!projected?.visible) { moonName.hidden = true; return; }
  moonName.hidden = false;
  const box = moonName.getBoundingClientRect();
  let x = Math.max(12, Math.min(innerWidth - box.width - 12, projected.x + projected.radius + 10));
  let y = Math.max(88, projected.y - projected.radius - box.height - 8);
  const destination = $('#spatial-label');
  const domPlaque = !destination.hidden && !destination.classList.contains('scene-link-accessible') ? destination.getBoundingClientRect() : null;
  const plaque = moonFrame.plaqueBounds || domPlaque;
  if (plaque && x < plaque.right + 10 && x + box.width > plaque.left - 10 && y < plaque.bottom + 10 && y + box.height > plaque.top - 10) {
    y = Math.max(88, plaque.top - box.height - 12);
  }
  moonName.style.left = x + 'px';
  moonName.style.top = Math.min(innerHeight - box.height - 12, y) + 'px';
}

function identifyMoon(moon) {
  if (!moon) {
    // Touch pointer-leave can follow pointer-up immediately; retain its short cue.
    if (moonPointerType !== 'touch') hideMoonName();
    return;
  }
  if (!selected || moon.parent !== selected || !$('#page').hidden || document.body.classList.contains('contents-open')) return;
  const changed = identifiedMoon?.id !== moon.id;
  identifiedMoon = moon;
  moonName.textContent = moon.name;
  if (changed) moonAnnouncement.textContent = moon.name;
  positionMoonName();
  clearTimeout(moonLabelTimer);
  if (moonPointerType === 'touch') moonLabelTimer = setTimeout(hideMoonName, 2200);
}
$('#solar-canvas').addEventListener('pointerdown', event => { moonPointerType = event.pointerType; }, true);
$('#solar-canvas').addEventListener('pointermove', event => { moonPointerType = event.pointerType; }, true);
$('#solar-canvas').addEventListener('pointerleave', () => { if (moonPointerType !== 'touch') hideMoonName(); });

let contentsReturnFocus;
function setIndexOpen(open) {
  const sidebar = $('#contents-sidebar');
  if (open) { contentsReturnFocus = document.activeElement; hideMoonName(); }
  sidebar.hidden = !open;
  $('#contents-shade').hidden = !open;
  $('#toggle-destinations').setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('contents-open', open);
  $('#atlas').inert = open;
  $('#page').inert = open;

  if (open) $('#close-contents').focus();
  else if (contentsReturnFocus?.isConnected) contentsReturnFocus.focus({ preventScroll: true });
}

function announce(text) {
  $('#announcer').textContent = text;
}



function setPaused(value) {
  paused = value;
  scene?.setPaused(value);

}

function hideDestination() {
  $('#spatial-label').hidden = true;
  $('#planet-detail').hidden = true;
}

function renderDestination(planet) {
  const label = $('#spatial-label');
  label.innerHTML = `<a aria-describedby="moon-summary" href="#/${planet.slug || 'about/' + planet.id}">
      <span class="label-kicker">${planet.name.toUpperCase()}${planet.id === 'pluto' ? ' · DWARF PLANET' : ''}</span>
      <span class="label-title">${planet.slug ? planet.title : 'Planet facts'}</span>
      <span class="label-action">OPEN <span aria-hidden="true">↗</span></span>
    </a>`;
}

function showDestination(planet, projected, spatialLink = false) {
  const label = $('#spatial-label');
  if (readySelection !== planet.id) {
    renderDestination(planet);
    readySelection = planet.id;

  }
  {
    label.hidden = false;
    label.classList.toggle('scene-link-accessible', spatialLink);
    label.classList.toggle('fallback-destination', fallback);
    const x = fallback ? innerWidth / 2 : projected?.x ?? innerWidth / 2;
    const y = fallback
      ? Math.min(innerHeight - label.offsetHeight - 24, innerHeight * .76)
      : projected ? projected.y + (projected.radius || 45) * .65 : innerHeight * .42;
    label.style.left = `${Math.max(130, Math.min(innerWidth - 130, x))}px`;
    label.style.top = `${fallback ? Math.max(96, y) : Math.max(115, Math.min(innerHeight - 240, y))}px`;
    if (keyboardSelection) {
      label.querySelector('a').focus({ preventScroll: true });
      keyboardSelection = false;
    }
  }
}

function choosePlanet(id, writeRoute = true) {
  const planet = byId[id];
  if (!planet) return;
  clearTimeout(fallbackTimer);
  hideMoonName();
  selected = id;
  const names = MOONS.filter(moon => moon.parent === id).map(moon => moon.name);
  moonSummary.textContent = names.length ? 'Moons in this view: ' + names.join(', ') + '.' : 'No natural moons.';
  readySelection = null;
  focusTime = performance.now();
  document.body.classList.add('focused');
  setIndexOpen(false);

  document.querySelectorAll('[data-planet]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.planet === id));
  });
  hideDestination();
  scene?.skipIntro();
  scene?.focus(id);
  if (writeRoute && location.hash !== `#/planet/${id}`) {
    history.pushState(null, '', `#/planet/${id}`);
  }
  announce(`${planet.name} selected. ${planet.slug ? 'Open ' + planet.title + ' when the close-up arrives.' : planet.fact}`);
  if (fallback) {
    // No animation dependency: deep links and button selection use the same path.
    fallbackTimer = setTimeout(() => {
      if (selected === id && $('#page').hidden) showDestination(planet);
    }, reduced ? 0 : 160);
  }
}

function overview(writeRoute = true, preserveIntro = false) {
  clearTimeout(fallbackTimer);
  selected = null;
  hideMoonName();
  moonSummary.textContent = '';
  readySelection = null;
  document.body.classList.remove('focused');
  hideDestination();
  document.querySelectorAll('[data-planet]').forEach(button => button.setAttribute('aria-pressed', 'false'));
  if (!preserveIntro) scene?.overview();
  if (writeRoute) location.hash = '/';
}

function enter(id) {
  const planet = byId[id];
  if (planet) location.hash = '/' + (planet.slug || 'about/' + id);
}

function renderFrame(frame) {
  moonFrame = frame;
  positionMoonName();
  if (!selected || !$('#page').hidden) return;
  if (performance.now() - focusTime < (reduced ? 0 : 1250)) return;
  const projected = frame.labels?.find(label => label.id === selected);
  if (!projected?.visible) {
    $('#spatial-label').hidden = true;
    return;
  }
  const inScene = frame.spatialLink === true || frame.spatialLink?.visible === true;
  showDestination(byId[selected], projected, inScene);
}

function renderPage(path, page) {
  hideMoonName();
  const planet = byId[page.planet];
  const entries = Object.keys(pages);
  const next = entries[(entries.indexOf(path) + 1) % entries.length];
  $('#atlas').hidden = true;
  $('#page').hidden = false;
  document.body.classList.add('is-page');
  document.title = `${page.title} — Jack Gao`;
  $('#page').innerHTML = `
    <a class="back-link" href="#/planet/${planet.id}">← <span>BACK TO ${planet.name.toUpperCase()}</span></a>
    <header class="page-heading"><div>
      <h1>${page.title}</h1>
    </div><span class="page-symbol" aria-hidden="true">${planet.symbol}</span></header>
    <p class="page-deck">${page.deck}</p>${page.body}
    <nav class="page-footer" aria-label="Page navigation">
      <a href="#/">← Solar system</a><a href="#/${next}">Next: ${pages[next].title} ↗</a>
    </nav>`;
  scene?.setPaused(true);
  window.scrollTo(0, 0);
  $('#page').focus({ preventScroll: true });
}

function route({ initial = false } = {}) {
  let path;
  try { path = decodeURIComponent(location.hash.replace(/^#\/?/, '')); }
  catch { path = ''; }
  if (pages[path]) {
    renderPage(path, pages[path]);
    return;
  }
  $('#atlas').hidden = false;
  $('#page').hidden = true;
  document.body.classList.remove('is-page');
  document.title = 'Jack Gao — A collection in orbit';
  scene?.setPaused(paused);
  const match = path.match(/^planet\/(\w+)$/);
  if (match && byId[match[1]]) choosePlanet(match[1], false);
  else overview(false, initial);
}

function enableFallback() {
  if (fallback) return;
  fallback = true;
  const message = document.createElement('p');
  message.className = 'fallback-message';
  message.textContent = 'Open Contents to explore every destination.';
  $('#universe').append(message);
  if (selected) choosePlanet(selected, false);
}

$('#toggle-destinations').addEventListener('click', () => setIndexOpen($('#contents-sidebar').hidden));
$('#close-contents').addEventListener('click', () => setIndexOpen(false));
$('#contents-shade').addEventListener('click', () => setIndexOpen(false));
$('#contents-sidebar').addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  setIndexOpen(false);
  if (link.getAttribute('href') === '#/') {
    event.preventDefault();
    overview();
    $('.signature').focus();
  }
});
$('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  setIndexOpen(true);
});
$('.signature').addEventListener('click', event => {
  event.preventDefault();
  setIndexOpen(false);
  overview();
  $('.signature').focus();
});
window.addEventListener('hashchange', () => route());
window.addEventListener('popstate', () => route());
window.addEventListener('keydown', event => {
  const sidebar = $('#contents-sidebar');
  if (!sidebar.hidden) {
    if (event.key === 'Escape') { event.preventDefault(); setIndexOpen(false); }
    if (event.key === 'Tab') {
      const items = [$('#toggle-destinations'), ...sidebar.querySelectorAll('a,button')];
      const current = items.indexOf(document.activeElement);
      const step = event.shiftKey ? -1 : 1;
      event.preventDefault();
      items[(current + step + items.length) % items.length].focus();
    }
    return;
  }
  if (event.key === 'Escape' && $('#page').hidden) { overview(); $('.signature').focus(); }
});

try {
  const { createSolarScene } = await import('./scene.js');
  scene = createSolarScene($('#solar-canvas'), {
    suspended: entrance.active(),
    onSelect: id => id === 'sun' ? overview() : choosePlanet(id),
    onEnter: enter,
    onHoverMoon: identifyMoon,
    onOverview: () => overview(),
    onHover: id => { document.body.style.cursor = id ? 'pointer' : ''; },
    onFrame: renderFrame,
    onReady: result => { if (result?.webgl === false) enableFallback(); }
  });
} catch (error) {
  console.error('Solar scene unavailable', error);
  enableFallback();
}
setPaused(paused);
route({ initial: true });
entrance.ready();
