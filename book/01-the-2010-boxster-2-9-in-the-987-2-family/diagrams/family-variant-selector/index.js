import { scaleLinear } from 'd3';
import { panel, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const variants = [
  { id: 'boxster', label: '2.9', title: 'Boxster 2.9', ps: 255, kw: 188, capacity: '2.9 litres', injection: 'Multipoint injection', roof: 'Powered fabric roof', detail: 'The reference ordinary 2010 model. Its engine injects fuel into the inlet ports; the S uses direct injection. Six-speed manual standard, seven-speed PDK optional.' },
  { id: 's', label: 'S', title: 'Boxster S', ps: 310, kw: 228, capacity: '3.4 litres', injection: 'Direct fuel injection', roof: 'Powered fabric roof', detail: 'The ordinary 2010 S has a larger 3.4-litre engine and 310 PS. It remains a separate engine variant with the ordinary powered roof. Six-speed manual standard, seven-speed PDK optional.' },
  { id: 'spyder', label: 'Spyder', title: 'Boxster Spyder', ps: 320, kw: 235, capacity: '3.4 litres', injection: 'Direct fuel injection', roof: 'Manual lightweight roof', detail: 'The lightweight production derivative, introduced in Europe in February 2010. Its specialised roof, body and chassis distinguish it from the ordinary S. Six-speed manual standard, seven-speed PDK optional.' },
  { id: 'black', label: 'Black Edition', title: 'S Black Edition', ps: 320, kw: 235, capacity: '3.4 litres', injection: 'Direct fuel injection', roof: 'Powered fabric roof', detail: 'The limited derivative introduced in Europe in March 2011: 987 cars, a black colour theme and additional equipment. It retains the ordinary powered-roof concept. Six-speed manual standard, seven-speed PDK optional.' },
];

export function mount(host, { state, signal }) {
  if (!variants.some(variant => variant.id === state.variant)) state.variant = 'boxster';
  const { stage, controls, explanation } = panel(host, {
    title: 'Compare a relative with the 2.9',
    description: 'Choose a variant. The reference power bar stays fixed so engine output, injection and roof differences remain visible.',
    note: 'Published European peak engine output; both bars use a 320 PS scale. Power alone does not measure acceleration or handling. Special derivatives are comparisons, not the specification of the reference 2010 2.9.',
  });
  let row;
  const redraw = svgDiagram(stage, 'Selected Boxster variant compared with the 255 PS reference 2.9', (svg, { width }) => {
    svg.selectAll('*').remove();
    const selected = variants.find(variant => variant.id === state.variant);
    const power = scaleLinear([0, 320], [0, width - 40]);
    const text = (x, y, value, size = 20, colour = '#263d34') => svg.append('text').attr('x', x).attr('y', y).attr('font-size', size).attr('fill', colour).text(value);
    text(20, 31, selected.title, 24);
    const bar = (y, value, colour) => {
      svg.append('rect').attr('x', 20).attr('y', y).attr('width', width - 40).attr('height', 18).attr('rx', 3).attr('fill', '#e4eae5');
      svg.append('rect').attr('x', 20).attr('y', y).attr('width', power(value)).attr('height', 18).attr('rx', 3).attr('fill', colour);
    };
    text(20, 65, 'Reference 2.9 · 255 PS', 18);
    bar(76, 255, '#8a9d91');
    text(20, 125, `Selected · ${selected.ps} PS`, 18);
    bar(136, selected.ps, '#176b53');
    text(20, 194, `${selected.kw} kW · ${selected.capacity}`, 23);
    text(20, 233, selected.injection);
    text(20, 272, selected.roof);
    const difference = selected.ps - 255;
    explanation.textContent = `${selected.detail} Published power difference from the reference: ${difference === 0 ? '0 PS' : `+${difference} PS`}.`;
    host.dataset.familyVariant = selected.id;
    host.dataset.familyPowerPs = String(selected.ps);
    row?.querySelectorAll('button').forEach((button, index) => button.setAttribute('aria-pressed', String(variants[index].id === selected.id)));
  }, signal);
  row = buttons(controls, variants.map(variant => ({ label: variant.label, action: () => { state.variant = variant.id; redraw(); } })), signal);
  redraw();
  return () => {};
}
