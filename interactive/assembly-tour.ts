import { panel, slider } from './ui';

interface TourState {
  progress: number;
  part: string;
  focusPart: boolean;
}
interface TourStage {
  value: number;
  label: string;
  text: string;
  nextLabel?: string;
}
interface TourPart {
  name: string;
  label: string;
  description: string;
  number?: number;
}

let sequence = 0;

/** Shared controls; the caller still owns the retained state and 3D scene. */
export function assemblyTour(
  host: HTMLElement,
  {
    title,
    note,
    stages,
    parts,
    initialPart,
    state,
    signal,
    onChange,
    onRestart,
  }: {
    title: string;
    note: string;
    stages: readonly TourStage[];
    parts: readonly TourPart[];
    initialPart: string;
    state: TourState;
    signal: AbortSignal;
    onChange: (animate: boolean) => void;
    onRestart?: () => void;
  },
) {
  host.classList.add('assembly-tour');
  const { stage, controls, explanation } = panel(host, { title, note });
  state.progress = Number.isFinite(state.progress) ? Math.max(0, Math.min(100, state.progress)) : 0;
  if (!parts.some((part) => part.name === state.part)) state.part = initialPart;
  const selectStage = (stop: TourStage) => {
    state.progress = stop.value;
    state.focusPart = false;
    onChange(true);
  };
  const steps = document.createElement('ol');
  steps.className = 'assembly-stages';
  steps.setAttribute('aria-label', 'Choose a view');
  const stageButtons = stages.map((stop) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = stop.label;
    button.addEventListener('click', () => selectStage(stop), { signal });
    item.append(button);
    steps.append(item);
    return button;
  });
  stage.before(steps);
  const navigation = document.createElement('div');
  navigation.className = 'assembly-navigation';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'assembly-back';
  back.textContent = '← Back';
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'assembly-next';
  navigation.append(back, next);
  controls.append(navigation);
  const progress = slider(controls, {
    label: 'Explore the assembly',
    value: state.progress,
    format: (value) => `${value}%`,
    signal,
    onChange(value) {
      state.progress = value;
      state.focusPart = false;
      onChange(false);
    },
  });
  const detents = document.createElement('datalist');
  detents.id = `assembly-stops-${++sequence}`;
  for (const stop of stages) detents.append(new Option(stop.label, String(stop.value)));
  progress.input.setAttribute('list', detents.id);
  controls.append(detents);
  const caption = document.createElement('div');
  caption.className = 'assembly-caption';
  const current = document.createElement('div');
  current.className = 'assembly-current';
  const count = document.createElement('span');
  const heading = document.createElement('h5');
  current.append(count, heading);
  explanation.before(caption);
  caption.append(current, explanation);
  const inspection = document.createElement('section');
  inspection.className = 'assembly-components';
  const inspectionHeading = document.createElement('h5');
  inspectionHeading.id = `assembly-parts-${sequence}`;
  inspectionHeading.textContent = 'Inspect a component';
  inspection.setAttribute('aria-labelledby', inspectionHeading.id);
  const partRow = document.createElement('div');
  partRow.className = 'assembly-parts component-parts';
  partRow.setAttribute('role', 'group');
  partRow.setAttribute('aria-labelledby', inspectionHeading.id);
  const partButtons = parts.map((part) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = part.label;
    button.dataset.part = part.name;
    if (part.number !== undefined) {
      const number = document.createElement('span');
      number.className = 'component-part-number';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = `${part.number} `;
      button.prepend(number);
    }
    button.addEventListener(
      'click',
      () => {
        state.part = part.name;
        state.progress = stages.at(-1)!.value;
        state.focusPart = true;
        onChange(true);
      },
      { signal },
    );
    partRow.append(button);
    return button;
  });
  inspection.append(inspectionHeading, partRow);
  caption.after(inspection);
  const before = () => [...stages].reverse().find((stop) => stop.value < state.progress);
  const after = () => stages.find((stop) => stop.value > state.progress);
  back.addEventListener(
    'click',
    () => {
      const stop = before();
      if (stop) selectStage(stop);
    },
    { signal },
  );
  next.addEventListener(
    'click',
    () => {
      const stop = after();
      if (stop) selectStage(stop);
      else {
        state.progress = stages[0].value;
        state.part = initialPart;
        state.focusPart = false;
        onRestart?.();
        onChange(true);
      }
    },
    { signal },
  );
  const refresh = () => {
    const index =
      state.progress > stages.at(-2)!.value
        ? stages.length - 1
        : Math.max(0, stages.filter((stop) => stop.value <= state.progress).length - 1);
    const stop = stages[index];
    const selected = parts.find((part) => part.name === state.part)!;
    progress.set(state.progress, false);
    progress.input.setAttribute('aria-valuetext', `${state.progress}% · ${stop.label}`);
    back.disabled = !before();
    const destination = after();
    next.textContent = destination
      ? (destination.nextLabel ?? `See ${destination.label.toLowerCase()} →`)
      : 'Start again ↺';
    count.textContent = `${index + 1} of ${stages.length}`;
    heading.textContent = state.focusPart ? selected.label : stop.label;
    explanation.textContent = state.focusPart ? selected.description : stop.text;
    stageButtons.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
      button.classList.toggle('is-complete', i < index);
    });
    partButtons.forEach((button, i) => {
      button.setAttribute('aria-pressed', String(state.focusPart && parts[i].name === state.part));
    });
  };
  refresh();
  return { stage, explanation, inspection, refresh };
}
