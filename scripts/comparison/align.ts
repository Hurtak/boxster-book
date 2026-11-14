export interface ComparisonBlock {
  kind: string;
  key: string;
  section: string;
  html: string;
  text: string;
  tokens: string[];
  media: { source: string; hash: string; alt: string }[];
}
export interface ComparisonRow {
  before?: ComparisonBlock;
  after?: ComparisonBlock;
  status: 'same' | 'changed' | 'added' | 'removed';
}
const normal = (value: string) =>
  value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim();
const words = (value: string) => new Set(normal(value).split(/\s+/));
function similarity(a: string, b: string) {
  const left = words(a),
    right = words(b);
  return (
    [...left].filter((word) => right.has(word)).length /
    Math.max(1, left.size + right.size - [...left].filter((word) => right.has(word)).length)
  );
}
function score(a: ComparisonBlock, b: ComparisonBlock) {
  if (a.section !== b.section) return -100;
  if (a.kind !== b.kind) return -12;
  if (a.key && a.key === b.key) return 18;
  if (a.text && normal(a.text) === normal(b.text)) return 14;
  const overlap = similarity(a.text, b.text);
  if (overlap > 0.35) return 4 + overlap * 5;
  // A replacement figure at the same place can still compare two different media.
  return a.kind === 'figure' ? 1 : -7;
}
export function sameBlock(a: ComparisonBlock, b: ComparisonBlock) {
  return (
    a.kind === b.kind &&
    a.text === b.text &&
    a.media.length === b.media.length &&
    a.media.every((m, i) => m.hash === b.media[i].hash && m.alt === b.media[i].alt)
  );
}
/** Sequence alignment within a heading, so an inserted figure cannot shift later prose. */
export function alignBlocks(before: ComparisonBlock[], after: ComparisonBlock[]): ComparisonRow[] {
  const gap = -3;
  const matrix = Array.from({ length: before.length + 1 }, () => new Float64Array(after.length + 1));
  for (let i = 1; i <= before.length; i++) matrix[i][0] = i * gap;
  for (let j = 1; j <= after.length; j++) matrix[0][j] = j * gap;
  for (let i = 1; i <= before.length; i++)
    for (let j = 1; j <= after.length; j++)
      matrix[i][j] = Math.max(
        matrix[i - 1][j - 1] + score(before[i - 1], after[j - 1]),
        matrix[i - 1][j] + gap,
        matrix[i][j - 1] + gap,
      );
  const rows: ComparisonRow[] = [];
  let i = before.length,
    j = after.length;
  while (i || j) {
    if (i && j && Math.abs(matrix[i][j] - (matrix[i - 1][j - 1] + score(before[i - 1], after[j - 1]))) < 0.00001) {
      const a = before[--i],
        b = after[--j];
      rows.push({ before: a, after: b, status: sameBlock(a, b) ? 'same' : 'changed' });
    } else if (i && (!j || matrix[i][j] === matrix[i - 1][j] + gap))
      rows.push({ before: before[--i], status: 'removed' });
    else rows.push({ after: after[--j], status: 'added' });
  }
  return rows.reverse();
}
/** LCS returns unmatched token positions, preserving punctuation and inline emphasis. */
export function changedTokens(before: string[], after: string[]) {
  const matrix = Array.from({ length: before.length + 1 }, () => new Uint32Array(after.length + 1));
  for (let i = before.length - 1; i >= 0; i--)
    for (let j = after.length - 1; j >= 0; j--)
      matrix[i][j] = before[i] === after[j] ? 1 + matrix[i + 1][j + 1] : Math.max(matrix[i + 1][j], matrix[i][j + 1]);
  const left = new Set(before.map((_, i) => i)),
    right = new Set(after.map((_, i) => i));
  let i = 0,
    j = 0;
  while (i < before.length && j < after.length) {
    if (before[i] === after[j]) {
      left.delete(i++);
      right.delete(j++);
    } else if (matrix[i + 1][j] >= matrix[i][j + 1]) i++;
    else j++;
  }
  return { before: [...left], after: [...right] };
}
