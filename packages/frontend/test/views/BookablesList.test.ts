import { shallowMount } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { mocked } from 'ts-jest/utils';
import { computed, ref } from 'vue';

import { BookableWithFilterMatched, useBookablesFilter } from '~/compositions/useBookablesFilter';
import BookablesList from '~/views/BookablesLists.vue';
import { sampleBookables } from '$/__fixtures__/bookable';
import { prepareUseCurrentSpaceMockOnce, prepareUseFindMockOnce } from '$/__helpers__/mocks';

jest.mock('~/compositions/useFind');
jest.mock('~/compositions/useBookablesFilter');
jest.mock('~/compositions/space/useCurrentSpace');

describe('BookablesList component', () => {
  it('should render correctly without filter', () => {
    // given
    prepareUseFindMockOnce(sampleBookables);
    prepareUseCurrentSpaceMockOnce();
    mocked(useBookablesFilter).mockReturnValueOnce({
      bookablesWithFilterMatched: computed(() => sampleBookables),
      bookablesFilter: ref(),
      isFilterMatched: jest.fn(),
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
    mocked(useBookablesFilter).mockReturnValueOnce({
      bookablesWithFilterMatched: computed(() => {
        const bookablesWithFilterMatched: BookableWithFilterMatched[] = cloneDeep(sampleBookables);
        bookablesWithFilterMatched[0].isFilterMatched = true;
        bookablesWithFilterMatched[1].isFilterMatched = false;
        return bookablesWithFilterMatched;
      }),
      bookablesFilter: ref(),
      isFilterMatched: jest.fn(),
    });

    // when
    const wrapper = shallowMount(BookablesList);

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });
});
