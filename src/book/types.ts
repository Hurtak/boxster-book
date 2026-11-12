import type { DiagramContext } from '../../interactive/types';
import type { MDXProps } from 'mdx/types';
import type { ComponentType } from 'react';

export interface HeadingRecord {
  id: string;
  title: string;
  depth: number;
}
export interface ChapterMetadata {
  number: number;
  file: string;
  id: string;
  title: string;
  headings: HeadingRecord[];
  diagrams: string[];
  noteCount: number;
  minutes: number;
  planned: boolean;
}
export interface Chapter extends ChapterMetadata {
  Component: ComponentType<MDXProps>;
}
export type AssetMap = Record<string, string>;
export type AssetSizes = Record<string, { width: number; height: number }>;
export interface DiagramModule {
  mount: (host: HTMLElement, options: DiagramContext) => void | (() => void) | Promise<void | (() => void)>;
}
export type DiagramRegistry = Record<string, () => Promise<DiagramModule>>;
