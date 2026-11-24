# Portfolio visual assets

## Earth

`assets/space/earth-nasa.webp` is a 2048 × 1024 WebP conversion of the equirectangular Blue Marble Earth texture distributed in the MIT-licensed three-globe repository:
https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-blue-marble.jpg
Repository license: https://github.com/vasturiano/three-globe/blob/master/LICENSE

NASA Blue Marble imagery credit: NASA Goddard Space Flight Center / Reto Stöckli (land surface, shallow water); Robert Simmon (ocean color and compositing). NASA describes the source mosaic and credits at:
https://science.nasa.gov/resource/blue-marble/
https://science.nasa.gov/earth/earth-observatory/the-blue-marble-2181/
NASA media usage terms: https://www.nasa.gov/nasa-brand-center/images-and-media/
The illustration makes no claim of NASA endorsement. The texture is a static composite, not live imagery. It is mapped with standard equirectangular UVs to Three.js SphereGeometry; the 2:1 map was visually checked for upright continents and icecaps.

## Rendering library

Three.js 0.169.0, vendored locally from the npm package's build/three.module.min.js. Copyright 2010–2024 Three.js authors; MIT license preserved at `assets/vendor/THREE-LICENSE.txt`. No runtime CDN dependency.
Source: https://github.com/mrdoob/three.js/tree/r169

## Deep-field sky

`assets/space/sky.webp`, generated expressly for this portfolio with the built-in OpenAI ImageGen tool on 2026-11-23; optimized to WebP from the original 1914 × 822 PNG (original retained in Codex generated_images). This is an artistic background, not an astronomical survey photograph.

Prompt: “Use case: photorealistic-natural. Asset type: ultrawide 21:9 background sky for an interactive solar-system portfolio; planetary meshes rendered separately. A cinematic understated astrophotography deep field: true midnight-indigo negative space, one diagonal irregular Milky Way dust lane crossing lower left toward upper right, intricate faint warm starlight and wisps of muted teal interstellar clouds, one tiny distant inclined spiral galaxy at far upper right, pin-sharp natural stars, editorial cinematic depth. The central 60% is calm and dark, so small foreground planets and fine orbit arcs will remain legible. Fine natural film-like texture, believable remote cosmic depth, restrained contrast and saturation, premium editorial. NO planets, NO rings, NO foreground objects, NO Sun, NO orbit lines, NO text, NO watermarks, NO telescope diffraction flares. Keep upper left especially dark and quiet for typography.”

## Authored materials and scale

Other planet maps, cloud layers, stellar corona, ring opacity bands and destination billboards are procedural original canvas textures. Jupiter's bands/storm, Mercury's craters, Mars' dusty surface and polar ice, and the gas giants' palettes are artistic approximations. Saturn's rings include a visible Cassini-like gap; ring thickness is exaggerated. Sizes, orbital distances and time are compressed for visual exploration. Period ratios and planet order are preserved; the display is not an ephemeris or physically scaled simulation. Sunlit sphere materials and atmospheric rims are real-time WebGL; glow is a billboard effect rather than physical stellar radiative transfer. The asteroid belt lies between Mars and Jupiter. Planet positions at startup are intentionally composed rather than date accurate.

Orbits use approximate real eccentricities and inclinations with Kepler-equation motion on matching elliptical paths. Only semimajor distances/body sizes are visually compressed; orientation and phase are composed. The sparse Cassiopeia W trace is illustrative, camera-anchored rather than a date/location sky chart. Individual stars twinkle with separate phases; pause, reduced motion and offscreen visibility suspend their clock.

Revision: Pluto is explicitly a dwarf planet, with approximate eccentricity 0.2488, inclination 17.16 degrees and 248-year period. Its pale mottled map and heart-like Tombaugh Regio patch are original illustrative procedural material. Orbital and axial angular motion run at 2x the prior presentation speed; camera timing, gestures and stellar twinkle are unchanged. Pluto retains exaggerated size and compressed semimajor distance for visibility.

Pluto is shown separately as a dwarf planet beyond Neptune, with an illustrative procedurally drawn Tombaugh-Regio-like surface. The atlas includes eight planets and one dwarf planet; it does not present Pluto as a ninth planet.

## Selected moons

Close-ups include 22 selected satellites: Earth's Moon; Mars' Phobos and Deimos; Jupiter's Io, Europa, Ganymede and Callisto; Saturn's Mimas, Enceladus, Tethys, Dione, Rhea, Titan and Iapetus; Uranus' Miranda, Ariel, Umbriel, Titania and Oberon; Neptune's Proteus and Triton; and Pluto's Charon. Mercury and Venus have none. Other satellites are intentionally omitted.

`moons.js` records kilometres, days, eccentricities and inclinations from [JPL satellite mean elements](https://ssd.jpl.nasa.gov/sats/elem/) and [satellite physical parameters](https://ssd.jpl.nasa.gov/sats/phys_par/), with [host mean radii](https://ssd.jpl.nasa.gov/planets/phys_par.html). The four Galilean periods adopt sidereal values from [NASA's Jovian satellite factsheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/joviansatfact.html). The source mean-element epoch is 2000-01-01.5 TDB; it is provenance only and does not define the animation's date.

The Moon uses an ecliptic reference plane. Other systems use approximate host-equator or satellite Laplace planes as recorded per entry. Iapetus retains its separate local plane tilt. The renderer's host-axis orientation, orbital nodes and initial phases are illustrative. Full inclinations encode orbital sense: Triton is retrograde; host obliquity is applied once for Uranus and Pluto. Charon's distance is the Pluto–Charon separation; Pluto's barycentric wobble is omitted.

JPL mean elements describe approximate orbital geometry and are not an ephemeris. This display does not reproduce a real date, current moon positions, orbital precession, perturbations, resonant phase relationships, mutual eclipses or occultation predictions. Procedural moon surfaces and colours are artistic materials rather than spacecraft texture maps.

Moon presentation uses a separate common clock of **one simulated day per eight seconds of its running animation clock**; long frame steps are capped for stability, so a slow device may run more slowly than wall time. This clock is independent of the compressed planetary year clock. Every moon retains its catalogue period under that shared rate, with no per-moon speed clamp. Thus Phobos completes a circuit in about 2.55 running seconds, the Moon in 218.58 seconds, and Iapetus in 634.65 seconds. Pause, reduced-motion preference and inactive rendering suspend the common clock.

Satellite separations are compressed within composed near/far display bounds. For systems with more than two moons, each intermediate distance blends 75% normalized logarithmic physical semimajor-axis spacing with 25% normalized orbital rank, retaining a readable gap and physical order. One- and two-moon systems use fixed composed bounds. They do not preserve true distance ratios or the physical relation between distance and period. Small bodies are enlarged with nonlinear size scaling and readability floors; Mars' two moons are especially exaggerated. Earth's Moon and Charon retain approximate host-relative radius ratios (0.273 and 0.52). Camera distance fits the selected satellite system, and moons are hidden in the overview. The displayed ellipse retains each entry's eccentricity; approximate reference-plane transformations preserve orbital sense. The base prograde angular momentum follows the rendered host's positive axial-spin convention; Triton's large inclination supplies its reversal once.

## Pixel typography

Pixelify Sans variable font (weights 400–700), Copyright 2021 The Pixelify Sans Project Authors, bundled unmodified from the Google Fonts repository: https://github.com/google/fonts/tree/main/ofl/pixelifysans . Licensed under the SIL Open Font License 1.1; full license at `assets/fonts/PixelifySans-OFL.txt`. All typography uses this locally hosted font without a runtime CDN dependency.
