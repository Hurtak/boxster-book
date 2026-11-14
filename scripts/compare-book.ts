import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium, type Browser, type Page } from 'playwright-core';
import { alignBlocks, changedTokens, type ComparisonBlock, type ComparisonRow } from './comparison/align';

interface Chapter {
  id: string;
  title: string;
  blocks: ComparisonBlock[];
}
interface BehaviorNote {
  before: string;
  after: string;
}
const escape = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
async function edition(browser: Browser, file: string, output: string): Promise<Chapter[]> {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(pathToFileURL(file).href);
    const chapters = await page.evaluate(() => {
      const tokenise = (element: Element) => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const result: string[] = [];
        while (walker.nextNode())
          result.push(...(walker.currentNode.textContent?.match(/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu) ?? []));
        return result;
      };
      return [...document.querySelectorAll<HTMLElement>('#book > section.level2')].map((chapter) => {
        const blocks: ComparisonBlock[] = [];
        const visit = (element: Element, section: string) => {
          if (element.tagName === 'SECTION') {
            [...element.children].forEach((child) => visit(child, element.id || section));
            return;
          }
          if (element.matches('.reference-atlas')) {
            [...element.children].forEach((child) => visit(child, section));
            return;
          }
          if (element.matches('script,style,.diagram-view-controls,.diagram-live')) return;
          if (!element.textContent?.trim() && !element.querySelector('img')) return;
          const copy = element.cloneNode(true) as HTMLElement;
          copy
            .querySelectorAll(
              '.figure-enlarge,.footnote-ref,.footnote-back,script,style,.diagram-view-controls,.diagram-live',
            )
            .forEach((node) => node.remove());
          copy.removeAttribute('id');
          copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
          const diagram = element.getAttribute('data-diagram');
          if (diagram) {
            const fallback = copy.querySelector('figure');
            copy.replaceChildren(...(fallback ? [fallback] : []));
          }
          copy.querySelectorAll('[hidden]').forEach((node) => node.removeAttribute('hidden'));
          const kind = diagram
            ? 'diagram'
            : element.tagName === 'FIGURE'
              ? 'figure'
              : /^H[1-6]$/.test(element.tagName)
                ? 'heading'
                : element.tagName.toLowerCase();
          const image = copy.querySelector('img');
          blocks.push({
            kind,
            key:
              diagram ||
              (kind === 'heading' ? section : kind === 'figure' ? image?.getAttribute('data-book-asset') || '' : ''),
            section,
            html: copy.outerHTML,
            text: (copy.textContent ?? '').replace(/\s+/g, ' ').trim(),
            tokens: tokenise(copy),
            media: [...copy.querySelectorAll('img')].map((image) => ({
              source: image.getAttribute('src')!,
              hash: '',
              alt: image.alt,
            })),
          });
        };
        [...chapter.children].forEach((node) => visit(node, chapter.id));
        return { id: chapter.id, title: chapter.querySelector('h2')!.textContent!, blocks };
      });
    });
    for (const chapter of chapters)
      for (const block of chapter.blocks) {
        for (const medium of block.media) {
          const path = fileURLToPath(new URL(medium.source, pathToFileURL(file)));
          medium.hash = createHash('sha256')
            .update(await readFile(path))
            .digest('hex');
        }
        // Every edition keeps its own asset directory. Never substitute current sources.
        for (const medium of block.media) {
          const original = fileURLToPath(new URL(medium.source, pathToFileURL(file)));
          const target = relative(dirname(output), original).split('\\').join('/');
          block.html = block.html.replaceAll(`src="${escape(medium.source)}"`, `src="${escape(target)}"`);
        }
        block.html = block.html.replaceAll(
          'href="#',
          `href="${relative(dirname(output), file).split('\\').join('/')}#`,
        );
      }
    return chapters;
  } finally {
    await context.close();
  }
}
async function highlight(page: Page, html: string, indices: number[], side: string) {
  if (!indices.length) return html;
  return page.evaluate(
    ({ html, indices, side }) => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      const walker = document.createTreeWalker(wrapper, NodeFilter.SHOW_TEXT),
        nodes: Text[] = [];
      while (walker.nextNode()) nodes.push(walker.currentNode as Text);
      let index = 0;
      const marked = new Set(indices);
      for (const node of nodes) {
        const fragment = document.createDocumentFragment();
        for (const part of node.data.match(/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]|\s+/gu) ?? []) {
          if (!part.trim()) {
            fragment.append(part);
            continue;
          }
          if (marked.has(index++)) {
            const mark = document.createElement('mark');
            mark.className = `token-${side}`;
            mark.textContent = part;
            fragment.append(mark);
          } else fragment.append(part);
        }
        node.replaceWith(fragment);
      }
      return wrapper.innerHTML;
    },
    { html, indices, side },
  );
}
export async function compareBooks({
  before,
  after,
  output,
  notes = {},
  screenshots,
}: {
  before: string;
  after: string;
  output: string;
  notes?: Record<string, BehaviorNote>;
  screenshots?: string;
}) {
  before = resolve(before);
  after = resolve(after);
  output = resolve(output);
  if ([before, after].includes(output)) throw Error('Comparison must not overwrite an edition');
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH } : {}),
  });
  try {
    const left = await edition(browser, before, output),
      right = await edition(browser, after, output);
    if (left.length !== right.length || left.some((chapter, i) => chapter.id !== right[i].id))
      throw Error('Chapter identities/order differ; reconcile them before paragraph alignment');
    const page = await browser.newPage();
    const chapters: { id: string; title: string; rows: ComparisonRow[] }[] = [];
    for (let c = 0; c < left.length; c++) {
      const a = left[c],
        b = right[c];
      // Preserve document order, including parent-level notes after nested sections.
      // The aligner forbids matches across section identities.
      const rows = alignBlocks(a.blocks, b.blocks);
      for (const row of rows) {
        const key = row.after?.key || row.before?.key || '';
        if (notes[key]) row.status = 'changed';
        if (row.before && row.after && row.status === 'changed') {
          const changed = changedTokens(row.before.tokens, row.after.tokens);
          row.before.html = await highlight(page, row.before.html, changed.before, 'before');
          row.after.html = await highlight(page, row.after.html, changed.after, 'after');
        }
        if (notes[key])
          for (const side of ['before', 'after'] as const) {
            const block = row[side];
            if (!block) continue;
            let preview = '';
            if (screenshots) {
              const path = resolve(screenshots, `${side}-${key}.png`);
              try {
                await readFile(path);
                preview = `<img class="runtime-preview" src="${escape(relative(dirname(output), path))}" alt="Captured ${side} live view of ${escape(key)}">`;
              } catch {
                /* A poster remains a useful fallback. */
              }
            }
            if (preview) block.html = preview;
            block.html = `<p class="behavior">${escape(notes[key][side])}</p>${block.html}`;
          }
        for (const side of ['before', 'after'] as const) {
          const block = row[side];
          if (!block || block.kind !== 'diagram') continue;
          const edition = side === 'before' ? before : after;
          block.html += `<p class="live-link"><a target="_blank" href="${escape(relative(dirname(output), edition))}#${escape(a.id)}/diagram/${escape(key)}">Open ${side} interactive ↗</a></p>`;
          if (screenshots) {
            const detail = resolve(screenshots, `${side}-${key}-detail.png`);
            try {
              await readFile(detail);
              block.html += `<details class="state-detail"><summary>View another interactive state</summary><img class="runtime-preview" src="${escape(relative(dirname(output), detail))}" alt="Another captured state of ${escape(key)}"></details>`;
            } catch {
              /* Additional state captures are optional. */
            }
          }
        }
      }
      chapters.push({ id: a.id, title: a.title, rows });
    }
    const counts = { same: 0, changed: 0, added: 0, removed: 0 };
    chapters.forEach((chapter) => chapter.rows.forEach((row) => counts[row.status]++));
    const cells = (row: ComparisonRow, side: 'before' | 'after') => {
      const block = row[side];
      const version = side === 'before' ? 'Before' : 'After';
      const label =
        row.status === 'changed'
          ? side === 'before'
            ? 'Previous version'
            : 'Revised version'
          : row.status === 'removed'
            ? 'Removed content'
            : 'Added content';
      const sideLabel =
        row.status === 'same'
          ? ''
          : `<div class="change-side-label"><span aria-hidden="true">${block ? (side === 'before' ? '−' : '+') : '—'}</span>${version} · ${block ? label : 'No corresponding block'}</div>`;
      return `<div class="cell ${side}${block ? '' : ' missing'}" data-side="${version}">${sideLabel}${block ? block.html : `<p class="empty">${side === 'before' ? 'This content was added.' : 'This content was removed.'}</p>`}</div>`;
    };
    const body = chapters
      .map((chapter, i) => {
        const hasChanges = chapter.rows.some((row) => row.status !== 'same');
        const sectionChanged = new Set(
          chapter.rows.filter((row) => row.status !== 'same').map((row) => row.after?.section || row.before?.section),
        );
        return `<section class="chapter ${hasChanges ? '' : 'unchanged-chapter'}" id="compare-${chapter.id}"><h2 class="chapter-title"><span>${String(i + 1).padStart(2, '0')}</span> ${escape(chapter.title)}</h2>${chapter.rows
          .map((row) => {
            const block = row.after || row.before!;
            const heading =
              block.kind === 'heading' &&
              block.section !== chapter.id &&
              [...sectionChanged].some(
                (section) => section === block.section || section?.startsWith(`${block.section}/`),
              );
            const status = { same: 'Unchanged', changed: 'Updated', added: 'Added', removed: 'Removed' }[row.status];
            const symbol = { same: '', changed: '↔', added: '+', removed: '−' }[row.status];
            return `<div class="comparison-row ${row.status} ${heading ? 'section-context' : ''}" data-status="${row.status}" data-section="${escape(block.section)}"><div class="row-status"><span class="status-symbol" aria-hidden="true">${symbol}</span>${status}${['figure', 'diagram'].includes(block.kind) ? ` · ${block.kind}` : ''}</div><div class="pair">${cells(row, 'before')}${cells(row, 'after')}</div></div>`;
          })
          .join('')}</section>`;
      })
      .join('');
    await mkdir(dirname(output), { recursive: true });
    const fontFolder = resolve(dirname(output), 'comparison-assets');
    await mkdir(fontFolder, { recursive: true });
    for (const font of ['source-serif-4.woff2', 'source-sans-3.woff2'])
      await cp(resolve(import.meta.dirname, '../assets/fonts', font), resolve(fontFolder, font));
    for (const notice of ['OFL-source-serif-4.txt', 'OFL-source-sans-3.txt'])
      await cp(resolve(import.meta.dirname, '../assets/fonts', notice), resolve(fontFolder, notice));
    const comparisonCss = (
      await Promise.all([
        readFile(resolve(import.meta.dirname, 'comparison/styles.css'), 'utf8'),
        readFile(resolve(import.meta.dirname, '../src/book/image-figures.css'), 'utf8'),
      ])
    ).join('\n');
    const html = `<!doctype html><html lang="en-GB" data-mode="changes"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Boxster book · visual review</title><style>${comparisonCss}</style></head><body><header><div class="heading"><p>PORSCHE BOXSTER 987.2 · EDITORIAL COMPARISON</p><h1>The visual revision, side by side</h1><p>19 chapters. Changes and their section headings are shown by default; matched blocks share a row.</p></div><nav aria-label="Comparison controls"><label>Chapter <select id="chapter"><option value="">Choose a chapter</option>${chapters.map((c, i) => `<option value="compare-${c.id}">${i + 1}. ${escape(c.title)}</option>`).join('')}</select></label><label class="filter"><input id="changes-only" type="checkbox" checked> Changes only</label><a href="${escape(relative(dirname(output), before))}">Before book ↗</a><a href="${escape(relative(dirname(output), after))}">After book ↗</a></nav></header><main><div class="overview"><p class="change-summary"><span class="legend-updated">↔ ${counts.changed} updated</span><span class="legend-added">+ ${counts.added} added</span><span class="legend-removed">− ${counts.removed} removed</span></p><p><mark class="token-before">Deleted text</mark> / <mark class="token-after">Inserted text</mark>. Updated blocks show the previous version in red and the revised version in green. Static images come from each saved build; tour captures show the actual initial live view. Open a full edition for interaction.</p><p class="decision">Source images retain their credits. Factory parts drawings and photographs are labelled separately; captions distinguish standard equipment, options and illustrative geometry.</p></div><div class="column-headings"><strong>Before</strong><strong>After</strong></div>${body}</main><footer>Snapshots and comparison are local review artifacts. Each edition retains its own assets; neither snapshot is loaded from the current development server.</footer><script>const filter=document.getElementById('changes-only');function apply(){document.documentElement.dataset.mode=filter.checked?'changes':'all'}filter.addEventListener('change',apply);apply();document.getElementById('chapter').addEventListener('change',e=>{if(e.target.value)document.getElementById(e.target.value).scrollIntoView({behavior:'smooth',block:'start'})});</script></body></html>`;
    await writeFile(output, html);
    await writeFile(
      resolve(dirname(output), 'comparison.json'),
      JSON.stringify(
        {
          before,
          after,
          counts,
          chapters: chapters.map((c) => ({
            id: c.id,
            title: c.title,
            rows: c.rows.map((r) => ({
              status: r.status,
              kind: (r.after || r.before)!.kind,
              section: (r.after || r.before)!.section,
              before: r.before?.key,
              after: r.after?.key,
            })),
          })),
        },
        null,
        2,
      ),
    );
    console.log(
      `Compared ${chapters.length} chapters: ${counts.changed} updated, ${counts.added} added, ${counts.removed} removed → ${output}`,
    );
    return counts;
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({
    options: {
      before: { type: 'string' },
      after: { type: 'string' },
      output: { type: 'string' },
      notes: { type: 'string' },
      screenshots: { type: 'string' },
    },
  });
  if (!values.before || !values.after || !values.output)
    throw Error(
      'Usage: vpx scripts/compare-book.ts --before before/index.html --after after/index.html --output comparison/index.html [--notes behavior.json] [--screenshots previews]',
    );
  await compareBooks({
    before: values.before,
    after: values.after,
    output: values.output,
    notes: values.notes ? JSON.parse(await readFile(values.notes, 'utf8')) : {},
    screenshots: values.screenshots,
  });
}
