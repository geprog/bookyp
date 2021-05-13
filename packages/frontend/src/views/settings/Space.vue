<template>
  <Header :title="t('settings')" has-back>
    <IconButton v-if="!editing" data-test="add-button" icon="table" @click="addMapObject" />
    <IconButton v-if="editing" data-test="save-button" type="submit" icon="check-mark" @click="saveNewMapObject" />
    <template #second>
      <SettingsTabs />
    </template>
  </Header>
  <div class="mx-4 mt-4 h-full m-auto flex flex-col">
    <svg
      class="w-full h-100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-test="space-map"
      @click="positionNewMapObject"
    >
      <path v-for="path in floorPlan" :key="path" :d="path" class="stroke-black" stroke-width="2" />
      <g
        v-for="mapObject in mapObjects"
        :key="mapObject._id"
        data-test="mapObject"
        :transform="`translate(${mapObject.xPos},${mapObject.yPos})`"
        class="cursor-pointer"
      >
        <path
          v-for="path in mapObject.paths"
          :key="path"
          :d="path"
          :class="
            selectedMapObjectId === mapObject._id
              ? 'stroke-current text-primary-dark fill-orange'
              : 'stroke-black fill-white'
          "
          stroke-width="1"
          @click.stop="toggleSelectedMapObject(mapObject)"
        />
      </g>
      <g
        v-if="newMapObject"
        data-test="new-map-object"
        :transform="`translate(${newMapObject.xPos},${newMapObject.yPos})`"
      >
        <path
          v-for="path in newMapObject.paths"
          :key="path"
          :d="path"
          class="stroke-current text-primary-dark fill-orange"
          stroke-width="1"
        />
      </g>
    </svg>
    <div class="mt-auto mb-4 flex flex-row-reverse">
      <FloatingButton
        v-if="selectedMapObjectId !== null"
        data-test="delete-button"
        type="submit"
        icon="delete"
        @click="removeSelectedMapObject"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/Header.vue';
import SettingsTabs from '~/components/SettingsTabs.vue';
import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'Space',

  components: { FloatingButton, IconButton, Header, SettingsTabs },

  setup() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const feathers = useFeathers();

    // load space
    const { data: spaces } = useFind('spaces');
    const floorPlan = computed(() => {
      if (!spaces.value.length) {
        return [];
      }
      return spaces.value[0].floorPlan;
    });

    // flag to show if we are currently editing the map
    const editing = computed(() => !!newMapObject.value);
    // load mapObjects
    const { data: mapObjects } = useFind('mapObjects');

    // if a mapObject is selected this contains its id
    const selectedMapObjectId = ref<string | null>(null);

    function toggleSelectedMapObject(mapObject: Model.MapObject) {
      selectedMapObjectId.value = mapObject._id;
    }

    async function removeSelectedMapObject(): Promise<void> {
      await feathers.service('mapObjects').remove(selectedMapObjectId.value);
      selectedMapObjectId.value = null;
    }

    let newMapObject = ref<null | Omit<Model.MapObject, '_id'>>(null);

    function addMapObject() {
      newMapObject.value = {
        xPos: 0,
        yPos: 0,
        rotation: 0,
        paths: [
          'M56.9259 1.12463H17.0648V83.4525H56.9259V1.12463Z',
          'M17.0648 26.6198H1.12036V58.4886H17.0648V26.6198Z',
        ],

        type: Model.MapObjectTypes.table,
      };
      // deselect any mapObject
      selectedMapObjectId.value = null;
    }

    async function saveNewMapObject(): Promise<void> {
      if (newMapObject.value) {
        await feathers.service('mapObjects').create(newMapObject.value);
        newMapObject.value = null;
      }
    }

    function positionNewMapObject(event: MouseEvent) {
      selectedMapObjectId.value = null;
      // skip if we are not currently in editing mode
      if (!editing.value) {
        return;
      }

      const svg = event.target as SVGSVGElement;
      const pt = svg.createSVGPoint();

      // pass event coordinates
      pt.x = event.clientX;
      pt.y = event.clientY;

      // transform to SVG coordinates
      const matrix = svg.getScreenCTM()?.inverse();
      const svgP = pt.matrixTransform(matrix);
      if (newMapObject.value) {
        newMapObject.value.xPos = svgP.x;
        newMapObject.value.yPos = svgP.y;
      }
    }

    return {
      t,
      editing,
      floorPlan,
      mapObjects,
      addMapObject,
      newMapObject,
      positionNewMapObject,
      saveNewMapObject,
      toggleSelectedMapObject,
      selectedMapObjectId,
      removeSelectedMapObject,
    };
  },
});
</script>
