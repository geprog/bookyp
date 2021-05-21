import { Model } from '@bookyp/core';
import { mount, shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { ref } from 'vue';

import BookingItem from '~/components/BookingItem.vue';
import useGet from '~/compositions/useGet';

jest.mock('~/compositions/useGet');

const booking: Model.Booking = {
  _id: 'test-booking-id',
  start: new Date('1995-12-17T03:24:00'),
  end: new Date('1995-12-17T07:24:00'),
  bookedBy: 'test-user-id',
  bookable: 'test-bookable-id',
  description: 'test-description',
};

const bookable: Model.Bookable = {
  _id: 'test-bookable-id',
  name: 'test-bookable',
  description: 'test-bookable-description',
};

describe('BookingItem component', () => {
  it('should render correctly', () => {
    // given
    const useGetMock = {
      data: ref(bookable),
      isLoading: ref(false),
    };
    mocked(useGet).mockReturnValue(useGetMock);
    // when
    const wrapper = shallowMount(BookingItem, {
      props: {
        booking: booking,
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
        booking: booking,
      },
    });

    //then
    expect(wrapper.find<HTMLLabelElement>('label').element.innerHTML).toBe(bookable.name);
  });
  it('should display a hours', () => {
    //given

    //when
    const wrapper = mount(BookingItem, {
      props: {
        booking: booking,
      },
    });

    //then
    expect(wrapper.find<HTMLParagraphElement>('p').element.textContent).toBe('03:24 - 07:24');
  });
});
