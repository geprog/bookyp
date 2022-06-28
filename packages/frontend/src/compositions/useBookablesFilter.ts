import { Model } from '@bookyp/core';
import { Params } from '@feathersjs/feathers';
import { computed, Ref, ref } from 'vue';

import useFind from '~/compositions/useFind';

type BookablesFilter = Partial<{ start: Date; end: Date; quickFilterEnabled: boolean }>;

const bookablesFilter: Ref<BookablesFilter | undefined> = ref();

export type BookableWithFilterMatched = Model.Bookable & { isFilterMatched?: boolean };

export const useBookablesFilter = (
  bookables?: Ref<Model.Bookable[]>,
): {
  bookablesFilter: Ref<BookablesFilter | undefined>;
  bookablesWithFilterMatched: Ref<BookableWithFilterMatched[]>;
  isFilterMatched: (bookableID?: Model.Ref<Model.Bookable>) => boolean | null;
} => {
  const bookingsParams = computed<Params | null>(() => {
    if (!bookablesFilter.value) {
      return null;
    }
    return {
      query: {
        start: { $lt: bookablesFilter.value.end?.toISOString() },
        end: { $gt: bookablesFilter.value.start?.toISOString() },
      },
    };
  });

  const { data: bookings, isLoading } = useFind('bookings', bookingsParams);

  const bookablesWithFilterMatched = computed<BookableWithFilterMatched[]>(() => {
    if (!bookables?.value) {
      return [];
    }
    if (!bookablesFilter.value) {
      return bookables.value;
    }

    if (isLoading.value) {
      return bookables.value;
    }

    return bookables.value.map((bookable: BookableWithFilterMatched) => ({
      ...bookable,
      isFilterMatched: !bookings.value.some((booking) => booking.bookable === bookable._id),
    }));
  });

  const bookablesByID = computed(() =>
    bookablesWithFilterMatched.value.reduce(
      (previousBookablesByID: Record<string, BookableWithFilterMatched>, currentBookable) => ({
        ...previousBookablesByID,
        [currentBookable._id]: currentBookable,
      }),
      {},
    ),
  );

  const isFilterMatched = (bookableID?: Model.Ref<Model.Bookable>): boolean | null => {
    if (
      bookableID === undefined ||
      (bookablesByID.value[bookableID] && bookablesByID.value[bookableID].isFilterMatched === undefined)
    ) {
      return null;
    }
    return bookablesByID.value[bookableID] && bookablesByID.value[bookableID].isFilterMatched === true;
  };

  return { bookablesFilter, bookablesWithFilterMatched, isFilterMatched };
};
