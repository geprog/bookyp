import { InjectionKey, Ref } from 'vue';

import { ViewBox } from '~/compositions/space/useViewBox';

export type SpaceEventTypes = 'move' | 'down' | 'up';

export type SpaceObjectTypes = 'root' | 'map-object' | 'wall' | 'wall-start' | 'wall-end';

interface SpaceMap {
  registerViewBox: (key: string, viewBox: Ref<ViewBox>) => void;
  unregisterViewBox: (key: string) => void;
  on: (
    eventType: SpaceEventTypes,
    objectType: SpaceObjectTypes,
    listener: (id: string | null, svgPoint: DOMPoint) => void,
  ) => void;
}

export const SpaceMapKey: InjectionKey<SpaceMap> = Symbol('SpaceMap');
