import { shallowMount } from '@vue/test-utils';

import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import { i18n } from '$/__helpers__/i18n';
import { prepareUseRouteMockOnce, prepareUseRouterMockOnce } from '$/__helpers__/mocks';

vi.mock('vue-router');
vi.mock('~/router');

describe('SettingsHeader component', () => {
  it('should render correctly when active', () => {
    // given
    const useRouteMock = prepareUseRouteMockOnce({ name: 'settings-space' });
    const useRouterMock = prepareUseRouterMockOnce();

    // when
    const wrapper = shallowMount(SettingsHeader, {
      props: {
        title: 'Title',
      },
      global: {
        mocks: {
          $route: useRouteMock,
          $router: useRouterMock,
        },
        plugins: [i18n],
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should allow overwriting actions e.g. for save/cancel actions', () => {
    // given
    const useRouteMock = prepareUseRouteMockOnce({ name: 'settings-space' });
    const useRouterMock = prepareUseRouterMockOnce();

    // when
    const wrapper = shallowMount(SettingsHeader, {
      props: {
        title: 'Title',
      },
      slots: {
        actions: 'Custom actions',
      },
      global: {
        mocks: {
          $route: useRouteMock,
          $router: useRouterMock,
        },
        plugins: [i18n],
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });
});
