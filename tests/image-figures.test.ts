import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { test } from 'vite-plus/test';
import { Assets, ImageSizes } from '../src/book/context';
import { AnnotatedFigure, ComparisonImage, ImageComparison } from '../src/book/ImageFigures';
import { Figure } from '../src/book/Figure';
import { DimensionedFigure } from '../src/book/DimensionedFigure';

const asset = 'book-asset:chapter/photo.jpg';
function render(element: Parameters<typeof renderToString>[0]) {
  return renderToString(
    createElement(
      Assets.Provider,
      { value: { [asset]: '/original-photo.jpg' } },
      createElement(ImageSizes.Provider, { value: { [asset]: { width: 1200, height: 800 } } }, element),
    ),
  );
}
test('comparison figures render independent original images and selectable labels without JavaScript', () => {
  const panels = ['Earlier front', 'Revised front', 'Earlier rear', 'Revised rear'].map((label, i) =>
    createElement(ComparisonImage, {
      key: label,
      src: asset,
      alt: label,
      label,
      note: 'Visible distinction',
      mirrored: i === 0,
    }),
  );
  const html = render(
    createElement(
      ImageComparison,
      {
        title: 'Facelift comparison',
        stackOnPhone: true,
        alt: 'Four photographs',
      },
      ...panels,
      createElement('p', { key: 'credit' }, 'Photo credit'),
    ),
  );
  assert.match(html, /class="image-comparison is-stacked-on-phone"/);
  assert.equal((html.match(/<img /g) ?? []).length, 4);
  assert.equal((html.match(/src="\/original-photo.jpg"/g) ?? []).length, 4);
  assert.equal((html.match(/data-mirrored="true"/g) ?? []).length, 1);
  assert.match(html, /<figcaption>Photo credit<\/figcaption>/);
  for (const label of ['Earlier front', 'Revised front', 'Earlier rear', 'Revised rear'])
    assert.ok(html.includes(label));
  assert.doesNotMatch(html, /<svg|data:image/);
});
test('numbered overlays remain separate from their original image and have a readable annotation key', () => {
  const html = render(
    createElement(AnnotatedFigure, {
      title: 'Cutaway',
      src: asset,
      alt: 'Assembly cutaway',
      annotations: [
        { id: '1', label: 'Clutch', x: 25, y: 40 },
        { id: '7', label: 'Original factory callout' },
      ],
    }),
  );
  assert.match(html, /src="\/original-photo.jpg"/);
  assert.match(html, /class="image-marker"[^>]*style="left:25%;top:40%"/);
  assert.equal((html.match(/class="image-marker"/g) ?? []).length, 1);
  assert.match(html, /aria-label="Image annotations"/);
  assert.ok(html.includes('Clutch') && html.includes('Original factory callout'));
});
test('comparison panels keep their numbered overlays independent and readable without JavaScript', () => {
  const html = render(
    createElement(
      ImageComparison,
      { title: 'Two assembly views', alt: 'Face and section' },
      ...[25, 75].map((x) =>
        createElement(ComparisonImage, {
          key: x,
          src: asset,
          alt: 'Original part view',
          label: `View ${x}`,
          note: 'Component detail',
          annotations: [{ id: '1', label: 'Disc face', x, y: 40 }],
        }),
      ),
      createElement('p', null, '1. Disc face'),
    ),
  );
  assert.equal((html.match(/src="\/original-photo.jpg"/g) ?? []).length, 2);
  assert.equal((html.match(/class="image-marker"/g) ?? []).length, 2);
  assert.match(html, /style="left:25%;top:40%"/);
  assert.match(html, /style="left:75%;top:40%"/);
  assert.match(html, /<figcaption>1. Disc face<\/figcaption>/);
  assert.doesNotMatch(html, /<svg|data:image/);
});
test('layout crops reserve their aspect ratio and position the original pixels instead of exporting another image', () => {
  const html = render(
    createElement(Figure, { src: asset, alt: 'Detail', crop: { x: 300, y: 200, width: 600, height: 400 } }),
  );
  assert.match(html, /aspect-ratio:600 \/ 400/);
  assert.match(html, /src="\/original-photo.jpg"/);
  assert.match(html, /width:200%;left:-50%;top:-50%/);
  assert.match(html, /width="1200" height="800"/);
});
test('dimension lines and labels share source coordinates while the photograph stays an independent image', () => {
  const html = render(
    createElement(DimensionedFigure, {
      src: asset,
      alt: 'Car side',
      title: 'Wheelbase',
      inset: { top: 0, right: 100, bottom: 200, left: 100 },
      dimensions: [
        {
          label: '2,415 mm',
          axis: 'horizontal',
          from: [200, 500],
          to: [1000, 500],
          at: 850,
          labelAt: [600, 900],
        },
      ],
    }),
  );
  assert.equal((html.match(/<img /g) ?? []).length, 1);
  assert.match(html, /src="\/original-photo.jpg"/);
  assert.match(html, /aspect-ratio:1400 \/ 1000/);
  assert.match(html, /viewBox="-100 0 1400 1000"/);
  assert.match(html, /M200 500V850 M1000 500V850 M200 850H1000/);
  assert.match(html, /class="dimension-label" style="left:50%;top:90%"/);
  assert.match(html, /2,415 mm/);
  assert.doesNotMatch(html, /<image |data:image/);
});
