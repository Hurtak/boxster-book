import { axisBottom, axisLeft, line, scaleLinear } from 'd3';
import { panel, slider } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

// Normalised at lambda 1: metered air = 1 and its required base fuel = 1.
// An abstract step removes 60% of the remaining fuel deficit, not lambda error.
// This settled-condition teaching model is not Porsche software or timing.
export function mixtureSteps(extraAir) {
  const air = 1 + extraAir / 100;
  let fuel = 1;
  return Array.from({ length: 9 }, (_, step) => {
    if (step) fuel += 0.6 * (air - fuel);
    return { step, lambda: air / fuel, trim: (fuel - 1) * 100 };
  });
}

export function mount(host, { state, signal }) {
  state.extraAir ??= 10;
  state.step ??= 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'What mixture feedback can correct',
    description: 'Follow the loop from the upstream oxygen sensor to the DME and port injectors. Add unmetered intake air, then move through abstract fuel corrections towards λ = 1. Lambda is the air–fuel ratio relative to its stoichiometric value.',
    note: 'Functional loop, not physical routing. Warm, steady closed-loop operation only: metered air and its required base fuel are each 100%. Fuel follows the command exactly; each step removes 60% of the remaining fuel deficit. No time scale, sensor delay, trim limit, short-/long-term split or Porsche calibration is modelled. Real targets and feedback availability vary with operating state.',
  });
  stage.style.height = '780px';
  const redraw = svgDiagram(stage, 'Upstream exhaust sensing feeds the DME, which commands port injectors; added fuel approaches lambda one while an intake air leak remains', (svg, { width, height }) => {
    svg.selectAll('*').remove();
    const values = mixtureSteps(state.extraAir);
    const current = values[state.step];
    svg.append('title').text('Mixture feedback adds fuel while the intake leak remains');
    svg.append('desc').text(`At correction step ${state.step}, additional unmetered air is ${state.extraAir}%, fuel correction is ${current.trim.toFixed(1)}%, and lambda is ${current.lambda.toFixed(3)}. Dashed arrows carry commands or sensor signals; solid arrows carry fuel, intake air or exhaust. The wideband sensor is before the catalyst. Steps are illustrative, not elapsed time.`);
    const diagramWidth = Math.min(width, 620);
    const offset = (width - diagramWidth) / 2;
    const g = svg.append('g').attr('transform', `translate(${offset},0)`);
    const ink = '#203b2d';
    const signalColour = '#276950';
    const flowColour = '#ad622d';
    const text = (x, y, content, size = 18, anchor = 'start', fill = ink) => g.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('font-size', size).attr('fill', fill).text(content);
    const arrow = (points, colour, dashed = false) => {
      g.append('path').attr('d', `M${points.map(p => p.join(',')).join('L')}`).attr('fill', 'none').attr('stroke', colour).attr('stroke-width', 2.5).attr('stroke-dasharray', dashed ? '5 4' : null);
      const end = points.at(-1);
      const before = points.at(-2);
      const angle = Math.atan2(end[1] - before[1], end[0] - before[0]);
      const head = [Math.PI / 6, -Math.PI / 6].map(a => [end[0] - 8 * Math.cos(angle + a), end[1] - 8 * Math.sin(angle + a)]);
      g.append('path').attr('d', `M${head[0].join(',')}L${end.join(',')}L${head[1].join(',')}`).attr('fill', 'none').attr('stroke', colour).attr('stroke-width', 2.5);
    };
    const boxWidth = (diagramWidth - 54) / 2;
    const right = diagramWidth - boxWidth;
    const centreLeft = boxWidth / 2;
    const centreRight = right + boxWidth / 2;
    const box = (x, y, lines) => {
      g.append('rect').attr('x', x).attr('y', y).attr('width', boxWidth).attr('height', 90).attr('rx', 3).attr('fill', '#fff').attr('stroke', '#9aaba0').attr('stroke-width', 1.5);
      lines.forEach((s, i) => text(x + boxWidth / 2, y + 25 + i * 25, s, i ? 16 : 18, 'middle').attr('font-weight', i ? 400 : 600));
    };
    text(0, 23, 'A control loop, not a leak repair', 20).attr('font-weight', 600);
    box(0, 51, ['DME', 'MAF-based fuel', '+ feedback trim']);
    box(right, 51, ['Port injectors', 'Meter commanded', 'fuel into ports']);
    box(right, 225, ['Combustion', 'Air + fuel burn', 'Exhaust leaves']);
    box(0, 225, ['Wideband sensor', 'Reads exhaust λ', 'Before catalyst']);
    arrow([[boxWidth + 4, 96], [right - 4, 96]], signalColour, true);
    arrow([[centreRight, 145], [centreRight, 219]], flowColour);
    arrow([[right - 4, 270], [boxWidth + 4, 270]], flowColour);
    arrow([[centreLeft, 219], [centreLeft, 145]], signalColour, true);
    // Clear labels interrupt the vertical arrows without disguising their direction.
    g.append('rect').attr('x', centreLeft - 44).attr('y', 167).attr('width', 88).attr('height', 25).attr('fill', '#f1f3f2');
    text(centreLeft, 186, 'λ signal', 16, 'middle', signalColour);
    g.append('rect').attr('x', centreRight - 23).attr('y', 167).attr('width', 46).attr('height', 25).attr('fill', '#f1f3f2');
    text(centreRight, 186, 'Fuel', 16, 'middle', flowColour);
    arrow([[centreRight, 346], [centreRight, 320]], flowColour);
    text(centreRight, 370, 'Intake air', 18, 'middle');
    text(centreRight, 394, `100% + ${state.extraAir}% leak`, 16, 'middle', flowColour);
    text(centreLeft, 352, 'Dashed = signal', 16, 'middle', signalColour);
    text(centreLeft, 376, 'Solid = flow', 16, 'middle', flowColour);

    g.append('line').attr('x1', 0).attr('x2', diagramWidth).attr('y1', 414).attr('y2', 414).attr('stroke', '#b6c1ba');
    text(0, 446, `Air: ${100 + state.extraAir}% of metered air`);
    text(0, 473, `Fuel: ${(100 + current.trim).toFixed(1)}% of base fuel`);
    text(0, 507, `λ = ${current.lambda.toFixed(3)}`, 25).attr('font-weight', 600);
    text(diagramWidth, 505, state.extraAir === 0 ? 'At target' : state.step === 0 ? 'Lean' : 'Approaching 1', 18, 'end');
    const margin = { left: 52, right: 14, top: 550, bottom: 58 };
    const x = scaleLinear().domain([0, 8]).range([margin.left, diagramWidth - margin.right]);
    const y = scaleLinear().domain([0.99, 1.21]).range([height - margin.bottom, margin.top]);
    const chartBottom = height - margin.bottom;
    g.append('g').attr('transform', `translate(0,${chartBottom})`).call(axisBottom(x).tickValues([0, 2, 4, 6, 8]).tickSizeOuter(0)).attr('font-size', 17);
    g.append('g').attr('transform', `translate(${margin.left},0)`).call(axisLeft(y).tickValues([1, 1.1, 1.2]).tickFormat(v => v.toFixed(1)).tickSizeOuter(0)).attr('font-size', 17);
    text(margin.left, 536, 'Lambda λ', 18);
    text((margin.left + diagramWidth - margin.right) / 2, height - 7, 'Correction step (not time)', 18, 'middle');
    g.append('line').attr('x1', x(0)).attr('x2', x(8)).attr('y1', y(1)).attr('y2', y(1)).attr('stroke', '#73847a').attr('stroke-dasharray', '5 5');
    text(x(8), y(1) - 10, 'Target 1', 16, 'end');
    g.append('path').datum(values).attr('d', line().x(v => x(v.step)).y(v => y(v.lambda))).attr('fill', 'none').attr('stroke', '#9aaba0').attr('stroke-width', 3);
    g.append('path').datum(values.slice(0, state.step + 1)).attr('d', line().x(v => x(v.step)).y(v => y(v.lambda))).attr('fill', 'none').attr('stroke', signalColour).attr('stroke-width', 4);
    g.selectAll('circle').data(values).join('circle').attr('cx', v => x(v.step)).attr('cy', v => y(v.lambda)).attr('r', v => v.step === state.step ? 7 : 3).attr('fill', v => v.step === state.step ? flowColour : '#7b9384');
    explanation.textContent = state.extraAir === 0
      ? 'All air is accounted for. Base fuel already matches it, so λ = 1 and no correction is needed.'
      : state.step === 0
        ? `The leak adds ${state.extraAir}% air after the MAF. With base fuel unchanged, λ = ${current.lambda.toFixed(3)}: lean. The upstream sensor informs the DME; the next fuel command can add petrol.`
        : `Step ${state.step}: fuel correction is +${current.trim.toFixed(1)}% of base fuel. Added petrol brings λ towards 1; it cannot close the leak, so the extra air remains. This correction alone does not identify a failed part.`;
    host.dataset.lambda = current.lambda.toFixed(6);
    host.dataset.fuelCorrection = current.trim.toFixed(6);
  }, signal);
  slider(controls, { label: 'Additional unmetered air', min: 0, max: 20, step: 1, value: state.extraAir, format: v => `+${v}%`, signal, onChange: value => { state.extraAir = value; redraw(); } });
  slider(controls, { label: 'Feedback correction step', min: 0, max: 8, step: 1, value: state.step, format: v => `${v} of 8`, signal, onChange: value => { state.step = value; redraw(); } });
}
