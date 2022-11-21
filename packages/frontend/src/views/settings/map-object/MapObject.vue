<template>
  <Header :title="isChoosingLink ? t('map_object.link_to_bookable') : t('map_object.edit')" has-back />

  <AppContent>
    <div class="flex flex-col mx-auto w-full py-3">
      <template v-if="isChoosingLink">
        <Button
          icon="plus"
          class="mb-3"
          :text="t('bookable_create').toLocaleUpperCase()"
          @click="router.push({ name: 'settings-map-object-link-create-bookable' })"
        />

        <SelectableListItem
          v-for="bookable in bookables"
          :key="bookable._id"
          :selected="mapObject.bookable === bookable._id"
          :label="bookable.name"
          data-test="select-bookable"
          class="cursor-pointer mb-3"
          @click="selectBookable(bookable)"
        />
      </template>

      <template v-else>
        <IconListItem
          v-if="linkedBookable"
          icon="link"
          :label="linkedBookable.name"
          data-test="linked-bookable"
          class="mb-3"
        >
          <template #end>
            <IconButton icon="delete" data-test="unlink-button" @click="unlinkBookable" />
          </template>
        </IconListItem>

        <Button
          icon="link"
          :text="
            mapObject.bookable
              ? t('map_object.change_bookable_link').toUpperCase()
              : t('map_object.link_to_bookable').toUpperCase()
          "
          @click="$router.push({ name: 'settings-map-object-link', params: { selectedMapObjectId: mapObject._id } })"
        />
      </template>
    </div>
  </AppContent>
</template>

<script lang="ts" setup>
import { Model } from '@bookyp/core';
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import Button from '~/components/buttons/Button.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import IconListItem from '~/components/list-items/IconListItem.vue';
import SelectableListItem from '~/components/list-items/SelectableListItem.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import useFind from '~/compositions/useFind';
import useGet from '~/compositions/useGet';

const props = defineProps<{
  mapObject: Model.MapObject;
}>();

const emit = defineEmits<{
  (event: 'update:mapObject', mapObject: Model.MapObject): void;
}>();

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const { spaceId } = useCurrentSpace();

const mapObject = toRef(props, 'mapObject');

const linkedBookableId = computed(() => mapObject.value?.bookable);
const { data: linkedBookable } = useGet('bookables', linkedBookableId, ref({ query: { $disableSoftDelete: true } }));

const { data: bookables } = useFind(
  'bookables',
  computed(() => ({ query: { space: spaceId.value } })),
);

const isChoosingLink = computed(() => route.name === 'settings-map-object-link');

function unlinkBookable() {
  emit('update:mapObject', { ...mapObject.value, bookable: undefined });
}

function selectBookable(bookable: Model.Bookable) {
  emit('update:mapObject', { ...mapObject.value, bookable: bookable._id });
  router.back();
}
</script>
