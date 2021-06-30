import { shallowMount } from '@vue/test-utils';

import Bookings from '~/views/account/Bookings.vue';
import { sampleBookings } from '$/__fixtures__/booking';
import { sampleUser } from '$/__fixtures__/user';
import { prepareUseFindMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useFind');
jest.mock('vue-i18n');
jest.mock('~/compositions/useAuthentication', () => ({
  get user() {
    return sampleUser;
  },
}));

describe('Bookings component', () => {
  it('should render correctly', () => {
    // given
    prepareUseFindMockOnce(sampleBookings);

    // when
    const wrapper = shallowMount(Bookings);

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should group bookings in multiple groups', () => {
    // given
    prepareUseFindMockOnce(sampleBookings);

    // when
    const wrapper = shallowMount(Bookings);

    // then
    expect(wrapper.findAll('[data-test=groupByDates]')).toHaveLength(3);
  });
});
