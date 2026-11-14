import { initializeState, type DiagramContext } from '../../../../interactive/types';
import { buttons, panel } from '../../../../interactive/ui';
import { carPlan, dashboardDetail, doorDetail, packages, rearDetail } from './drawing';

export function mount(host: HTMLElement, { state: saved, signal }: DiagramContext) {
  const state = initializeState(saved, { selected: 0 });
  state.selected = Number.isFinite(state.selected) ? Math.max(0, Math.min(2, Math.trunc(state.selected))) : 0;
  const { stage, controls, explanation } = panel(host, {
    title: 'Locate the speaker package',
    description: 'Compare the dashboard, each door and the space behind the seats. The details below are enlarged.',
    note: 'Car footprint follows catalogue dimensions. Speaker housings and locations are photo-guided; hidden geometry and mounting positions are illustrative. Sources: Porsche UK 01/10 pp. 82, 87–89 and PET 911-005.',
  });
  // The selector must stay still when BOSE adds the rear-enclosure detail.
  host.insertBefore(controls, stage);
  stage.classList.add('state-figure-stage');
  const draw = () => {
    const p = packages[state.selected];
    const title = document.createElement('p');
    title.textContent = p.title;
    Object.assign(title.style, { fontWeight: '600', margin: '0 0 8px' });
    const plan = document.createElement('div');
    plan.innerHTML = carPlan(p.key);
    Object.assign(plan.querySelector('svg')!.style, { width: '100%', height: 'auto', display: 'block' });
    const details = document.createElement('div');
    Object.assign(details.style, {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,190px),1fr))',
      gap: '16px',
    });
    const regions = [
      {
        id: 'dashboard',
        title: `1 · Dashboard · ${p.counts[0]} speakers`,
        image: dashboardDetail(p.key),
        copy: p.dashboard,
      },
      {
        id: 'doors',
        title: `2 · Each door · ${p.counts[1] / 2} speaker${p.counts[1] === 2 ? '' : 's'}`,
        image: doorDetail(p.key),
        copy: p.door,
      },
      ...(p.key === 'bose' ? [{ id: 'rear', title: '3 · Rear · 4 speakers', image: rearDetail(), copy: p.rear }] : []),
    ];
    for (const region of regions) {
      const section = document.createElement('div');
      section.dataset.speakerRegion = region.id;
      section.style.minWidth = '0';
      const heading = document.createElement('p');
      heading.textContent = region.title;
      Object.assign(heading.style, { fontWeight: '600', margin: '0 0 8px' });
      const image = document.createElement('div');
      image.innerHTML = region.image;
      Object.assign(image.querySelector('svg')!.style, { width: '100%', height: '175px', display: 'block' });
      const description = document.createElement('p');
      description.textContent = region.copy;
      description.style.margin = '8px 0 0';
      section.append(heading, image, description);
      details.append(section);
    }
    stage.replaceChildren(title, plan, details);
    explanation.textContent = `${p.counts[0]} dashboard + ${p.counts[1]} door + ${p.counts[2]} rear = ${p.counts.reduce((sum: number, count) => sum + count, 0)} physical loudspeakers. ${p.output}. ${p.key === 'bose' ? 'Four rear drivers share one enclosure; eleven speakers do not imply eleven amplifier channels.' : p.rear}`;
    options.querySelectorAll('button').forEach((button, i) => {
      button.setAttribute('aria-pressed', String(i === state.selected));
    });
    host.dataset.mechanismState = String(state.selected);
    host.dataset.speakerCounts = p.counts.join(',');
  };
  const options = buttons(
    controls,
    packages.map((p, selected) => ({
      label: p.label,
      action: () => {
        state.selected = selected;
        draw();
      },
    })),
    signal,
  );
  draw();
}
