import type { Ref } from 'vue';
import type { PublicSpace, Space } from '#shared/types/models';

export type AnySpace = Space | PublicSpace;

/** the spaces visible to the current user, optionally filtered by a time range with a free bookable */
export function useSpaces(options: { admin?: boolean; withFrequency?: boolean; freeRange?: Ref<{ start?: Date; end?: Date }> } = {}) {
  const { user } = useAuth();

  const query = computed(() => ({
    ...(options.admin ? { admin: 'true' } : {}),
    ...(options.withFrequency ? { withFrequency: 'true' } : {}),
    ...(options.freeRange?.value.start && options.freeRange.value.end
      ? { freeFrom: options.freeRange.value.start.toISOString(), freeTo: options.freeRange.value.end.toISOString() }
      : {}),
  }));

  const { data, pending, loading, refresh } = usePolling(
    () => `spaces:${JSON.stringify(query.value)}`,
    () => $fetch<AnySpace[]>('/api/spaces', { query: query.value }),
    { watch: [query, user], default: () => [] },
  );

  return { spaces: data, pending, loading, refresh };
}

/** a single space */
export function useSpace(spaceId: Ref<string | undefined>) {
  return usePolling(
    () => `space:${spaceId.value}`,
    async () => (spaceId.value ? await $fetch<AnySpace>(`/api/spaces/${spaceId.value}`) : null),
    { watch: [spaceId] },
  );
}
