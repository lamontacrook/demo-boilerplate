import { getMetadata } from '../../scripts/aem.js';

export default function decorate(block) {
  const templates = getMetadata('template').split(',');
  templates.forEach((item) => block.classList.add(item.trim()));
  const slider = document.createElement('div');
  slider.classList.add('slider');
  let i = 1;

  [...block.children].forEach((row) => {
    row.setAttribute('id', `slide${i}`);
    row.classList.add('slide');
    slider.append(row);
    const a = document.createElement('a');
    a.setAttribute('href', `#slide${i}`);
    block.append(a);
    i += 1;
  });
  block.prepend(slider);
}
