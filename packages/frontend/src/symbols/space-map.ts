import { InjectionKey, Ref } from 'vue';

import { ViewBox } from '~/compositions/space/useViewBox';

interface SpaceMap {
  registerViewBox: (key: string, viewBox: Ref<ViewBox>) => void;
  unregisterViewBox: (key: string) => void;
}

export const SpaceMapKey: InjectionKey<SpaceMap> = Symbol('SpaceMap');
