import { scaleLinear, axisBottom, axisLeft, line, range, format } from 'd3';
import { panel, slider } from '../ui.js';
import { svgDiagram } from '../svg.js';
import { kineticEnergy } from '../math.js';

export function energyDiagram(host, { state, signal }, config) {
  state.speed ??= config.speed;
  state.mass ??= config.mass;
  const minMass = 1000;
  const maxMass = 1800;
  const referenceMass = config.mass;
  // Keep the scale fixed across mass changes so more mass visibly raises the curve.
  const maxEnergy = kineticEnergy(maxMass, config.maxSpeed);
  const { stage, controls, explanation } = panel(host, config);
  explanation.setAttribute('aria-live', 'polite');
  explanation.setAttribute('aria-atomic', 'true');
  const redraw = svgDiagram(stage, 'Kinetic energy rises with the square of speed', (svg, { width, height }) => {
    svg.selectAll('*').remove();
    const margin = { top: 84, right: 16, bottom: 50, left: 55 };
    const x = scaleLinear([0, config.maxSpeed], [margin.left, width - margin.right]);
    const y = scaleLinear([0, maxEnergy], [height - margin.bottom, margin.top]).nice(3);
    const energy = kineticEnergy(state.mass, state.speed);
    const reference = kineticEnergy(state.mass, 100);
    const summary = `${format(',.0f')(energy)} kJ at ${state.speed} km/h and ${format(',')(state.mass)} kg. ${(energy / reference).toFixed(2)} times the energy at 100 km/h for this mass; ${(state.mass / referenceMass).toFixed(2)} times the energy of ${format(',')(referenceMass)} kg at this speed.`;
    svg.append('title').text('Kinetic energy: speed squared, directly proportional to mass');
    svg.append('desc').text(`${summary} The vertical scale stays fixed. The solid blue curve uses the selected mass; the dashed grey curve always uses ${format(',')(referenceMass)} kg.`);
    const grid = svg.append('g').attr('data-energy-axis', 'energy').attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(y).ticks(3).tickSize(-(width - margin.left - margin.right)).tickFormat(format(',.0f')));
    grid.attr('font-family', 'inherit');
    grid.select('.domain').remove();
    grid.selectAll('.tick line').attr('stroke', '#d5dae1');
    grid.selectAll('text').attr('font-size', 15).attr('fill', '#526159');
    const axis = svg.append('g').attr('data-energy-axis', 'speed').attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(x).tickValues([0, 50, 100, 150, 200]).tickSize(4));
    axis.attr('font-family', 'inherit');
    axis.selectAll('text').attr('font-size', 15).attr('fill', '#526159');
    axis.selectAll('path,line').attr('stroke', '#9aa3af');
    axis.select('.tick:last-child text').attr('text-anchor', 'end');
    svg.append('text').attr('x', 0).attr('y', 18).attr('font-size', 15).attr('fill', '#526159').text('Kinetic energy (kJ) · fixed scale');
    svg.append('text').attr('x', width - margin.right).attr('y', height - 6).attr('text-anchor', 'end').attr('font-size', 15).attr('fill', '#526159').text('Speed (km/h)');
    const legend = (yPosition, colour, dash, label) => {
      svg.append('line').attr('x1', 0).attr('x2', 22).attr('y1', yPosition - 5).attr('y2', yPosition - 5)
        .attr('stroke', colour).attr('stroke-width', 3).attr('stroke-dasharray', dash);
      svg.append('text').attr('x', 30).attr('y', yPosition).attr('font-size', 15).attr('fill', '#526159').text(label);
    };
    legend(42, '#1d5fbf', null, `Selected: ${format(',')(state.mass)} kg`);
    legend(64, '#6b7280', '5 4', `Fixed reference: ${format(',')(referenceMass)} kg`);
    const curve = line().x((speed) => x(speed));
    const samples = range(0, config.maxSpeed + 1, 2);
    svg.append('path').attr('data-energy-curve', 'reference').datum(samples).attr('fill', 'none').attr('stroke', '#6b7280').attr('stroke-width', 2).attr('stroke-dasharray', '5 4')
      .attr('d', curve.y((speed) => y(kineticEnergy(referenceMass, speed))));
    svg.append('path').attr('data-energy-curve', 'selected').datum(samples).attr('fill', 'none').attr('stroke', '#1d5fbf').attr('stroke-width', 3)
      .attr('d', curve.y((speed) => y(kineticEnergy(state.mass, speed))));
    svg.append('line').attr('x1', x(100)).attr('x2', x(100)).attr('y1', y(0)).attr('y2', y(reference)).attr('stroke', '#1d5fbf').attr('opacity', 0.5).attr('stroke-dasharray', '4 4');
    svg.append('circle').attr('cx', x(100)).attr('cy', y(reference)).attr('r', 4).attr('fill', '#1d5fbf');
    svg.append('circle').attr('cx', x(state.speed)).attr('cy', y(energy)).attr('r', 6).attr('fill', '#1d5fbf').attr('stroke', '#fff').attr('stroke-width', 2);
    explanation.textContent = summary;
    host.dataset.energyKj = energy;
  }, signal);
  slider(controls, { label: 'Speed', min: 20, max: config.maxSpeed, step: 5, value: state.speed, format: (v) => `${v} km/h`, signal, onChange: (value) => { state.speed = value; redraw(); } });
  slider(controls, { label: 'Illustrative total mass', min: minMass, max: maxMass, step: 50, value: state.mass, format: (v) => `${format(',')(v)} kg`, signal, onChange: (value) => { state.mass = value; redraw(); } });
  return () => {};
}
