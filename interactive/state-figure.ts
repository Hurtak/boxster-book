import { initializeState, type DiagramContext } from './types';
import { buttons, panel } from './ui';
let sequence = 0;

/** Discrete mechanisms with a full text explanation and a shared static fallback. */
export function mountStateFigure(
  host: HTMLElement,
  { state: saved, signal }: DiagramContext,
  configuration: {
    title: string;
    description: string;
    note: string;
    frames: readonly string[];
    labels: readonly string[];
    explanations: readonly string[];
  },
) {
  const { frames, labels, explanations, ...copy } = configuration;
  if (!frames.length || frames.length !== labels.length || labels.length !== explanations.length)
    throw Error('Each mechanism state needs a drawing, label and explanation');
  const state = initializeState(saved, { selected: 0 });
  state.selected = Number.isFinite(state.selected)
    ? Math.max(0, Math.min(frames.length - 1, Math.trunc(state.selected)))
    : 0;
  const { stage, controls, explanation } = panel(host, copy);
  const prefix = `mechanism-${++sequence}-`;
  stage.classList.add('state-figure-stage');
  const draw = () => {
    const ids = new Map(
      [...frames[state.selected].matchAll(/\bid="([^"]+)"/g)].map((match) => [match[1], prefix + match[1]]),
    );
    stage.innerHTML = frames[state.selected]
      .replace(/\bid="([^"]+)"/g, (_, id: string) => `id="${ids.get(id)}"`)
      .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${ids.get(id) ?? id})`)
      .replace(
        /aria-labelledby="([^"]+)"/g,
        (_, value: string) =>
          `aria-labelledby="${value
            .split(/\s+/)
            .map((id) => ids.get(id) ?? id)
            .join(' ')}"`,
      );
    explanation.textContent = explanations[state.selected];
    options.querySelectorAll('button').forEach((button, i) => {
      button.setAttribute('aria-pressed', String(i === state.selected));
    });
    host.dataset.mechanismState = String(state.selected);
  };
  const options = buttons(
    controls,
    labels.map((label, selected) => ({
      label,
      action: () => {
        state.selected = selected;
        draw();
      },
    })),
    signal,
  );
  draw();
}
