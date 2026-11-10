import { scaleLinear } from 'd3';
import { panel, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const variants = [
  { id: 'boxster', label: '2.9', title: 'Boxster 2.9', ps: 255, kw: 188, capacity: '2.9 litres', injection: 'Multipoint injection', roof: 'Powered fabric roof', detail: 'The reference ordinary 2010 model. Its engine injects fuel into the inlet ports; the S uses direct injection. Six-speed manual standard, seven-speed PDK optional.' },
  { id: 's', label: 'S', title: 'Boxster S', ps: 310, kw: 228, capacity: '3.4 litres', injection: 'Direct fuel injection', roof: 'Powered fabric roof', detail: 'The ordinary 2010 S has a larger 3.4-litre engine and 310 PS. It remains a separate engine variant with the ordinary powered roof. Six-speed manual standard, seven-speed PDK optional.' },
  { id: 'spyder', label: 'Spyder', title: 'Boxster Spyder', ps: 320, kw: 235, capacity: '3.4 litres', injection: 'Direct fuel injection', roof: 'Manual lightweight roof', detail: 'Porsche’s November 2009 Dutch announcement scheduled this lightweight production derivative’s market launch for February 2010. Its specialised roof, body and chassis distinguish it from the ordinary S. Six-speed manual standard, seven-speed PDK optional.' },
  { id: 'black', label: 'Black Edition', title: 'S Black Edition', ps: 320, kw: 235, capacity: '3.4 litres', injection: 'Direct fuel injection', roof: 'Powered fabric roof', detail: 'Porsche’s February 2011 Dutch announcement listed availability from March 2011: 987 cars, a black colour theme and additional equipment. It retains the ordinary powered-roof concept. Six-speed manual standard, seven-speed PDK optional.' },
];

export function mount(host, { state, signal }) {
  if (!variants.some(variant => variant.id === state.variant)) state.variant = 'boxster';
  const { stage, controls, explanation } = panel(host, {
    title: 'Compare a relative with the 2.9',
    description: 'Choose a variant. The 2010 2.9 stays visible as the reference for power, engine capacity, fuel injection and roof.',
    note: 'Published European peak engine output; both bars use a 320 PS scale. Power alone does not measure acceleration or handling. Special derivatives are comparisons, not the specification of the reference 2010 2.9.',
  });
  stage.style.height = '195px';
  const comparison = document.createElement('table');
  comparison.style.cssText = 'display:table;width:100%;max-width:100%;overflow:visible;table-layout:fixed;border-collapse:collapse;font-size:18px;line-height:1.35;margin:0 0 4px;white-space:normal';
  comparison.setAttribute('aria-label', 'Engine and roof compared with the reference 2010 Boxster 2.9');
  const header = comparison.createTHead().insertRow();
  const selectedCells = [];
  for (const [index, label] of ['Feature', 'Reference · 2010 2.9', 'Selected'].entries()) {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = label;
    cell.style.cssText = `text-align:left;vertical-align:top;padding:10px 8px 12px 0;border-bottom:0;font-size:16px;white-space:normal;width:${index === 0 ? 28 : 36}%`;
    header.append(cell);
  }
  const selectedHeading = header.lastElementChild;
  const body = comparison.createTBody();
  for (const [key, label] of [['capacity', 'Capacity'], ['injection', 'Fuel injection'], ['roof', 'Roof']]) {
    const row = body.insertRow();
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = label;
    heading.style.cssText = 'text-align:left;vertical-align:top;padding:12px 8px 12px 0;border-top:1px solid #c7d2ca;border-bottom:0;font-size:16px;font-weight:600;white-space:normal';
    row.append(heading);
    for (const variant of [variants[0], null]) {
      const cell = row.insertCell();
      cell.style.cssText = 'vertical-align:top;padding:12px 8px 12px 0;border-top:1px solid #c7d2ca;border-bottom:0;overflow-wrap:normal;white-space:normal';
      if (variant) cell.textContent = variant[key];
      else selectedCells.push({ cell, key });
    }
  }
  stage.after(comparison);
  let row;
  const redraw = svgDiagram(stage, 'Selected Boxster variant compared with the 255 PS reference 2.9', (svg, { width }) => {
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} 195`).attr('height', 195);
    const selected = variants.find(variant => variant.id === state.variant);
    svg.attr('aria-label', `${selected.title} peak engine output compared with the reference 2010 Boxster 2.9`);
    svg.append('title').text(`${selected.title}: ${selected.kw} kW / ${selected.ps} PS`);
    svg.append('desc').text('Both bars start at zero and share a maximum of 320 PS. Reference: 188 kW / 255 PS. Engine capacity, fuel injection and roof are compared in the table below.');
    const power = scaleLinear([0, 320], [0, width - 40]);
    const text = (x, y, value, size = 20, colour = '#263d34') => svg.append('text').attr('x', x).attr('y', y).attr('font-size', size).attr('fill', colour).text(value);
    text(20, 31, selected.title, 24);
    const bar = (y, value, colour) => {
      svg.append('rect').attr('x', 20).attr('y', y).attr('width', width - 40).attr('height', 18).attr('rx', 3).attr('fill', '#e4eae5');
      svg.append('rect').attr('x', 20).attr('y', y).attr('width', power(value)).attr('height', 18).attr('rx', 3).attr('fill', colour);
    };
    text(20, 65, 'Reference · 188 kW / 255 PS', 18);
    bar(76, 255, '#8a9d91');
    text(20, 125, `Selected · ${selected.kw} kW / ${selected.ps} PS`, 18);
    bar(136, selected.ps, '#176b53');
    text(20, 180, '0', 16);
    text(width - 20, 180, '320 PS', 16).attr('text-anchor', 'end');
    selectedHeading.textContent = `Selected · ${selected.id === 'boxster' ? '2.9' : selected.title.replace('Boxster ', '')}`;
    for (const { cell, key } of selectedCells) cell.textContent = selected[key];
    const difference = selected.ps - 255;
    const injection = selected.id === 'boxster' ? '' : ' Direct injection delivers fuel into the cylinders rather than the 2.9’s inlet ports.';
    explanation.textContent = `${selected.detail}${injection} Published power difference from the reference: ${difference === 0 ? '0 PS' : `+${difference} PS`}.`;
    host.dataset.familyVariant = selected.id;
    host.dataset.familyPowerPs = String(selected.ps);
    row?.querySelectorAll('button').forEach((button, index) => button.setAttribute('aria-pressed', String(variants[index].id === selected.id)));
  }, signal);
  row = buttons(controls, variants.map(variant => ({ label: variant.label, action: () => { state.variant = variant.id; redraw(); } })), signal);
  redraw();
  return () => {};
}
