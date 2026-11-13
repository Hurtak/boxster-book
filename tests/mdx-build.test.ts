import { compile, run } from '@mdx-js/mdx';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import * as jsx from 'react/jsx-runtime';
import { test } from 'vite-plus/test';
import { buildBook, root } from '../scripts/build';
import { inlineCss, resourceBytes } from '../scripts/mdx/assets';
import { compilerOptions } from '../scripts/mdx/compiler';
import { discoverBook, resolveBookLink } from '../scripts/mdx/inventory';
import { Diagram, Figure, SourceNotes, SourceReference } from '../src/book/components';

async function fixture(files: Record<string, string>, work: (source: string) => Promise<void>) {
  const folder = await mkdtemp(resolve(tmpdir(), 'boxster-mdx-test-'));
  try {
    for (const [name, source] of Object.entries(files)) {
      const path = resolve(folder, name);
      await mkdir(resolve(path, '..'), { recursive: true });
      await writeFile(path, source);
    }
    await work(folder);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
}
test('all MDX chapters compile with their current chapter and section routes', async () => {
  const contract = JSON.parse(await readFile(resolve(root, 'tests/fixtures/manuscript-baseline.json'), 'utf8'));
  const book = await discoverBook(resolve(root, 'book'), root);
  assert.equal(book.chapters.length, contract.chapters.length);
  for (let i = 0; i < book.chapters.length; i++) {
    const chapter = book.chapters[i],
      before = contract.chapters[i];
    assert.ok(chapter.file.endsWith('/index.mdx'));
    assert.equal(chapter.id, before.id);
    assert.equal(chapter.noteCount, before.notes.length);
    assert.deepEqual(
      chapter.headings.map((h) => h.id),
      before.headings.map((h: { id: string }) => h.id),
    );
    assert.deepEqual(chapter.diagrams, before.diagrams);
    await compile({ path: chapter.file, value: await readFile(chapter.file, 'utf8') }, compilerOptions(book));
  }
});
test('GFM tables, repeated notes, captions and chapter links compile with clean routes', async () => {
  await fixture(
    {
      '01-sample/index.mdx': `# Sample

Intro[^one], repeated[^one], then another[^two]. [Details](index.mdx#details).

## Details

| Feature | Value |
| --- | --- |
| Engine | 2.9 |

<Figure src="data:image/svg+xml;base64,PHN2Zy8+" alt="Separate visual description">

Caption with **detail** and [credit](https://example.com).

</Figure>

[^one]: First source.
[^two]: Second source.
`,
    },
    async (source) => {
      const book = await discoverBook(source, root),
        chapter = book.chapters[0];
      const code = await compile(
        { path: chapter.file, value: await readFile(chapter.file, 'utf8') },
        { ...compilerOptions(book), outputFormat: 'function-body' },
      );
      const module = await run(String(code), jsx);
      const html = renderToString(
        createElement(module.default, {
          components: { Figure, Diagram, SourceNotes, SourceReference },
        }),
      );
      assert.match(html, /<table>/);
      assert.match(html, /<td>2\.9<\/td>/);
      assert.match(html, /alt="Separate visual description"/);
      assert.match(
        html,
        /<figcaption>Caption with <strong>detail<\/strong> and <a href="https:\/\/example.com">credit<\/a>\.<\/figcaption>/,
      );
      assert.match(html, /id="sample\/sources\/one"/);
      assert.match(html, /id="sample\/sources\/one\/2"/);
      assert.match(html, /id="sample\/sources\/two"/);
      assert.equal((html.match(/First source\./g) || []).length, 2);
      for (const route of ['one/1', 'one/2', 'two/1']) assert.ok(html.includes(`href="#sample/references/${route}"`));
      assert.match(html, /<details[^>]*class="chapter-notes"[^>]*>/);
      assert.doesNotMatch(html, /<details[^>]* open/);
      assert.equal(resolveBookLink('index.mdx#details', chapter, book), '#sample/details');
      assert.throws(() => resolveBookLink('index.md#details', chapter, book), /Unknown chapter link/);
    },
  );
});
test('invalid authoring fails with actionable chapter, heading, diagram and note errors', async () => {
  const cases: [Record<string, string>, RegExp][] = [
    [{ '01-one/index.mdx': '# One', '01-two/index.mdx': '# Two' }, /positive and unique/],
    [{ '01-one/index.mdx': '# One', '01-one/index.md': '# One' }, /exactly one/],
    [{ '01-one/index.mdx': '# One\n\n[Bad](../02-no/index.md)' }, /Unknown chapter link/],
    [{ '01-one/index.mdx': '# One\n\n[Bad](#missing)' }, /Unknown chapter heading/],
    [
      {
        '01-one/index.mdx': '# One\n\n<Diagram id="missing" poster={poster} alt="An explanation" />',
      },
      /Missing diagram module/,
    ],
    [{ '01-one/index.mdx': '# One\n\n<Figure src={image} alt="" />' }, /non-empty literal alt/],
    [{ '01-one/index.mdx': '# One\n\nBroken[^missing].' }, /Unresolved footnote/],
  ];
  for (const [files, pattern] of cases)
    await fixture(files, async (source) => {
      await assert.rejects(discoverBook(source, root), pattern);
    });
});
test('chapter, section, source and diagram routes are readable and independent of citation order', async () => {
  await fixture(
    {
      'routes.json': JSON.stringify({ '01-one': 'brakes', '02-two': 'roof' }),
      '01-one/index.mdx': `# A long chapter title

Second[^second], first[^first], repeated[^first].
[Local](#new-topic). [Roof](../02-two/index.mdx#topic). [Direct](#roof/topic).
[Sources](#sources). [Diagram](#diagram/caliper-pressure).

## New topic

### Other 2.9 model years

<Diagram id="caliper-pressure" poster="data:image/svg+xml;base64,PHN2Zy8+" alt="Caliper section" />

[^first]: First source.
[^second]: Second source.
`,
      '01-one/diagrams/caliper-pressure/index.ts': 'export function mount() {}',
      '02-two/index.mdx': '# Two\n\n## Topic\n\nThird[^first].\n\n[^first]: Third source.\n',
    },
    async (source) => {
      const before = await discoverBook(source, root),
        chapter = before.chapters[0];
      assert.equal(chapter.id, 'brakes');
      assert.deepEqual(
        chapter.headings.map((h) => h.id),
        ['brakes/new-topic', 'brakes/other-2-9-model-years'],
      );
      assert.equal(resolveBookLink('../02-two/index.mdx#topic', chapter, before), '#roof/topic');
      assert.equal(resolveBookLink('#roof/topic', chapter, before), '#roof/topic');
      assert.equal(resolveBookLink('#other-2.9-model-years', chapter, before), '#brakes/other-2-9-model-years');
      assert.equal(resolveBookLink('#sources', chapter, before), '#brakes/sources');
      assert.equal(resolveBookLink('#diagram/caliper-pressure', chapter, before), '#brakes/diagram/caliper-pressure');
      const destinations = before.destinations.get(chapter.file)!;
      assert.deepEqual(destinations, [
        { id: 'brakes/sources/second', reference: 'brakes/references/second/1' },
        { id: 'brakes/sources/first', reference: 'brakes/references/first/1' },
        { id: 'brakes/sources/first/2', reference: 'brakes/references/first/2' },
      ]);
      const code = await compile(
        { path: chapter.file, value: await readFile(chapter.file, 'utf8') },
        { ...compilerOptions(before), outputFormat: 'function-body' },
      );
      const module = await run(String(code), jsx);
      const html = renderToString(
        createElement(module.default, { components: { Diagram, SourceReference, SourceNotes } }),
      );
      assert.match(html, /id="brakes\/diagram\/caliper-pressure"/);
      assert.match(html, /id="brakes\/sources"/);
      assert.match(html, /href="#brakes\/sources\/first" id="brakes\/references\/first\/1"[^>]*><sup>2<\/sup>/);
      assert.doesNotMatch(html, /book__|index\.md|data-fragment-target|id="fn(?:ref)?\d+"/);
      await writeFile(
        chapter.file,
        (await readFile(chapter.file, 'utf8'))
          .replace('# A long chapter title', '# A revised title')
          .replace(
            'Second[^second], first[^first], repeated[^first]',
            'First[^first], repeated[^first], second[^second]',
          ),
      );
      const after = await discoverBook(source, root);
      assert.equal(after.chapters[0].id, 'brakes', 'Title changes do not rename chapter routes');
      assert.deepEqual(after.destinations.get(chapter.file), [destinations[1], destinations[2], destinations[0]]);
      assert.deepEqual(
        after.destinations.get(after.chapters[1].file),
        before.destinations.get(before.chapters[1].file),
      );
    },
  );
});
test('invalid, missing, reserved and conflicting routes fail before rendering', async () => {
  const cases: [Record<string, string>, RegExp][] = [
    [{ '01-one': 'same', '02-two': 'same' }, /Duplicate heading/],
    [{ '01-one': 'Bad Slug' }, /Invalid chapter route/],
    [{ '01-one': 'title' }, /Reserved chapter route/],
    [{ '03-missing': 'missing' }, /Chapter route has no chapter/],
  ];
  for (const [routes, pattern] of cases)
    await fixture(
      {
        'routes.json': JSON.stringify(routes),
        '01-one/index.mdx': '# One',
        '02-two/index.mdx': '# Two',
      },
      async (source) => {
        await assert.rejects(discoverBook(source, root), pattern);
      },
    );
  await fixture({ '01-one/index.mdx': '# One\n\n## Sources' }, async (source) => {
    await assert.rejects(discoverBook(source, root), /Reserved heading route/);
  });
  await fixture(
    { '01-one/index.mdx': '# One\n\nText[^one.two] and [^one-two].\n\n[^one.two]: First.\n[^one-two]: Second.' },
    async (source) => {
      await assert.rejects(discoverBook(source, root), /Duplicate source route/);
    },
  );
});
test('a failed book build leaves the previously successful export intact', async () => {
  await fixture(
    { 'book/01-one/index.mdx': '# One\n\n[Bad](#missing)', 'book.html': 'Existing good edition' },
    async (folder) => {
      const output = resolve(folder, 'book.html');
      await assert.rejects(buildBook({ source: resolve(folder, 'book'), output }), /Unknown chapter heading/);
      assert.equal(await readFile(output, 'utf8'), 'Existing good edition');
      assert.ok(!(await readdir(folder)).some((n) => n.startsWith('.book-build-')));
    },
  );
  await fixture(
    {
      'book/01-one/index.mdx': "import Missing from './not-present.tsx';\n\n# One\n\n<Missing />",
      'book.html': 'Existing good edition',
    },
    async (folder) => {
      const output = resolve(folder, 'book.html');
      await assert.rejects(buildBook({ source: resolve(folder, 'book'), output }));
      assert.equal(await readFile(output, 'utf8'), 'Existing good edition');
      assert.ok(!(await readdir(folder)).some((n) => n.startsWith('.book-build-')));
    },
  );
});
test('book assets embed nested local resources and reject unresolved network dependencies', async () => {
  await fixture(
    {
      'photo.png': 'image bytes',
      'nested.svg': '<svg xmlns="http://www.w3.org/2000/svg"><image href="photo.png" /></svg>',
      'remote.svg': '<svg><image href="https://example.com/image.png" /></svg>',
      'circular.svg': '<svg><image href="circular.svg" /></svg>',
    },
    async (folder) => {
      assert.match((await resourceBytes(resolve(folder, 'nested.svg'))).toString(), /data:image\/png;base64/);
      assert.match(await inlineCss('body{background:url("photo.png")}', folder), /data:image\/png;base64/);
      await assert.rejects(resourceBytes(resolve(folder, 'remote.svg')), /External resource/);
      await assert.rejects(resourceBytes(resolve(folder, 'circular.svg')), /Circular embedded resource/);
      await assert.rejects(inlineCss('@import "https://example.com/style.css";', folder), /Unresolved CSS/);
    },
  );
});
