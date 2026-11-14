import state0 from '../../images/intake-state-0.svg?raw';
import state1 from '../../images/intake-state-1.svg?raw';
import state2 from '../../images/intake-state-2.svg?raw';
import { mountStateFigure } from '../../../../interactive/state-figure';
import type { DiagramContext } from '../../../../interactive/types';
export const mount = (host: HTMLElement, context: DiagramContext) =>
  mountStateFigure(host, context, {
    title: 'Two flaps change the intake connections',
    description:
      'Both flaps are closed by vacuum at idle. The distribution flap opens above 3,800 rpm; the tuning flap opens above 5,500 rpm.',
    note: 'Key: 1 centre distributor; 2 three-runner bank modules; 3 oval sleeves and clamps; 4 vacuum units. Visible proportions follow the part photographs. The enlarged flap sections explain the switching states; their internal dimensions and installed axes are illustrative.',
    frames: [state0, state1, state2],
    labels: ['Low range', 'Above 3,800', 'Above 5,500'],
    explanations: [
      'At idle both actuators hold their flaps closed by vacuum. The divided inlet still supplies both banks: these are tuning connections, not the main throttle.',
      'Above 3,800 rpm the distribution actuator is vented and its flap opens. The tuning flap remains closed by vacuum.',
      'Above 5,500 rpm the tuning actuator is also vented. Both tuning connections are open in the published 2.9 upper-range state.',
    ],
  });
