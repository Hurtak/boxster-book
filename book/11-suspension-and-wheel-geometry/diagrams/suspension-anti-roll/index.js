import { line } from 'd3';
import { panel, slider, buttons } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

export function differentialTravel(leftMm, rightMm) {
  return leftMm - rightMm;
}

export function mount(host, { state, signal }) {
  state.leftMm ??= 25;
  state.rightMm ??= 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'The anti-roll bar responds to difference',
    description: 'Move each wheel relative to a body held level. Compare both wheels rising with one wheel rising alone.',
    note: 'Schematic axle viewed from behind. Travel is illustrative. Difference in wheel travel is a twist input, not a measured bar angle, torque or Boxster roll-stiffness calibration. Real link angles and compliance are omitted.',
  });
  const redraw = svgDiagram(stage, 'Anti-roll bar linking left and right wheel movement', (svg, { width, height }) => {
    svg.selectAll('*').remove();
    const leftX = 43;
    const rightX = width - 43;
    const centreY = height * 0.56;
    const leftY = centreY - state.leftMm;
    const rightY = centreY - state.rightMm;
    const diff = differentialTravel(state.leftMm, state.rightMm);
    const colour = Math.abs(diff) < 0.01 ? '#637a6e' : '#a6552b';
    const text = (x, y, content) => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', 'middle').attr('font-size', 16).attr('fill', '#273e35').text(content);
    const path = (points, stroke, sw = 4) => svg.append('path').attr('d', line()(points)).attr('fill', 'none').attr('stroke', stroke).attr('stroke-width', sw).attr('stroke-linejoin', 'round');
    text(width / 2, 25, 'Body held level');
    path([[26, 47], [width - 26, 47]], '#273e35', 11);
    for (const [x, y] of [[leftX, leftY], [rightX, rightY]]) {
      path([[x, 55], [x, y]], '#82988d', 3);
      svg.append('rect').attr('x', x - 18).attr('y', y - 34).attr('width', 36).attr('height', 68).attr('rx', 9).attr('fill', '#273e35');
      svg.append('circle').attr('cx', x).attr('cy', y).attr('r', 7).attr('fill', '#faf8f1');
    }
    // The coloured outer arms connect the moving drop links to a body-mounted bar.
    const barY = centreY - 52;
    path([[leftX + 20, leftY], [leftX + 35, leftY], [leftX + 35, barY], [rightX - 35, barY], [rightX - 35, rightY], [rightX - 20, rightY]], colour, 6);
    for (const x of [leftX + 49, rightX - 49]) {
      svg.append('rect').attr('x', x - 7).attr('y', barY - 10).attr('width', 14).attr('height', 20).attr('rx', 4).attr('fill', '#faf8f1').attr('stroke', '#273e35').attr('stroke-width', 2);
    }
    text(width / 2, barY - 22, 'Body-mounted bar');
    text(leftX, centreY + 80, 'Left');
    text(rightX, centreY + 80, 'Right');
    text(width / 2, height - 16, `${Math.abs(diff)} mm differential input`);
    explanation.textContent = diff === 0
      ? `Both wheels have moved ${state.leftMm} mm in the same direction. In this ideal symmetric case the bar rotates in its body mounts without added torsional twist. The individual springs still carry extra load.`
      : `The wheels differ by ${Math.abs(diff)} mm. The bar is twisted and resists this difference, transferring load between the two sides. ${diff > 0 ? 'The left wheel' : 'The right wheel'} has moved farther into bump; the bar opposes that relative movement.`;
    Object.assign(host.dataset, { leftTravelMm: state.leftMm, rightTravelMm: state.rightMm, differentialTravelMm: diff, barTwistInputMm: Math.abs(diff) });
  }, signal);
  const left = slider(controls, { label: 'Left wheel bump travel', min: -30, max: 30, value: state.leftMm, format: v => `${v} mm`, signal, onChange: value => { state.leftMm = value; redraw(); } });
  const right = slider(controls, { label: 'Right wheel bump travel', min: -30, max: 30, value: state.rightMm, format: v => `${v} mm`, signal, onChange: value => { state.rightMm = value; redraw(); } });
  const preset = (l, r) => { state.leftMm = l; state.rightMm = r; left.set(l, false); right.set(r, false); redraw(); };
  buttons(controls, [
    { label: 'Both wheels rise', action: () => preset(25, 25) },
    { label: 'Left wheel only', action: () => preset(25, 0) },
    { label: 'Opposite movement', action: () => preset(30, -30) },
  ], signal);
  return () => {};
}
