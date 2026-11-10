import { panel, slider, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const stages = [
  ['Closed', 'The header is held at the windscreen by its manually operated latch. The raised glass meets the roof seals.'],
  ['Released', 'The driver releases the header latch before powered opening. Window lowering gives the frameless glass clearance from the roof seals.'],
  ['Clearance', 'The compartment cover rises to provide room as the roof assembly begins moving rearwards. The movements overlap in the real mechanism.'],
  ['Folding', 'The linked frame folds the fabric and lining into the compartment behind the seats. Both sides must move together.'],
  ['Stowed', 'The roof is packed behind the seats and the compartment cover is closed. This is the fully open end position.'],
];

export function mount(host, { state, signal }) {
  state.stage ??= 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'From a closed roof to an open roadster',
    description: 'Choose a stage and follow the roof and its compartment cover behind the seats.',
    note: '2010 2.9 explanatory side view. Positions and overlapping movements are simplified, with no timing, pivot dimensions or service-setting information. Operate the real roof only as its handbook directs.',
  });
  explanation.setAttribute('aria-live', 'polite');
  let row;
  const redraw = svgDiagram(stage, 'Schematic stages of the ordinary 2010 Boxster folding roof', (svg, { width: w, height: h }) => {
    svg.selectAll('*').remove();
    const s = state.stage;
    const y = h * .62;
    const text = (x, yy, value, size = 14) => svg.append('text').attr('x', x).attr('y', yy).attr('text-anchor', 'middle').attr('font-size', size).attr('fill', '#263c34').text(value);
    const path = (d, stroke, sw, fill = 'none') => svg.append('path').attr('d', d).attr('stroke', stroke).attr('stroke-width', sw).attr('fill', fill).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
    text(w / 2, 26, `${s + 1} / 5 · ${stages[s][0]}`, 17);
    path(`M${w*.08},${y+25} Q${w*.12},${y-5} ${w*.27},${y-5} L${w*.39},${y+5} H${w*.88} L${w*.94},${y+25} Z`, '#315d4d', 3, '#e5ece6');
    path(`M${w*.27},${y-5} L${w*.39},${y-70}`, '#637d83', 5);
    path(`M${w*.47},${y+2} v-33 q0,-10 9,-10 v43 M${w*.58},${y+2} v-36 q0,-9 9,-9 v45`, '#af875a', 7);
    svg.append('rect').attr('x',w*.69).attr('y',y-8).attr('width',w*.2).attr('height',23).attr('fill','#b4c6bb');
    const roofs = [
      `M${w*.39},${y-70} Q${w*.52},${y-110} ${w*.66},${y-75} L${w*.78},${y-12}`,
      `M${w*.40},${y-75} Q${w*.53},${y-115} ${w*.67},${y-77} L${w*.78},${y-12}`,
      `M${w*.46},${y-116} Q${w*.60},${y-125} ${w*.69},${y-78} L${w*.78},${y-12}`,
      `M${w*.69},${y-76} L${w*.64},${y-105} L${w*.79},${y-83} L${w*.72},${y-45} L${w*.81},${y-13}`,
      `M${w*.71},${y+3} l${w*.04},-7 l${w*.05},8 l${w*.04},-6 l${w*.04},7`,
    ];
    path(roofs[s], '#243d34', 8);
    const lifted = s === 2 || s === 3;
    path(lifted ? `M${w*.76},${y-13} L${w*.88},${y-89}` : `M${w*.69},${y-12} L${w*.89},${y-10}`, '#315d4d', 7);
    if (s < 2) svg.append('circle').attr('cx', w*.39).attr('cy', y-70).attr('r', 6).attr('fill', s === 0 ? '#b67c46' : '#fff').attr('stroke','#b67c46').attr('stroke-width',2);
    text(w*.27, y+53, 'Front');
    text(w*.77, y+53, 'Roof compartment');
    text(w/2, h-18, s === 0 ? 'Latch engaged · glass sealed' : s === 4 ? 'Roof stowed · cover closed' : 'Illustrative intermediate stage');
    explanation.textContent = stages[s][1];
    host.dataset.roofStage = String(s);
    host.dataset.roofPosition = stages[s][0].toLowerCase();
    if (row) [...row.children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === s)));
  }, signal);
  const control = slider(controls, { label: 'Opening stage', min: 0, max: 4, step: 1, value: state.stage, format: v => stages[v][0], signal, onChange: value => { state.stage = value; redraw(); } });
  row = buttons(controls, stages.map(([label], i) => ({ label, action: () => control.set(i) })), signal);
  redraw();
  return () => {};
}
