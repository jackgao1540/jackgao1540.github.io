# Jack Gao — A personal orbit

An interactive solar-system portfolio, published at **https://jackgao1540.github.io/**. The planets lead to pages for posts, pictures, Diep Genie, work, projects, and favourites. Unfilled collections are explicitly marked as future content.

## Edit the atlas

- **Destination names, planet facts, and page content:** edit `planets` and `pages` near the top of `app.js`. Give a planet a `slug` and matching `pages` entry to add its destination. Hash routes such as `#/diep-genie` work on static hosting and refresh safely.
- **Bodies, orbit placement, camera motion, and materials:** edit `PLANETS` and the scene functions in `scene.js`. The scene uses Three.js, with a 2D fallback when WebGL is unavailable. Sizes and distances are compressed for exploration.
- **Layout, mobile navigation, and fonts:** edit `index.html` and `style.css`. Fonts, Three.js, and visual assets are served locally.

## Preview

Serve this folder with any static HTTP server; opening `index.html` as a `file:` URL will not load ES modules correctly. For example, with Python installed:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000/`. No build step or package installation is required. GitHub Pages publishes the `main` branch at the repository root.

## Credits

See [ASSET-CREDITS.md](ASSET-CREDITS.md) for image provenance, source links, and rendering notes; [Three.js MIT license](assets/vendor/THREE-LICENSE.txt), [DM Mono OFL](assets/fonts/DMMono-OFL.txt), and [Instrument Serif OFL](assets/fonts/InstrumentSerif-OFL.txt) are included with their assets.
