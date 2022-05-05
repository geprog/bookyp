import { InjectionKey, Ref } from 'vue';

import { ViewBox } from '~/compositions/space/useViewBox';

export type SpaceMapEvents = 'moveInsideSvg' | 'downInsideSvg' | 'upInsideSvg';

interface SpaceMap {
  registerViewBox: (key: string, viewBox: Ref<ViewBox>) => void;
  unregisterViewBox: (key: string) => void;
  on: (event: SpaceMapEvents, listener: (svgPoint: DOMPoint, event: PointerEvent) => void) => void;
}

export const SpaceMapKey: InjectionKey<SpaceMap> = Symbol('SpaceMap');
