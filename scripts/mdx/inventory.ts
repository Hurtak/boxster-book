import type { Heading, Nodes, PhrasingContent, Root, RootContent } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import { toString } from 'mdast-util-to-string';
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import type { ChapterMetadata } from '../../src/book/types';
import { noteDestinations, readChapterRoutes, routeSlug, type NoteDestination } from './routes';

export interface BookInventory {
  root: string;
  chapters: ChapterMetadata[];
  diagrams: Record<string, string>;
  ids: Set<string>;
  destinations: Map<string, NoteDestination[]>;
}
export const parser = () => unified().use(remarkParse).use(remarkMdx).use(remarkGfm);
export const attribute = (node: MdxJsxFlowElement | MdxJsxTextElement, name: string) =>
  node.attributes.find(
    (attribute): attribute is MdxJsxAttribute => attribute.type === 'mdxJsxAttribute' && attribute.name === name,
  )?.value;
export function literalAttribute(node: MdxJsxFlowElement | MdxJsxTextElement, name: string): unknown {
  const value = attribute(node, name);
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    try {
      return JSON.parse(value.value);
    } catch {
      /* a binding, not a literal */
    }
  }
}
export function explicitHeadings(tree: Root): void {
  visit(tree, (node) => {
    if (node.type !== 'mdxJsxFlowElement' || node.name !== 'Heading') return;
    const level = attribute(node, 'level');
    const depth = Number(level && typeof level === 'object' ? level.value : level);
    const id = attribute(node, 'id');
    if (!(depth >= 1 && depth <= 6) || typeof id !== 'string' || !id)
      throw Error('Heading needs a literal id and level from 1 to 6');
    const children = node.children.flatMap<RootContent | PhrasingContent>((child) =>
      child.type === 'paragraph' ? child.children : [child],
    );
    Object.assign(node, { type: 'heading', depth, children, data: { hProperties: { id } } });
  });
}
export function headingRecords(tree: Root, chapter: string) {
  const used = new Set<string>();
  const records: { node: Heading; id: string; title: string; depth: number }[] = [];
  visit(tree, 'heading', (node) => {
    const title = toString(node);
    const explicit = node.data?.hProperties?.id;
    const base = routeSlug(typeof explicit === 'string' ? explicit : title) || 'section';
    if (node.depth !== 1 && ['sources', 'references', 'diagram'].includes(base))
      throw Error(`Reserved heading route: ${chapter}/${base}`);
    let slug = base,
      n = 1;
    if (explicit && used.has(slug)) throw Error(`Duplicate heading id: ${slug}`);
    while (used.has(slug)) slug = `${base}-${n++}`;
    used.add(slug);
    records.push({ node, id: node.depth === 1 ? chapter : `${chapter}/${slug}`, title, depth: node.depth });
  });
  return records;
}
function readingText(node: Nodes): string {
  if (node.type === 'mdxjsEsm' || node.type === 'footnoteDefinition' || node.type === 'footnoteReference') return '';
  if (node.type === 'mdxJsxFlowElement' && node.name === 'Diagram') {
    const alt = literalAttribute(node, 'alt');
    return typeof alt === 'string' ? alt : '';
  }
  if ('value' in node && typeof node.value === 'string') return node.value;
  const block = ['root', 'list', 'listItem', 'table', 'tableRow', 'tableCell', 'mdxJsxFlowElement'].includes(node.type);
  return ('children' in node ? node.children : []).map(readingText).join(block ? '\n' : '');
}
export async function discoverBook(source: string, root: string): Promise<BookInventory> {
  const routes = await readChapterRoutes(source);
  const paths = (await readdir(source, { withFileTypes: true })).filter((e) => e.isDirectory() && /^\d/.test(e.name));
  const chapters: ChapterMetadata[] = [],
    diagrams: Record<string, string> = {},
    ids = new Set<string>(),
    numbers = new Set<number>();
  const destinations = new Map<string, NoteDestination[]>();
  for (const entry of paths.sort((a, b) => Number(a.name.split('-')[0]) - Number(b.name.split('-')[0]))) {
    if (!/^\d{2,}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name)) throw Error(`Invalid chapter folder: ${entry.name}`);
    const number = Number(entry.name.split('-')[0]);
    if (!number || numbers.has(number)) throw Error(`Chapter numbers must be positive and unique: ${entry.name}`);
    numbers.add(number);
    const folder = resolve(source, entry.name);
    const files = (await readdir(folder)).filter((name) => /^index\.mdx?$/.test(name));
    if (files.length !== 1) throw Error(`Expected exactly one index.mdx in ${folder}`);
    if (files[0] !== 'index.mdx') throw Error(`Convert the chapter entry to index.mdx: ${folder}`);
    const file = resolve(folder, files[0]);
    const raw = await readFile(file, 'utf8');
    const tree = parser().parse(raw);
    explicitHeadings(tree);
    const slug = routes[entry.name] ?? entry.name.replace(/^\d+-/, '');
    if (['book', 'title', 'contents'].includes(slug)) throw Error(`Reserved chapter route: ${slug}`);
    const headings = headingRecords(tree, slug);
    if (headings.filter((h) => h.depth === 1).length !== 1 || headings[0]?.depth !== 1)
      throw Error(`Each chapter needs exactly one opening # title: ${file}`);
    let noteCount = 0;
    visit(tree, 'footnoteReference', () => {
      noteCount++;
    });
    const references: string[] = [];
    visit(tree, (node) => {
      if (node.type === 'text' && /\[\^[^\]]+\]/.test(node.value))
        throw Error(`Unresolved footnote reference in ${file}: ${node.value}`);
      if (node.type === 'image') throw Error(`Use Figure with an imported image and descriptive alt text in ${file}`);
      if (
        node.type === 'mdxJsxFlowElement' &&
        node.name &&
        ['Figure', 'Diagram', 'AnnotatedFigure', 'ComparisonImage', 'ImageComparison', 'DimensionedFigure'].includes(
          node.name,
        )
      ) {
        const alt = literalAttribute(node, 'alt');
        if (typeof alt !== 'string' || !alt.trim())
          throw Error(`${node.name} needs non-empty literal alt text in ${file}`);
        const src = attribute(node, node.name === 'Diagram' ? 'poster' : 'src');
        if (node.name !== 'ImageComparison' && (!src || (typeof src === 'string' && !src.startsWith('data:'))))
          throw Error(`${node.name} needs an imported image (src={image} or poster={poster}) in ${file}`);
      }
      if (node.type === 'mdxJsxFlowElement' && node.name === 'Diagram') {
        const id = attribute(node, 'id');
        if (typeof id !== 'string' || !id) throw Error(`Diagram needs a literal id: ${file}`);
        if (references.includes(id)) throw Error(`Duplicate diagram reference ${id}: ${file}`);
        references.push(id);
      }
    });
    const available = await readdir(resolve(folder, 'diagrams'), { withFileTypes: true }).catch(
      (e: NodeJS.ErrnoException) => {
        if (e.code === 'ENOENT') return [];
        throw e;
      },
    );
    for (const entry of available) {
      if (!entry.isDirectory()) continue;
      if (diagrams[entry.name]) throw Error(`Duplicate diagram id: ${entry.name}`);
      const module = resolve(folder, 'diagrams', entry.name, 'index.ts');
      if (!(await stat(module).catch(() => null))) throw Error(`Missing diagram module: ${module}`);
      diagrams[entry.name] = module;
    }
    for (const id of references) {
      const module = resolve(folder, 'diagrams', id, 'index.ts');
      if (!(await stat(module).catch(() => null))) throw Error(`Missing diagram module: ${module}`);
      if (diagrams[id] !== module) throw Error(`Unknown chapter diagram: ${id} in ${file}`);
    }
    for (const h of headings) {
      if (ids.has(h.id)) throw Error(`Duplicate heading: ${h.id}`);
      ids.add(h.id);
    }
    const notes = noteDestinations(tree, slug);
    const generated = [
      ...notes.flatMap((n) => [n.id, n.reference]),
      ...(noteCount ? [`${slug}/sources`] : []),
      ...references.map((id) => `${slug}/diagram/${id}`),
    ];
    for (const id of generated) {
      if (ids.has(id)) throw Error(`Duplicate book destination: ${id}`);
      ids.add(id);
    }
    destinations.set(file, notes);
    chapters.push({
      number,
      file,
      id: headings[0].id,
      title: headings[0].title,
      headings: headings.slice(1).map(({ node: _node, ...h }) => h),
      diagrams: references,
      noteCount,
      minutes: Math.max(1, Math.ceil(readingText(tree).trim().split(/\s+/).length / 220)),
      planned: tree.children.filter((n) => n.type !== 'mdxjsEsm').length === 1,
    });
  }
  if (!chapters.length) throw Error(`No numbered chapters in ${source}`);
  for (const folder of Object.keys(routes))
    if (!paths.some((entry) => entry.name === folder)) throw Error(`Chapter route has no chapter: ${folder}`);
  // Validate links only after the complete chapter/heading index exists.
  const inventory = { root, chapters, diagrams, ids, destinations };
  for (const chapter of chapters) {
    const source = await readFile(chapter.file, 'utf8');
    const tree = parser().parse(source);
    visit(tree, 'link', (node) => {
      resolveBookLink(node.url, chapter, inventory);
    });
  }
  return inventory;
}
export function resolveBookLink(url: string, chapter: ChapterMetadata, book: BookInventory): string {
  if (/^(?:[a-z][\w+.-]*:|\/\/)/i.test(url)) return url;
  const [path, fragment = ''] = url.split('#');
  let owner = chapter;
  if (path) {
    const file = resolve(dirname(chapter.file), decodeURIComponent(path));
    const match = book.chapters.find((c) => c.file === file);
    if (!match) {
      if (/index\.mdx?$/.test(path)) throw Error(`Unknown chapter link ${url} in ${relative(book.root, chapter.file)}`);
      return url;
    }
    owner = match;
  }
  if (!path && !fragment) return url;
  const decoded = decodeURIComponent(fragment);
  const id = !decoded
    ? owner.id
    : book.ids.has(decoded) || ['book', 'title', 'contents'].includes(decoded)
      ? decoded
      : `${owner.id}/${decoded.split('/').map(routeSlug).join('/')}`;
  if (!book.ids.has(id) && !['book', 'title', 'contents'].includes(id))
    throw Error(`Unknown chapter heading ${url} in ${relative(book.root, chapter.file)}`);
  return '#' + id;
}
