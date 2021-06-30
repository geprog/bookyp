import { shallowMount } from '@vue/test-utils';

import FloorPlan from '~/components/space/FloorPlan.vue';
import { sampleFloorPlan } from '$/__fixtures__/floorPlan';
import { prepareUseFeathersMockOnce, prepareUseFindMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useFind');
jest.mock('~/compositions/useFeathers');

describe('FloorPlan component', () => {
  it('should render correctly', () => {
    // given
    prepareUseFeathersMockOnce();
    prepareUseFindMockOnce([
      {
        _id: 'dummy-id',
        floorPlan: sampleFloorPlan,
      },
    ]);

    // when
    const wrapper = shallowMount(FloorPlan, {});

    // then
    expect(wrapper.findAll('path')[0].attributes('d')).toStrictEqual(sampleFloorPlan[0]);
    expect(wrapper.findAll('path')[1].attributes('d')).toStrictEqual(sampleFloorPlan[1]);
    expect(wrapper.html()).toMatchSnapshot();
  });
});
