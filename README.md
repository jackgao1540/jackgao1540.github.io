# Jack Gao — A collection in orbit

An interactive solar-system portfolio, published at **https://jackgao1540.github.io/**. Contents highlights **Sun / About me**, **Saturn / Work experience**, **Jupiter / Projects**, **Mercury / Reads & resources**, and **Mars / Posts**, in that order. These five bodies hold all page content. Other bodies remain selectable in the scene with name-only cues, without facts or destination links.

## Edit the atlas

- **Destination names and routes:** edit `planets` and `pages` in `app.js`. `contentsBodies` controls the five-item directory and next-page sequence. Sun, Mercury and Mars page content lives in `editorial-content.js`; Saturn's resume-style employment history lives in `work-history.js`. Existing `#/posts`, `#/work` and `#/favourites` links retain their URLs, while Sun uses `#/about-me`. Legacy `#/diep-genie` and `#/pictures` links redirect to Projects and About me; old `#/about/<body>` facts links become scene selections. Hash routes work on static hosting and refresh safely.
- **Sun photographs:** `sun-gallery.js` defines the nine supplied photos, their order, alt text and responsive variants in `assets/gallery/`. The About me gallery preserves the full image frames and opens full-resolution copies.
- **Moon catalogue:** edit `moons.js` for selected satellite measurements and source links; `moon-renderer.js` controls their display layout, materials, frame transforms and clock. The atlas keeps a representative major-moon roster in the shared world, not every known satellite. See the moon section in `ASSET-CREDITS.md` for reference planes, presentation scales, and date limitations.
- **Bodies, orbit placement, camera motion, and materials:** edit `PLANETS` and the scene functions in `scene.js`. The scene uses Three.js, with a 2D fallback when WebGL is unavailable. Sizes and distances are compressed for exploration.
- **Contents sidebar:** use the top-right Contents button on any page to open the destination list. It remains hidden until requested and supports keyboard navigation and native scrolling.
- **Layout, navigation, and fonts:** edit `index.html` and `style.css`. Fonts, Three.js, and visual assets are served locally.

## Explore

The home page opens in a dark introduction: “Jack Gao” and “A collection of myself displayed in orbit.” type into view. Scroll down, swipe upward, press a down-navigation key, or activate the chevron to unfold the light animation and pull back from the Sun into the atlas. Reduced-motion visitors see the complete introduction and enter the overview without the burst or camera movement. Direct links to planets and articles bypass the introduction. `intro.js` controls this entrance; the Sun-to-overview camera path lives in `scene.js`.

Click a body or scroll inward over it to approach continuously in the shared solar system. Its small popup names the planet. Content bodies also link to their associated page; only activating that link opens the topic. Drag with a mouse, pen, or one finger to orbit; two fingers pinch around a planet to approach and keep zooming. A single wheel or pinch stream continues into near-surface optical magnification without a separate isolated scene. Scroll outward to back away smoothly into the overview. The other planets and the selected major moons remain in the world, with ordinary occlusion and viewport visibility. Hover or tap a moon for a short name cue. Click **Jack Gao** to reset the overview. Contents and articles scroll normally, and the browser tab title stays **jackgao1540** on every route.

With a fine primary pointer (including a narrow desktop window or touch laptop), outward zoom automatically clears the selection once the globe’s projected width falls below 10% of the viewport width. On touch-first mobile devices in portrait, outward zoom or pinch clears it once the globe’s projected height falls below 15% of the visible scene height. Landscape uses the same 10% projected-width rule as desktop. Rotating the device alone does not clear a selection. Rings do not count toward either measurement. The camera keeps its current aim and remaining zoom instead of swinging back to the Sun; simply selecting or zooming inward never triggers this rule.

The supplied FTL theme requests looping playback at page load and continues across in-page routes. If the browser blocks audible autoplay, playback retries after interaction or through the **Sound** button. Turning sound off is remembered across navigation and reloads.

The galaxy sky, solar system, and opening light burst render on a small pixel grid and scale with nearest-neighbor sampling. All text uses locally hosted pixel fonts while remaining selectable HTML: Pixelify Sans for lettering and Orbit Pixel Symbols for the planetary and navigation glyphs. `pixel-renderer.js` controls the grid, stepped sky colors and texture-edge blending; `controls.js` shares captured-pointer drag and pinch behavior between WebGL and the 2D fallback. Near-surface camera limits scale with each planet’s radius, and its moving center is tracked directly to keep the camera outside the surface.

## Preview

Serve this folder with any static HTTP server; opening `index.html` as a `file:` URL will not load ES modules correctly. For example, with Python installed:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000/`. No build step or package installation is required. GitHub Pages publishes the `main` branch at the repository root.

## Credits

See [ASSET-CREDITS.md](ASSET-CREDITS.md) for image provenance, source links, and rendering notes; [Three.js MIT license](assets/vendor/THREE-LICENSE.txt), [DM Mono OFL](assets/fonts/DMMono-OFL.txt), and [Instrument Serif OFL](assets/fonts/InstrumentSerif-OFL.txt) are included with their assets.
