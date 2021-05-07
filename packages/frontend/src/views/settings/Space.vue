<template>
  <Header :title="t('settings')" has-back>
    <IconButton v-if="editing" data-test="save-button" type="submit" icon="check-mark" @click="saveNewMapObject" />
    <template #second>
      <SettingsTabs />
    </template>
  </Header>
  <div class="mx-4 mt-4">
    <svg class="w-full h-128" fill="none" xmlns="http://www.w3.org/2000/svg" @click="positionNewMapObject">
      <path v-for="path in floorPlan" :key="path" :d="path" stroke="#323130" stroke-width="2" />
      <g v-for="mapObject in mapObjects" :key="mapObject" :transform="`translate(${mapObject.xPos},${mapObject.yPos})`">
        <path v-for="path in mapObject.paths" :key="path" :d="path" stroke="#323130" stroke-width="1" />
      </g>
      <g v-if="newMapObject" :transform="`translate(${newMapObject.xPos},${newMapObject.yPos})`">
        <path
          v-for="path in newMapObject.paths"
          :key="path"
          :d="path"
          fill="#FDE68A"
          stroke="#F59E0B"
          stroke-width="2"
        />
      </g>
    </svg>
    <FloatingButton data-test="add-button" class="fixed bottom-8 right-8" icon="table" @click="addMapObject" />
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

    // flag to show if we are currently editing the map
    const editing = computed(() => !!newMapObject.value);
    const { data: mapObjects } = useFind('mapObjects');

    const { data: spaces } = useFind('spaces');
    const floorPlan = computed(() => {
      if (!spaces.value.length) {
        return [];
      }
      return spaces.value[0].floorPlan;
    });

    let newMapObject = ref<null | Omit<Model.MapObject, '_id'>>(null);

    const addMapObject = () => {
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
    };

    async function saveNewMapObject(): Promise<void> {
      // save newMapObject
      if (newMapObject.value) {
        await feathers.service('mapObjects').create(newMapObject.value);
        newMapObject.value = null;
      }
    }

    function positionNewMapObject(event: MouseEvent) {
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

    return { t, editing, floorPlan, mapObjects, addMapObject, newMapObject, positionNewMapObject, saveNewMapObject };
  },
});
</script>
