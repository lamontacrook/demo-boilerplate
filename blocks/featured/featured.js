import { getMetadata } from '../../scripts/aem.js';

export default function decorate(block) {
  const templates = getMetadata('template').split(',');
  templates.forEach((item) => block.classList.add(item.trim()));
  if (block.querySelector('div > div > div:nth-child(1) > picture')) block.classList.add('right');
}
