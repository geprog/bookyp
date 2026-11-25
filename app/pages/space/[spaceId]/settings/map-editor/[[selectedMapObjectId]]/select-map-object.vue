<template>
  <AppContent class="flex-row! flex-wrap justify-center gap-4 p-4">
    <button
      v-for="type in mapObjectTypes"
      :key="type.name"
      type="button"
      class="flex w-min flex-col gap-2"
      :data-test="`map-object-type-${type.name}`"
      @click="select(type)"
    >
      <MapObjectPreview
        :view-box="type.viewBox"
        :paths="type.paths"
        class="size-32 cursor-pointer rounded-lg border-2 border-gray-200 p-2 hover:border-amber-600"
        :class="{ 'bg-amber-200': selectedMapObjectType.name === type.name }"
      />
      <div class="text-center text-sm">
        {{ type.name }}
      </div>
    </button>

    <button type="button" class="flex flex-col gap-2" data-test="upload-map-object-type" @click.stop="newTypeFileInput?.click()">
      <div class="flex size-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-gray-200 p-2 hover:border-amber-600">
        <Icon name="svg" class="size-16!" />
        <Icon name="arrow-upload" />
      </div>
      <div class="text-center text-sm">
        {{ t('upload_new_map_object_type') }}
      </div>
      <input ref="newTypeFileInput" type="file" class="hidden" accept="image/svg+xml" @change="onTypeFile">
    </button>
  </AppContent>
</template>

<script setup lang="ts">
import type { MapObjectTypeDefinition } from '#shared/utils/mapObjectTypes';

/** choose the type of a new map object (v1 route `select-map-object`) */
const { t } = useI18n();
const { editorPath, mapObjectTypes, selectedMapObjectType, addMapObject, uploadMapObjectType } = useMapEditorContext();

useAppHeader(() => ({ menu: 'footer', title: t('select_map_object_type'), back: editorPath.value }));

async function select(type: MapObjectTypeDefinition) {
  // adding selects the new object, which replaces this page with the editor
  await addMapObject(type);
  if (useRoute().path.endsWith('/select-map-object')) {
    await navigateTo(editorPath.value, { replace: true });
  }
}

const newTypeFileInput = ref<HTMLInputElement>();

async function onTypeFile(event: Event) {
  await uploadMapObjectType((event.target as HTMLInputElement).files);
  if (newTypeFileInput.value) {
    newTypeFileInput.value.value = '';
  }
}
</script>
