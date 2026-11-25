import type { Ref } from 'vue';
import type { Bookable } from '#shared/types/models';
import type { AnySpace } from '~/composables/useSpaces';

/** loads the bookables of the given ids (deleted ones included) as a map, used to render booking lists */
export function useBookableLookup(bookableIds: Ref<string[]>) {
  const { data } = useApiData(
    'bookable-lookup',
    async () => {
      const ids = [...new Set(bookableIds.value)];
      const bookables = await Promise.all(ids.map(id => $fetch<Bookable>(`/api/bookables/${id}`).catch(() => undefined)));
      return bookables.filter((b): b is Bookable => !!b);
    },
    { watch: [bookableIds], default: () => [] },
  );
  return computed(() => new Map<string, Bookable>((data.value ?? []).map(b => [b._id, b])));
}

/** the visible spaces as a map by id */
export function useSpaceLookup() {
  const { spaces } = useSpaces();
  return computed(() => new Map<string, AnySpace>((spaces.value ?? []).map(s => [s._id, s])));
}
