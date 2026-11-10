import { panel, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const conditions = [
  { label: 'Warming up', radiator: false, fan: false, text: 'During warm-up the short return path lets coolant circulate around the engine while the thermostat restricts the radiator circuit. The belt-driven pump keeps turning.' },
  { label: 'Warm driving', radiator: true, fan: false, text: 'As the thermostat opens, the radiator circuit carries heat forward and returns cooler coolant to the pump. Air from the car’s movement can remove heat; this example does not request fan assistance.' },
  { label: 'Warm in traffic', radiator: true, fan: true, text: 'The coolant route can remain the same while electric fans provide airflow through the front radiator modules at low road speed. Thermostat opening and fan demand are different functions.' },
];

export function mount(host, { state, signal }) {
  state.condition = Number.isInteger(state.condition) && state.condition >= 0 && state.condition < conditions.length ? state.condition : 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'Where does the coolant go?',
    description: 'Select an operating condition to separate coolant circulation from cooling airflow.',
    note: 'Functional schematic. States are illustrative, with no Porsche temperature thresholds or measured flow rates. Heater and oil-cooler branches are omitted; thermostat opening is progressive.',
  });
  stage.style.height = '430px';
  let row;
  const redraw = svgDiagram(stage, 'Engine, thermostat, bypass and front radiator circuit', (svg, { width, height }) => {
    svg.selectAll('*').remove();
    const cx = width / 2;
    const engineTop = height - 80;
    const bypassY = height - 139;
    const valveX = width - 38;
    const selected = conditions[state.condition];
    const warm = '#b35e37';
    const cool = '#26708a';
    const muted = '#aab1aa';
    const defs = svg.append('defs');
    for (const [name, colour] of [['warm', warm], ['cool', cool], ['muted', muted]]) {
      defs.append('marker').attr('id', `fluid-cooling-${name}`).attr('markerWidth', 7).attr('markerHeight', 7).attr('refX', 5).attr('refY', 3.5).attr('orient', 'auto').append('path').attr('d', 'M0 0L7 3.5L0 7Z').attr('fill', colour);
    }
    const line = (d, colour, marker, dashed = false) => svg.append('path').attr('d', d).attr('fill', 'none').attr('stroke', colour).attr('stroke-width', 5).attr('stroke-dasharray', dashed ? '7 5' : null).attr('marker-end', marker ? `url(#fluid-cooling-${marker})` : null);
    const text = (x, y, value, size = 20, weight = 400) => svg.append('text').attr('x', x).attr('y', y).attr('font-size', size).attr('font-weight', weight).attr('text-anchor', 'middle').attr('fill', '#24342c').text(value);
    const box = (x, y, w, h, fill, stroke) => svg.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', 8).attr('fill', fill).attr('stroke', stroke).attr('stroke-width', 2);
    svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#f7f7f2');
    text(cx, 25, 'Front of car', 20, 600);
    line(`M${cx - 80} ${engineTop + 32}H25V85H${cx - 96}`, selected.radiator ? warm : muted, selected.radiator ? 'warm' : null, !selected.radiator);
    line(`M${cx + 96} 85H${valveX}V${bypassY}`, selected.radiator ? cool : muted, selected.radiator ? 'cool' : null, !selected.radiator);
    line(`M${cx - 80} ${engineTop + 32}H48V${bypassY}H${valveX}`, selected.radiator ? muted : warm, selected.radiator ? null : 'warm', selected.radiator);
    line(`M${valveX} ${bypassY + 14}V${engineTop + 32}H${cx + 83}`, cool, 'cool');
    box(cx - 96, 51, 192, 68, selected.radiator ? '#d5e8ef' : '#edf0e9', selected.radiator ? cool : muted);
    text(cx, 79, 'Front radiator', 22, 600);
    text(cx, 105, 'pair', 22);
    text(cx, 148, selected.fan ? 'Fans: airflow assistance' : 'Fans: not requested', 20, 600);
    for (const offset of [-20, 0, 20]) {
      const x = cx + offset;
      line(`M${x} 159V180`, selected.fan ? cool : muted, selected.fan ? 'cool' : null, !selected.fan);
    }
    box(cx - 86, 195, 172, 49, '#eef1ea', '#7c897c');
    text(cx, 218, 'Expansion tank', 20);
    line(`M${cx + 86} 219H${width - 14}V${engineTop + 53}H${cx + 83}`, '#7c897c', null, true);
    text(cx, bypassY - 15, 'Short bypass', 20);
    svg.append('circle').attr('cx', valveX).attr('cy', bypassY).attr('r', 14).attr('fill', selected.radiator ? '#d5e8ef' : '#f2ddb9').attr('stroke', '#526455').attr('stroke-width', 2);
    text(cx, bypassY + 29, selected.radiator ? 'Radiator route open' : 'Radiator route restricted', 20, 600);
    box(cx - 83, engineTop, 166, 66, '#e0ebdf', '#236148');
    text(cx, engineTop + 28, 'Engine + pump', 22, 600);
    text(cx, engineTop + 53, 'Rear of car', 20);
    explanation.textContent = selected.text;
    host.dataset.coolingCondition = String(state.condition);
    if (row) [...row.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === state.condition)));
  }, signal);
  row = buttons(controls, conditions.map(({ label }, i) => ({ label, action: () => { state.condition = i; redraw(); } })), signal);
  redraw();
  return () => {};
}
