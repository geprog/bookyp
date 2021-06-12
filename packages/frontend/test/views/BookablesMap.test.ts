import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { nextTick } from 'vue';

import BookablesMap from '~/views/BookablesMap.vue';
import { sampleMapObject, sampleMapObjectWithBookable } from '$/__fixtures__/mapObject';
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
    const useRouterMockOnce = prepareUseRouterMockOnce();
    const wrapper = shallowMount(BookablesMap);

    // when
    wrapper.getComponent('[data-test=map-objects]').vm.$emit('click-on-map-object', sampleMapObjectWithBookable);
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
    wrapper.getComponent('[data-test=map-objects]').vm.$emit('click-on-map-object', sampleMapObject);
    await nextTick();

    // then
    expect(useRouterMockOnce.push).not.toHaveBeenCalled();
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
    wrapper.getComponent('[data-test=toggle-bar]').vm.$emit('selected-end');
    await nextTick();

    // then
    expect(mockRouter.replace).toHaveBeenCalledWith({ name: 'bookables-list' });
  });
});
