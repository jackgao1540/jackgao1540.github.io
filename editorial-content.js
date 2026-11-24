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
  againstAllLikelihood: 'https://arxiv.org/html/2611.09385v1',
  genieProject: 'https://github.com/jackgao1540/Diep-Genie',
  geniePaper: 'https://arxiv.org/abs/2402.15391',
  minigridProject: 'https://github.com/jackgao1540/Google-GENIE-MiniGrid-Video-Tokenizer-and-Dynamics-Model',
  minigrid: 'https://minigrid.farama.org/',
  mlx: 'https://github.com/ml-explore/mlx',
  stars: 'https://github.com/jackgao1540?tab=stars',
  planets: 'https://science.nasa.gov/solar-system/planets/'
});

export function createEditorialPages({ card, external, orbitArt }) {
  const source = EDITORIAL_SOURCES;
  return {
    'about-me': {
      planet: 'sun',
      title: 'About me',
      body: `<div class="about-bio">
        <p class="page-prose">I'm Jack. Currently wrapping up my final year of my BSc at UBC. I love to learn things about the world; but not as much as I'm excited to build things yet to come. Right now, I'm learning about machine learning research (world models, spiking NNs, RL), ancient civilizations and cultures (Aztecs, Teotihuacán's), trying to get one in a krillion, among other things.</p>
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
      </div>
      <p class="page-eyebrow">PROJECT REFERENCES</p>
      <div class="page-grid">
        ${card('PAPER / WORLD MODELS', 'Genie: Generative Interactive Environments', 'Learning action-controllable worlds from video. This is the paper linked from my Diep-Genie prototype.', source.geniePaper, 'Read the paper')}
        ${card('REFERENCE / GRIDWORLDS', 'MiniGrid', 'The gridworld environments used in my earlier Genie-style data collection prototype. The documentation covers environments, wrappers and examples.', source.minigrid, 'Open the documentation')}
        ${card('BOOKMARK / MACHINE LEARNING', 'MLX', 'An array framework for Apple silicon, kept in my public GitHub stars.', source.mlx, 'Explore MLX')}
        ${card('REFERENCE / THIS ATLAS', 'Explore the solar system', 'NASA’s guide to the planets is one of the reference sources for this solar system.', source.planets, 'Visit NASA')}
      </div>
      <p class="page-note">For the experiments these references connect to, see ${external(source.genieProject, 'Diep-Genie', '')} and ${external(source.minigridProject, 'the MiniGrid prototype', '')}.</p>`
    },
    'posts': {
      planet: 'mars',
      title: 'Posts',
      deck: 'A notebook for projects and ideas.',
      body: `${orbitArt}<p class="page-prose">No posts have been published here yet.</p>`
    }
  };
}
