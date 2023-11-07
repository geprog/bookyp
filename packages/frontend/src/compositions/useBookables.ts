import { Model } from '@bookyp/core';
import { Params } from '@feathersjs/feathers';
import dayjs from 'dayjs';
import { computed, onBeforeUnmount, onMounted, Ref, ref } from 'vue';

import { user } from '~/compositions/useAuthentication';
import { DateFilter, useDateFilter } from '~/compositions/useDateFilter';
import useFind from '~/compositions/useFind';

import { useCurrentTime } from './useCurrentTime';

const now = ref(new Date());
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
  dateFilter: Ref<DateFilter>;
  combinedFilter: Ref<DateFilter>;
  bookablesWithFilterMatched: Ref<BookableWithFilterMatched[]>;
  userBookings: Ref<Model.Booking[]>;
  allBookings: Ref<Model.Booking[]>;
  isFilterMatched: (bookableID?: Model.Ref<Model.Bookable>) => boolean | null;
  isBookedByMe: (bookableID?: Model.Ref<Model.Bookable>) => boolean;
  resetBookablesFilter: () => void;
  isRequested: (bookableID?: Model.Ref<Model.Bookable>) => boolean;
  isRequestedByMe: (bookableID?: Model.Ref<Model.Bookable>) => boolean;
} => {
  const { dateFilter } = useDateFilter();
  const { currentTime } = useCurrentTime();

  const defaultFilter = computed(() => {
    const start = ceilDate(dayjs(currentTime.value).toDate(), 15, 'minutes');
    return {
      start,
      end: dayjs(start).add(2, 'hours').toDate(),
    };
  });

  const combinedFilter = computed(() => ({
    start: dateFilter.value.start || defaultFilter.value.start,
    end: dateFilter.value.end || defaultFilter.value.end,
  }));

  const bookingsParams = computed<Params | null>(() => {
    if (combinedFilter.value.start && combinedFilter.value.end) {
      return {
        query: {
          start: { $lt: combinedFilter.value.end.toISOString() },
          end: { $gt: combinedFilter.value.start.toISOString() },
        },
      };
    }

    return null;
  });

  const { data: bookings, isLoading } = useFind('bookings', bookingsParams);

  const bookablesWithFilterMatched = computed<BookableWithFilterMatched[]>(() => {
    if (!bookables?.value || isLoading.value) {
      return [];
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

  function isFilterMatched(bookableID?: Model.Ref<Model.Bookable>): boolean | null {
    if (
      bookableID === undefined ||
      (bookablesByID.value[bookableID] && bookablesByID.value[bookableID].isFilterMatched === undefined)
    ) {
      return null;
    }
    return bookablesByID.value[bookableID] && bookablesByID.value[bookableID].isFilterMatched === true;
  }

  const userBookings = computed(() =>
    bookings.value?.filter((booking) => user.value?._id && booking.bookedBy === user.value?._id),
  );

  const allBookings = computed(() =>
    bookings.value?.filter((booking) => bookables?.value.map((bookable) => bookable._id).includes(booking.bookable)),
  );

  function isBookedByMe(bookableID?: Model.Ref<Model.Bookable>): boolean {
    if (bookableID === undefined) {
      return false;
    }
    return userBookings.value.some((booking) => booking.bookable === bookableID);
  }

  function isRequestedByMe(bookableID?: Model.Ref<Model.Bookable>): boolean {
    if (bookableID === undefined) {
      return false;
    }
    return userBookings.value.some((booking) => booking.bookable === bookableID && booking.request);
  }

  function isRequested(bookableID?: Model.Ref<Model.Bookable>): boolean {
    if (bookableID === undefined) {
      return false;
    }
    return allBookings.value.some((booking) => booking.bookable === bookableID && booking.request);
  }

  function resetBookablesFilter() {
    dateFilter.value = {
      start: undefined,
      end: undefined,
    };
  }

  onMounted(() => {
    if (startUpdateInterval.value === undefined) {
      startUpdateInterval.value = setInterval(() => {
        now.value = new Date();
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
    dateFilter,
    combinedFilter,
    bookablesWithFilterMatched,
    isFilterMatched,
    userBookings,
    allBookings,
    isBookedByMe,
    resetBookablesFilter,
    isRequestedByMe,
    isRequested,
  };
};
