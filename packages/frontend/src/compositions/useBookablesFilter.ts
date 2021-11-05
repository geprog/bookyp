import { Model } from '@bookyp/core';
import { Params } from '@feathersjs/feathers';
import { computed, ComputedRef, Ref, ref } from 'vue';

import useFind from '~/compositions/useFind';

type BookablesFilter = Partial<{ start: Date; end: Date }>;

const bookablesFilter: Ref<BookablesFilter | undefined> = ref();

export type BookableWithFilterMatched = Model.Bookable & { isFilterMatched?: boolean };

export const useBookablesFilter = (
  bookables?: Ref<Model.Bookable[]>,
): {
  bookablesFilter: Ref<BookablesFilter | undefined>;
  bookablesWithFilterMatched: ComputedRef<BookableWithFilterMatched[]>;
} => {
  const bookingsParams: ComputedRef<Params | null> = computed(() => {
    if (!bookablesFilter.value) {
      return null;
    }
    return {
      query: {
        start: { $lt: bookablesFilter.value.start },
        end: { $gt: bookablesFilter.value.end },
      },
    };
  });

  const { data: bookings } = useFind('bookings', bookingsParams);

  const bookablesWithFilterMatched = computed<BookableWithFilterMatched[]>(() => {
    if (!bookables?.value) {
      return [];
    }
    if (!bookablesFilter.value) {
      return bookables.value;
    }

    return bookables.value.map((bookable: BookableWithFilterMatched) => {
      if (!bookings.value) {
        return bookable;
      }
      return {
        ...bookable,
        isFilterMatched: !bookings.value.some((booking) => booking.bookable === bookable._id),
      };
    });
  });
  return { bookablesFilter, bookablesWithFilterMatched };
};
