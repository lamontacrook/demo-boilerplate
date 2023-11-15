import { getMetadata } from '../../scripts/aem.js';

export default function decorate(block) {
  const h1 = block.querySelector('h1');
  const theme = getMetadata('theme');
  const picture = block.querySelector('picture');
  const h2 = block.querySelector('h2');
  const p = block.querySelectorAll('p');
  const heroContent = document.createElement('div');
  heroContent.classList.add('hero-content');
  if (h1) heroContent.append(h1);
  if (h2) heroContent.append(h2);
  p.forEach((elem) => {
    heroContent.append(elem);
  });

  block.querySelector('div').append(picture);
  block.querySelector('div').append(heroContent);
  block.querySelector('div').querySelector('div').remove();

  if (theme !== 'small-hero') {
    const blue = document.createElement('div');
    blue.classList.add('blue-box');
    block.append(blue);
  }
}
