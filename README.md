# Jack Gao — A collection in orbit

An interactive solar-system portfolio, published at **https://jackgao1540.github.io/**. The eight planets and dwarf planet Pluto lead to pages for posts, pictures, Diep Genie, work, projects, favourites, and planetary facts. Unfilled collections are explicitly marked as future content.

## Edit the atlas

- **Destination names, planet facts, and page content:** edit `planets` and `pages` near the top of `app.js`. Give a planet a `slug` and matching `pages` entry to add its destination. Hash routes such as `#/diep-genie` work on static hosting and refresh safely.
- **Moon catalogue:** edit `moons.js` for selected satellite measurements and source links; `moon-renderer.js` controls their display layout, materials, frame transforms and clock. Close-ups show a representative major-moon roster, not every known satellite. See the moon section in `ASSET-CREDITS.md` for reference planes, presentation scales, and date limitations.
- **Bodies, orbit placement, camera motion, and materials:** edit `PLANETS` and the scene functions in `scene.js`. The scene uses Three.js, with a 2D fallback when WebGL is unavailable. Sizes and distances are compressed for exploration.
- **Contents sidebar:** use the top-right Contents button on any page to open the destination list. It remains hidden until requested and supports keyboard navigation and native scrolling.
- **Layout, navigation, and fonts:** edit `index.html` and `style.css`. Fonts, Three.js, and visual assets are served locally.

## Explore

The home page opens in a dark introduction: “Jack Gao” and “A collection of myself displayed in orbit.” type into view. Scroll down, swipe upward, press a down-navigation key, or activate the chevron to unfold the light animation and pull back from the Sun into the atlas. Reduced-motion visitors see the complete introduction and enter the overview without the burst or camera movement. Direct links to planets and articles bypass the introduction. `intro.js` controls this entrance; the Sun-to-overview camera path lives in `scene.js`.

Click a body to approach it, then activate its destination plaque to open the topic. Drag with a mouse, pen, or one finger to orbit the overview or a focused planet; two fingers pinch to zoom. Hover or tap a moon for a short name cue; the selected view also supplies a screen-reader moon list. With a mouse or trackpad, scroll inward over a body to approach it, then keep scrolling inward for a near-surface view. Scroll outward to zoom back to the full planetary system; a new outward gesture from that framing returns to the overview. Scroll over empty space to adjust general zoom. Click **Jack Gao** to return home and reset the view. Scrolling inside Contents or an article scrolls its content normally.

The sky, solar system, and opening light burst render on a small pixel grid and scale with nearest-neighbor sampling. Text and controls retain native resolution. `pixel-renderer.js` controls the grid and sky; `controls.js` shares captured-pointer drag and pinch behavior between WebGL and the 2D fallback. Near-surface camera limits scale with each planet’s radius, and its moving center is tracked directly to keep the camera outside the surface.

## Preview

Serve this folder with any static HTTP server; opening `index.html` as a `file:` URL will not load ES modules correctly. For example, with Python installed:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000/`. No build step or package installation is required. GitHub Pages publishes the `main` branch at the repository root.

## Credits

See [ASSET-CREDITS.md](ASSET-CREDITS.md) for image provenance, source links, and rendering notes; [Three.js MIT license](assets/vendor/THREE-LICENSE.txt), [DM Mono OFL](assets/fonts/DMMono-OFL.txt), and [Instrument Serif OFL](assets/fonts/InstrumentSerif-OFL.txt) are included with their assets.
