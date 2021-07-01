import { mount, shallowMount } from '@vue/test-utils';

import BookingItem from '~/components/list-items/BookingItem.vue';
import { sampleBookable } from '$/__fixtures__/bookable';
import { sampleBooking } from '$/__fixtures__/booking';
import { prepareUseGetMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useGet');

describe('BookingItem component', () => {
  it('should render correctly', () => {
    // given
    prepareUseGetMockOnce(sampleBookable);

    // when
    const wrapper = shallowMount(BookingItem, {
      props: {
        booking: sampleBooking,
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should display a label', () => {
    // given
    prepareUseGetMockOnce(sampleBookable);

    // when
    const wrapper = mount(BookingItem, {
      props: {
        booking: sampleBooking,
      },
    });

    // then
    expect(wrapper.find('[data-test="label"]').element.innerHTML).toBe(sampleBookable.name);
  });

  it('should display a hours', () => {
    // given
    prepareUseGetMockOnce(sampleBookable);

    // when
    const wrapper = mount(BookingItem, {
      props: {
        booking: sampleBooking,
      },
    });

    // then
    expect(wrapper.find('[data-test="description"]').element.textContent).toMatchSnapshot();
  });
});
