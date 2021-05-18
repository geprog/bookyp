import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import SettingsTabs from '~/components/tabs/SettingsTabs.vue';

describe('SettingsTabs component', () => {
  it('should render correctly when active', () => {
    // given
    const mockRoute = {
      name: 'settings-space',
    };
    const mockRouter = {
      push: jest.fn(),
    };

    // when
    const wrapper = shallowMount(SettingsTabs, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
        },
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });
});
