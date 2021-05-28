import { config, shallowMount } from '@vue/test-utils';
import toDiffableHtml from 'diffable-html';
import { mocked } from 'ts-jest/utils';
import { ref } from 'vue';

import useFind from '~/compositions/useFind';
import Bookings from '~/views/account/Bookings.vue';

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

const bookings = [
  {
    start: new Date('1995-12-17T03:24:00'),
    end: new Date('1995-12-17T07:24:00'),
    bookedBy: 'test-user-id',
    bookable: 'test-bookable-id',
    description: 'test-description',
  },
  {
    start: new Date('1995-12-17T12:24:00'),
    end: new Date('1995-12-17T14:24:00'),
    bookedBy: 'test-user-id',
    bookable: 'test-bookable-id',
    description: 'test-description',
  },
  {
    start: new Date('1995-12-18T03:24:00'),
    end: new Date('1995-12-18T07:24:00'),
    bookedBy: 'test-user-id',
    bookable: 'test-bookable-id',
    description: 'test-description',
  },
];

describe('Bookings component', () => {
  beforeAll(() => {
    config.renderStubDefaultSlot = true;
  });

  afterAll(() => {
    config.renderStubDefaultSlot = false;
  });

  it('should render correctly', () => {
    // given
    const useFindMock = {
      data: ref(bookings),
      isLoading: ref(false),
    };
    mocked(useFind).mockReturnValue(useFindMock);

    // when
    const wrapper = shallowMount(Bookings, {});

    // then
    expect(toDiffableHtml(wrapper.html())).toMatchSnapshot();
  });

  it('should group bookings in two groups', () => {
    // when
    const wrapper = shallowMount(Bookings, {});

    // then
    expect(wrapper.findAll('[data-test=groupByDates]')).toHaveLength(2);
  });
});
