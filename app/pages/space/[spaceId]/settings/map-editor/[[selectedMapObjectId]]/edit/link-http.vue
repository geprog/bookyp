<template>
  <AppContent>
    <form class="mx-auto flex w-full flex-col py-3" @submit.prevent="updateLink">
      <IconField icon="i-bookyp-link">
        <!-- the browser checks the url like the server does (absolute http(s) url), so the map save does not fail later -->
        <TextField v-model="url" type="url" pattern="https?://.+" required :placeholder="t('link_map_objects')" data-test="map-object-url" />
      </IconField>
      <AppButton class="w-full" icon="link" :text="t('map_object.save_url').toUpperCase()" type="submit" data-test="save-url-button" />
    </form>
  </AppContent>
</template>

<script setup lang="ts">
/** link the selected map object to a website (v1 route `edit/link-http`) */
const { t } = useI18n();
const { back } = useBack();
const { editorPath, selectedMapObjectId, selectedMapObject, updateSelectedMapObject } = useMapEditorContext();

const editPath = computed(() => `${editorPath.value}/${selectedMapObjectId.value}/edit`);

useAppHeader(() => ({ menu: 'footer', title: t('map_object.edit_link'), back: editPath.value }));

const url = ref('');
watch(selectedMapObject, (mapObject) => {
  if (mapObject?.link?.type === 'url') {
    url.value = mapObject.link.url;
  }
}, { immediate: true });

async function updateLink() {
  updateSelectedMapObject({ link: { type: 'url', url: url.value } });
  await back(editPath.value);
}
</script>
