import { energyDiagram } from '../../../../interactive/diagrams/energy.js';

export function mount(host, context) {
  return energyDiagram(host, context, {
    title: 'Speed becomes heat',
    description: 'Doubling speed quadruples kinetic energy. Adding 10% mass adds 10% energy. Change either control to compare with the fixed 1,400 kg reference.',
    note: 'E = ½mv²: mass in kg, speed in m/s (km/h ÷ 3.6); 1 kJ = 1,000 J. The masses are illustrative, not measured Boxster specifications. This straight-line calculation leaves out wheel rotation, drag and other losses; it does not predict stopping distance or brake temperature.',
    speed: 100,
    mass: 1400,
    maxSpeed: 200,
  });
}
