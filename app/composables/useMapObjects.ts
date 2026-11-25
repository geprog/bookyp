import type { Ref } from 'vue';
import type { MapObject } from '#shared/types/models';

/** the map objects of a space, refreshed by polling */
export function useMapObjects(spaceId: Ref<string | undefined | null>) {
  const { data, pending, status, loading, refresh } = usePolling(
    () => `map-objects:${spaceId.value}`,
    async () => (spaceId.value ? await $fetch<MapObject[]>(`/api/spaces/${spaceId.value}/map-objects`) : []),
    { watch: [spaceId], default: () => [] },
  );
  return { mapObjects: data, pending, status, loading, refresh };
}
