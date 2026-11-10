import { panel } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const sourceLabels = { radio: 'FM radio', cd: 'Audio / MP3 CD', aux: 'External player · AUX', usb: 'USB / period iPod', dvd: 'Discrete 5.1 DVD' };
const soundLabels = { standard: 'Standard speakers', plus: 'Sound Package Plus', bose: 'BOSE' };

function pathFor(state) {
  const pcm = state.headUnit === 'pcm';
  let missing = '';
  if (state.source === 'usb' && !pcm) missing = 'USB / iPod control needs PCM 3.0. The UK 2010 CDR-30 interface supplies AUX only.';
  else if (['aux', 'usb'].includes(state.source) && !state.audioInterface) missing = 'This external source needs the optional universal audio interface (870).';
  else if (state.source === 'dvd' && (!pcm || state.sound !== 'bose')) missing = 'This discrete 5.1 DVD example needs PCM 3.0 and BOSE. CDR-30 reads CDs; BOSE can derive surround from a stereo CD.';
  const source = { radio: 'FM broadcast → tuner', cd: 'CD drive → decoded audio', aux: 'Player → analogue AUX', usb: 'USB / iPod → PCM interface', dvd: 'DVD drive → 5.1 programme' }[state.source];
  const amplifier = { standard: 'Head-unit output stages', plus: 'Analogue → Plus amplifier', bose: pcm ? 'MOST → BOSE amplifier' : 'Digital → BOSE amplifier' }[state.sound];
  const speakers = { standard: ['2 dashboard tweeters', '+ 2 door woofers'], plus: ['7 speakers', '185 W total'], bose: ['11 speakers · subwoofer', '385 W total'] }[state.sound];
  return { pcm, missing, source, amplifier, speakers };
}

export function mount(host, { state, signal }) {
  state.headUnit ??= 'cdr';
  state.source ??= 'radio';
  state.sound ??= 'standard';
  state.audioInterface ??= false;
  if (!['cdr', 'pcm'].includes(state.headUnit)) state.headUnit = 'cdr';
  if (!Object.hasOwn(sourceLabels, state.source)) state.source = 'radio';
  if (!Object.hasOwn(soundLabels, state.sound)) state.sound = 'standard';
  const { stage, controls, explanation } = panel(host, {
    title: 'Follow one programme through the system',
    description: 'Choose the source, head unit and sound package. Add interface 870 for an external player.',
    note: 'January 2010 UK catalogue relationships, simplified signal paths. This is not a complete factory configurator or wiring diagram. “DVD” here specifically means the PCM + BOSE discrete 5.1 example.',
  });
  stage.style.height = '420px';
  const redraw = svgDiagram(stage, 'Selected audio source, head unit, amplification and loudspeakers', (svg, { width, height }) => {
    svg.selectAll('*').remove();
    const route = pathFor(state);
    const centre = width / 2;
    const boxWidth = width - 24;
    const active = !route.missing;
    const labels = [
      [route.source],
      [route.pcm ? 'PCM 3.0' : 'CDR-30', active ? 'programme selected' : 'source unavailable'],
      [route.amplifier],
      route.speakers,
    ];
    const ys = [22, 120, 218, 316];
    for (let i = 0; i < labels.length; i++) {
      const enabled = i === 0 || active;
      const group = svg.append('g').attr('opacity', enabled ? 1 : 0.52);
      group.append('rect').attr('x', 12).attr('y', ys[i]).attr('width', boxWidth).attr('height', 72).attr('rx', 5).attr('fill', '#fff').attr('stroke', i === 1 && !active ? '#a4412b' : '#72887b').attr('stroke-width', 2);
      labels[i].forEach((label, line) => group.append('text').attr('x', centre).attr('y', ys[i] + (labels[i].length === 1 ? 44 : 29 + line * 28)).attr('text-anchor', 'middle').attr('font-size', 20).attr('fill', '#203e33').text(label));
      if (i < 3) {
        const x = centre, top = ys[i] + 76;
        svg.append('path').attr('d', active ? `M${x},${top}v15m-5,-5l5,5l5,-5` : `M${x - 5},${top + 2}l10,10m0,-10l-10,10`).attr('stroke', active ? '#176b53' : '#a4412b').attr('stroke-width', 3).attr('fill', 'none');
      }
    }
    const details = state.sound === 'bose' ? `${route.pcm ? 'The PCM MOST programme path feeds' : 'The digital sound system uses'} the BOSE amplifier, which drives the speakers.` : state.sound === 'plus' ? 'The separate analogue Sound Package Plus amplifier drives all speaker channels.' : 'The standard arrangement uses the head unit’s output stages and four speakers.';
    explanation.textContent = route.missing || `${sourceLabels[state.source]} is available through ${route.pcm ? 'PCM 3.0' : 'CDR-30'}. ${details}${state.source === 'aux' ? ' Choose tracks on the external player.' : ''}${state.source === 'usb' ? ' Supported USB/iPod selections can be controlled through PCM.' : ''}`;
    host.dataset.audioHeadUnit = state.headUnit;
    host.dataset.audioSource = state.source;
    host.dataset.audioSound = state.sound;
    host.dataset.audioAvailable = String(active);
    host.dataset.audioInterface = String(state.audioInterface);
  }, signal);
  const selectControl = (label, key, values) => {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:grid;gap:6px;margin-bottom:14px;font:inherit';
    const caption = document.createElement('label');
    caption.textContent = label;
    const select = document.createElement('select');
    select.id = `${stage.getAttribute('aria-labelledby')}-${key}`;
    caption.htmlFor = select.id;
    select.style.cssText = 'font:inherit;min-height:44px;width:100%;max-width:100%;background:#fff;color:#203e33;border:1px solid #72887b;padding:6px';
    for (const [value, name] of Object.entries(values)) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = name;
      select.append(option);
    }
    select.value = state[key];
    select.addEventListener('change', () => { state[key] = select.value; redraw(); }, { signal });
    wrapper.append(caption, select);
    controls.append(wrapper);
  };
  selectControl('Head unit', 'headUnit', { cdr: 'CDR-30', pcm: 'PCM 3.0 / navigation' });
  selectControl('Programme source', 'source', sourceLabels);
  selectControl('Sound system', 'sound', soundLabels);
  const interfaceLabel = document.createElement('label');
  interfaceLabel.style.cssText = 'display:flex;align-items:center;gap:10px;min-height:44px';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = state.audioInterface;
  checkbox.addEventListener('change', () => { state.audioInterface = checkbox.checked; redraw(); }, { signal });
  interfaceLabel.append(checkbox, document.createTextNode('Universal audio interface (870) fitted'));
  controls.append(interfaceLabel);
  redraw();
  return () => {};
}
