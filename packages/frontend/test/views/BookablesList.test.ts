import { config, shallowMount } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { computed, ref } from 'vue';

import { BookableWithFilterMatched, useBookables } from '~/compositions/useBookables';
import BookablesList from '~/views/BookablesList.vue';
import { sampleBookables } from '$/__fixtures__/bookable';
import { i18n } from '$/__helpers__/i18n';
import { prepareUseCurrentSpaceMockOnce, prepareUseFindMockOnce } from '$/__helpers__/mocks';

vi.mock('~/compositions/useFind');
vi.mock('~/compositions/useBookables');
vi.mock('~/compositions/space/useCurrentSpace');

describe('BookablesList component', () => {
  beforeAll(() => {
    config.renderStubDefaultSlot = true;
  });

  afterAll(() => {
    config.renderStubDefaultSlot = false;
  });

  it('should render correctly without filter', () => {
    // given
    prepareUseFindMockOnce(sampleBookables);
    prepareUseCurrentSpaceMockOnce();
    vi.mocked(useBookables).mockReturnValueOnce({
      bookablesWithFilterMatched: computed(() => sampleBookables),
      bookablesFilter: ref(),
      isFilterMatched: vi.fn(),
      userBookings: ref([]),
      isBookedByMe: vi.fn().mockReturnValue(false),
      resetBookablesFilter: vi.fn(),
    });

    // when
    const wrapper = shallowMount(BookablesList, {
      global: {
        plugins: [i18n],
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render correctly with filter', () => {
    // given
    prepareUseFindMockOnce(sampleBookables);
    prepareUseCurrentSpaceMockOnce();
    vi.mocked(useBookables).mockReturnValueOnce({
      bookablesWithFilterMatched: computed(() => {
        const bookablesWithFilterMatched: BookableWithFilterMatched[] = cloneDeep(sampleBookables);
        bookablesWithFilterMatched[0].isFilterMatched = true;
        bookablesWithFilterMatched[1].isFilterMatched = false;
        return bookablesWithFilterMatched;
      }),
      bookablesFilter: ref(),
      isFilterMatched: vi.fn(),
      userBookings: ref([]),
      isBookedByMe: vi.fn().mockReturnValue(false),
      resetBookablesFilter: vi.fn(),
    });

    // when
    const wrapper = shallowMount(BookablesList, {
      global: {
        plugins: [i18n],
      },
    });

    // then
    expect(wrapper.html()).toMatchSnapshot();
  });
});
