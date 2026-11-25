<template>
  <Teleport v-if="editor.changed.value" to="#app-header-actions" defer>
    <IconButton icon="dismiss" :label="t('discard')" data-test="abort-button" @click="abort" />
    <IconButton icon="check-mark" :disabled="saving" :label="t('save')" data-test="save-button" @click="save" />
  </Teleport>

  <div class="flex min-h-0 grow flex-col pt-12">
    <SpaceMap data-test="space-map" :disable-panning="mode !== 'none'">
      <FloorPlanEditing
        :mode="mode"
        :floor-plan="editor.floorPlan.value"
        :selected-floor-plan-object-id="selectedFloorPlanObjectId"
        @select-floor-plan-object="selectFloorPlanObject"
        @update:floor-plan="editor.updateFloorPlan"
      />
      <MapObjectsEditing
        :mode="mode"
        :map-objects="editor.mapObjects.value"
        :selected-map-object-id="selectedMapObjectId"
        @move-map-object="(id, position) => editor.updateMapObject(id, { xPos: position.x, yPos: position.y })"
        @select-map-object="selectMapObject"
        @dblclick-map-object="openMapObjectSettings"
      />
    </SpaceMap>

    <!-- floating toolbar -->
    <div class="pointer-events-none fixed bottom-0 z-10 m-auto flex flex-row gap-2 place-self-center pb-4 max-md:bottom-14">
      <template v-if="selectedMapObject">
        <FloatingButton data-test="edit-button" icon="i-bookyp-edit" @click="openMapObjectSettings" />
        <FloatingButton data-test="delete-button" icon="i-bookyp-delete" @click="removeSelectedMapObject" />
        <FloatingButton data-test="rotate-button" icon="i-bookyp-arrow-clockwise" class="mr-2" @click="rotateSelectedMapObject" />
      </template>
      <FloatingButton v-else-if="selectedFloorPlanObjectId !== null" data-test="delete-button" icon="i-bookyp-delete" @click="removeSelectedFloorPlanObject" />
      <template v-else-if="mode !== 'none'">
        <InfoBox class="h-8">
          {{ t('map_editing.adding_wall_instruction') }}
        </InfoBox>
        <FloatingButton data-test="stop-walls-button" @click.stop="mode = 'none'">
          <Icon name="dismiss" color="text-white" />
          <Icon name="wall" color="text-white" />
        </FloatingButton>
      </template>
      <template v-else>
        <FloatingButton icon="i-bookyp-table" :text="t('map_editing.objects')" data-test="add-map-object-button" @click="navigateTo(`${editorPath}/select-map-object`)" />
        <FloatingButton icon="i-bookyp-wall" :text="t('map_editing.walls')" data-test="add-wall-button" @click.stop="mode = 'wall'" />
        <input ref="floorPlanFileInput" type="file" class="hidden" accept="image/svg+xml" @change="onFloorPlanFile">
        <FloatingButton icon="i-bookyp-svg" :text="t('map_editing.floor_plan')" data-test="upload-floor-plan-button" @click.stop="floorPlanFileInput?.click()" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { spaceId } = useCurrentSpace();
const {
  editorPath,
  editor,
  mode,
  selectedMapObjectId,
  selectedMapObject,
  selectedFloorPlanObjectId,
  saving,
  selectMapObject,
  selectFloorPlanObject,
  removeSelectedMapObject,
  rotateSelectedMapObject,
  removeSelectedFloorPlanObject,
  uploadFloorPlan,
  save,
  abort,
} = useMapEditorContext();

useAppHeader(() => ({ title: t('space_editor'), back: `/space/${spaceId.value}/bookables/map` }));

async function openMapObjectSettings() {
  if (selectedMapObjectId.value) {
    await navigateTo(`${editorPath.value}/${selectedMapObjectId.value}/edit`);
  }
}

const floorPlanFileInput = ref<HTMLInputElement>();

async function onFloorPlanFile(event: Event) {
  await uploadFloorPlan((event.target as HTMLInputElement).files);
  if (floorPlanFileInput.value) {
    floorPlanFileInput.value.value = '';
  }
}

onKeyStroke('Delete', (event) => {
  event.preventDefault();
  if (selectedMapObjectId.value) {
    void removeSelectedMapObject();
  }
  else if (selectedFloorPlanObjectId.value !== null) {
    removeSelectedFloorPlanObject();
  }
});
</script>
