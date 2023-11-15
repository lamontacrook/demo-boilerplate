import { readBlockConfig, decorateIcons } from '../../scripts/aem.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // fetch footer content
  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`, window.location.pathname.endsWith('/footer') ? { cache: 'reload' } : {});

  if (resp.ok) {
    const html = await resp.text();

    // decorate footer DOM
    const footer = document.createElement('div');
    footer.innerHTML = html;
    const leftDiv = document.createElement('div');
    leftDiv.classList.add('left');
    const rightDiv = document.createElement('div');
    rightDiv.classList.add('right');

    leftDiv.append(footer.querySelector('div > div > p:has(picture)'));
    footer.querySelectorAll('p').forEach((item) => {
      rightDiv.append(item);
    });
    footer.querySelector('div > div').append(leftDiv);
    footer.querySelector('div > div').append(rightDiv);
    decorateIcons(footer);
    block.append(footer);
  }
}
