<template>
  <AppContent>
    <Spinner v-if="pending" />
    <div v-else class="mx-auto flex w-full flex-col py-3">
      <AppButton icon="plus" class="mb-3" :text="t('bookable_create').toLocaleUpperCase()" data-test="create-bookable-button" @click="navigateTo(`${editPath}/link/create-bookable`)" />

      <SelectableListItem
        v-for="bookable in bookables"
        :key="bookable._id"
        :selected="mapObject?.link?.type === 'bookable' && mapObject.link.bookable === bookable._id"
        :label="bookable.name"
        data-test="select-bookable"
        class="mb-3 cursor-pointer"
        @update:selected="selectBookable(bookable)"
      />
    </div>
  </AppContent>
</template>

<script setup lang="ts">
import type { Bookable } from '#shared/types/models';

/** choose the bookable the selected map object links to (v1 route `edit/link`) */
const { t } = useI18n();
const { back } = useBack();
const { editorPath, selectedMapObjectId, selectedMapObject, updateSelectedMapObject } = useMapEditorContext();
const { mapObjectBookables, pending } = useMapObjectBookables();

const mapObject = selectedMapObject;
const editPath = computed(() => `${editorPath.value}/${selectedMapObjectId.value}/edit`);
const bookables = computed(() => mapObjectBookables.value.filter(b => !b.deleted));

useAppHeader(() => ({ menu: 'footer', title: t('map_object.link_to_bookable'), back: editPath.value }));

async function selectBookable(bookable: Bookable) {
  updateSelectedMapObject({ link: { type: 'bookable', bookable: bookable._id } });
  await back(editPath.value);
}
</script>
