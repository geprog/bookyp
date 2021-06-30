import { shallowMount } from '@vue/test-utils';

import AccountTabs from '~/components/tabs/AccountTabs.vue';
import { prepareUseRouteMockOnce, prepareUseRouterMockOnce } from '$/__helpers__/mocks';

jest.mock('vue-router');

describe('AccountTabs component', () => {
  it('should render correctly', () => {
    // given
    const useRouteMock = prepareUseRouteMockOnce({ name: 'account-bookings' });
    const useRouterMock = prepareUseRouterMockOnce();

    // when
    const wrapper = shallowMount(AccountTabs, {
      global: {
        mocks: {
          $route: useRouteMock,
          $router: useRouterMock,
        },
        // stub needed due to caching issue. see https://github.com/vuejs/vue-test-utils-next/issues/530
        stubs: {
          TabButton: {
            template: '<div></div>',
          },
        },
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });
});
