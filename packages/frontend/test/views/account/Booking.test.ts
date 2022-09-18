import { config, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';

import DeleteDialog from '~/components/DeleteDialog.vue';
import Booking from '~/views/account/Booking.vue';
import { sampleBookable } from '$/__fixtures__/bookable';
import { sampleBooking } from '$/__fixtures__/booking';
import { sampleSpace } from '$/__fixtures__/space';
import { i18n } from '$/__helpers__/i18n';
import { prepareUseFeathersMockOnce, prepareUseGetMockOnce, prepareUseRouterMockOnce } from '$/__helpers__/mocks';

vi.mock('~/compositions/useGet');
vi.mock('~/compositions/useFeathers');
vi.mock('vue-router');

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
    prepareUseGetMockOnce(sampleBookable);
    prepareUseRouterMockOnce();

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
    expect.assertions(1);
    // given
    prepareUseGetMockOnce(sampleBooking);
    prepareUseGetMockOnce(sampleSpace);
    prepareUseGetMockOnce(sampleBookable);
    prepareUseRouterMockOnce();
    const useFeathersMock = prepareUseFeathersMockOnce();

    const wrapper = shallowMount(Booking, {
      props: {
        bookingId: sampleBooking._id,
      },
      global: { plugins: [i18n] },
    });

    // when
    await wrapper.findComponent('[data-test=delete-button]').trigger('click');
    wrapper.findComponent(DeleteDialog).vm.$emit('confirmation', true);
    await nextTick();

    // then
    expect(useFeathersMock.remove).toHaveBeenCalledWith(sampleBooking._id);
  });
});
