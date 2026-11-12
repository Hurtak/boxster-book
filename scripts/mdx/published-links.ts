import type { Root } from 'mdast';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { visit } from 'unist-util-visit';

interface PublishedChapter {
  headings: Record<string, string>;
  notes: Record<string, number[]>;
}
export interface NoteDestination {
  id: string;
  reference: string;
}
export interface ChapterDestinations {
  aliases: Record<string, string>;
  notes: NoteDestination[];
}
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export async function readPublishedLinks(source: string): Promise<Record<string, PublishedChapter>> {
  const file = resolve(source, 'published-links.json');
  let raw: string;
  try {
    raw = await readFile(file, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
  const value: unknown = JSON.parse(raw);
  if (!record(value) || !record(value.chapters)) throw Error(`Invalid published links: ${file}`);
  const chapters: Record<string, PublishedChapter> = {};
  for (const [folder, chapter] of Object.entries(value.chapters)) {
    if (!record(chapter) || !record(chapter.headings) || !record(chapter.notes))
      throw Error(`Invalid published links for ${folder}`);
    const headings: Record<string, string> = {},
      notes: Record<string, number[]> = {};
    for (const [from, to] of Object.entries(chapter.headings)) {
      if (!from || typeof to !== 'string' || !to) throw Error(`Invalid published heading in ${folder}`);
      headings[from] = to;
    }
    for (const [label, ids] of Object.entries(chapter.notes)) {
      if (!Array.isArray(ids) || !ids.length || !ids.every((id) => Number.isSafeInteger(id) && id > 0))
        throw Error(`Invalid published note ${label} in ${folder}`);
      notes[label] = ids;
    }
    chapters[folder] = { headings, notes };
  }
  return chapters;
}

export function chapterDestinations(
  tree: Root,
  prefix: string,
  headings: string[],
  published?: PublishedChapter,
): ChapterDestinations {
  const aliases: Record<string, string> = {};
  for (const [from, to] of Object.entries(published?.headings ?? {})) {
    if (!headings.includes(prefix + to)) throw Error(`Missing published heading target: ${prefix + to}`);
    if (from !== to) aliases[prefix + from] = prefix + to;
  }
  const occurrences = new Map<string, NoteDestination[]>();
  const notes: NoteDestination[] = [];
  visit(tree, 'footnoteReference', (node) => {
    const previous = occurrences.get(node.identifier) ?? [];
    const number = published?.notes[node.identifier]?.[previous.length];
    // Unpublished references use a label/occurrence identity, not a global offset.
    // Adding a chapter or moving another source therefore cannot renumber them.
    const key = createHash('sha256').update(node.identifier).digest('hex').slice(0, 16);
    const destination = {
      id: number ? `fn${number}` : `${prefix}note-${key}-${previous.length + 1}`,
      reference: number ? `fnref${number}` : `${prefix}noteref-${key}-${previous.length + 1}`,
    };
    previous.push(destination);
    occurrences.set(node.identifier, previous);
    notes.push(destination);
  });
  for (const [label, ids] of Object.entries(published?.notes ?? {})) {
    const references = occurrences.get(label);
    if (!references?.length) throw Error(`Published source ${label} has no reference in ${prefix}`);
    // A removed duplicate citation still has a destination and a backlink to a
    // surviving citation of the same source, without adding a numbered note.
    for (const id of ids.slice(references.length)) {
      aliases[`fn${id}`] = references[0].id;
      aliases[`fnref${id}`] = references[0].reference;
    }
  }
  return { aliases, notes };
}
