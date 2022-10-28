import { Model } from '@bookyp/core';
import { Params } from '@feathersjs/feathers';
import dayjs from 'dayjs';
import { computed, onBeforeUnmount, onMounted, Ref, ref } from 'vue';

import { user } from '~/compositions/useAuthentication';
import useFind from '~/compositions/useFind';

type BookablesFilter = Partial<{ start: Date; end: Date; quickFilterEnabled: boolean }>;

const bookablesFilter: Ref<BookablesFilter | undefined> = ref();

const startUpdateInterval = ref<ReturnType<typeof setTimeout>>();

export type BookableWithFilterMatched = Model.Bookable & { isFilterMatched?: boolean };

export function ceilDate(_date: Date, amount: number, unit: 'minutes'): Date {
  const date = dayjs(_date);
  return date
    .add(amount - (date.get(unit) % amount), unit)
    .startOf(unit)
    .toDate();
}

export const useBookables = (
  bookables?: Ref<Model.Bookable[]>,
): {
  bookablesFilter: Ref<BookablesFilter | undefined>;
  bookablesWithFilterMatched: Ref<BookableWithFilterMatched[]>;
  isFilterMatched: (bookableID?: Model.Ref<Model.Bookable>) => boolean | null;
  userBookings: Ref<Model.Booking[]>;
  isBookedByMe: (bookableID?: Model.Ref<Model.Bookable>) => boolean;
  resetBookablesFilter: () => void;
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

  const userBookings = computed(() => bookings.value?.filter((booking) => booking.bookedBy === user.value?._id));

  const isBookedByMe = (bookableID?: Model.Ref<Model.Bookable>): boolean => {
    if (bookableID === undefined) {
      return false;
    }
    return userBookings.value.some((booking) => booking.bookable === bookableID);
  };

  const resetBookablesFilter = () => {
    bookablesFilter.value = {
      start: ceilDate(dayjs().toDate(), 15, 'minutes'),
      end: ceilDate(dayjs().add(2, 'hour').toDate(), 15, 'minutes'),
      quickFilterEnabled: true,
    };
  };

  onMounted(() => {
    if (bookablesFilter.value === undefined) {
      resetBookablesFilter();
    }

    // update start and end of quick filter every minute
    if (startUpdateInterval.value === undefined) {
      startUpdateInterval.value = setInterval(() => {
        if (!bookablesFilter.value?.quickFilterEnabled) {
          return;
        }

        const newStart = ceilDate(dayjs().toDate(), 15, 'minutes');
        bookablesFilter.value = {
          ...bookablesFilter.value,
          start: newStart,
          end: dayjs(newStart)
            .add(Math.abs(dayjs(bookablesFilter.value.start).diff(dayjs(bookablesFilter.value.end))))
            .toDate(),
        };
      }, 1000 * 60);
    }
  });

  onBeforeUnmount(() => {
    if (startUpdateInterval.value) {
      clearInterval(startUpdateInterval.value);
      startUpdateInterval.value = undefined;
    }
  });

  return {
    bookablesFilter,
    bookablesWithFilterMatched,
    isFilterMatched,
    userBookings,
    isBookedByMe,
    resetBookablesFilter,
  };
};
