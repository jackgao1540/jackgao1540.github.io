import { renderSunGallery } from './sun-gallery.js';

// Social handles are supplied by the user; LinkedIn is also verified by the
// supplied resume hyperlink and GitHub by the authenticated connected account.
// The gallery contains the user's supplied photos; biography remains deferred.
export const EDITORIAL_SOURCES = Object.freeze({
  github: 'https://github.com/jackgao1540',
  linkedin: 'https://www.linkedin.com/in/jackgao1540',
  twitter: 'https://x.com/jackgao1540',
  instagram: 'https://www.instagram.com/jackgao1540/',
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
      deck: 'Jack Gao',
      body: `<nav class="social-links" aria-label="Social profiles">
        ${external(source.linkedin, 'LinkedIn')}
        ${external(source.twitter, 'X / Twitter')}
        ${external(source.instagram, 'Instagram')}
        ${external(source.github, 'GitHub')}
      </nav>${renderSunGallery()}`
    },
    'favourites': {
      planet: 'mercury',
      title: 'Reads & resources',
      deck: 'Papers behind the projects, useful tools, and references worth keeping.',
      body: `<div class="page-grid">
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
