import { mount, shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { ref } from 'vue';

import BookingItem from '~/components/list-items/BookingItem.vue';
import useGet from '~/compositions/useGet';
import { sampleBookable } from '$/__fixtures__/bookable';
import { sampleBooking } from '$/__fixtures__/booking';

jest.mock('~/compositions/useGet');

describe('BookingItem component', () => {
  it('should render correctly', () => {
    // given
    const useGetMock = {
      data: ref(sampleBookable),
      isLoading: ref(false),
    };
    mocked(useGet).mockReturnValue(useGetMock);
    // when
    const wrapper = shallowMount(BookingItem, {
      props: {
        booking: sampleBooking,
      },
    });

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should display a label', () => {
    //given

    //when
    const wrapper = mount(BookingItem, {
      props: {
        booking: sampleBooking,
      },
    });

    //then
    expect(wrapper.find('[data-test="label"]').element.innerHTML).toBe(sampleBookable.name);
  });

  it('should display a hours', () => {
    //given

    //when
    const wrapper = mount(BookingItem, {
      props: {
        booking: sampleBooking,
      },
    });

    //then
    expect(wrapper.find('[data-test="description"]').element.textContent).toMatchSnapshot();
  });
});
