export default function decorate(block) {
  if (block.querySelector('div > div > div:nth-child(1) > picture')) block.classList.add('right');
}
