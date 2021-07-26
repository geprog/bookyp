import { shallowMount } from '@vue/test-utils';
import { ref } from 'vue';

import FloorPlan from '~/components/space/FloorPlan.vue';
import useViewBox from '~/compositions/space/useViewBox';
import { SpaceMapKey } from '~/symbols/space-map';
import { sampleFloorPlan } from '$/__fixtures__/floorPlan';
import { prepareUseCurrentSpaceMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/space/useCurrentSpace');

const SpaceMapMock = {
  registerViewBox: jest.fn(),
  unregisterViewBox: jest.fn(),
};

const globalOptions = {
  provide: {
    [SpaceMapKey as symbol]: SpaceMapMock,
  },
};

describe('FloorPlan component', () => {
  it('should render correctly', () => {
    // given
    prepareUseCurrentSpaceMockOnce({
      _id: 'dummy-id',
      floorPlan: sampleFloorPlan,
    });

    // when
    const wrapper = shallowMount(FloorPlan, {
      global: globalOptions,
    });

    // then
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(sampleFloorPlan[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(sampleFloorPlan[1]);
    expect(wrapper.html()).toMatchSnapshot();
  });

  describe('view box handling', () => {
    it('should register view box if handler provided', () => {
      jest.resetAllMocks();
      // given
      prepareUseCurrentSpaceMockOnce({
        _id: 'dummy-id',
        floorPlan: sampleFloorPlan,
      });

      const viewBox = useViewBox(ref(sampleFloorPlan), { strokeWidth: 2 });

      // when
      shallowMount(FloorPlan, {
        global: globalOptions,
      });

      // then
      expect(SpaceMapMock.registerViewBox).toHaveBeenCalledWith(
        'FloorPlan',
        expect.objectContaining({ value: viewBox.value }),
      );
    });

    it('should unregister view box on unmount if handler provided', () => {
      jest.resetAllMocks();
      // given
      prepareUseCurrentSpaceMockOnce({
        _id: 'dummy-id',
        floorPlan: sampleFloorPlan,
      });

      const wrapper = shallowMount(FloorPlan, {
        global: globalOptions,
      });

      // when
      wrapper.unmount();

      // then
      expect(SpaceMapMock.unregisterViewBox).toHaveBeenCalledWith('FloorPlan');
    });
  });
});
