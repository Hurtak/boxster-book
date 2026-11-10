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
    description: 'Compare each axle’s standard 17-inch tyre with a period 18- or 19-inch choice. Width and sidewall profile change with the rim. Then change road speed.',
    note: 'Geometric estimates, not loaded rolling circumferences, measured tyre data, speedometer corrections or fitment approvals. Tyre and rim widths are not shown in these face views. UK option availability and period Porsche handbook sizes are sourced in the chapter; R is radial construction, with the Z speed designation omitted here for clarity.',
  });
  stage.style.height = '400px';
  const construction = document.createElement('p');
  construction.className = 'diagram-description';
  explanation.after(construction);
  let axleButtons;
  let rimButtons;
  const redraw = svgDiagram(stage, 'Nominal tyre and rim diameter comparison', (svg, { width }) => {
    svg.selectAll('*').remove();
    const baselineSize = fitments[17][state.axle];
    const comparedSize = fitments[state.rim][state.axle];
    const base = dimensions(baselineSize);
    const compared = dimensions(comparedSize);
    const change = (compared.diameter / base.diameter - 1) * 100;
    const baseRpm = wheelRpm(state.speed, base.circumference);
    const comparedRpm = wheelRpm(state.speed, compared.circumference);
    const sidewallText = (value) => value.toFixed(Number.isInteger(value * 10) ? 1 : 2);
    const radiusScale = Math.min(width * 0.18, 78) / 350;
    const cy = 145;
    const label = (x, y, value, colour = '#243a32', size = width < 440 ? 16 : 20) => svg.append('text')
      .attr('x', x).attr('y', y).attr('text-anchor', 'middle').attr('font-size', size)
      .attr('fill', colour).text(value);
    const dimension = (x1, y1, x2, y2, colour) => {
      svg.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
        .attr('stroke', colour).attr('stroke-width', 1.5);
      const vertical = x1 === x2;
      for (const [x, y] of [[x1, y1], [x2, y2]]) {
        svg.append('line').attr('x1', x - (vertical ? 4 : 0)).attr('y1', y - (vertical ? 0 : 4))
          .attr('x2', x + (vertical ? 4 : 0)).attr('y2', y + (vertical ? 0 : 4))
          .attr('stroke', colour).attr('stroke-width', 1.5);
      }
    };
    svg.append('desc').text('The outer circle is nominal tyre diameter D; the inner circle is nominal rim bead-seat diameter d. Sidewall height h fills the radial gap. Both tyres share one geometric scale; widths and loaded deflection are not drawn.');
    for (const [index, size, data, rpm] of [[0, baselineSize, base, baseRpm], [1, comparedSize, compared, comparedRpm]]) {
      const cx = width * (index ? 0.75 : 0.25);
      const colour = index ? '#17654c' : '#65716b';
      const outerRadius = data.diameter / 2 * radiusScale;
      const rimRadius = size[2] * 25.4 / 2 * radiusScale;
      label(cx, 25, `${size[2]}-inch rim`);
      label(cx, 53, `${size[0]}/${size[1]} R${size[2]}`);
      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', outerRadius).attr('fill', '#333b38');
      svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', rimRadius).attr('fill', '#e8eae5').attr('stroke', colour).attr('stroke-width', 2);
      // Dimension circles are the nominal bead-seat and tyre diameters, not a rim-flange drawing.
      dimension(cx - outerRadius - 8, cy - outerRadius, cx - outerRadius - 8, cy + outerRadius, colour);
      label(cx - outerRadius - 20, cy + 5, 'D', colour, 16);
      dimension(cx - rimRadius, cy, cx + rimRadius, cy, colour);
      label(cx, cy - 8, 'd', colour, 16);
      dimension(cx, cy - outerRadius, cx, cy - rimRadius, '#ffffff');
      label(cx + 13, cy - (outerRadius + rimRadius) / 2 + 5, 'h', '#ffffff', 14);
      label(cx, 245, `D ${data.diameter.toFixed(1)} mm`);
      label(cx, 272, `Rim d ${(size[2] * 25.4).toFixed(1)} mm`);
      label(cx, 299, `Sidewall h ${sidewallText(data.sidewall)} mm`);
      label(cx, 326, `C ${data.circumference.toFixed(1)} mm`);
      label(cx, 353, `${rpm.toFixed(1)} rpm`);
    }
    label(width / 2, 386, 'Nominal circles · same geometric scale', '#4c5c54', width < 440 ? 15 : 18);
    const drivelineNote = state.axle === 'rear'
      ? 'With the same gear engaged and no clutch or tyre slip, engine rpm changes in the same proportion as these driven rear wheels.'
      : 'The front wheels steer and are not connected to the final drive. Select rear tyres to compare engine rpm in a fixed, engaged gear.';
    explanation.textContent = `${state.axle === 'rear' ? 'Rear' : 'Front'} tyres: circumference C ${base.circumference.toFixed(1)} mm → ${compared.circumference.toFixed(1)} mm (${change >= 0 ? '+' : ''}${change.toFixed(2)}%). At ${state.speed} mph, estimated wheel speed is ${baseRpm.toFixed(1)} rpm → ${comparedRpm.toFixed(1)} rpm. ${drivelineNote}`;
    const [tyreWidth, aspect, rim] = comparedSize;
    construction.textContent = `For the ${rim}-inch comparison: sidewall h = ${tyreWidth} mm × ${aspect}% = ${sidewallText(compared.sidewall)} mm. Rim bead-seat diameter d = ${rim} × 25.4 = ${(rim * 25.4).toFixed(1)} mm. Overall diameter D = d + 2h = ${compared.diameter.toFixed(1)} mm; circumference C = πD. At ${state.speed} mph, travel is ${(state.speed * 1609.344 / 60).toFixed(1)} metres/minute; divide by C in metres for rpm.`;
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
