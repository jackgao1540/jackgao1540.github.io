import { renderSunGallery } from './sun-gallery.js';

// Social handles are supplied by the user; LinkedIn is also verified by the
// supplied resume hyperlink and GitHub by the authenticated connected account.
// The biography and gallery contain the user's supplied text and photos.
export const EDITORIAL_SOURCES = Object.freeze({
  github: 'https://github.com/jackgao1540',
  linkedin: 'https://www.linkedin.com/in/jackgao1540',
  twitter: 'https://x.com/jackgao1540',
  instagram: 'https://www.instagram.com/jackgao1540/',
  howToChangeYourMind: 'https://www.google.com/search?kgmid=%2Fg%2F11f190d9vd&amp;q=how+to+change+your+mind+michael+pollan+how+to+change+your+mind%3A+what+the+new+science+of+psychedelics+teaches+us+about+consciousness%2C+dying%2C+addiction%2C+depression%2C+and+transcendence',
  michaelPollan: 'https://michaelpollan.com/books/how-to-change-your-mind/',
  crimeAndPunishment: 'https://standardebooks.org/ebooks/fyodor-dostoevsky/crime-and-punishment/constance-garnett',
  againstAllLikelihood: 'https://arxiv.org/html/2611.09385v1'
});

export function createEditorialPages({ card, external, orbitArt }) {
  const source = EDITORIAL_SOURCES;
  return {
    'about-me': {
      planet: 'sun',
      title: 'About me',
      body: `<div class="about-bio">
        <p class="page-prose">I'm Jack. Currently wrapping up my final year of my BSc at UBC. I love to learn things about the world; but not as much as I'm excited to build things yet to come. Right now, I'm learning about world models, spiking nns, rl, ancient civilizations and cultures (Aztecs, Teotihuacán's). Current things I am attempting: creating a world model based on <a href="https://diep.io/" target="_blank" rel="noopener noreferrer">diep.io</a>, designing a jacket, and building a pet robot.</p>
        <p class="page-prose">I'm always open to a new conversation, feel free to connect with me!</p>
      </div><nav class="social-links" aria-label="Social profiles">
        ${external(source.linkedin, 'LinkedIn')}
        ${external(source.twitter, 'X / Twitter')}
        ${external(source.instagram, 'Instagram')}
        ${external(source.github, 'GitHub')}
      </nav>${renderSunGallery()}`
    },
    'favourites': {
      planet: 'mercury',
      title: 'Reads & resources',
      body: `<p class="page-eyebrow">CURRENTLY READING</p>
      <div class="page-grid">
        <article class="content-card"><h2>${external(source.howToChangeYourMind, 'How to Change Your Mind:', '')}</h2><p>What the New Science of Psychedelics Teaches Us About Consciousness, Dying, Addiction, Depression, and Transcendence</p><p>${external(source.michaelPollan, 'Michael Pollan', '')} · 2018</p></article>
        ${card('BOOK', 'Crime and Punishment', 'Fyodor Dostoevsky', source.crimeAndPunishment, 'Read the book')}
      </div>
      <p class="page-eyebrow">LIKED MEDIA</p>
      <div class="page-grid">
        ${card('PAPER', 'Against All Likelihood', 'David Lopez-Paz', source.againstAllLikelihood, 'Read the paper · v1')}
      </div>`
    },
    'posts': {
      planet: 'mars',
      title: 'Posts',
      deck: 'A notebook for projects and ideas.',
      body: `${orbitArt}<p class="page-prose">No posts have been published here yet.</p>`
    }
  };
}
