import { shallowMount } from '@vue/test-utils';

import Bookings from '~/views/account/Bookings.vue';
import { sampleBookings } from '$/__fixtures__/booking';
import { i18n } from '$/__helpers__/i18n';
import { prepareUseCurrentSpaceMockOnce, prepareUseFindMockOnce, prepareUseRouteMockOnce } from '$/__helpers__/mocks';

vi.mock('vue-router');
vi.mock('~/compositions/useFind');
vi.mock('~/compositions/space/useCurrentSpace');
vi.mock('~/compositions/useAuthentication');
vi.mock('~/router');

describe('Bookings component', () => {
  it('should render correctly', () => {
    // given
    const useRouteMock = prepareUseRouteMockOnce();
    prepareUseFindMockOnce(sampleBookings);
    prepareUseCurrentSpaceMockOnce();

    // when
    const wrapper = shallowMount(Bookings, {
      global: {
        mocks: {
          $route: useRouteMock,
        },
        stubs: ['router-link'],
        plugins: [i18n],
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should group bookings in multiple groups', () => {
    // given
    const useRouteMock = prepareUseRouteMockOnce();
    prepareUseFindMockOnce(sampleBookings);
    prepareUseCurrentSpaceMockOnce();

    // when
    const wrapper = shallowMount(Bookings, {
      global: {
        mocks: {
          $route: useRouteMock,
        },
        stubs: ['router-link'],
        plugins: [i18n],
      },
    });

    // then
    expect(wrapper.findAll('[data-test=groupByDates]')).toHaveLength(3);
  });
});
