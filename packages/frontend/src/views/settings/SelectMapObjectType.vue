<template>
  <Header :title="t('select_map_object_type')" has-back />

  <AppContent class="flex flex-row gap-2 p-3">
    <div v-for="mapObjectType in mapObjectTypes" :key="mapObjectType.name" class="flex flex-col gap-2">
      <MapObject
        :viewBox="mapObjectType.viewBox"
        :paths="mapObjectType.paths"
        class="h-32 w-32 border-2 border-gray-200 rounded-lg p-2 cursor-pointer hover:border-primary-dark"
        :class="{
          'bg-primary-light': selectedMapObjectType.name === mapObjectType.name,
        }"
        @click="
          () => {
            $emit('update:selectedMapObjectType', mapObjectType);
            $router.back();
          }
        "
      />
      <div class="text-center text-sm">{{ mapObjectType.name }}</div>
    </div>
  </AppContent>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import Header from '~/components/headers/Header.vue';
import AppContent from '~/components/layout/AppContent.vue';
import MapObject from '~/components/space/MapObject.vue';
import { MapObjectType, mapObjectTypes } from '~/compositions/space/useNewMapObject';

const { t } = useI18n();

defineProps<{
  selectedMapObjectType: MapObjectType;
}>();

defineEmits<{
  (event: 'update:selectedMapObjectType', mapObjectType: MapObjectType): void;
}>();
</script>
