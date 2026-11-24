// User-supplied photographs, kept in their supplied sequence and full framing.
// Full-resolution files and responsive variants retain color profiles only;
// camera, location and other ancillary metadata are not carried into the site.
export const SUN_PHOTOS = Object.freeze([
  {
    "src": "./assets/gallery/sun-01.webp",
    "width": 1206,
    "height": 666,
    "alt": "A person beneath branching lightning above a dark treeline.",
    "variants": [
      {
        "src": "./assets/gallery/sun-01-480.webp",
        "width": 480
      },
      {
        "src": "./assets/gallery/sun-01-960.webp",
        "width": 960
      },
      {
        "src": "./assets/gallery/sun-01.webp",
        "width": 1206
      }
    ],
    "span": 12
  },
  {
    "src": "./assets/gallery/sun-02.webp",
    "width": 960,
    "height": 1280,
    "alt": "Two people standing in front of a columned building surrounded by trees.",
    "variants": [
      {
        "src": "./assets/gallery/sun-02-480.webp",
        "width": 480
      },
      {
        "src": "./assets/gallery/sun-02.webp",
        "width": 960
      }
    ],
    "span": 5
  },
  {
    "src": "./assets/gallery/sun-03.webp",
    "width": 1280,
    "height": 853,
    "alt": "A group of people with decorative headbands and a purple jacket beside a window at night.",
    "variants": [
      {
        "src": "./assets/gallery/sun-03-480.webp",
        "width": 480
      },
      {
        "src": "./assets/gallery/sun-03-960.webp",
        "width": 960
      },
      {
        "src": "./assets/gallery/sun-03.webp",
        "width": 1280
      }
    ],
    "span": 7
  },
  {
    "src": "./assets/gallery/sun-04.webp",
    "width": 960,
    "height": 1280,
    "alt": "Two people outdoors beside wooden buildings and overhead wires at dusk.",
    "variants": [
      {
        "src": "./assets/gallery/sun-04-480.webp",
        "width": 480
      },
      {
        "src": "./assets/gallery/sun-04.webp",
        "width": 960
      }
    ],
    "span": 6
  },
  {
    "src": "./assets/gallery/sun-05.webp",
    "width": 2880,
    "height": 3840,
    "alt": "A person in a dark patterned shirt with illuminated high-rise buildings behind them at night.",
    "variants": [
      {
        "src": "./assets/gallery/sun-05-480.webp",
        "width": 480
      },
      {
        "src": "./assets/gallery/sun-05-960.webp",
        "width": 960
      },
      {
        "src": "./assets/gallery/sun-05.webp",
        "width": 2880
      }
    ],
    "span": 6
  },
  {
    "src": "./assets/gallery/sun-06.webp",
    "width": 2880,
    "height": 3840,
    "alt": "A person in a jacket overlooking a blue lake and snow-covered mountains.",
    "variants": [
      {
        "src": "./assets/gallery/sun-06-480.webp",
        "width": 480
      },
      {
        "src": "./assets/gallery/sun-06-960.webp",
        "width": 960
      },
      {
        "src": "./assets/gallery/sun-06.webp",
        "width": 2880
      }
    ],
    "span": 6
  },
  {
    "src": "./assets/gallery/sun-07.webp",
    "width": 960,
    "height": 1280,
    "alt": "A person wearing a long scarf on a street lined with wooden buildings and other pedestrians.",
    "variants": [
      {
        "src": "./assets/gallery/sun-07-480.webp",
        "width": 480
      },
      {
        "src": "./assets/gallery/sun-07.webp",
        "width": 960
      }
    ],
    "span": 6
  },
  {
    "src": "./assets/gallery/sun-08.webp",
    "width": 2880,
    "height": 3840,
    "alt": "Three people with bottles in a room with a window and a strand of lights.",
    "variants": [
      {
        "src": "./assets/gallery/sun-08-480.webp",
        "width": 480
      },
      {
        "src": "./assets/gallery/sun-08-960.webp",
        "width": 960
      },
      {
        "src": "./assets/gallery/sun-08.webp",
        "width": 2880
      }
    ],
    "span": 6
  },
  {
    "src": "./assets/gallery/sun-09.webp",
    "width": 2880,
    "height": 3840,
    "alt": "A person in a reddish sweater in front of an illuminated tower at night.",
    "variants": [
      {
        "src": "./assets/gallery/sun-09-480.webp",
        "width": 480
      },
      {
        "src": "./assets/gallery/sun-09-960.webp",
        "width": 960
      },
      {
        "src": "./assets/gallery/sun-09.webp",
        "width": 2880
      }
    ],
    "span": 6
  }
]);

export function renderSunGallery() {
  return '<section class="sun-gallery" aria-label="Photo gallery">' + SUN_PHOTOS.map((photo, index) => {
    const preferred = photo.variants.find(v => v.width === 960) || photo.variants.at(-1);
    const desktopWidth = photo.span === 12 ? 980 : (1004 * photo.span / 12 - 24);
    const sizes = photo.span === 12
      ? '(max-width: 700px) 88vw, (max-width: 1060px) calc(100vw - 80px), 980px'
      : '(max-width: 700px) 88vw, (max-width: 1060px) calc((100vw - 56px) * ' + photo.span + ' / 12 - 24px), ' + Math.ceil(desktopWidth) + 'px';
    return '<a class="sun-gallery__photo sun-gallery__photo--' + photo.span + '" href="' + photo.src + '" target="_blank" rel="noopener noreferrer" aria-label="Open full-size photograph in a new tab: ' + photo.alt + '">' +
      '<img class="sun-gallery__image" src="' + preferred.src + '" srcset="' + photo.variants.map(v => v.src + ' ' + v.width + 'w').join(', ') + '" sizes="' + sizes + '" width="' + photo.width + '" height="' + photo.height + '" alt="' + photo.alt + '" loading="' + (index === 0 ? 'eager' : 'lazy') + '" decoding="async"' + (index === 0 ? ' fetchpriority="high"' : '') + '></a>';
  }).join('') + '</section>';
}
