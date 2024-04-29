const NODE_NAMES = {
  div: () => { return document.createElement('div'); },
  button: () => { return document.createElement('button'); }
};

const ATTRIBUTES = {
  '#': (attribute, element) => { return element.setAttribute('id', attribute); },
  '.': (attribute, element) => {
    attribute.split('.').forEach((item) => {
      element.classList.add(item);
    });
    return element;
  },
};

const expand = (event) => {
  console.log('in expand');
  event.target.classList.replace('inactive', 'active');
};

const getCSS = () => {
  const vars = Array.from(document.styleSheets)
    .filter(
      sheet =>
        sheet.href === null || sheet.href.startsWith(window.location.origin)
    )
    .reduce((acc, sheet) => (acc = [
      ...acc,
      ...Array.from(sheet.cssRules).reduce(
        (def, rule) => (def =
          rule.selectorText === ':root'
            ? [
              ...def,
              ...Array.from(rule.style).filter(name =>
                name.startsWith('--')
              )
            ] : def),
        []
      )
    ]), []);

  const arry = vars.map((item) => {
    return { value: item, label: item };
  });
  // console.log(arry);
  // setCSSVariables(arry);
  return arry;
};

const elementCreate = (block, props) => {
  const elem = props.slice(0, 1);
  const vals = props.slice(1);
  const element = NODE_NAMES[elem]();
  vals.forEach((item) => {
    const attr = item.slice(0, 1);
    const val = item.slice(1);
    ATTRIBUTES[attr](val, element);
  });
  return element;
};

export default async function decorate(block) {
  console.log('loading modal');
  const audienceSelector = elementCreate(null, ['div', '#audience-selector', '.modal.inactive']);
  audienceSelector.addEventListener('mouseover', (ev) => {
    console.log(ev.target);
    expand(ev);
  });

  const closeBtn = elementCreate(null, ['button', '#close-button', '.close']);
  closeBtn.textContent = 'X';
  const modalContent = elementCreate(null, ['div', '#modal-content', '.modal-content']);

  audienceSelector.append(closeBtn);
  audienceSelector.append(modalContent);

  closeBtn.addEventListener('click', (event) => {
      const modal = document.querySelector('.modal.active');
      if (modal) modal.classList.replace('active', 'inactive');
      console.log(modal);
      event.preventDefault();
      return false;
  });

  const cssSelect = document.createElement('select');
  getCSS().forEach((css) => {
    const option = document.createElement('option');
    option.setAttribute('value', css.value);
    option.textContent = css.label;
    cssSelect.append(option);
  });

  // cssSelect.append(document.createElement('option'));
  // const modalContent = audienceSelector.querySelector('.modal-content');
  console.log(modalContent);
  modalContent.append(cssSelect);

  block.append(audienceSelector);
  // <div id="audience-selector" className="modal inactive" onMouseEnter={expand}>
  {/* <button className='close' onClick={closePanel}>X</button>
    <div className="modal-content">
      <div className='form-element'>
        <label htmlFor='audience'>Audience</label>
        <Select id="audience"
          name="audience"
          defaultValue={audience}
          isClearable={true}
          onChange={updateAudience}
          components={animatedComponents}
          options={audienceOptions} />
        <label htmlFor='lang'>Language</label>
        <Select id='lang'
          name='language'
          onChange={updateLanguage}
          defaultValue={language}
          isClearable={false}
          formatGroupLabel={'Languages'}
          options={langOptions} />
        <label htmlFor='update'></label>
        <button value='update' id='update' onClick={() => updatePage()}>Update Page</button>
      </div>
      {customize && (
        <React.Fragment>
          <div className='form-element'>
            <label htmlFor='cssVars'>CSS Variables</label>
            <Select id='cssVars'
              name='css-vars'
              onChange={updateCSSList}
              options={cssVariables} />
          </div>
          <div className='form-element'>
            {cssList.map((item) => (
              <React.Fragment key={item}>
                <label key={`${item}-label`} htmlFor={item}>{item}</label>
                <input key={`${item}-input`} id={item} name={item} onKeyUp={updateCSS} />
              </React.Fragment>
            ))}
          </div>
          <div className='form-element'>
            <button onClick={downLoadConfig}>Save Configuration</button>
            <input id='configuration' type='file' onChange={handleConfiguration} />
          </div>
        </React.Fragment>
      )}
    </div>
  </div> */}
}