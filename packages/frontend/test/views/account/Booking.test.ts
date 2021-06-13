import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { nextTick } from 'vue';

import Booking from '~/views/account/Booking.vue';
import { sampleBookable } from '$/__fixtures__/bookable';
import { sampleBooking } from '$/__fixtures__/booking';
import { prepareUseFeathersMockOnce, prepareUseGetMockOnce, prepareUseRouterMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useGet');
jest.mock('~/compositions/useFeathers');
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

  it('should delete the booking', async () => {
    expect.assertions(1);
    // given
    prepareUseGetMockOnce(sampleBooking);
    prepareUseGetMockOnce(sampleBookable);
    prepareUseRouterMockOnce();
    const useFeathersMock = prepareUseFeathersMockOnce();

    const wrapper = shallowMount(Booking, {
      props: {
        bookingId: sampleBooking._id,
      },
    });

    // when
    wrapper.findComponent('[data-test=delete-button]').vm.$emit('click');
    await nextTick();

    // then
    expect(useFeathersMock.remove).toHaveBeenCalledWith(sampleBooking._id);
  });
});
