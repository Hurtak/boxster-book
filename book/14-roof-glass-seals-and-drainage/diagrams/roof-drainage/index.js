import { panel, slider, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

export function mount(host, { state, signal }) {
  state.blocked ??= false;
  // Preserve the saved-state key; it now explicitly denotes an illustrative amount.
  state.rain ??= 35;
  const { stage, controls, explanation } = panel(host, {
    title: 'A good seal still needs a working drain',
    description: 'Compare clear and blocked outlets with the same illustrative amount of water added to the collection area.',
    note: 'Functional section of one side of the ordinary roof compartment. These are alternative snapshots, not a time or rainfall simulation. Pan shape, water levels and the overflow point are illustrative; drain capacity and concealed hose routing are not shown.',
  });
  stage.style.height = '430px';
  explanation.setAttribute('aria-live', 'polite');
  let row;
  const redraw = svgDiagram(stage, 'Roof runoff entering a side drip pan; a clear outlet leads outside, while a blocked outlet can cause interior overflow', (svg, { width: w }) => {
    svg.selectAll('*').remove();
    const ink = '#263c34', blue = '#22779e', rust = '#a14f39';
    const left = 24, right = w * .65, rim = 205, bottom = 319;
    const drainX = w * .32;
    const overflow = state.blocked && state.rain > 65;
    const outcome = !state.rain ? 'dry' : !state.blocked ? 'drained' : overflow ? 'overflow' : 'collecting';
    const messages = {
      dry: 'No water has been added. A dry pan alone does not show whether its drain is clear. Changing the outlet still changes the escape route.',
      drained: 'In this clear-outlet example, water collected on the wet side has a route outside the body. Blue arrows show direction, not a calculated drainage rate or capacity.',
      collecting: 'Water remains in the pan because debris blocks its outlet. The upper seal is intact: sealing the joint and draining the collection area are separate jobs.',
      overflow: 'In this blocked-outlet example, water has reached the rim and can spill towards the interior. This explains an ingress route without requiring a tear in the fabric or a failed upper seal.',
    };
    svg.append('title').text('Sealing and drainage do different jobs');
    svg.append('desc').text(messages[outcome]);
    const text = (x, y, lines, { anchor = 'middle', colour = ink, size = 16, weight = 400 } = {}) => {
      const label = svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('font-size', size).attr('font-weight', weight).attr('fill', colour);
      for (const [i, line] of [].concat(lines).entries()) label.append('tspan').attr('x', x).attr('dy', i ? 19 : 0).text(line);
      return label;
    };
    const path = (d, colour, sw = 3, fill = 'none') => svg.append('path').attr('d', d).attr('fill', fill).attr('stroke', colour).attr('stroke-width', sw).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
    const arrow = (d, x, y, colour = blue) => {
      path(d, colour, 3.5);
      path(`M${x-5},${y-8} L${x},${y} L${x+5},${y-8}`, colour, 3.5);
    };
    text(w / 2, 20, state.blocked ? 'Blocked outlet' : 'Clear outlet', { weight: 600, size: 18 });
    // Water enters the pan on the wet side of the intact roof/body joint.
    // This maps relationships, not the physical positions of the car's parts.
    const sealX = w * .62;
    text(w * .28, 62, 'Roof fabric');
    text(w * .79, 62, 'Intact seal');
    path(`M35,124 L${sealX},91`, '#315d4d', 9);
    path(`M${sealX+25},91 H${w-18}`, '#7f9890', 9);
    svg.append('rect').attr('x', sealX-2).attr('y', 83).attr('width', 29).attr('height', 16).attr('rx', 7).attr('fill', '#b28049');
    path(`M${w*.79},69 L${sealX+12},79`, '#7f9890', 1.5);
    text(w * .35, 164, state.rain ? 'Runoff reaches pan' : 'Wet collection side', { colour: state.rain ? blue : ink });
    if (state.rain > 0) {
      path(`M${w*.47},94 L45,114 Q35,118 35,133 V141`, blue, 3.5);
      arrow('M35,175 V219', 35, 219);
    }
    // An open throat in the pan floor connects to the drain. Debris blocks that
    // opening; no unbroken floor is drawn across the intended water path.
    const depth = state.blocked ? Math.min(state.rain / 65, 1) * (bottom-rim) : state.rain ? 11 : 0;
    if (depth) svg.append('rect').attr('x', left+3).attr('y', bottom-depth).attr('width', right-left-6).attr('height', depth).attr('fill', '#7fb8d0').attr('opacity', .7);
    path(`M${left},${rim} V${bottom} H${drainX-9} V382 M${drainX+9},382 V${bottom} H${right} V${rim}`, '#455b50', 4);
    text((left+right) / 2, 246, 'Side drip pan', { weight: 600 });
    text((left+right) / 2, 272, outcome === 'dry' ? 'Dry' : outcome === 'drained' ? 'Water can drain' : overflow ? 'Water at rim' : 'Water held here');
    text(drainX+28, 349, state.blocked ? ['Debris blocks', 'the opening'] : ['Drain opening', 'and pipe'], { anchor: 'start' });
    path(`M${drainX+13},326 L${drainX+24},339`, '#7f9890', 1.5);
    if (state.blocked) {
      path(`M${drainX-10},${bottom-7} l20,13 m-20,0 l20,-13`, rust, 4);
      svg.append('circle').attr('cx', drainX-3).attr('cy', bottom-5).attr('r', 3).attr('fill', '#b28049');
    } else if (state.rain > 0) {
      arrow(`M${drainX},${bottom-16} V391`, drainX, 391);
    }
    text(drainX, 419, 'Outside body');
    const interiorX = w * .84;
    text(interiorX, 291, ['Interior', 'side'], { colour: rust });
    if (overflow) {
      // A possible spill over the collection boundary, not through the seal.
      arrow(`M${right-12},${rim} H${right+5} Q${right+23},${rim} ${right+23},${rim+17} V374`, right+23, 374, rust);
      text(interiorX, 226, ['Possible', 'overflow'], { colour: rust });
    }
    explanation.textContent = messages[outcome];
    host.dataset.drainState = state.blocked ? 'blocked' : 'clear';
    host.dataset.waterOutcome = outcome;
    host.dataset.rainInput = String(state.rain);
    if (row) [...row.children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === Number(state.blocked))));
  }, signal);
  row = buttons(controls, [
    { label: 'Clear drain', action: () => { state.blocked = false; redraw(); } },
    { label: 'Blocked drain', action: () => { state.blocked = true; redraw(); } },
  ], signal);
  slider(controls, {
    label: 'Illustrative water added', min: 0, max: 100, step: 1, value: state.rain,
    format: v => v === 0 ? 'None' : v <= 35 ? 'Low' : v <= 65 ? 'Medium' : 'High',
    signal, onChange: value => { state.rain = value; redraw(); },
  });
  redraw();
  return () => {};
}
