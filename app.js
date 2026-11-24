import { MOONS } from './moons.js';
import { createEntrance } from './intro.js';
import { createEditorialPages } from './editorial-content.js';
import { workHistoryBody, workHistoryDeck } from './work-history.js';
// Only content bodies have a page destination; other bodies remain name-only selections.
const planets = [
 {id:'sun',name:'Sun',title:'About me',slug:'about-me',color:'#fcd882',symbol:'☉'},
 {id:'mercury',name:'Mercury',title:'Reads & resources',slug:'favourites',color:'#ada397',symbol:'☿'},
 {id:'venus',name:'Venus',color:'#dbb98d',symbol:'♀'},
 {id:'earth',name:'Earth',color:'#71a9b4',symbol:'⊕'},
 {id:'mars',name:'Mars',title:'Posts',slug:'posts',color:'#bc7358',symbol:'♂'},
 {id:'jupiter',name:'Jupiter',title:'Projects',slug:'projects',color:'#d7b69c',symbol:'♃'},
 {id:'saturn',name:'Saturn',title:'Work experience',slug:'work',color:'#d3bf8f',symbol:'♄'},
 {id:'uranus',name:'Uranus',color:'#98c8c9',symbol:'♅'},
 {id:'neptune',name:'Neptune',color:'#5381bc',symbol:'♆'},
 {id:'pluto',name:'Pluto',color:'#b6a28c',symbol:'♇'}
];
const byId=Object.fromEntries(planets.map(p=>[p.id,p]));
const contentsBodies=['sun','saturn','jupiter','mercury','mars'].map(id=>byId[id]);
const contentsRoutes=contentsBodies.map(body=>body.slug);
const $=s=>document.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = reduced;
let scene;
let selected = null;
let sceneUnavailable = false;
let readySelection = null;
const entrance = createEntrance({
  reduced,
  onEnter: () => { scene?.setSuspended?.(false); return scene?.playIntro(); },
  onComplete: () => { scene?.setSuspended?.(false); announce('Select a planet to explore.'); }
});
if(reduced) document.body.classList.add('reduced-motion');
const external=(url,label,cls='card-link')=>`<a class="${cls}" href="${url}" target="_blank" rel="noopener noreferrer">${label} <span aria-hidden="true">↗</span></a>`;
const card=(meta,title,copy,url,label='Explore project',extraLink='')=>`<article class="content-card"><span class="card-meta">${meta}</span><h2>${title}</h2><p>${copy}</p>${url?external(url,label):''}${extraLink}</article>`;
const orbitArt=`<div class="empty-art" aria-hidden="true"><svg viewBox="0 0 150 120"><ellipse cx="75" cy="60" rx="64" ry="24" transform="rotate(-25 75 60)"/><ellipse cx="75" cy="60" rx="45" ry="44"/><circle cx="75" cy="60" r="14"/><circle cx="129" cy="35" r="4" fill="currentColor"/><path d="M75 3v8m0 98v8M10 60H2m146 0h-8"/></svg></div>`;
const pages={
 'projects': {
   planet:'jupiter',
   title:'Projects',
   deck:'A few things I am building.',
   body:`<div class="page-grid">
     ${card('RESEARCH / WORLD MODELS','Diep-Genie','A small Genie-style video world-model research prototype for diep.io, with local validation and latent-action experiments.','https://github.com/jackgao1540/Diep-Genie','Read the repository',external('https://jackgao1540.github.io/Diep-Genie/', 'View data and reconstructions'))}
     ${card('PYTHON / MACHINE LEARNING','Genie in MiniGrid','A toy implementation of Google’s GENIE paper, exploring video tokenization and dynamics in MiniGrid.','https://github.com/jackgao1540/Google-GENIE-MiniGrid-Video-Tokenizer-and-Dynamics-Model')}
     ${card('C++ / INVERSE KINEMATICS','FABRIK · SFML','A segmented arm using FABRIK, with dynamic joint addition and removal.','https://github.com/jackgao1540/FABRIK_SFML')}
     ${card('C++ / EXPLORATION','Mandelbrot','A public C++ repository for exploring the Mandelbrot set.','https://github.com/jackgao1540/mandelbrot')}
     ${card('C++ / PROBLEM SOLVING','DMOJ solutions','Solutions to DMOJ problems over the years.','https://github.com/jackgao1540/dmoj-solutions')}
   </div>
   <p class="page-note">Diep-Genie is a research prototype. Implementation details and documented results are available in its public repository.</p>`
 },
};
Object.assign(pages,createEditorialPages({card,external,orbitArt}));
pages.work={planet:'saturn',title:'Work experience',deck:workHistoryDeck,body:workHistoryBody};
$('#destination-list').innerHTML = contentsBodies.map(planet => '<li><a class="contents-destination" href="#/' + planet.slug + '" style="--planet:' + planet.color + '"><span class="planet-dot ' + planet.id + '" aria-hidden="true"></span><span class="destination-copy"><span class="destination-name">' + planet.name + '</span><span class="planet-name">' + planet.title + '</span></span><span aria-hidden="true">↗</span></a></li>').join('');

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
  const plaque = !destination.hidden ? destination.getBoundingClientRect() : null;
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
  if (!$('#page').hidden || document.body.classList.contains('contents-open')) return;
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
  label.innerHTML = `<span class="popup-name">${planet.name}</span>${planet.slug ? `<a class="popup-link" aria-describedby="moon-summary" href="#/${planet.slug}">${planet.title} <span aria-hidden="true">↗</span></a>` : ''}`;
}

function showDestination(planet, projected) {
  const label = $('#spatial-label');
  if (!projected?.visible) { label.hidden = true; return; }
  if (readySelection !== planet.id) {
    renderDestination(planet);
    readySelection = planet.id;
  }
  label.hidden = false;
  label.className = 'spatial-label planet-popup';
  const gap=12,margin=12,top=innerWidth<=700?88:108,radius=Math.max(0,projected.radius||0);
  const sideRoom=Math.max(innerWidth-margin-projected.x-radius-gap,projected.x-radius-gap-margin);
  label.style.maxWidth=`${sideRoom>=84?Math.min(innerWidth<=700?160:220,sideRoom):innerWidth<=700?160:220}px`;
  const box=label.getBoundingClientRect();
  const candidates=[
    {x:projected.x+radius+gap,y:projected.y-box.height/2},
    {x:projected.x-radius-gap-box.width,y:projected.y-box.height/2},
    {x:projected.x-box.width/2,y:projected.y+radius+gap},
    {x:projected.x-box.width/2,y:projected.y-radius-gap-box.height}
  ];
  const fits=p=>p.x>=margin&&p.x+box.width<=innerWidth-margin&&p.y>=top&&p.y+box.height<=innerHeight-margin;
  // Prefer an empty side, then above/below the disk. Only an all-surface view needs an inset edge.
  const anchor=candidates.find(fits)||{x:innerWidth-box.width-margin,y:projected.y-box.height/2};
  label.style.left=`${Math.round(Math.max(margin,Math.min(innerWidth-box.width-margin,anchor.x)))}px`;
  label.style.top=`${Math.round(Math.max(top,Math.min(innerHeight-box.height-margin,anchor.y)))}px`;

}

function showStaticDestination(planet) {
  showDestination(planet, {x:innerWidth/2,y:innerHeight/2,radius:0,visible:true});
  $('#spatial-label').classList.add('renderer-unavailable');
}

function choosePlanet(id, writeRoute = true) {
  const planet = byId[id];
  if (!planet) return;
  hideMoonName();
  selected = id;
  const names = MOONS.filter(moon => moon.parent === id).map(moon => moon.name);
  moonSummary.textContent = planet.slug && names.length ? 'Moons in this view: ' + names.join(', ') + '.' : '';
  readySelection = null;
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
  announce(`${planet.name} selected.${planet.slug ? ' ' + planet.title + ' is available in its popup.' : ''}`);
  if (sceneUnavailable) showStaticDestination(planet);
}

function overview(writeRoute = true, preserveIntro = false) {
  selected = null;
  hideMoonName();
  moonSummary.textContent = '';
  readySelection = null;
  document.body.classList.remove('focused');
  hideDestination();
  document.querySelectorAll('[data-planet]').forEach(button => button.setAttribute('aria-pressed', 'false'));
  if (!preserveIntro) scene?.overview();
  if (writeRoute && location.hash !== '#/') history.pushState(null, '', '#/');
}

function renderFrame(frame) {
  moonFrame = frame;
  positionMoonName();
  if (!selected || !$('#page').hidden) return;
  if (frame.focus !== selected || frame.intro) { $('#spatial-label').hidden = true; return; }
  const projected = frame.labels?.find(label => label.id === selected);
  if (!projected?.visible) {
    $('#spatial-label').hidden = true;
    return;
  }
  showDestination(byId[selected], projected);
}

function renderPage(path, page) {
  hideMoonName();
  const planet = byId[page.planet];
  const next = contentsRoutes[(contentsRoutes.indexOf(path) + 1) % contentsRoutes.length];
  $('#atlas').hidden = true;
  $('#page').hidden = false;
  document.body.classList.add('is-page');
  $('#page').innerHTML = `
    <a class="back-link" href="#/planet/${planet.id}">← <span>BACK TO ${planet.name.toUpperCase()}</span></a>
    <header class="page-heading"><div>
      <h1>${page.title}</h1>
    </div><span class="page-symbol" aria-hidden="true">${planet.symbol}</span></header>
    ${page.deck ? `<p class="page-deck">${page.deck}</p>` : ''}${page.body}
    <nav class="page-footer" aria-label="Page navigation">
      <a href="#/">← Solar system</a><a href="#/${next}">Next: ${pages[next].title} ↗</a>
    </nav>`;
  scene?.setPaused(true);
  scene?.setSuspended?.(true);
  window.scrollTo(0, 0);
  $('#page').focus({ preventScroll: true });
}

function route({ initial = false } = {}) {
  let path;
  try { path = decodeURIComponent(location.hash.replace(/^#\/?/, '')); }
  catch { path = ''; }
  // Preserve old links while keeping all editorial content on its canonical body.
  const legacyRoutes = { 'diep-genie': 'projects', pictures: 'about-me' };
  const oldFacts = path.match(/^about\/(\w+)$/);
  const canonical = legacyRoutes[path] || (oldFacts && byId[oldFacts[1]] ? 'planet/' + oldFacts[1] : null);
  if (canonical) {
    path = canonical;
    history.replaceState(null, '', '#/' + path);
  }
  if (pages[path]) {
    renderPage(path, pages[path]);
    return;
  }
  $('#atlas').hidden = false;
  $('#page').hidden = true;
  document.body.classList.remove('is-page');
  scene?.setPaused(paused);
  scene?.setSuspended?.(entrance.active());
  const match = path.match(/^planet\/(\w+)$/);
  if (match && byId[match[1]]) choosePlanet(match[1], false);
  else overview(false, initial);
}

function enableFallback(unavailable = false) {
  if (!unavailable || sceneUnavailable) return;
  sceneUnavailable = true;
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
      const items = [$('#toggle-destinations'), $('#sound-toggle'), ...sidebar.querySelectorAll('a,button')].filter(Boolean);
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
    onSelect: choosePlanet,
    onHoverMoon: identifyMoon,
    onOverview: () => overview(),
    onHover: id => { document.body.style.cursor = id ? 'pointer' : ''; },
    onFrame: renderFrame,
    onReady: result => { if (result?.webgl === false) enableFallback(result.available === false); }
  });
} catch (error) {
  console.error('Solar scene unavailable', error);
  enableFallback(true);
}
setPaused(paused);
route({ initial: true });
entrance.ready();

window.addEventListener('resize', () => { if (sceneUnavailable && selected && $('#page').hidden) showStaticDestination(byId[selected]); });
