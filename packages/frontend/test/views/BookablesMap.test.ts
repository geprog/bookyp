import { config, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import MapObjects from '~/components/space/MapObjects.vue';
import BookablesMap from '~/views/BookablesMap.vue';
import { sampleMapObject, sampleMapObjectWithBookable } from '$/__fixtures__/mapObject';
import { prepareUseRouterMockOnce } from '$/__helpers__/mocks';

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

    // when
    const wrapper = shallowMount(BookablesMap);

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should open booking-create view when clicked on mapObject', async () => {
    expect.assertions(1);
    // given
    const useRouterMockOnce = prepareUseRouterMockOnce();
    const wrapper = shallowMount(BookablesMap);

    // when
    wrapper.getComponent(MapObjects).vm.$emit('clickOnMapObject', sampleMapObjectWithBookable.bookable);
    await nextTick();

    // then
    expect(useRouterMockOnce.push).toHaveBeenCalledWith({
      name: 'booking-create',
      params: { bookableId: sampleMapObjectWithBookable.bookable },
    });
  });

  it('should not open booking-create view when clicked on mapObject that is not linked to a bookable', async () => {
    expect.assertions(1);
    // given
    const useRouterMockOnce = prepareUseRouterMockOnce();
    const wrapper = shallowMount(BookablesMap);

    // when
    wrapper.getComponent(MapObjects).vm.$emit('clickOnMapObject', sampleMapObject.bookable);
    await nextTick();

    // then
    expect(useRouterMockOnce.push).not.toHaveBeenCalled();
  });
});
