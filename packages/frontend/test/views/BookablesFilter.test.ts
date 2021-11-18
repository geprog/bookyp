import { shallowMount } from '@vue/test-utils';
import { mocked } from 'ts-jest/utils';
import { computed, ref } from 'vue';

import { useBookablesFilter } from '~/compositions/useBookablesFilter';
import BookablesFilter from '~/views/BookablesFilter.vue';
import { prepareUseRouterMockOnce } from '$/__helpers__/mocks';

const sampleDate0 = new Date('1993-10-15T03:24:00');
const sampleDate1 = new Date('2001-10-15T03:24:00');
const sampleDate2 = new Date('2002-10-15T03:24:00');

jest.mock('vue-router');
jest.mock('~/compositions/useBookablesFilter');

describe('BookablesFilter component', () => {
  it('should render correctly', () => {
    // given
    // set time to have consistent snapshots
    jest.useFakeTimers('modern').setSystemTime(sampleDate0);
    prepareUseRouterMockOnce();
    mocked(useBookablesFilter).mockReturnValueOnce({
      bookablesWithFilterMatched: computed(() => []),
      bookablesFilter: ref(),
      isFilterMatched: jest.fn(),
    });

    // when
    const wrapper = shallowMount(BookablesFilter);

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should show the current filter values', () => {
    // given
    // set time to have consistent snapshots
    jest.useFakeTimers('modern').setSystemTime(sampleDate0);
    prepareUseRouterMockOnce();
    mocked(useBookablesFilter).mockReturnValueOnce({
      bookablesWithFilterMatched: computed(() => []),
      bookablesFilter: ref({ start: sampleDate1, end: sampleDate2 }),
      isFilterMatched: jest.fn(),
    });

    // when
    const wrapper = shallowMount(BookablesFilter);

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });
});
