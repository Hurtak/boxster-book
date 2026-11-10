import { panel, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

const layers = [
  { id: 'all', label: 'All spaces', text: 'The ordinary Boxster reserves separate spaces for its folding roof, engine and rear luggage. The roof bay sits above the engine region; the boot is farther back. Two different exterior covers close the roof bay and the boot.' },
  { id: 'luggage', label: 'Rear boot', text: 'The rear luggage compartment is reached through its own lid. Porsche quotes 130 litres, including with the ordinary roof lowered. The small service flap exposes fluid-filling points; it does not reveal the complete engine.' },
  { id: 'roof', label: 'Roof bay', text: 'The folding roof occupies a dedicated bay beneath the convertible-top compartment cover. That cover must move to give the roof frame clearance. It is separate from the rear luggage lid.' },
  { id: 'access', label: 'Service layers', text: 'A removable top engine cover lies beneath trim in the roof/engine region. The rear boot gives access to the oil and coolant fillers. These are different access layers, with different jobs; the drawing is not a removal sequence.' },
];

export function mount(host, { state, signal }) {
  if (!layers.some(layer => layer.id === state.layer)) state.layer = 'all';
  const { stage, controls, explanation } = panel(host, {
    title: 'Separate the rear body layers',
    description: 'Choose a space to see how the ordinary powered roof, engine and rear boot fit into the same rear body.',
    note: 'Schematic side section of the rear half; front is left. Vertical gaps are expanded. Not to scale, not CAD, and not a service procedure. Fluid-filler positions are generalised.',
  });
  let row;
  const redraw = svgDiagram(stage, 'Rear body layers: roof bay above engine, boot farther back', (svg, { width, height }) => {
    svg.selectAll('*').remove();
    const chosen = layers.find(layer => layer.id === state.layer);
    const show = id => state.layer === 'all' || state.layer === id || (state.layer === 'access' && id === 'access');
    const text = (x, y, value, fill = '#253d32', anchor = 'middle', size = 20) => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('font-size', size).attr('fill', fill).text(value);
    const line = (points, colour, thickness = 3, dash = null) => svg.append('path').attr('d', points).attr('fill', 'none').attr('stroke', colour).attr('stroke-width', thickness).attr('stroke-dasharray', dash);
    const box = (x, y, w, h, fill, stroke, active) => svg.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', 5).attr('fill', fill).attr('stroke', stroke).attr('stroke-width', active ? 3 : 1.5).attr('opacity', active ? 1 : 0.27);
    const base = height - 34;
    const engineX = width * 0.27, engineW = width * 0.37;
    const bootX = width * 0.69, bootW = width * 0.27;
    const roofY = 61, roofH = 58, coverY = 148;
    const engineY = base - 74;
    text(12, 24, '← Front', '#536b5d', 'start');
    text(width - 12, 24, 'Rear →', '#536b5d', 'end');
    // A vertical rear-cabin boundary and low body edge locate the section.
    line(`M${width * 0.19},54V${base}H${width - 8}`, '#9cae9e', 3);
    line(`M${width * 0.11},92V${base - 7}H${width * 0.18}`, '#253d32', 10);
    text(width * 0.11, base + 25, 'Seat');
    // Roof compartment and its separate exterior cover.
    box(engineX, roofY, engineW, roofH, '#e4e2c9', '#8a7e34', show('roof'));
    text(engineX + engineW / 2, roofY + 36, 'Roof bay');
    line(`M${engineX},${roofY - 9}H${engineX + engineW}`, show('roof') ? '#8a7e34' : '#bdc3b7', 6);
    // Engine, below the removable cover and behind the seats.
    box(engineX, engineY, engineW, 66, '#d3e1d3', '#176b53', state.layer === 'all' || state.layer === 'access');
    text(engineX + engineW / 2, engineY + 41, 'Engine');
    line(`M${engineX},${coverY}H${engineX + engineW}`, show('access') ? '#a35d32' : '#aeb9ab', 5, '7 4');
    text(engineX + engineW / 2, coverY + 24, 'Top cover', '#80512e');
    // Rear luggage occupies a different longitudinal region.
    box(bootX, 126, bootW, 82, '#d9e5eb', '#357694', show('luggage') || state.layer === 'access');
    text(bootX + bootW / 2, 158, 'Boot');
    text(bootX + bootW / 2, 189, '130 l', '#357694');
    line(`M${bootX},116H${bootX + bootW}`, show('luggage') ? '#357694' : '#bdc3b7', 6);
    // Filler indication is deliberately generic, not a hose-routing drawing.
    const fillerX = bootX + bootW * 0.5;
    svg.append('circle').attr('cx', fillerX).attr('cy', 218).attr('r', 5).attr('fill', show('access') ? '#a35d32' : '#adbaad');
    line(`M${fillerX},224V238`, '#a35d32', 2);
    text(fillerX, 259, 'Fillers', '#80512e');
    explanation.textContent = chosen.text;
    row?.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(layers[i].id === state.layer)));
    host.dataset.bodyLayer = state.layer;
  }, signal);
  row = buttons(controls, layers.map(layer => ({ label: layer.label, action: () => { state.layer = layer.id; redraw(); } })), signal);
  redraw();
  return () => {};
}
