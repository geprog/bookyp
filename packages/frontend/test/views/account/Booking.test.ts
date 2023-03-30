import { config, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { openDialog } from 'vue3-promise-dialog';

import { user } from '~/compositions/useAuthentication';
import Booking from '~/views/account/Booking.vue';
import { sampleBookable } from '$/__fixtures__/bookable';
import { sampleBooking } from '$/__fixtures__/booking';
import { sampleSpace } from '$/__fixtures__/space';
import { sampleUser } from '$/__fixtures__/user';
import { i18n } from '$/__helpers__/i18n';
import { prepareUseFeathersMockOnce, prepareUseGetMockOnce } from '$/__helpers__/mocks';

vi.mock('~/compositions/useGet');
vi.mock('~/compositions/useFeathers');
vi.mock('vue3-promise-dialog');
vi.mock('~/compositions/useRouter');

describe('Booking view', () => {
  beforeAll(() => {
    config.renderStubDefaultSlot = true;
  });

  afterAll(() => {
    config.renderStubDefaultSlot = false;
  });

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

  it('should delete the booking', async () => {
    expect.assertions(2);
    // given
    prepareUseGetMockOnce(sampleBooking);
    prepareUseGetMockOnce(sampleSpace);
    prepareUseGetMockOnce(sampleUser);
    prepareUseGetMockOnce(sampleBookable);
    user.value = sampleUser;
    vi.mocked(openDialog).mockResolvedValue(true);

    const useFeathersMock = prepareUseFeathersMockOnce();

    const wrapper = shallowMount(Booking, {
      props: {
        bookingId: sampleBooking._id,
      },
      global: { plugins: [i18n] },
    });

    // when
    await wrapper.findComponent('[data-test=delete-button]').trigger('click');
    await nextTick();

    // then
    expect(openDialog).toHaveBeenCalledOnce();
    expect(useFeathersMock.remove).toHaveBeenCalledWith(sampleBooking._id);
  });
});
