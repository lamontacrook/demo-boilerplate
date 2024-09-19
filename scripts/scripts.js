import {
  sampleRUM,
  buildBlock,
  createOptimizedPicture as libCreateOptimizedPicture,
  loadHeader,
  loadFooter,
  decorateButtons as libDecorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  toClassName,
  getMetadata,
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

// Define the custom audiences mapping for experimentation
const EXPERIMENTATION_CONFIG = {
  audiences: {
    device: {
      mobile: () => window.innerWidth < 600,
      desktop: () => window.innerWidth >= 600,
    },
    visitor: {
      new: () => !localStorage.getItem('franklin-visitor-returning'),
      returning: () => !!localStorage.getItem('franklin-visitor-returning'),
    },
  },
};

/**
 * Determine if we are serving content for the block-library, if so don't load the header or footer
 * @returns {boolean} True if we are loading block library content
 */
export function isBlockLibrary() {
  return window.location.pathname.includes('block-library');
}

/**
 * Convience method for creating tags in one line of code
 * @param {string} tag Tag to create
 * @param {object} attributes Key/value object of attributes
 * @param {HTMLElement | HTMLElement[] | string} children Child element
 * @returns {HTMLElement} The created tag
 */
export function createTag(tag, attributes, children) {
  const element = document.createElement(tag);
  if (children) {
    if (children instanceof HTMLElement
      || children instanceof SVGElement
      || children instanceof DocumentFragment) {
      element.append(children);
    } else if (Array.isArray(children)) {
      element.append(...children);
    } else {
      element.insertAdjacentHTML('beforeend', children);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      element.setAttribute(key, val);
    });
  }
  return element;
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const div = main.querySelector('div');
  const section = document.createElement('div');
  section.append(buildBlock('hero', { elems: [div] }));
  main.prepend(section);
}

/**
 * to add/remove a template, just add/remove it in the list below
 */
const TEMPLATE_LIST = [
  'editor',
];

/**
 * Run template specific decoration code.
 * @param {Element} main The container element
 */

const overlap = (array) => {
  const uniqueElements = new Set(array);
  const filteredElements = array.filter((itm) => {
    const item = itm.trim();
    if (uniqueElements.has(item)) {
      uniqueElements.delete(item);
    } else {
      return item;
    }
    return '';
  });
  return [...new Set(filteredElements)];
};

async function decorateTemplates(main) {
  const templates = getMetadata('template').split(',').concat(TEMPLATE_LIST).map((item) => item.trim());
  const overlapArry = overlap(templates);

  overlapArry.forEach(async (template) => {
    try {
      const mod = await import(`../templates/${template}/${template}.js`);
      loadCSS(`${window.hlx.codeBasePath}/templates/${template}/${template}.css`);
      if (mod.default) {
        await mod.default(main);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Auto Blocking failed', error);
    }
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    if (getMetadata('autoblock') === 'false') return;
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/*
  * Appends query params to a URL
  * @param {string} url The URL to append query params to
  * @param {object} params The query params to append
  * @returns {string} The URL with query params appended
  * @private
  * @example
  * appendQueryParams('https://example.com', { foo: 'bar' });
  * // returns 'https://example.com?foo=bar'
*/
function appendQueryParams(url, params) {
  const { searchParams } = url;
  params.forEach((value, key) => {
    searchParams.set(key, value);
  });
  url.search = searchParams.toString();
  return url.toString();
}

/**
 * Creates an optimized picture element for an image.
 * If the image is not an absolute URL, it will be passed to libCreateOptimizedPicture.
 * @param {string} src The image source URL
 * @param {string} alt The image alt text
 * @param {boolean} eager Whether to load the image eagerly
 * @param {object[]} breakpoints The breakpoints to use
 * @returns {Element} The picture element
 *
 */
export function createOptimizedPicture(src, alt = '', eager = false, breakpoints = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }]) {
  const isAbsoluteUrl = /^https?:\/\//i.test(src);

  // Fallback to createOptimizedPicture if src is not an absolute URL
  if (!isAbsoluteUrl) return libCreateOptimizedPicture(src, alt, eager, breakpoints);

  const url = new URL(src);
  const picture = document.createElement('picture');
  const { pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);
  console.log(breakpoints);
  // webp
  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('type', 'image/webp');
    const searchParams = new URLSearchParams({ width: br.width, format: 'webply', smartcrop: br.smartcrop });
    console.log(searchParams);
    source.setAttribute('srcset', appendQueryParams(url, searchParams));
    picture.appendChild(source);
  });

  // fallback
  breakpoints.forEach((br, i) => {
    const searchParams = new URLSearchParams({ width: br.width, format: ext });

    if (i < breakpoints.length - 1) {
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute('srcset', appendQueryParams(url, searchParams));
      picture.appendChild(source);
    } else {
      const img = document.createElement('img');
      img.setAttribute('loading', eager ? 'eager' : 'lazy');
      img.setAttribute('alt', alt);
      picture.appendChild(img);
      img.setAttribute('src', appendQueryParams(url, searchParams));
    }
  });

  // const tSrc = document.createElement('source');
  // tSrc.setAttribute('media', '(max-width:599px)');
  // tSrc.setAttribute('type', 'image/webp');
  // tSrc.setAttribute('srcset', appendQueryParams(url, new URLSearchParams({ smartcrop: '11square' })));
  // picture.appendChild(tSrc);

  return picture;

  // let p = `<source media="(max-width: 899px)" type="image/webp" srcset="https://delivery-p124331-e1227315.adobeaemcloud.com/adobe/assets/urn:aaid:aem:35d3db0c-db15-4f5c-86db-e9dcc8d2f853/as/AdobeStock_302114365.jpeg?preferwebp=true&amp;width=2000&amp;format=jpeg">
  //   <source media="(min-width: 900px)" type="image/webp" srcset="https://delivery-p124331-e1227315.adobeaemcloud.com/adobe/assets/urn:aaid:aem:35d3db0c-db15-4f5c-86db-e9dcc8d2f853/as/AdobeStock_302114365.jpeg?preferwebp=true&amp;width=750&amp;format=jpeg&amp;smartcrop=54vert">
  //   <img loading="lazy" alt="" src="https://delivery-p124331-e1227315.adobeaemcloud.com/adobe/assets/urn:aaid:aem:35d3db0c-db15-4f5c-86db-e9dcc8d2f853/as/AdobeStock_302114365.jpeg?preferwebp=true&amp;width=750&amp;format=jpeg">`;
  // let pp = document.createElement('picture');
  // pp.innerHTML = p;
  // return pp;
}

/** *
 *
 * <picture>
 * <source media="(min-width: 600px)" type="image/webp" srcset="https://delivery-p124331-e1227315.adobeaemcloud.com/adobe/assets/urn:aaid:aem:35d3db0c-db15-4f5c-86db-e9dcc8d2f853/as/AdobeStock_302114365.jpeg?preferwebp=true&amp;width=2000&amp;format=webply">
 * <source type="image/webp" srcset="https://delivery-p124331-e1227315.adobeaemcloud.com/adobe/assets/urn:aaid:aem:35d3db0c-db15-4f5c-86db-e9dcc8d2f853/as/AdobeStock_302114365.jpeg?preferwebp=true&amp;width=750&amp;format=webply">
 * <source media="(min-width: 600px)" srcset="https://delivery-p124331-e1227315.adobeaemcloud.com/adobe/assets/urn:aaid:aem:35d3db0c-db15-4f5c-86db-e9dcc8d2f853/as/AdobeStock_302114365.jpeg?preferwebp=true&amp;width=2000&amp;format=jpeg"><img loading="lazy" alt="" src="https://delivery-p124331-e1227315.adobeaemcloud.com/adobe/assets/urn:aaid:aem:35d3db0c-db15-4f5c-86db-e9dcc8d2f853/as/AdobeStock_302114365.jpeg?preferwebp=true&amp;width=750&amp;format=jpeg">
 * </picture>
 *
 *
 */

/**
 * <picture>
  <source media="(max-width: 799px)" srcset="elva-480w-close-portrait.jpg" />
  <source media="(min-width: 800px)" srcset="elva-800w.jpg" />
  <img src="elva-800w.jpg" alt="Chris standing up holding his daughter Elva" />
</picture>
 *
 *
 */

function whatBlockIsThis(element) {
  let currentElement = element;

  while (currentElement.parentElement) {
    if (currentElement.parentElement.classList.contains('block')) return currentElement.parentElement;
    currentElement = currentElement.parentElement;
    if (currentElement.classList.length > 0) return currentElement.classList[0];
  }
  return null;
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function decorateButtons(main) {
  main.querySelectorAll('a').forEach((a) => {
    if (a.href.startsWith('https://delivery-')) {
      if (a.parentElement.classList.contains('button-container')) a.parentElement.classList.remove('button-container');
      console.log(getMetadata('columns'));
      // min-width:900px=54vert,max-width:899px=169banner
      // { media: '(min-width: 600px)', width: '2000' }
      const breakpoints = [
        { media: '(min-width: 900px)', width: '2000', smartcrop: '54vert' },
        { media: '(max-width: 899px)', width: '900', smartcrop: '169banner' },
      ];
      const picture = createOptimizedPicture(a.href, 'test', false, breakpoints);
      a.replaceWith(picture);
    } else libDecorateButtons(main);
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();

  // load experiments
  const experiment = toClassName(getMetadata('experiment'));
  const instantExperiment = getMetadata('instant-experiment');
  if (instantExperiment || experiment) {
    const { runExperiment } = await import('./experimentation/index.js');
    await runExperiment(experiment, instantExperiment, EXPERIMENTATION_CONFIG);
  }

  const main = doc.querySelector('main');
  if (main) {
    decorateTemplates(main);
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));

  // Load experimentation preview overlay
  if (window.location.hostname === 'localhost' || window.location.hostname.endsWith('.hlx.page')) {
    const preview = await import(`${window.hlx.codeBasePath}/tools/preview/preview.js`);
    await preview.default();
    if (window.hlx.experiment) {
      const experimentation = await import(`${window.hlx.codeBasePath}/tools/preview/experimentation.js`);
      experimentation.default();
    }
  }

  // Mark customer as having viewed the page once
  localStorage.setItem('franklin-visitor-returning', true);

  const context = {
    getMetadata,
    toClassName,
  };
  // eslint-disable-next-line import/no-relative-packages
  const { initConversionTracking } = await import('../plugins/rum-conversion/src/index.js');
  await initConversionTracking.call(context, document);
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
