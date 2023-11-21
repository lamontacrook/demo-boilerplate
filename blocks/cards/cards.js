import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';

export default function decorate(block) {
  const templates = getMetadata('template').split(',');
  templates.forEach((item) => block.classList.add(item.trim()));

  const container = block.parentElement.parentElement;
  const cardLink = container && container.classList.contains('card-link');

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const anchor = document.createElement('a');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const button = div.querySelector('.button-container');
      const href = button && button.querySelector('a').href;
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
      if (cardLink) {
        anchor.setAttribute('href', href);
        anchor.append(div);
        li.replaceChildren(anchor);
        if (button) button.remove();
      }
      ul.append(li);
    });
    ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
    block.textContent = '';
    block.append(ul);
  });
}
