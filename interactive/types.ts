import type { Selection } from 'd3';
import type { Object3D } from 'three';

export interface DiagramContext {
  state: Record<string, unknown>;
  signal: AbortSignal;
  whenVisible?: Promise<void>;
}

type WidenState<T> = {
  [K in keyof T]: T[K] extends boolean ? boolean : T[K] extends number ? number : string;
};

type StateValue = string | number | boolean;

/** Retained state crosses the untyped storage boundary; validate its primitives once. */
export function initializeState<T extends Record<string, StateValue>>(
  saved: Record<string, unknown>,
  defaults: T,
): WidenState<T> {
  for (const [key, fallback] of Object.entries(defaults)) {
    if (typeof saved[key] !== typeof fallback) saved[key] = fallback;
  }
  return saved as WidenState<T>;
}

export type VectorCoordinates = readonly number[];
export interface CameraPose {
  position: number[];
  target: number[];
}
export interface CameraFrame extends CameraPose {
  at: number;
}
export type SvgSelection = Selection<SVGSVGElement, unknown, null, undefined>;
export type SvgDraw = (svg: SvgSelection, size: { width: number; height: number }) => void;
export type ConnectionKind = 'mechanical' | 'fluid' | 'air' | 'electrical' | 'signal' | 'structure';
export interface ExplorerConfig {
  id: string;
  title: string;
  location: string;
  overview: string;
  assembled: string;
  exploded: string;
  focus: string;
  note?: string;
  direction?: number[];
  hideCarParts?: string[];
  ghostParts?: string[];
  reuseCarParts?: Record<string, string[]>;
  finishInstallation?: (model: Object3D) => void;
  connections: { from: string; to: string; label: string; kind: ConnectionKind }[];
}
export interface AssemblyModule {
  config: ExplorerConfig;
  createAssembly: () => Object3D;
}
