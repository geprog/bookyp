<template>
  <Header
    :title="isChoosingBookableLink ? t('map_object.link_to_bookable') : t('map_object.edit')"
    :back-fallback="isChoosingBookableLink ? { name: 'settings-map-object' } : { name: 'settings-space-map' }"
  />

  <AppContent>
    <div class="flex flex-col mx-auto w-full py-3">
      <template v-if="isChoosingBookableLink">
        <Button
          icon="plus"
          class="mb-3"
          :text="t('bookable_create').toLocaleUpperCase()"
          @click="$router.push({ name: 'settings-map-object-link-create-bookable' })"
        />

        <SelectableListItem
          v-for="bookable in bookables"
          :key="bookable._id"
          :selected="mapObject.link?.type === 'bookable' && mapObject.link.bookable === bookable._id"
          :label="bookable.name"
          data-test="select-bookable"
          class="cursor-pointer mb-3"
          @click="selectBookable(bookable)"
        />
      </template>

      <template v-else-if="mapObject.link?.type === 'url'">
        <IconListItem icon="link" :label="mapObject.link.url" data-test="linked-bookable" class="mb-3">
          <template #end>
            <IconButton icon="delete" data-test="unlink-button" @click="unlinkMapObject" />
          </template>
        </IconListItem>
        <Button class="w-full" icon="link" :text="t('map_object.change_link').toUpperCase()" @click="unlinkMapObject" />
      </template>

      <template v-else-if="mapObject.link?.type === 'bookable'">
        <IconListItem
          v-if="linkedBookable"
          icon="link"
          :label="linkedBookable.name"
          data-test="linked-bookable"
          class="mb-3"
        >
          <template #end>
            <IconButton icon="delete" data-test="unlink-button" @click="unlinkMapObject" />
          </template>
        </IconListItem>
        <Button class="w-full" icon="link" :text="t('map_object.change_link').toUpperCase()" @click="unlinkMapObject" />
      </template>

      <template v-else>
        <div class="w-full flex flex-col gap-2">
          <Button
            icon="link"
            class="w-full"
            :text="t('map_object.link_to_bookable').toUpperCase()"
            @click="$router.push({ name: 'settings-map-object-link', params: { selectedMapObjectId: mapObject._id } })"
          />
          <Button
            v-if="!mapObject.link"
            class="w-full"
            icon="link"
            :text="t('map_object.link_to_website').toUpperCase()"
            @click="$router.push({ name: 'settings-map-object-url', params: { selectedMapObjectId: mapObject._id } })"
          />
        </div>
      </template>
    </div>
  </AppContent>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import IconListItem from '~/components/list-items/IconListItem.vue';
import SelectableListItem from '~/components/list-items/SelectableListItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { useBack } from '~/compositions/useBack';
import useFind from '~/compositions/useFind';
import useGet from '~/compositions/useGet';

const props = defineProps<{
  mapObject: Model.MapObject;
}>();

const emit = defineEmits<{
  (event: 'update:mapObject', mapObject: Model.MapObject): void;
}>();

const { t } = useI18n();
const route = useRoute();
const { spaceId } = useCurrentSpace();
const { back } = useBack();

const mapObject = toRef(props, 'mapObject');

const linkedBookableId = computed(() => (mapObject.value?.link as { bookable?: string })?.bookable);
const { data: linkedBookable } = useGet('bookables', linkedBookableId, ref({ query: { $disableSoftDelete: true } }));

const { data: bookables } = useFind(
  'bookables',
  computed(() => ({ query: { space: spaceId.value } })),
);

const isChoosingBookableLink = computed(() => route.name === 'settings-map-object-link');

function unlinkMapObject() {
  emit('update:mapObject', { ...mapObject.value, link: undefined });
}

function selectBookable(bookable: Model.Bookable) {
  emit('update:mapObject', { ...mapObject.value, link: { type: 'bookable', bookable: bookable._id } });
  void back({ name: 'settings-map-object' });
}
</script>
