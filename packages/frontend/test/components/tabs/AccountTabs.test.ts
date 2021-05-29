import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import AccountTabs from '~/components/tabs/AccountTabs.vue';

describe('AccountTabs component', () => {
  it('should render correctly when active', () => {
    // given
    const mockRoute = {
      name: 'account-bookings',
    };
    const mockRouter = {
      push: jest.fn(),
    };

    // when
    const wrapper = shallowMount(AccountTabs, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter,
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
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });
});
