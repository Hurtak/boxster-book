import { scaleLinear } from 'd3';
import { panel, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const configurations = [
  { name: 'Manual', time: 5.9, weight: 1335, consumption: '9.4', co2: 221, detail: 'Standard six-speed manual: 5.9 s to 100 km/h, 1,335 kg DIN and 221 g/km CO₂ in the NEDC test.' },
  { name: 'PDK', time: 5.8, weight: 1365, consumption: '9.1', co2: 214, detail: 'Optional seven-speed PDK: 5.8 s to 100 km/h, 1,365 kg DIN and 214 g/km CO₂ in the NEDC test.' },
  { name: 'PDK + Chrono', time: 5.6, weight: 1365, consumption: '9.1', co2: 214, detail: 'PDK with Sport Chrono SPORT PLUS: Porsche quotes 5.6 s to 100 km/h. Weight and NEDC entries shown are the published PDK baseline; this is not a separate measurement of an optioned car.' },
];

export function mount(host, { state, signal }) {
  state.configuration ??= 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'One engine, three acceleration entries',
    description: 'Choose a catalogue configuration. Compare the quoted acceleration time while keeping engine output in view.',
    note: 'January 2010 UK brochure, pp. 126–127. Bars start at zero. These are quoted 0–100 km/h times, not a simulated acceleration trace. Weight and NEDC consumption are standard-car reference figures.',
  });
  let row;
  const redraw = svgDiagram(stage, 'Manual, PDK and PDK with Sport Chrono 0–100 km/h time comparison', (svg, { width, height }) => {
    svg.selectAll('*').remove();
    const right = width - 15;
    const x = scaleLinear([0, 7], [12, right]);
    const text = (px, py, value, size = 20, anchor = 'start', colour = '#233e32') => svg.append('text').attr('x', px).attr('y', py).attr('font-size', size).attr('text-anchor', anchor).attr('fill', colour).text(value);
    const selected = configurations[state.configuration];
    configurations.forEach((configuration, index) => {
      const y = 42 + index * 68;
      const active = index === state.configuration;
      text(12, y - 9, configuration.name, 20);
      text(right, y - 9, `${configuration.time.toFixed(1)} s`, 21, 'end');
      svg.append('rect').attr('x', x(0)).attr('y', y).attr('width', x(configuration.time) - x(0)).attr('height', 20).attr('fill', active ? '#176b53' : '#b9c8be');
      if (active) svg.append('rect').attr('x', x(0)).attr('y', y - 3).attr('width', x(configuration.time) - x(0)).attr('height', 26).attr('fill', 'none').attr('stroke', '#233e32').attr('stroke-width', 2);
    });
    text(12, 258, 'All three: 188 kW / 255 PS', width < 350 ? 20 : 23);
    text(12, height - 8, `DIN baseline: ${selected.weight.toLocaleString('en-GB')} kg`, 20);
    explanation.textContent = `${selected.detail} Peak engine output remains 188 kW / 255 PS and 290 Nm. Combined NEDC consumption: ${selected.consumption} l/100 km.`;
    row?.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === state.configuration)));
    host.dataset.specificationConfiguration = String(state.configuration);
    host.dataset.specificationTime = selected.time.toFixed(1);
  }, signal);
  row = buttons(controls, configurations.map((configuration, index) => ({ label: configuration.name, action: () => { state.configuration = index; redraw(); } })), signal);
  redraw();
  return () => {};
}
