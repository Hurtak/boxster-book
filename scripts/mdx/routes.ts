import type { Root } from 'mdast';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { visit } from 'unist-util-visit';

export const routeSlug = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export async function readChapterRoutes(source: string): Promise<Record<string, string>> {
  let raw: string;
  try {
    raw = await readFile(resolve(source, 'routes.json'), 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
  const routes: unknown = JSON.parse(raw);
  if (!routes || typeof routes !== 'object' || Array.isArray(routes)) throw Error('Invalid chapter routes.json');
  for (const [folder, slug] of Object.entries(routes)) {
    if (typeof slug !== 'string' || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(slug))
      throw Error(`Invalid chapter route for ${folder}: ${String(slug)}`);
    if (['book', 'title', 'contents'].includes(slug)) throw Error(`Reserved chapter route: ${slug}`);
  }
  return routes as Record<string, string>;
}

export interface NoteDestination {
  id: string;
  reference: string;
}

export function noteDestinations(tree: Root, chapter: string): NoteDestination[] {
  const occurrences = new Map<string, number>();
  const labels = new Map<string, string>();
  const notes: NoteDestination[] = [];
  visit(tree, 'footnoteReference', (node) => {
    const slug = routeSlug(node.identifier);
    if (!slug) throw Error(`Empty source route for ${node.identifier} in ${chapter}`);
    const label = labels.get(slug);
    if (label && label !== node.identifier) throw Error(`Duplicate source route: ${chapter}/sources/${slug}`);
    labels.set(slug, node.identifier);
    const occurrence = (occurrences.get(slug) ?? 0) + 1;
    occurrences.set(slug, occurrence);
    notes.push({
      id: `${chapter}/sources/${slug}${occurrence === 1 ? '' : '/' + occurrence}`,
      reference: `${chapter}/references/${slug}/${occurrence}`,
    });
  });
  return notes;
}
