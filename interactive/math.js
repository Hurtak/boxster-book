export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const segment = (value, start, end) => clamp((value - start) / (end - start));
export const smooth = (value) => value * value * (3 - 2 * value);

export function kineticEnergy(massKg, speedKmh) {
  if (!Number.isFinite(massKg) || massKg <= 0 || !Number.isFinite(speedKmh) || speedKmh < 0) {
    throw new RangeError('Mass must be positive and speed must be non-negative.');
  }
  return 0.5 * massKg * (speedKmh / 3.6) ** 2 / 1000;
}

export function sampleTimeline(progress, frames) {
  const value = clamp(progress, frames[0].at, frames.at(-1).at);
  const right = frames.findIndex((frame) => frame.at >= value);
  if (right <= 0) return { position: [...frames[0].position], target: [...frames[0].target] };
  const before = frames[right - 1];
  const after = frames[right];
  const t = smooth(segment(value, before.at, after.at));
  const interpolate = (key) => before[key].map((number, i) => number + (after[key][i] - number) * t);
  return { position: interpolate('position'), target: interpolate('target') };
}
