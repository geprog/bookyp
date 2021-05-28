import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { ref } from 'vue';

import useGet, { UseGet } from '~/compositions/useGet';
import Booking from '~/views/account/Booking.vue';
import { sampleBookable } from '$/__fixtures__/bookable';
import { sampleBooking } from '$/__fixtures__/booking';

jest.mock('~/compositions/useGet');
jest.mock('vue-i18n');

describe('Booking view', () => {
  it('should render correctly', () => {
    // given
    const useGetMockBooking = {
      data: ref(sampleBooking),
      isLoading: ref(false),
    };
    const useGetMockBookable = {
      data: ref(sampleBookable),
      isLoading: ref(false),
    };
    mocked(useGet, true).mockImplementation(
      (serviceName, _id): UseGet<unknown> => {
        if (serviceName === 'bookings' && _id.value === sampleBooking._id) {
          return useGetMockBooking;
        }
        if (serviceName === 'bookables' && _id.value === sampleBooking.bookable) {
          return useGetMockBookable;
        }
        return { isLoading: ref(false), data: ref() };
      },
    );

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
