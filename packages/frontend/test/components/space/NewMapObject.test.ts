import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';

import NewMapObject from '~/components/space/NewMapObject.vue';
import useViewBox, { mapObjectsToPaths } from '~/compositions/space/useViewBox';
import { SpaceMapKey } from '~/symbols/space-map';
import { sampleMapObject } from '$/__fixtures__/mapObject';

jest.mock('~/compositions/useFind');

const SpaceMapMock = {
  registerViewBox: jest.fn(),
  unregisterViewBox: jest.fn(),
};

const globalOptions = {
  provide: {
    [SpaceMapKey as symbol]: SpaceMapMock,
  },
};

describe('NewMapObject component', () => {
  it('should render correctly in viewing mode', () => {
    // given

    // when
    const wrapper = shallowMount(NewMapObject, {
      props: {
        newMapObject: sampleMapObject,
      },
      global: globalOptions,
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
    expect(wrapper.findAll('path')).toHaveLength(2);
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(sampleMapObject.paths[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(sampleMapObject.paths[1]);
  });

  describe('view box handling', () => {
    it('should register view box if handler provided', () => {
      jest.resetAllMocks();
      // given
      const viewBox = useViewBox(mapObjectsToPaths(ref([sampleMapObject])), { strokeWidth: 1 });

      // when
      shallowMount(NewMapObject, {
        props: {
          newMapObject: sampleMapObject,
        },
        global: globalOptions,
      });
      // then
      expect(SpaceMapMock.registerViewBox).toHaveBeenCalledWith(
        'NewMapObject',
        expect.objectContaining({ value: viewBox.value }),
      );
    });

    it('should unregister view box on unmount if handler provided', () => {
      jest.resetAllMocks();
      // given
      const wrapper = shallowMount(NewMapObject, {
        props: {
          newMapObject: sampleMapObject,
        },
        global: globalOptions,
      });

      // when
      wrapper.unmount();

      // then
      expect(SpaceMapMock.unregisterViewBox).toHaveBeenCalledWith('NewMapObject');
    });
  });
});
