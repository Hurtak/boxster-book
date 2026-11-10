import { energyDiagram } from '../../../../interactive/diagrams/energy.js';

export function mount(host, context) {
  return energyDiagram(host, context, {
    title: 'Speed becomes heat',
    description: 'Change speed and mass to see the energy the car carries before braking.',
    note: 'E = ½mv². This is an illustrative energy calculation, not a stopping-distance or brake-temperature prediction.',
    speed: 100,
    mass: 1400,
    maxSpeed: 200,
  });
}
