import type { Ref } from 'vue';
import type { MapObjectType } from '#shared/types/models';
import type { MapObjectTypeDefinition } from '#shared/utils/mapObjectTypes';
import { defaultMapObjectTypes } from '#shared/utils/mapObjectTypes';

/** the default map object types plus the ones uploaded for the space */
export function useMapObjectTypes(spaceId: Ref<string>) {
  const { data: custom, refresh } = useApiData(
    () => `map-object-types:${spaceId.value}`,
    () => $fetch<MapObjectType[]>(`/api/spaces/${spaceId.value}/map-object-types`),
    { watch: [spaceId], default: () => [] },
  );

  const mapObjectTypes = computed<(MapObjectTypeDefinition & { _id?: string })[]>(() => [
    ...defaultMapObjectTypes,
    ...(custom.value ?? []).map(type => ({ _id: type._id, name: type.name, viewBox: type.viewBox, paths: type.paths, bgPaths: type.bgPaths })),
  ]);

  return { mapObjectTypes, refresh };
}
