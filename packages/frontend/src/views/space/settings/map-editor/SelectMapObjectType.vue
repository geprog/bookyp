<template>
  <Header :title="t('select_map_object_type')" :back-fallback="{ name: 'settings-space-map' }" />

  <AppContent class="gap-4 p-4 !flex-row flex-wrap justify-center">
    <div v-for="mapObjectType in mapObjectTypes" :key="mapObjectType.name" class="flex flex-col gap-2 w-min">
      <MapObject
        :viewBox="mapObjectType.viewBox"
        :paths="mapObjectType.paths"
        class="h-32 w-32 border-2 border-gray-200 rounded-lg p-2 cursor-pointer hover:border-primary-dark"
        :class="{
          'bg-primary-light': selectedMapObjectType.name === mapObjectType.name,
        }"
        @click="
          async () => {
            $emit('update:selectedMapObjectType', mapObjectType);
            await back({ name: 'settings-space-map' });
          }
        "
      />
      <div class="text-center text-sm">{{ mapObjectType.name }}</div>
    </div>

    <div class="flex flex-col gap-2" @click.stop="newMapObjectTypeFileInput?.click()">
      <div
        class="
          flex flex-col
          justify-center
          items-center
          gap-2
          h-32
          w-32
          border-2 border-gray-200
          rounded-lg
          p-2
          cursor-pointer
          hover:border-primary-dark
        "
      >
        <Icon name="svg" class="w-16 h-16" viewBox="0 0 24 24" />
        <Icon name="arrow-upload" />
      </div>
      <div class="text-center text-sm">{{ t('upload_new_map_object_type') }}</div>
      <input
        ref="newMapObjectTypeFileInput"
        type="file"
        class="hidden"
        accept="image/svg+xml"
        @change="uploadNewMapObject($event.target as HTMLInputElement)"
      />
    </div>
  </AppContent>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';

import Header from '~/components/headers/Header.vue';
import Icon from '~/components/Icon.vue';
import AppContent from '~/components/layout/AppContent.vue';
import MapObject from '~/components/space/map/MapObject.vue';
import { useCurrentSpace } from '~/compositions/space/useCurrentSpace';
import { getMapObjectTypes, MapObjectType } from '~/compositions/space/useNewMapObject';
import { useBack } from '~/compositions/useBack';
import useFeathers from '~/compositions/useFeathers';
import { getBgPathsFromPaths } from '~/lib/svgParser';

const { t } = useI18n();
const toast = useToast();
const { back } = useBack();

defineProps<{
  selectedMapObjectType: MapObjectType;
}>();

defineEmits<{
  (event: 'update:selectedMapObjectType', mapObjectType: MapObjectType): void;
}>();

const { spaceId } = useCurrentSpace();
const mapObjectTypes = getMapObjectTypes(spaceId);

const feathers = useFeathers();

const newMapObjectTypeFileInput = ref<HTMLInputElement>();

async function uploadNewMapObject(target: HTMLInputElement) {
  const name = prompt(t('enter_name_for_new_map_object_type'));
  if (!name) {
    return;
  }

  if (target.files === null || target.files.length !== 1) {
    return;
  }

  const processingInfoToast = toast.info(t('processing_map_object_type'), { timeout: false });

  const doc = new DOMParser().parseFromString(await target.files[0].text(), 'image/svg+xml');
  const paths = Array.from(doc.getElementsByTagName('path'))
    .map((path) => path.getAttribute('d'))
    .filter((d) => d !== null) as string[];

  const viewBox = doc.getElementsByTagName('svg')[0].getAttribute('viewBox');

  if (!viewBox) {
    toast.error(t('could_not_find_view_box'));
    return;
  }

  if (!spaceId.value) {
    return;
  }

  await feathers.service('mapObjectTypes').create({
    name,
    paths,
    bgPaths: getBgPathsFromPaths(paths),
    viewBox,
    spaceId: spaceId.value,
  });

  toast.dismiss(processingInfoToast);
}
</script>
