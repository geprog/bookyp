<template>
  <NuxtPage />
</template>

<script setup lang="ts">
import type { MapObjectTypeDefinition } from '#shared/utils/mapObjectTypes';
import type { EditorMode } from '~/components/map/FloorPlanEditing.vue';
import type { EditingMapObject } from '~/composables/useMapEditor';

/**
 * The space editor: floor plan (walls / uploaded svg) and map objects (placed, rotated, linked to bookables).
 * Everything is edited locally and saved in one go. The selected map object is part of the route
 * (`map-editor/:selectedMapObjectId?`) and the sub pages (settings of the selected map object,
 * type selection) are nested routes, so the unsaved state survives while they are open - like in v1.
 */
definePageMeta({ key: 'map-editor' });

const { t } = useI18n();
const route = useRoute();
const { space, spaceId } = useCurrentSpace();
const { api, showError } = useApi();
const { openDialog } = useDialog();
const toast = useAppToast();

const editorPath = computed(() => `/space/${spaceId.value}/settings/map-editor`);

const { mapObjects: savedMapObjects, refresh: refreshMapObjects, status: mapObjectsStatus } = useMapObjects(spaceId);
const mapObjectsLoaded = computed(() => mapObjectsStatus.value === 'success' || mapObjectsStatus.value === 'error');
const editor = useMapEditor(spaceId, computed(() => space.value.floorPlan), savedMapObjects);
const { mapObjectTypes, refresh: refreshTypes } = useMapObjectTypes(spaceId);
// v1 highlighted the table on the type selection page until another type was used
const selectedMapObjectType = ref<MapObjectTypeDefinition>(mapObjectTypes.value[1] ?? mapObjectTypes.value[0]!);

const mode = ref<EditorMode>('none');
const selectedFloorPlanObjectId = ref<string | null>(null);
const saving = ref(false);

const selectedMapObjectId = computed(() => (typeof route.params.selectedMapObjectId === 'string' && route.params.selectedMapObjectId) || undefined);
const selectedMapObject = computed(() => editor.mapObjects.value.find(m => m._id === selectedMapObjectId.value && !m.isDeleted));

async function selectMapObject(id: string | null) {
  if (mode.value !== 'none') {
    return;
  }
  if (id) {
    selectedFloorPlanObjectId.value = null;
  }
  if ((id ?? undefined) === selectedMapObjectId.value) {
    return;
  }
  await navigateTo(id ? `${editorPath.value}/${id}` : editorPath.value, { replace: true });
}

async function selectFloorPlanObject(id: string | null) {
  if (mode.value === 'wall') {
    return;
  }
  selectedFloorPlanObjectId.value = id;
  if (id) {
    await selectMapObject(null);
  }
}

async function addMapObject(type: MapObjectTypeDefinition) {
  selectedMapObjectType.value = type;
  const mapObject = editor.addMapObject(type, getBgPathsFromPaths(type.paths));
  await selectMapObject(mapObject._id);
}

function updateSelectedMapObject(update: Partial<EditingMapObject>) {
  if (selectedMapObjectId.value) {
    editor.updateMapObject(selectedMapObjectId.value, update);
  }
}

async function removeSelectedMapObject() {
  if (selectedMapObjectId.value) {
    editor.removeMapObject(selectedMapObjectId.value);
    await selectMapObject(null);
  }
}

function rotateSelectedMapObject() {
  if (selectedMapObject.value) {
    editor.updateMapObject(selectedMapObject.value._id, { rotation: (selectedMapObject.value.rotation + 90) % 360 });
  }
}

function removeSelectedFloorPlanObject() {
  if (selectedFloorPlanObjectId.value !== null) {
    editor.removeFloorPlanObject(Number(selectedFloorPlanObjectId.value));
    selectedFloorPlanObjectId.value = null;
  }
}

async function uploadFloorPlan(files: FileList | null) {
  const file = files?.[0];
  if (!file) {
    return;
  }
  const { paths } = parseSvgFile(await file.text());
  editor.updateFloorPlan(paths);
}

async function uploadMapObjectType(files: FileList | null) {
  const file = files?.[0];
  if (!file) {
    return;
  }
  // eslint-disable-next-line no-alert
  const name = window.prompt(t('enter_name_for_new_map_object_type'));
  if (!name) {
    return;
  }
  const { paths, viewBox } = parseSvgFile(await file.text());
  if (!viewBox) {
    toast.error(t('could_not_find_view_box'));
    return;
  }
  const processing = toast.info(t('processing_map_object_type'), { timeout: false });
  try {
    await api(`/api/spaces/${spaceId.value}/map-object-types`, {
      method: 'POST',
      body: { name, paths, bgPaths: getBgPathsFromPaths(paths), viewBox },
    });
    await refreshTypes();
  }
  catch (error) {
    showError(error);
  }
  finally {
    toast.dismiss(processing);
  }
}

async function reset() {
  editor.resetFromSource();
  mode.value = 'none';
  selectedFloorPlanObjectId.value = null;
  await selectMapObject(null);
}

async function save() {
  saving.value = true;
  try {
    await api(`/api/spaces/${spaceId.value}/map-objects`, { method: 'PUT', body: { mapObjects: editor.toSavePayload() } });
    await api(`/api/spaces/${spaceId.value}`, { method: 'PATCH', body: { floorPlan: editor.floorPlan.value } });
    await refreshMapObjects();
    editor.changed.value = false;
    await reset();
  }
  catch (error) {
    showError(error);
  }
  finally {
    saving.value = false;
  }
}

async function abort(): Promise<boolean> {
  if (!(await openDialog({ title: t('discard'), description: t('confirm_unsaved_changes'), confirm: t('discard'), confirmColor: 'error' }))) {
    return false;
  }
  await reset();
  return true;
}

// leaving the editor (not its sub pages) with unsaved changes has to be confirmed
onBeforeRouteLeave(async () => {
  if (!editor.changed.value) {
    return true;
  }
  return abort();
});

provideMapEditor({
  spaceId,
  editorPath,
  editor,
  mapObjectsLoaded,
  mapObjectTypes,
  selectedMapObjectType,
  mode,
  selectedMapObjectId,
  selectedMapObject,
  selectedFloorPlanObjectId,
  saving,
  selectMapObject,
  selectFloorPlanObject,
  addMapObject,
  updateSelectedMapObject,
  removeSelectedMapObject,
  rotateSelectedMapObject,
  removeSelectedFloorPlanObject,
  uploadFloorPlan,
  uploadMapObjectType,
  save,
  abort,
});
</script>
