let sequence = 0;

export function panel(host, { title, description, note }) {
  const heading = document.createElement('h4');
  heading.textContent = title;
  heading.id = `interactive-title-${++sequence}`;
  const introduction = document.createElement('p');
  introduction.className = 'diagram-description';
  introduction.textContent = description;
  const stage = document.createElement('div');
  stage.className = 'diagram-stage';
  stage.setAttribute('role', 'group');
  stage.setAttribute('aria-labelledby', heading.id);
  const controls = document.createElement('div');
  controls.className = 'diagram-controls';
  const explanation = document.createElement('p');
  explanation.className = 'diagram-explanation';
  const caption = document.createElement('p');
  caption.className = 'diagram-note';
  caption.textContent = note;
  host.append(heading, introduction, stage, controls, explanation, caption);
  return { stage, controls, explanation };
}

export function slider(container, { label, min = 0, max = 100, step = 1, value, format = String, signal, onChange }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'diagram-slider';
  const id = `interactive-control-${++sequence}`;
  const caption = document.createElement('label');
  caption.htmlFor = id;
  caption.textContent = label;
  const output = document.createElement('output');
  output.htmlFor = id;
  const input = document.createElement('input');
  Object.assign(input, { id, type: 'range', min, max, step, value });
  const set = (next, notify = true) => {
    input.value = next;
    output.textContent = format(Number(input.value));
    input.setAttribute('aria-valuetext', output.textContent);
    if (notify) onChange(Number(input.value));
  };
  input.addEventListener('input', () => set(input.value), { signal });
  wrapper.append(caption, output, input);
  container.append(wrapper);
  set(value, false);
  return { input, set };
}

export function buttons(container, items, signal) {
  const row = document.createElement('div');
  row.className = 'diagram-buttons';
  for (const { label, action } of items) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', action, { signal });
    row.append(button);
  }
  container.append(row);
  return row;
}
