function View() { }

View.prototype = {
  constructor: View,
  isElementInView: function (element, fullyInView) {
    const pageTop = document.documentElement.scrollTop;
    const pageBottom = pageTop + window.screen.height;
    const elementTop = element.getBoundingClientRect().top;
    const elementBottom = elementTop + element.getBoundingClientRect().height;

    console.log(`page top ${pageTop}`);
    console.log(`page bottom ${pageBottom}`);
    console.log(`element top ${elementTop}`);
    console.log(`element bottom ${elementBottom}`);

    if (fullyInView === true) {
      return ((pageTop < elementTop) && (pageBottom > elementBottom));
    } else {
      return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
    }
  }
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
          window.addEventListener('scroll', () => {
            const isElementInView = new View().isElementInView(picWrapper, true);
            console.log(isElementInView);
          });
        }
      } else {
        const content = document.createElement('div');
        [...col.children].forEach((item) => {
          content.append(item);
        });
        col.append(content);
        content.classList.add('columns-content');
      }
    });
  });
}
