<template>
  <AppContent>
    <Spinner v-if="pending" />
    <div v-else-if="mapObject" class="mx-auto flex w-full flex-col py-3">
      <template v-if="mapObject.link?.type === 'url'">
        <ListItem :label="mapObject.link.url" data-test="linked-bookable" class="mb-3">
          <template #start>
            <Icon name="link" class="my-auto" />
          </template>
          <template #end>
            <IconButton icon="delete" :label="t('delete')" data-test="unlink-button" @click="unlink" />
          </template>
        </ListItem>
        <AppButton class="w-full" icon="link" :text="t('map_object.change_link').toUpperCase()" data-test="change-link-button" @click="unlink" />
      </template>

      <template v-else-if="mapObject.link?.type === 'bookable'">
        <ListItem v-if="linkedBookable" :label="linkedBookable.name" data-test="linked-bookable" class="mb-3">
          <template #start>
            <Icon name="link" class="my-auto" />
          </template>
          <template #end>
            <IconButton icon="delete" :label="t('delete')" data-test="unlink-button" @click="unlink" />
          </template>
        </ListItem>
        <AppButton class="w-full" icon="link" :text="t('map_object.change_link').toUpperCase()" data-test="change-link-button" @click="unlink" />
      </template>

      <template v-else>
        <div class="flex w-full flex-col gap-2">
          <AppButton icon="link" class="w-full" :text="t('map_object.link_to_bookable').toUpperCase()" data-test="link-to-bookable-button" @click="navigateTo(`${editPath}/link`)" />
          <AppButton icon="link" class="w-full" :text="t('map_object.link_to_website').toUpperCase()" data-test="link-to-website-button" @click="navigateTo(`${editPath}/link-http`)" />
        </div>
      </template>
    </div>
  </AppContent>
</template>

<script setup lang="ts">
/** settings of the selected map object: its link to a bookable or a website (v1 route `edit`) */
const { t } = useI18n();
const { editorPath, mapObjectsLoaded, selectedMapObjectId, selectedMapObject, updateSelectedMapObject } = useMapEditorContext();
const { mapObjectBookables, pending } = useMapObjectBookables();

const mapObject = selectedMapObject;
const editPath = computed(() => `${editorPath.value}/${selectedMapObjectId.value}/edit`);

useAppHeader(() => ({ menu: 'footer', title: t('map_object.edit'), back: editorPath.value }));

const linkedBookable = computed(() => (mapObject.value?.link?.type === 'bookable' ? mapObjectBookables.value.find(b => b._id === (mapObject.value!.link as { bookable: string }).bookable) : undefined));

function unlink() {
  updateSelectedMapObject({ link: undefined });
}

// the map object is gone (e.g. after a reload with an unsaved object): back to the editor
watch([mapObjectsLoaded, mapObject], ([loaded, value]) => {
  if (loaded && !value) {
    void navigateTo(editorPath.value, { replace: true });
  }
}, { immediate: true });
</script>
