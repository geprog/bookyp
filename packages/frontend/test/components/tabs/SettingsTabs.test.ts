import { shallowMount } from '@vue/test-utils';

import SettingsTabs from '~/components/tabs/SettingsTabs.vue';
import { prepareUseRouteMockOnce, prepareUseRouterMockOnce } from '$/__helpers__/mocks';

jest.mock('vue-router');

describe('SettingsTabs component', () => {
  it('should render correctly when active', () => {
    // given
    const useRouteMock = prepareUseRouteMockOnce({ name: 'settings-space' });
    const useRouterMock = prepareUseRouterMockOnce();

    // when
    const wrapper = shallowMount(SettingsTabs, {
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
