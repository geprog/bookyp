import { shallowMount } from '@vue/test-utils';

import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import { prepareUseRouteMockOnce, prepareUseRouterMockOnce } from '$/__helpers__/mocks';

jest.mock('vue-router');

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
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });
});
