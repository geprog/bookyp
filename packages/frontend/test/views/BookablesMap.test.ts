import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import MapObjects from '~/components/space/MapObjects.vue';
import BookablesMap from '~/views/BookablesMap.vue';
import { sampleMapObject, sampleMapObjectWithBookable } from '$/__fixtures__/mapObject';
import { prepareUseRouterMockOnce } from '$/__helpers__/mocks';

jest.mock('vue-router');
jest.mock('~/compositions/useFind');
jest.mock('~/compositions/useAuthentication');

describe('BookablesMap view', () => {
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
    wrapper.getComponent(MapObjects).vm.$emit('click-on-map-object', sampleMapObjectWithBookable.bookable);
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
    wrapper.getComponent(MapObjects).vm.$emit('click-on-map-object', sampleMapObject.bookable);
    await nextTick();

    // then
    expect(useRouterMockOnce.push).not.toHaveBeenCalled();
  });
});
