import { shallowMount } from '@vue/test-utils';

import Booking from '~/views/account/Booking.vue';
import { sampleBookable } from '$/__fixtures__/bookable';
import { sampleBooking } from '$/__fixtures__/booking';
import { sampleSpace } from '$/__fixtures__/space';
import { sampleUser } from '$/__fixtures__/user';
import { i18n } from '$/__helpers__/i18n';
import { prepareUseGetMockOnce } from '$/__helpers__/mocks';

vi.mock('~/compositions/useGet');
vi.mock('~/compositions/useFeathers');
vi.mock('~/compositions/useDialog');
vi.mock('~/compositions/useBack', () => ({
  useBack: () => ({
    back: vi.fn(),
  }),
}));

describe('Booking view', () => {
  it('should render correctly', () => {
    // given
    prepareUseGetMockOnce(sampleBooking);
    prepareUseGetMockOnce(sampleSpace);
    prepareUseGetMockOnce(sampleUser);
    prepareUseGetMockOnce(sampleBookable);

    // when
    const wrapper = shallowMount(Booking, {
      props: {
        bookingId: sampleBooking._id,
      },
      global: { plugins: [i18n] },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });
});
