import { line } from 'd3';
import { svgDiagram } from '../../../../interactive/svg.ts';
import { initializeState, type DiagramContext } from '../../../../interactive/types';
import { buttons, panel, slider } from '../../../../interactive/ui.ts';

export function differentialTravel(leftMm: number, rightMm: number) {
  return leftMm - rightMm;
}

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, { leftMm: 25, rightMm: 0 });
  state.leftMm ??= 25;
  state.rightMm ??= 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'The anti-roll bar responds to difference',
    description:
      'Move each wheel relative to a body held level. Positive travel is bump, toward the body; negative travel is rebound.',
    note: 'Functional oblique view, not Boxster geometry. Wheel travel, lever motion and end orientations are illustrative. Symmetric, initially unpreloaded bar; springs, link angles, friction and compliance are omitted. No measured twist angle, force, torque or roll stiffness is calculated.',
  });
  stage.style.height = '590px';
  const redraw = svgDiagram(
    stage,
    'Anti-roll bar: body mounts, lever arms and drop links; compare rotation with torsional twist',
    (svg, { width }) => {
      svg.selectAll('*').remove();
      svg
        .append('desc')
        .text(
          'The central shaft is supported by two body-mounted bushes. Each lever arm connects through a separate drop link to moving suspension. The inset compares both shaft ends from the same direction: matching orientations mean no added twist; a separation means added twist. Force arrows show only the bar’s resisting directions on the suspension.',
        );
      const diagramWidth = Math.min(width, 460);
      const drawing = svg.append('g').attr('transform', `translate(${(width - diagramWidth) / 2},0)`);
      const centreX = diagramWidth / 2;
      const leftX = 47;
      const rightX = diagramWidth - 81;
      const barY = 128;
      const armTip = (x: number, travel: number): [number, number] => [x + 28 * Math.cos(travel * 0.018), 198 - travel];
      const leftTip = armTip(leftX, state.leftMm);
      const rightTip = armTip(rightX, state.rightMm);
      const diff = differentialTravel(state.leftMm, state.rightMm);
      const colour = Math.abs(diff) < 0.01 ? '#637a6e' : '#a6552b';
      const text = (x: number, y: number, content: string | number, size = 16, fill = '#273e35') =>
        drawing
          .append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('font-size', size)
          .attr('fill', fill)
          .text(content);
      const path = (points: readonly (readonly number[])[], stroke: string, sw = 4) =>
        drawing
          .append('path')
          .attr('d', line<readonly number[]>()(points))
          .attr('fill', 'none')
          .attr('stroke', stroke)
          .attr('stroke-width', sw)
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round');
      const joint = (x: number, y: number) =>
        drawing
          .append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 4)
          .attr('fill', '#faf8f1')
          .attr('stroke', '#273e35')
          .attr('stroke-width', 2);
      const arrow = (x: number, y: number, down: boolean) => {
        const end = y + (down ? 19 : -19);
        path(
          [
            [x, y + (down ? -19 : 19)],
            [x, end],
          ],
          '#a6552b',
          3,
        );
        path(
          [
            [x - 5, end + (down ? -7 : 7)],
            [x, end],
            [x + 5, end + (down ? -7 : 7)],
          ],
          '#a6552b',
          3,
        );
      };

      text(centreX, 23, 'Body held level', 18);
      text(centreX, 47, 'Bushes allow bar rotation');
      path(
        [
          [27, 72],
          [diagramWidth - 27, 72],
        ],
        '#273e35',
        10,
      );
      const mountXs = [leftX + 40, rightX - 22];
      for (const x of mountXs)
        path(
          [
            [x, 77],
            [x, barY - 11],
          ],
          '#82988d',
          6,
        );
      // The shaft stays on its body-mounted axis; its end arms turn about that axis.
      path(
        [
          [leftX, barY],
          [rightX, barY],
        ],
        colour,
        9,
      );
      for (const x of mountXs) {
        drawing
          .append('rect')
          .attr('x', x - 9)
          .attr('y', barY - 12)
          .attr('width', 18)
          .attr('height', 24)
          .attr('rx', 5)
          .attr('fill', '#faf8f1')
          .attr('stroke', '#273e35')
          .attr('stroke-width', 2);
        path(
          [
            [x - 5, barY],
            [x + 5, barY],
          ],
          colour,
          7,
        );
      }
      text(centreX, 111, 'Torsion section');
      path(
        [
          [centreX, 115],
          [centreX, 121],
        ],
        '#82988d',
        1.5,
      );
      for (const [x, tip] of [
        [leftX, leftTip],
        [rightX, rightTip],
      ] as const) {
        path([[x, barY], tip], colour, 7);
        path([tip, [tip[0], tip[1] + 70]], '#273e35', 3);
        joint(...tip);
        joint(tip[0], tip[1] + 70);
        drawing
          .append('rect')
          .attr('x', tip[0] - 15)
          .attr('y', tip[1] + 55)
          .attr('width', 30)
          .attr('height', 50)
          .attr('rx', 7)
          .attr('fill', '#273e35');
        drawing
          .append('circle')
          .attr('cx', tip[0])
          .attr('cy', tip[1] + 70)
          .attr('r', 5)
          .attr('fill', '#faf8f1');
      }
      text(centreX, 185, 'Lever arms');
      path(
        [
          [centreX - 44, 180],
          [(leftX + leftTip[0]) / 2 + 5, (barY + leftTip[1]) / 2],
        ],
        '#82988d',
        1.5,
      );
      path(
        [
          [centreX + 44, 180],
          [(rightX + rightTip[0]) / 2 - 5, (barY + rightTip[1]) / 2],
        ],
        '#82988d',
        1.5,
      );
      text(centreX, 232, 'Drop links');
      path(
        [
          [centreX - 42, 238],
          [leftTip[0] + 7, 238],
        ],
        '#82988d',
        1.5,
      );
      path(
        [
          [centreX + 42, 238],
          [rightTip[0] - 7, 238],
        ],
        '#82988d',
        1.5,
      );
      const signed = (value: number) => `${value > 0 ? '+' : ''}${value}`;
      text(leftX + 28, 350, `Left ${signed(state.leftMm)} mm`);
      text(rightX + 28, 350, `Right ${signed(state.rightMm)} mm`);
      if (diff !== 0) {
        arrow(leftTip[0] - 29, leftTip[1] + 80, diff > 0);
        arrow(rightTip[0] + 29, rightTip[1] + 80, diff < 0);
      }
      text(centreX, 374, diff === 0 ? 'No added bar force in this ideal case' : 'Arrows: bar force on suspension');
      path(
        [
          [14, 393],
          [diagramWidth - 14, 393],
        ],
        '#c2cbc5',
        1,
      );

      // Overlay both end orientations as seen from ONE direction along the shaft.
      // The visual angles are deliberately exaggerated, not a kinematic solution.
      text(centreX, 421, 'Compare both bar ends');
      text(centreX, 443, 'Same viewing direction along the shaft', 15);
      const dialY = 493;
      drawing
        .append('circle')
        .attr('cx', centreX)
        .attr('cy', dialY)
        .attr('r', 35)
        .attr('fill', 'none')
        .attr('stroke', '#c2cbc5')
        .attr('stroke-width', 2);
      path(
        [
          [centreX, dialY],
          [centreX, dialY + 35],
        ],
        '#82988d',
        2,
      ).attr('stroke-dasharray', '4 4');
      const spoke = (travel: number, stroke: string, length: number, sw?: number) => {
        const angle = Math.PI / 2 + travel * 0.018;
        path(
          [
            [centreX, dialY],
            [centreX + length * Math.cos(angle), dialY + length * Math.sin(angle)],
          ],
          stroke,
          sw,
        );
      };
      spoke(state.leftMm, '#273e35', 35, 6);
      spoke(state.rightMm, '#a6552b', 27, 3);
      text(centreX - 104, 478, 'Left end');
      path(
        [
          [centreX - 123, 491],
          [centreX - 85, 491],
        ],
        '#273e35',
        6,
      );
      text(centreX + 104, 478, 'Right end');
      path(
        [
          [centreX + 85, 491],
          [centreX + 123, 491],
        ],
        '#a6552b',
        3,
      );
      text(centreX, 553, `${Math.abs(diff)} mm wheel-travel difference`, 18);
      text(centreX, 575, diff === 0 ? 'Ends match: no added twist' : 'Ends differ: added torsional twist');
      explanation.textContent =
        diff === 0
          ? `${state.leftMm === 0 ? 'Both wheels are at the zero-travel reference; there is no added rotation or twist.' : `Equal ${signed(state.leftMm)} mm travel turns both arms together: the bar rotates in its body bushes without added torsional twist.`} The individual road springs still respond to body-relative travel. The dashed inset line marks the zero-travel orientation.`
          : `The wheels differ by ${Math.abs(diff)} mm. ${state.leftMm * state.rightMm > 0 ? 'Even movement in the same direction adds twist when the amounts differ. ' : ''}The drop links turn the lever arms differently, twisting the shaft. The bar pushes down on the ${diff > 0 ? 'left' : 'right'} suspension and up on the ${diff > 0 ? 'right' : 'left'}, opposing the difference. Arrows give direction only; the dashed inset line is the zero-travel reference.`;
      Object.assign(host.dataset, {
        leftTravelMm: state.leftMm,
        rightTravelMm: state.rightMm,
        differentialTravelMm: diff,
        barTwistInputMm: Math.abs(diff),
      });
    },
    signal,
  );
  const left = slider(controls, {
    label: 'Left wheel bump travel',
    min: -30,
    max: 30,
    value: state.leftMm,
    format: (v) => `${v} mm`,
    signal,
    onChange: (value) => {
      state.leftMm = value;
      redraw();
    },
  });
  const right = slider(controls, {
    label: 'Right wheel bump travel',
    min: -30,
    max: 30,
    value: state.rightMm,
    format: (v) => `${v} mm`,
    signal,
    onChange: (value) => {
      state.rightMm = value;
      redraw();
    },
  });
  const preset = (l: number, r: number) => {
    state.leftMm = l;
    state.rightMm = r;
    left.set(l, false);
    right.set(r, false);
    redraw();
  };
  buttons(
    controls,
    [
      { label: 'Both wheels rise', action: () => preset(25, 25) },
      { label: 'Left wheel only', action: () => preset(25, 0) },
      { label: 'Opposite movement', action: () => preset(30, -30) },
    ],
    signal,
  );
  return () => {};
}
