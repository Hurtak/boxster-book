import type { ComponentType } from 'react';
import type { MDXProps } from 'mdx/types';

export interface HeadingRecord { id: string; title: string; depth: number }
export interface ChapterMetadata {
  number: number;
  file: string;
  id: string;
  title: string;
  headings: HeadingRecord[];
  diagrams: string[];
  noteOffset: number;
  noteCount: number;
  minutes: number;
  planned: boolean;
}
export interface Chapter extends ChapterMetadata { Component: ComponentType<MDXProps> }
export type AssetMap = Record<string, string>;
export type AssetSizes = Record<string,{width:number;height:number}>;
export interface DiagramModule {
  mount: (host: HTMLElement, options: { state: Record<string, unknown>; signal: AbortSignal; whenVisible?:Promise<void> }) =>
    void | (() => void) | Promise<void | (() => void)>;
}
export type DiagramRegistry = Record<string, () => Promise<DiagramModule>>;
