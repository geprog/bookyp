import { shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { ref } from 'vue';

import useFind from '~/compositions/useFind';
import Bookings from '~/views/account/Bookings.vue';
import { sampleBookings } from '$/__fixtures__/booking';

jest.mock('~/compositions/useFind');
jest.mock('vue-i18n');

jest.mock('~/compositions/useAuthentication', () => ({
  get user() {
    return {
      _id: 'test-user-id',
      email: 'test-user-mail',
    };
  },
}));

describe('Bookings component', () => {
  it('should render correctly', () => {
    // given
    const useFindMock = {
      data: ref(sampleBookings),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);

    // when
    const wrapper = shallowMount(Bookings, {});

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should group bookings in multiple groups', () => {
    // when
    const wrapper = shallowMount(Bookings, {});

    // then
    expect(wrapper.findAll('[data-test=groupByDates]')).toHaveLength(3);
  });
});
