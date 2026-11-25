import type { ComputedRef, InjectionKey, Ref } from 'vue';
import type { Bookable } from '#shared/types/models';
import type { MapObjectTypeDefinition } from '#shared/utils/mapObjectTypes';
import type { EditorMode } from '~/components/map/FloorPlanEditing.vue';
import type { EditingMapObject } from '~/composables/useMapEditor';

/**
 * The state of the space editor, provided by the editor page and used by its sub pages
 * (map object settings, link selection, map object type selection) like in v1 where
 * these were nested routes of the editor.
 */
export interface MapEditorContext {
  spaceId: Ref<string>;
  /** the base route of the editor */
  editorPath: ComputedRef<string>;
  editor: ReturnType<typeof useMapEditor>;
  /** the saved map objects were loaded at least once (sub pages wait for it before they judge the selection) */
  mapObjectsLoaded: ComputedRef<boolean>;
  mapObjectTypes: ComputedRef<(MapObjectTypeDefinition & { _id?: string })[]>;
  /** the type that is highlighted on the type selection page (the last one used) */
  selectedMapObjectType: Ref<MapObjectTypeDefinition>;
  mode: Ref<EditorMode>;
  selectedMapObjectId: ComputedRef<string | undefined>;
  selectedMapObject: ComputedRef<EditingMapObject | undefined>;
  selectedFloorPlanObjectId: Ref<string | null>;
  saving: Ref<boolean>;
  selectMapObject: (id: string | null) => Promise<void>;
  selectFloorPlanObject: (id: string | null) => Promise<void>;
  addMapObject: (type: MapObjectTypeDefinition) => Promise<void>;
  updateSelectedMapObject: (update: Partial<EditingMapObject>) => void;
  removeSelectedMapObject: () => Promise<void>;
  rotateSelectedMapObject: () => void;
  removeSelectedFloorPlanObject: () => void;
  uploadFloorPlan: (files: FileList | null) => Promise<void>;
  uploadMapObjectType: (files: FileList | null) => Promise<void>;
  save: () => Promise<void>;
  abort: () => Promise<boolean>;
}

const mapEditorKey: InjectionKey<MapEditorContext> = Symbol('map-editor');

export function provideMapEditor(context: MapEditorContext) {
  provide(mapEditorKey, context);
}

export function useMapEditorContext(): MapEditorContext {
  const context = inject(mapEditorKey);
  if (!context) {
    throw new Error('useMapEditorContext must be used inside the map editor page');
  }
  return context;
}

/** the bookables of the space including deleted ones, so links of old map objects can still be shown */
export function useMapObjectBookables() {
  const { spaceId } = useMapEditorContext();
  const { data, status, refresh } = useApiData(
    () => `bookables:${spaceId.value}:all`,
    () => $fetch<Bookable[]>(`/api/spaces/${spaceId.value}/bookables`, { query: { includeDeleted: 'true' } }),
    { watch: [spaceId], default: () => [] },
  );
  const mapObjectBookables = computed(() => data.value ?? []);
  const pending = computed(() => status.value === 'idle' || status.value === 'pending');
  return { mapObjectBookables, pending, refresh };
}
