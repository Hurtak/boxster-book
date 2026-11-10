import { scaleLinear, axisBottom, axisLeft, line, range, format } from 'd3';
import { panel, slider } from '../ui.js';
import { svgDiagram } from '../svg.js';
import { kineticEnergy } from '../math.js';

export function energyDiagram(host, { state, signal }, config) {
  state.speed ??= config.speed;
  state.mass ??= config.mass;
  const { stage, controls, explanation } = panel(host, config);
  const redraw = svgDiagram(stage, 'Kinetic energy rises with the square of speed', (svg, { width, height }) => {
    svg.selectAll('*').remove();
    const margin = { top: 34, right: 18, bottom: 48, left: 52 };
    const x = scaleLinear([0, config.maxSpeed], [margin.left, width - margin.right]);
    const y = scaleLinear([0, kineticEnergy(state.mass, config.maxSpeed)], [height - margin.bottom, margin.top]);
    const grid = svg.append('g').attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(4).tickSize(-(width - margin.left - margin.right)).tickFormat(format(',.0f')));
    grid.attr('font-family', 'inherit');
    grid.select('.domain').remove();
    grid.selectAll('.tick line').attr('stroke', '#d5dae1');
    grid.selectAll('text').attr('font-size', 14).attr('fill', '#526159');
    const axis = svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x).tickValues([0, 50, 100, 150, 200]).tickSize(4));
    axis.attr('font-family', 'inherit');
    axis.selectAll('text').attr('font-size', 14).attr('fill', '#526159');
    axis.selectAll('path,line').attr('stroke', '#9aa3af');
    axis.select('.tick:last-child text').attr('text-anchor', 'end');
    svg.append('text').attr('x', margin.left).attr('y', 18).attr('font-size', 14).attr('fill', '#526159').text('Kinetic energy (kJ)');
    svg.append('text').attr('x', width - margin.right).attr('y', height - 6).attr('text-anchor', 'end').attr('font-size', 14).attr('fill', '#526159').text('Speed (km/h)');
    svg.append('path').datum(range(0, config.maxSpeed + 1, 2)).attr('fill', 'none').attr('stroke', '#1d5fbf').attr('stroke-width', 3)
      .attr('d', line().x((speed) => x(speed)).y((speed) => y(kineticEnergy(state.mass, speed))));
    const reference = kineticEnergy(state.mass, 100);
    svg.append('line').attr('x1', x(100)).attr('x2', x(100)).attr('y1', y(0)).attr('y2', y(reference)).attr('stroke', '#6b7280').attr('stroke-dasharray', '4 4');
    svg.append('circle').attr('cx', x(100)).attr('cy', y(reference)).attr('r', 4).attr('fill', '#6b7280');
    svg.append('circle').attr('cx', x(state.speed)).attr('cy', y(kineticEnergy(state.mass, state.speed))).attr('r', 6).attr('fill', '#1d5fbf').attr('stroke', '#fff').attr('stroke-width', 2);
    const energy = kineticEnergy(state.mass, state.speed);
    explanation.textContent = `${format(',.0f')(energy)} kJ at ${state.speed} km/h — ${(energy / reference).toFixed(2)} times the energy at 100 km/h for the same mass.`;
    host.dataset.energyKj = energy;
  }, signal);
  slider(controls, { label: 'Speed', min: 20, max: config.maxSpeed, step: 5, value: state.speed, format: (v) => `${v} km/h`, signal, onChange: (value) => { state.speed = value; redraw(); } });
  slider(controls, { label: 'Illustrative total mass', min: 1000, max: 1800, step: 50, value: state.mass, format: (v) => `${format(',')(v)} kg`, signal, onChange: (value) => { state.mass = value; redraw(); } });
  return () => {};
}
