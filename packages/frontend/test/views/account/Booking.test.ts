import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';

import Booking from '~/views/account/Booking.vue';
import { sampleBookable } from '$/__fixtures__/bookable';
import { sampleBooking } from '$/__fixtures__/booking';
import { prepareUseGetMockOnce, prepareUseRouterMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useGet');
jest.mock('vue-i18n');
jest.mock('vue-router');

describe('Booking view', () => {
  it('should render correctly', () => {
    // given
    prepareUseGetMockOnce(sampleBooking);
    prepareUseGetMockOnce(sampleBookable);
    prepareUseRouterMockOnce();

    // when
    const wrapper = shallowMount(Booking, {
      props: {
        bookingId: sampleBooking._id,
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });
});
