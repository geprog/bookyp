import { shallowMount } from '@vue/test-utils';

import Bookings from '~/views/account/Bookings.vue';
import { sampleBookings } from '$/__fixtures__/booking';
import { prepareUseCurrentSpaceMockOnce, prepareUseFindMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useFind');
jest.mock('~/compositions/space/useCurrentSpace');
jest.mock('vue-i18n');
jest.mock('~/compositions/useAuthentication');

describe('Bookings component', () => {
  it('should render correctly', () => {
    // given
    prepareUseFindMockOnce(sampleBookings);
    prepareUseCurrentSpaceMockOnce();

    // when
    const wrapper = shallowMount(Bookings);

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should group bookings in multiple groups', () => {
    // given
    prepareUseFindMockOnce(sampleBookings);
    prepareUseCurrentSpaceMockOnce();

    // when
    const wrapper = shallowMount(Bookings);

    // then
    expect(wrapper.findAll('[data-test=groupByDates]')).toHaveLength(3);
  });
});
