const VARIABLES = 'https://main--demo-boilerplate--lamontacrook.hlx.page/theme/variables.json?sheet-variables';

async function fetchVariables() {
  const url = new URL(VARIABLES);
  const { pathname } = url;
  const variables = await fetch(pathname);
  const json = await variables.json();
  const variableMap = {};

  Object.values(json.data).forEach((row) => {
    if (row.Block === '') row.Block = 'default';
    else row.Block = row.Block.toLowerCase();
    if (Object.prototype.hasOwnProperty(variableMap, row.Block)) variableMap[row.Block].push(row);
    else variableMap[row.Block] = [row];
  });
  return variableMap;
}
export default async function decorate(main) {
  const variables = await fetchVariables();
  const blocks = main.querySelectorAll('.block');
  const form = document.createElement('div');
  const tabs = document.createElement('ul');
  form.append(tabs);
  form.classList.add('form');
  blocks.forEach((block) => {
    const blockName = [...block.classList].shift();

    const li = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.setAttribute('href', `#${blockName}`);
    anchor.textContent = blockName;
    anchor.addEventListener('click', ((e) => {
      form.querySelectorAll('.container').forEach((item) => item.setAttribute('style', 'visibility:hidden'));
      const container = form.querySelector(`#container-${blockName}`);

      // container.setAttribute('style', 'visibility:visible');
      container.setAttribute('style', 'display:block');
      e.preventDefault();
    }));
    li.append(anchor);
    tabs.append(li);

    const container = document.createElement('div');
    container.classList.add('container');
    container.setAttribute('id', `container-${blockName}`);
    if (variables[blockName]) {
      variables[blockName].forEach((item) => {
        const input = document.createElement('input');
        const label = document.createElement('label');
        label.classList.add('label-item');
        label.setAttribute('for', item.Variable);
        label.textContent = item.Name;
        input.setAttribute('type', 'text');
        input.setAttribute('id', item.Variable);
        input.setAttribute('value', item.Value);
        input.classList.add('input-item');
        input.addEventListener('change', ((e) => {
          const r = document.querySelector(':root');
          r.style.setProperty(e.target.id, e.target.value);
        }));
        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group');
        inputGroup.append(label, input);
        container.append(inputGroup);
      });
    }
    form.append(container);
  });
  main.append(form);
}
