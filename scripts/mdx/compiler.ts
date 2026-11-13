import type { CompileOptions } from '@mdx-js/mdx';
import type { Element, RootContent as HtmlContent, Root as HtmlRoot } from 'hast';
import type { FootnoteDefinition, ListItem, Paragraph, PhrasingContent, Root, RootContent } from 'mdast';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';
import { visit } from 'unist-util-visit';
import type { BookInventory } from './inventory';
import { explicitHeadings, headingRecords, resolveBookLink } from './inventory';

const component = (
  name: string,
  attributes: Record<string, string>,
  children: MdxJsxFlowElement['children'] = [],
): MdxJsxFlowElement => ({
  type: 'mdxJsxFlowElement',
  name,
  attributes: Object.entries(attributes).map(([name, value]) => ({
    type: 'mdxJsxAttribute',
    name,
    value,
  })),
  children,
});

function remarkBook(book: BookInventory) {
  return (tree: Root, file: { path?: string }) => {
    const chapter = book.chapters.find((c) => c.file === file.path);
    if (!chapter) throw Error(`Chapter is absent from the book manifest: ${file.path}`);
    const destinations = book.destinations.get(chapter.file)!;
    explicitHeadings(tree);
    for (const heading of headingRecords(tree, chapter.id)) {
      heading.node.data = { ...heading.node.data, hProperties: { id: heading.id } };
    }
    visit(tree, 'mdxJsxFlowElement', (node) => {
      if (node.name === 'details') {
        // A citation backlink can open a technical disclosure before hydration.
        node.attributes.push({ type: 'mdxJsxAttribute', name: 'suppressHydrationWarning', value: null });
      }
      if (node.name !== 'Diagram') return;
      const id = node.attributes.find((a) => a.type === 'mdxJsxAttribute' && a.name === 'id');
      if (!id || id.type !== 'mdxJsxAttribute' || typeof id.value !== 'string') return;
      node.attributes.push({ type: 'mdxJsxAttribute', name: 'anchor', value: `${chapter.id}/diagram/${id.value}` });
    });
    visit(tree, 'link', (node) => {
      node.url = resolveBookLink(node.url, chapter, book);
    });
    const definitions = new Map<string, FootnoteDefinition>();
    visit(tree, 'footnoteDefinition', (node) => {
      if (definitions.has(node.identifier)) throw Error(`Duplicate note ${node.identifier} in ${chapter.file}`);
      definitions.set(node.identifier, node);
    });
    const notes: ListItem[] = [];
    const used = new Set<string>();
    let local = 0;
    visit(tree, 'footnoteReference', (node, index, parent) => {
      const definition = definitions.get(node.identifier);
      if (!definition) throw Error(`Missing note ${node.identifier} in ${chapter.file}`);
      used.add(node.identifier);
      const number = ++local;
      const destination = destinations[number - 1];
      const reference = {
        ...component('SourceReference', {
          note: destination.id,
          reference: destination.reference,
          number: String(number),
        }),
        type: 'mdxJsxTextElement' as const,
        children: [] as PhrasingContent[],
      };
      if (parent && index !== undefined) (parent.children as (RootContent | PhrasingContent)[])[index] = reference;
      const children = structuredClone(definition.children);
      let last = children.at(-1);
      if (!last || last.type !== 'paragraph') {
        last = { type: 'paragraph', children: [] };
        children.push(last);
      }
      (last as Paragraph).children.push(
        { type: 'text', value: ' ' },
        {
          type: 'link',
          url: `#${destination.reference}`,
          children: [{ type: 'text', value: '↩︎' }],
          data: {
            hProperties: {
              className: ['footnote-back'],
              role: 'doc-backlink',
              'aria-label': `Back to reference ${number}`,
            },
          },
        },
      );
      notes.push({
        type: 'listItem',
        spread: false,
        children,
        data: { hProperties: { id: destination.id, value: String(number) } },
      });
    });
    for (const id of definitions.keys()) if (!used.has(id)) throw Error(`Unreferenced note ${id} in ${chapter.file}`);
    if (local !== chapter.noteCount) throw Error(`Note inventory changed while compiling ${chapter.file}`);
    tree.children = tree.children.filter((n) => n.type !== 'footnoteDefinition');
    if (notes.length)
      tree.children.push(
        component('SourceNotes', { id: `${chapter.id}/sources`, count: String(notes.length) }, [
          { type: 'list', ordered: true, start: 1, spread: true, children: notes },
        ]),
      );
  };
}

// Wrap sections for navigation and printing; React chooses heading levels for
// the complete document and the enhanced chapter reader.
function rehypeSections() {
  return (tree: HtmlRoot) => {
    const result: HtmlContent[] = [];
    const stack: { depth: number; node: Element }[] = [];
    for (const node of tree.children) {
      const depth = node.type === 'element' && /^h[1-6]$/.test(node.tagName) ? Number(node.tagName.slice(1)) : 0;
      if (depth) {
        const id = (node as Element).properties.id;
        delete (node as Element).properties.id;
        if (depth === 1) {
          stack.length = 0;
          result.push(node);
          continue;
        }
        while (stack.length && stack.at(-1)!.depth >= depth) stack.pop();
        const section: Element = {
          type: 'element',
          tagName: 'section',
          properties: { id, className: [`level${depth + 1}`] },
          children: [node as Element],
        };
        (stack.at(-1)?.node.children ?? result).push(section);
        stack.push({ depth, node: section });
      } else if (node.type === 'mdxjsEsm' || (node.type === 'mdxJsxFlowElement' && node.name === 'SourceNotes')) {
        result.push(node);
      } else (stack.at(-1)?.node.children ?? result).push(node as Element);
    }
    tree.children = result;
  };
}

export function compilerOptions(book: BookInventory): CompileOptions {
  return {
    format: 'mdx',
    remarkPlugins: [remarkGfm, remarkSmartypants, [remarkBook, book]],
    rehypePlugins: [rehypeSections],
  };
}
