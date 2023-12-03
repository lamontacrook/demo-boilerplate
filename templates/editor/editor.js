export default function decorate(main) {
  const cssVars = [...document.styleSheets].map((item) => {
    if (item.href.includes('styles.css')) {
      const rules = [...item.cssRules].reduce((accumulator, rule) => {
        if (rule.selectorText === ':root') {
          return (Object.values(rule.style));
        }
        return accumulator;
      }, []);
      console.log(rules);
      return rules;
    }
  });

  console.log(cssVars);
  const blocks = main.querySelectorAll('.block');
  const form = document.createElement('div');
  form.classList.add('form');
  blocks.forEach((block) => {
    const blockName = [...block.classList].shift();
    form.innerHTML += `<strong>${blockName}</strong>`;
  });
  main.append(form);
}
