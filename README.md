# Jack Gao — Work in orbit

An interactive solar-system portfolio, published at **https://jackgao1540.github.io/**. The eight planets and dwarf planet Pluto lead to pages for posts, pictures, Diep Genie, work, projects, favourites, and planetary facts. Unfilled collections are explicitly marked as future content.

## Edit the atlas

- **Destination names, planet facts, and page content:** edit `planets` and `pages` near the top of `app.js`. Give a planet a `slug` and matching `pages` entry to add its destination. Hash routes such as `#/diep-genie` work on static hosting and refresh safely.
- **Bodies, orbit placement, camera motion, and materials:** edit `PLANETS` and the scene functions in `scene.js`. The scene uses Three.js, with a 2D fallback when WebGL is unavailable. Sizes and distances are compressed for exploration.
- **Contents sidebar:** use the top-right Contents button on any page to open the destination list. It remains hidden until requested and supports keyboard navigation and native scrolling.
- **Layout, navigation, and fonts:** edit `index.html` and `style.css`. Fonts, Three.js, and visual assets are served locally.

## Explore

Click a body to approach it, then click its in-world plaque to open the topic. With a mouse or trackpad, scroll inward (negative vertical delta) over a body to approach it; scroll outward (positive delta) from a close-up to return to the overview. Scroll over empty space to adjust the general zoom. Click **Jack Gao** to return home and reset the view, including after free-space zoom. Scrolling inside Contents or an article scrolls its content normally.

## Preview

Serve this folder with any static HTTP server; opening `index.html` as a `file:` URL will not load ES modules correctly. For example, with Python installed:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000/`. No build step or package installation is required. GitHub Pages publishes the `main` branch at the repository root.

## Credits

See [ASSET-CREDITS.md](ASSET-CREDITS.md) for image provenance, source links, and rendering notes; [Three.js MIT license](assets/vendor/THREE-LICENSE.txt), [DM Mono OFL](assets/fonts/DMMono-OFL.txt), and [Instrument Serif OFL](assets/fonts/InstrumentSerif-OFL.txt) are included with their assets.
