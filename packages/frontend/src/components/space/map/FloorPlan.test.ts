import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';

import useViewBox from '~/compositions/space/useViewBox';
import { SpaceMapKey } from '~/symbols/space-map';
import { sampleFloorPlan } from '$/__fixtures__/floorPlan';
import { prepareUseGetMockOnce } from '$/__helpers__/mocks';

import FloorPlan from './FloorPlan.vue';

vi.mock('~/compositions/useGet');

const SpaceMapMock = {
  registerViewBox: vi.fn(),
  unregisterViewBox: vi.fn(),
};

const globalOptions = {
  provide: {
    [SpaceMapKey as symbol]: SpaceMapMock,
  },
};

describe('FloorPlan component', () => {
  it('should render correctly', () => {
    // given
    const spaceId = 'dummy-id';
    prepareUseGetMockOnce({
      _id: spaceId,
      floorPlan: sampleFloorPlan,
      members: [],
      name: 'space',
    });

    // when
    const wrapper = shallowMount(FloorPlan, {
      global: globalOptions,
      props: {
        spaceId,
      },
    });

    // then
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(sampleFloorPlan[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(sampleFloorPlan[1]);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should not render anything when Space is undefined', () => {
    // given
    prepareUseGetMockOnce(undefined);

    // when
    const wrapper = shallowMount(FloorPlan, {
      global: globalOptions,
      props: {
        spaceId: '123',
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  describe('view box handling', () => {
    it('should register view box if handler provided', () => {
      vi.resetAllMocks();
      // given
      const spaceId = 'dummy-id';
      prepareUseGetMockOnce({
        _id: 'dummy-id',
        floorPlan: sampleFloorPlan,
        members: [],
        name: 'space',
      });

      const viewBox = useViewBox(ref(sampleFloorPlan), { strokeWidth: 2 });

      // when
      shallowMount(FloorPlan, {
        global: globalOptions,
        props: {
          spaceId,
        },
      });

      // then
      expect(SpaceMapMock.registerViewBox).toHaveBeenCalledWith(
        'FloorPlan',
        expect.objectContaining({ value: viewBox.value }),
      );
    });

    it('should unregister view box on unmount if handler provided', () => {
      vi.resetAllMocks();
      // given
      const spaceId = 'dummy-id';
      prepareUseGetMockOnce({
        _id: spaceId,
        floorPlan: sampleFloorPlan,
        members: [],
        name: 'space',
      });

      const wrapper = shallowMount(FloorPlan, {
        global: globalOptions,
        props: {
          spaceId,
        },
      });

      // when
      wrapper.unmount();

      // then
      expect(SpaceMapMock.unregisterViewBox).toHaveBeenCalledWith('FloorPlan');
    });
  });
});
