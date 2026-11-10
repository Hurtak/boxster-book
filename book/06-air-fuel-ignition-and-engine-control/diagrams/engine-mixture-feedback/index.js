import { axisBottom, axisLeft, line, scaleLinear } from 'd3';
import { panel, slider } from '../../../../interactive/ui.js';
import { svgDiagram } from '../../../../interactive/svg.js';

// A deliberately simple settled-condition model, not Porsche software or timing.
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
    description: 'Add air that the meter did not measure, then move through successive fuel corrections. The target here is λ = 1.',
    note: 'Illustrative steady running: fixed metered air, fuel delivery proportional to command and a 60% correction each step. Steps have no time unit; this is not a Porsche fuel-trim map or a diagnostic simulator.',
  });
  stage.style.height = '390px';
  const redraw = svgDiagram(stage, 'Lambda approaches one as feedback adds fuel to match additional unmetered air', (svg, { width, height }) => {
    svg.selectAll('*').remove();
    const values = mixtureSteps(state.extraAir);
    const current = values[state.step];
    const text = (x, y, content, size = 20, anchor = 'start') => svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', anchor).attr('font-size', size).attr('fill', '#203b2d').text(content);
    text(0, 26, `Extra air: +${state.extraAir}%`);
    text(0, 57, `Fuel correction: +${current.trim.toFixed(1)}%`);
    text(width, 91, `λ = ${current.lambda.toFixed(3)}`, 26, 'end');
    const margin = { left: 62, right: 18, top: 132, bottom: 56 };
    const x = scaleLinear().domain([0, 8]).range([margin.left, width - margin.right]);
    const y = scaleLinear().domain([0.99, 1.21]).range([height - margin.bottom, margin.top]);
    const chartBottom = height - margin.bottom;
    svg.append('g').attr('transform', `translate(0,${chartBottom})`).call(axisBottom(x).tickValues([0, 2, 4, 6, 8]).tickSizeOuter(0)).attr('font-size', 20);
    svg.append('g').attr('transform', `translate(${margin.left},0)`).call(axisLeft(y).tickValues([1, 1.1, 1.2]).tickFormat(v => v.toFixed(1)).tickSizeOuter(0)).attr('font-size', 20);
    text(margin.left, 116, 'Lambda λ', 20);
    text((margin.left + width - margin.right) / 2, height - 8, 'Correction step', 20, 'middle');
    svg.append('line').attr('x1', x(0)).attr('x2', x(8)).attr('y1', y(1)).attr('y2', y(1)).attr('stroke', '#73847a').attr('stroke-dasharray', '5 5');
    svg.append('path').datum(values).attr('d', line().x(v => x(v.step)).y(v => y(v.lambda))).attr('fill', 'none').attr('stroke', '#9aaba0').attr('stroke-width', 3);
    svg.append('path').datum(values.slice(0, state.step + 1)).attr('d', line().x(v => x(v.step)).y(v => y(v.lambda))).attr('fill', 'none').attr('stroke', '#276950').attr('stroke-width', 4);
    svg.selectAll('circle').data(values).join('circle').attr('cx', v => x(v.step)).attr('cy', v => y(v.lambda)).attr('r', v => v.step === state.step ? 7 : 3).attr('fill', v => v.step === state.step ? '#ad622d' : '#7b9384');
    explanation.textContent = state.extraAir === 0
      ? 'All air is accounted for. The starting fuel quantity already matches it, so feedback makes no correction.'
      : state.step === 0
        ? `There is ${state.extraAir}% more air than the meter reported. Before correction, the mixture is lean: λ = ${current.lambda.toFixed(3)}.`
        : `After ${state.step} correction ${state.step === 1 ? 'step' : 'steps'}, the fuel command is ${current.trim.toFixed(1)}% higher. Lambda has moved towards one. The underlying air leak still exists.`;
    host.dataset.lambda = current.lambda.toFixed(6);
    host.dataset.fuelCorrection = current.trim.toFixed(6);
  }, signal);
  slider(controls, { label: 'Additional unmetered air', min: 0, max: 20, step: 1, value: state.extraAir, format: v => `+${v}%`, signal, onChange: value => { state.extraAir = value; redraw(); } });
  slider(controls, { label: 'Feedback correction step', min: 0, max: 8, step: 1, value: state.step, format: v => `${v} of 8`, signal, onChange: value => { state.step = value; redraw(); } });
}
