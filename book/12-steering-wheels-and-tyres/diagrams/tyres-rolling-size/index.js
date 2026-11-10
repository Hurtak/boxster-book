import { panel, buttons, slider } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

// Period Porsche sizes. See the chapter's research.md for source and market limits.
export const fitments = {
  17: { front: [205, 55, 17], rear: [235, 50, 17] },
  18: { front: [235, 40, 18], rear: [265, 40, 18] },
  19: { front: [235, 35, 19], rear: [265, 35, 19] },
};

export function dimensions([width, aspect, rim]) {
  const sidewall = width * aspect / 100;
  const diameter = rim * 25.4 + 2 * sidewall;
  return { sidewall, diameter, circumference: Math.PI * diameter };
}

export function wheelRpm(speedMph, circumferenceMm) {
  return speedMph * 1609.344 / 60 / (circumferenceMm / 1000);
}

export function mount(host, { state, signal }) {
  state.axle ??= 'rear';
  state.rim ??= 18;
  state.speed ??= 60;
  const { stage, controls, explanation } = panel(host, {
    title: 'A larger rim, a shorter sidewall',
    description: 'Compare the standard 17-inch size with a period 18- or 19-inch combination on the same axle. Then change road speed.',
    note: 'Geometric estimates from nominal tyre markings. These are not loaded rolling circumferences, measured tyre data, speedometer corrections or fitment approvals. UK wheel availability and Porsche handbook sizes are sourced in the chapter.',
  });
  let axleButtons;
  let rimButtons;
  const redraw = svgDiagram(stage, 'Nominal tyre and rim diameter comparison', (svg, { width, height }) => {
    svg.selectAll('*').remove();
    const baselineSize = fitments[17][state.axle];
    const comparedSize = fitments[state.rim][state.axle];
    const base = dimensions(baselineSize);
    const compared = dimensions(comparedSize);
    const change = (compared.diameter / base.diameter - 1) * 100;
    const baseRpm = wheelRpm(state.speed, base.circumference);
    const comparedRpm = wheelRpm(state.speed, compared.circumference);
    const radiusScale = Math.min(width * 0.205, 92) / 350;
    const cy = height * 0.43;
    const label = (x, y, value, colour = '#243a32', size = 20) => svg.append('text')
      .attr('x', x).attr('y', y).attr('text-anchor', 'middle').attr('font-size', size)
      .attr('fill', colour).text(value);
    for (const [index, size, data] of [[0, baselineSize, base], [1, comparedSize, compared]]) {
      const cx = width * (index ? 0.75 : 0.25);
      const colour = index ? '#17654c' : '#65716b';
      const outerRadius = data.diameter / 2 * radiusScale;
      const rimRadius = size[2] * 25.4 / 2 * radiusScale;
      label(cx, 26, `${size[2]}-inch rim`);
      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', outerRadius).attr('fill', '#333b38');
      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', rimRadius).attr('fill', '#e8eae5').attr('stroke', colour).attr('stroke-width', 4);
      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 10).attr('fill', colour);
      for (let spoke = 0; spoke < 5; spoke++) {
        const angle = spoke * Math.PI * 2 / 5 - Math.PI / 2;
        svg.append('line').attr('x1', cx).attr('y1', cy)
          .attr('x2', cx + Math.cos(angle) * (rimRadius - 6)).attr('y2', cy + Math.sin(angle) * (rimRadius - 6))
          .attr('stroke', colour).attr('stroke-width', 5);
      }
      label(cx, height - 76, `${size[0]}/${size[1]} R${size[2]}`);
      label(cx, height - 47, `Ø ${data.diameter.toFixed(1)} mm`);
      label(cx, height - 18, `${data.sidewall.toFixed(1)} mm sidewall`, '#4c5c54', width < 440 ? 16 : 20);
    }
    const drivelineNote = state.axle === 'rear'
      ? 'In the same gear, engine speed follows these driven rear wheels in the same proportion.'
      : 'These are the steering wheels. Select rear tyres to compare the effect on engine speed in a fixed gear.';
    explanation.textContent = `${state.axle === 'rear' ? 'Rear' : 'Front'} tyres: nominal circumference ${base.circumference.toFixed(1)} mm → ${compared.circumference.toFixed(1)} mm (${change >= 0 ? '+' : ''}${change.toFixed(2)}%). At ${state.speed} mph, estimated wheel speed is ${baseRpm.toFixed(1)} rpm → ${comparedRpm.toFixed(1)} rpm. ${drivelineNote}`;
    Object.assign(host.dataset, {
      axle: state.axle, comparedRim: state.rim,
      baseDiameterMm: base.diameter, comparedDiameterMm: compared.diameter,
      baseCircumferenceMm: base.circumference, comparedCircumferenceMm: compared.circumference,
      diameterChangePercent: change, baseWheelRpm: baseRpm, comparedWheelRpm: comparedRpm,
    });
    for (const [row, selected] of [[axleButtons, state.axle], [rimButtons, state.rim]]) {
      if (row) for (const button of row.children) button.setAttribute('aria-pressed', String(button.dataset.value === String(selected)));
    }
  }, signal);
  axleButtons = buttons(controls, ['front', 'rear'].map((axle) => ({
    label: axle === 'front' ? 'Front tyres' : 'Rear tyres',
    action: () => { state.axle = axle; redraw(); },
  })), signal);
  Array.from(axleButtons.children).forEach((button, i) => { button.dataset.value = ['front', 'rear'][i]; });
  rimButtons = buttons(controls, [18, 19].map((rim) => ({
    label: `Compare ${rim}-inch`, action: () => { state.rim = rim; redraw(); },
  })), signal);
  Array.from(rimButtons.children).forEach((button, i) => { button.dataset.value = [18, 19][i]; });
  slider(controls, {
    label: 'Illustrative road speed', min: 0, max: 80, step: 5, value: state.speed,
    format: (value) => `${value} mph`, signal,
    onChange: (value) => { state.speed = value; redraw(); },
  });
  redraw();
  return () => {};
}
