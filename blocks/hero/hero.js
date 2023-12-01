import { getMetadata } from '../../scripts/aem.js';

export default function decorate(block) {
  const h1 = block.querySelector('h1');
  const picture = block.querySelector('picture');
  const h2 = block.querySelector('h2');
  const p = block.querySelectorAll('p');
  const heroContent = document.createElement('div');
  heroContent.classList.add('hero-content');
  if (h1) heroContent.append(h1);
  if (h2) heroContent.append(h2);
  p.forEach((elem) => {
    if (elem.textContent.trim() !== '') heroContent.append(elem);
  });

  block.querySelector('div').append(picture, heroContent);
  const templates = getMetadata('template').split(',').map((item) => item.trim());
  if (templates.includes('gradient')) {
    const gradient = document.createElement('div');
    block.querySelector('div').append(gradient);
    templates.forEach((cls) => gradient.classList.add(cls));
  }
  block.querySelector('div').querySelector('div').remove();
}
