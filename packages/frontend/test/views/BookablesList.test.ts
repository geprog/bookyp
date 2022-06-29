import { shallowMount } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { mocked } from 'ts-jest/utils';
import { computed, ref } from 'vue';

import { BookableWithFilterMatched, useBookables } from '~/compositions/useBookables';
import BookablesList from '~/views/BookablesList.vue';
import { sampleBookables } from '$/__fixtures__/bookable';
import { prepareUseCurrentSpaceMockOnce, prepareUseFindMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useFind');
jest.mock('~/compositions/useBookables');
jest.mock('~/compositions/space/useCurrentSpace');

describe('BookablesList component', () => {
  it('should render correctly without filter', () => {
    // given
    prepareUseFindMockOnce(sampleBookables);
    prepareUseCurrentSpaceMockOnce();
    mocked(useBookables).mockReturnValueOnce({
      bookablesWithFilterMatched: computed(() => sampleBookables),
      bookablesFilter: ref(),
      isFilterMatched: jest.fn(),
      userBookings: ref([]),
      isBookedByMe: jest.fn().mockReturnValue(false),
    });

    // when
    const wrapper = shallowMount(BookablesList);

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render correctly with filter', () => {
    // given
    prepareUseFindMockOnce(sampleBookables);
    prepareUseCurrentSpaceMockOnce();
    mocked(useBookables).mockReturnValueOnce({
      bookablesWithFilterMatched: computed(() => {
        const bookablesWithFilterMatched: BookableWithFilterMatched[] = cloneDeep(sampleBookables);
        bookablesWithFilterMatched[0].isFilterMatched = true;
        bookablesWithFilterMatched[1].isFilterMatched = false;
        return bookablesWithFilterMatched;
      }),
      bookablesFilter: ref(),
      isFilterMatched: jest.fn(),
      userBookings: ref([]),
      isBookedByMe: jest.fn().mockReturnValue(false),
    });

    // when
    const wrapper = shallowMount(BookablesList);

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });
});
