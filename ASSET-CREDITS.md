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
