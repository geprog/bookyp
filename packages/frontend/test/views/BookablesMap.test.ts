import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { nextTick } from 'vue';

import ToggleBar from '~/components/buttons/ToggleBar.vue';
import MapObjects from '~/components/space/MapObjects.vue';
import BookablesMap from '~/views/BookablesMap.vue';
import { mapObjects } from '$/__fixtures__/mapObject';
import { prepareUseRouterMockOnce } from '$/helpers/mocks';

jest.mock('vue-router');
jest.mock('~/compositions/useFind');
jest.mock('~/compositions/useAuthentication');

describe('BookablesMap view', () => {
  it('should render correctly', () => {
    // given

    // when
    const wrapper = shallowMount(BookablesMap);

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should open booking-create view when clicked on mapObject', async () => {
    expect.assertions(1);
    // given
    const { pushMock } = prepareUseRouterMockOnce();
    const wrapper = shallowMount(BookablesMap);

    // when
    wrapper.getComponent(MapObjects).vm.$emit('click-on-map-object', mapObjects[0]);
    await nextTick();

    // then
    expect(pushMock).toHaveBeenCalledWith({ name: 'booking-create', params: { bookableId: mapObjects[0].bookable } });
  });

  it('should not open booking-create view when clicked on mapObject that is not linked to a bookable', async () => {
    expect.assertions(1);
    // given
    const { pushMock } = prepareUseRouterMockOnce();
    const wrapper = shallowMount(BookablesMap);

    // when
    wrapper.getComponent(MapObjects).vm.$emit('click-on-map-object', mapObjects[1]);
    await nextTick();

    // then
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('should open bookables-list when clicked on toggle bar', async () => {
    expect.assertions(1);
    // given
    const mockRouter = {
      replace: jest.fn(),
    };
    const wrapper = shallowMount(BookablesMap, {
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });

    // when
    wrapper.getComponent(ToggleBar).vm.$emit('selected-end');
    await nextTick();

    // then
    expect(mockRouter.replace).toHaveBeenCalledWith({ name: 'bookables-list' });
  });
});
