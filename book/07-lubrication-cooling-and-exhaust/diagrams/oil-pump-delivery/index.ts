import state0 from '../../images/oil-overlap-0.svg?raw';
import state1 from '../../images/oil-overlap-1.svg?raw';
import { mountStateFigure } from '../../../../interactive/state-figure';
import type { DiagramContext } from '../../../../interactive/types';
export const mount = (host: HTMLElement, context: DiagramContext) =>
  mountStateFigure(host, context, {
    title: 'Why the oil pump can deliver less',
    description:
      'A hydraulic pressure difference moves one gear axially. Reduced engaged tooth width reduces displacement while mechanical drive continues.',
    note: 'Key: 1 control piston; 2 sliding gear; 3 spring piston and spring. Blue is the pump-pressure connection, green the regulated side; the brown dashed line is the electrical command. This enlarged pressure section follows the factory principle drawing. Housing, internal oil passages and travel are schematic; the four scavenge sections are omitted.',
    frames: [state0, state1],
    labels: ['More overlap', 'Less overlap'],
    explanations: [
      'More engaged tooth width gives a greater displacement per revolution. Both gears turn, with the crankshaft supplying the mechanical drive; the valve controls the hydraulic force on the sliding assembly.',
      'The lower gear and its pistons move along their axis, changing the spring compression. The smaller engaged width reduces displacement per revolution while both gears remain mechanically driven.',
    ],
  });
