import { getMetadata } from '../../scripts/aem.js';

export default function decorate(block) {
  const templates = getMetadata('template').split(',');
  templates.forEach((item) => block.classList.add(item.trim()));
}
