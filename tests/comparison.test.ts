import assert from 'node:assert/strict';
import { test } from 'vite-plus/test';
import { alignBlocks, changedTokens, type ComparisonBlock } from '../scripts/comparison/align';

function block(kind: string, text: string, key = ''): ComparisonBlock {
  return { kind, text, key, section: 'sample', html: '', tokens: text.split(' '), media: [] };
}
test('an inserted figure does not offset following paragraphs in the comparison', () => {
  const a = block('p', 'A seat supports the occupant.'),
    b = block('p', 'The runners set pedal reach.');
  const figure = block('figure', 'The frame and runners.', 'new-drawing');
  const rows = alignBlocks([a, b], [a, figure, b]);
  assert.deepEqual(
    rows.map((row) => row.status),
    ['same', 'added', 'same'],
  );
  assert.equal(rows[2].before, b);
  assert.equal(rows[2].after, b);
});
test('replacement pictures align while unchanged adjacent figures retain their match', () => {
  const a = block('figure', 'The front axle.', 'old-axle'),
    b = block('figure', 'The rear axle.', 'rear');
  const revised = block('figure', 'Front axle with numbered labels.', 'annotated-front');
  const rows = alignBlocks([a, b], [revised, b]);
  assert.deepEqual(
    rows.map((row) => row.status),
    ['changed', 'same'],
  );
});
test('changed image bytes are detected even when the caption remains identical', () => {
  const a = block('figure', 'The pulley arrangement.', 'drive');
  a.media = [{ source: 'old.svg', hash: 'old', alt: 'Accessory pulleys' }];
  const b = { ...a, media: [{ ...a.media[0], hash: 'new' }] };
  assert.equal(alignBlocks([a], [b])[0].status, 'changed');
});
test('chapter-level notes stay after nested sections rather than moving beside the introduction', () => {
  const intro = block('p', 'Introduction');
  const heading = { ...block('heading', 'A nested section', 'sample/section'), section: 'sample/section' };
  const paragraph = { ...block('p', 'The mechanism.'), section: 'sample/section' };
  const drawing = { ...block('figure', 'New cutaway', 'new'), section: 'sample/section' };
  const notes = block('details', 'Notes and sources');
  const rows = alignBlocks([intro, heading, paragraph, notes], [intro, heading, paragraph, drawing, notes]);
  assert.deepEqual(
    rows.map((row) => row.after?.text),
    ['Introduction', 'A nested section', 'The mechanism.', 'New cutaway', 'Notes and sources'],
  );
});
test('word highlights identify inserted and deleted tokens without highlighting common prose', () => {
  assert.deepEqual(changedTokens(['two', 'door', 'airbags'], ['two', 'door', 'head', 'airbags']), {
    before: [],
    after: [2],
  });
  assert.deepEqual(changedTokens(['the', 'S', 'shown', 'below'], ['the', 'S']), { before: [2, 3], after: [] });
});
