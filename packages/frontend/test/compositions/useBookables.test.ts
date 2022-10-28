import { mount } from '@vue/test-utils';
import { ref } from 'vue';

import { sampleBookable, sampleBookables } from '$/__fixtures__/bookable';
import { sampleBooking } from '$/__fixtures__/booking';
import { prepareUseFindMockOnce } from '$/__helpers__/mocks';

vi.mock('~/compositions/useFind');

let useBookables: typeof import('~/compositions/useBookables');

describe('useBookables composition', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    useBookables = await import('~/compositions/useBookables');
  });

  it('should return original bookables when no filter is set', () => {
    // given
    prepareUseFindMockOnce();
    const component = {
      template: '<p>Horst</p>',
      setup() {
        // when
        const { bookablesWithFilterMatched } = useBookables.useBookables(ref(sampleBookables));

        // then
        expect(bookablesWithFilterMatched.value).toStrictEqual(sampleBookables);
      },
    };
    mount(component);
  });

  it('should return modified bookables that match when filter is set but no bookings are present', () => {
    expect.assertions(2);
    // given
    prepareUseFindMockOnce();
    const component = {
      template: '<p>Horst</p>',
      setup() {
        // when
        const { bookablesWithFilterMatched, bookablesFilter } = useBookables.useBookables(ref(sampleBookables));
        bookablesFilter.value = { start: new Date(), end: new Date() };

        // then
        expect(bookablesWithFilterMatched.value[0].isFilterMatched).toBe(true);
        expect(bookablesWithFilterMatched.value[1].isFilterMatched).toBe(true);
      },
    };
    mount(component);
  });

  it('should return modified bookable that does not match when filter is set and booking already exist', () => {
    expect.assertions(1);
    // given
    prepareUseFindMockOnce([sampleBooking]);
    const component = {
      template: '<p>Horst</p>',
      setup() {
        // when
        const { bookablesWithFilterMatched, bookablesFilter } = useBookables.useBookables(ref([sampleBookable]));
        bookablesFilter.value = {
          start: new Date('2018-08-08T08:00:00'),
          end: new Date('2018-08-08T08:01:00'),
        };

        // then
        expect(bookablesWithFilterMatched.value[0].isFilterMatched).toBe(false);
      },
    };
    mount(component);
  });
});
