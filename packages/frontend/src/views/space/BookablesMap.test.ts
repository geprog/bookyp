import { config, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import MapObjects from '~/components/space/map/MapObjects.vue';
import { sampleMapObject, sampleMapObjectWithBookable } from '$/__fixtures__/mapObject';
import { prepareUseCurrentSpaceMockOnce, prepareUseRouterMockOnce } from '$/__helpers__/mocks';

import BookablesMap from './BookablesMap.vue';

vi.mock('~/compositions/space/useCurrentSpace');
vi.mock('vue-router');

describe('BookablesMap view', () => {
  beforeAll(() => {
    config.renderStubDefaultSlot = true;
  });

  afterAll(() => {
    config.renderStubDefaultSlot = false;
  });

  it('should render correctly', () => {
    // given
    prepareUseCurrentSpaceMockOnce(undefined);

    // when
    const wrapper = shallowMount(BookablesMap);

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should open booking-create view when clicked on mapObject', async () => {
    expect.assertions(1);
    // given
    prepareUseCurrentSpaceMockOnce(undefined);
    const useRouterMockOnce = prepareUseRouterMockOnce();
    const wrapper = shallowMount(BookablesMap);

    // when
    wrapper.getComponent(MapObjects).vm.$emit('clickOnMapObject', sampleMapObjectWithBookable);
    await nextTick();

    // then
    expect(useRouterMockOnce.push).toHaveBeenCalledWith({
      name: 'booking-create',
      params: { bookableId: (sampleMapObjectWithBookable.link as { bookable: string }).bookable },
    });
  });

  it('should not open booking-create view when clicked on mapObject that is not linked to a bookable', async () => {
    expect.assertions(1);
    // given
    prepareUseCurrentSpaceMockOnce(undefined);
    const useRouterMockOnce = prepareUseRouterMockOnce();
    const wrapper = shallowMount(BookablesMap);

    // when
    wrapper.getComponent(MapObjects).vm.$emit('clickOnMapObject', sampleMapObject);
    await nextTick();

    // then
    expect(useRouterMockOnce.push).not.toHaveBeenCalled();
  });
});
