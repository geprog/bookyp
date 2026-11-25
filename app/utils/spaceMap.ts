import type { InjectionKey, Ref } from 'vue';

export type SpaceEventType = 'move' | 'down' | 'up';

export type SpaceObjectType = 'root' | 'map-object' | 'wall' | 'wall-start' | 'wall-end';

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SpaceMapListener = (id: string | null, svgPoint: { x: number; y: number }) => void;

export interface SpaceMapContext {
  registerViewBox: (key: string, viewBox: Ref<ViewBox>) => void;
  unregisterViewBox: (key: string) => void;
  /** listen to pointer events on the map, grouped by the type of the element under the pointer */
  on: (eventType: SpaceEventType, objectType: SpaceObjectType, listener: SpaceMapListener) => void;
}

export const spaceMapKey: InjectionKey<SpaceMapContext> = Symbol('SpaceMap');
