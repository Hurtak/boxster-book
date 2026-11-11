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
    explicitHeadings(tree);
    const prefix = chapter.id.slice(0, chapter.id.lastIndexOf('__') + 2);
    for (const heading of headingRecords(tree, prefix)) {
      heading.node.data = { ...heading.node.data, hProperties: { id: heading.id } };
    }
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
      const number = ++local,
        global = chapter.noteOffset + number;
      const reference = {
        ...component('SourceReference', {
          note: String(global),
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
          url: `#fnref${global}`,
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
        data: { hProperties: { id: `fn${global}`, value: String(number) } },
      });
    });
    for (const id of definitions.keys()) if (!used.has(id)) throw Error(`Unreferenced note ${id} in ${chapter.file}`);
    if (local !== chapter.noteCount) throw Error(`Note inventory changed while compiling ${chapter.file}`);
    tree.children = tree.children.filter((n) => n.type !== 'footnoteDefinition');
    if (notes.length)
      tree.children.push(
        component('SourceNotes', { id: chapter.id + '--notes', count: String(notes.length) }, [
          { type: 'list', ordered: true, start: 1, spread: true, children: notes },
        ]),
      );
  };
}

// Preserve Pandoc's section wrappers/fragment IDs, while React chooses heading
// levels appropriate to the complete document or the enhanced chapter reader.
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
