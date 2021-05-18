<template>
  <Header :title="t('settings')" has-back>
    <IconButton v-if="mode === 'viewing'" data-test="add-button" icon="table" @click="addMapObject" />
    <IconButton v-if="mode === 'editing'" data-test="abort-button" icon="cross" @click="selectMapObject(null)" />
    <template v-if="mode === 'creating'">
      <IconButton data-test="abort-button" icon="cross" @click="newMapObject = null" />
      <IconButton data-test="save-button" type="submit" icon="check-mark" @click="saveNewMapObject" />
    </template>

    <template #second>
      <SettingsTabs />
    </template>
  </Header>

  <div class="m-4 flex flex-col flex-grow">
    <svg
      class="w-full flex-grow"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-test="space-map"
      @click="positionNewMapObject"
    >
      <path v-for="path in floorPlan" :key="path" :d="path" class="stroke-black" stroke-width="2" />
      <g
        v-for="mapObject in mapObjects"
        :key="mapObject._id"
        data-test="map-object"
        :transform="`translate(${mapObject.xPos},${mapObject.yPos})`"
        :class="{ 'cursor-pointer map-object': mode === 'viewing' || mode === 'editing' }"
        @click.stop="selectMapObject(mapObject)"
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
        />
      </g>
    </svg>
    <div v-if="selectedMapObjectId" class="mt-auto ml-auto flex flex-row">
      <FloatingButton data-test="delete-button" type="submit" icon="delete" @click="removeSelectedMapObject" />
    </div>
  </div>
</template>

<script lang="ts">
import { Model } from '@bookyp/core';
import { computed, defineComponent, PropType, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import FloatingButton from '~/components/buttons/FloatingButton.vue';
import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/Header.vue';
import SettingsTabs from '~/components/tabs/SettingsTabs.vue';
import useFeathers from '~/compositions/useFeathers';
import useFind from '~/compositions/useFind';

export default defineComponent({
  name: 'Space',

  components: { FloatingButton, IconButton, Header, SettingsTabs },

  props: {
    selectedMapObjectId: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },

  setup(props) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { t } = useI18n();
    const feathers = useFeathers();
    const router = useRouter();
    const route = useRoute();

    const { data: spaces } = useFind('spaces');
    const floorPlan = computed(() => {
      if (!spaces.value.length) {
        return [];
      }
      return spaces.value[0].floorPlan;
    });

    const { data: mapObjects } = useFind('mapObjects');

    const selectedMapObjectId = toRef(props, 'selectedMapObjectId');

    let newMapObject = ref<null | Omit<Model.MapObject, '_id'>>(null);

    // flag to show if we are currently editing the map
    const mode = computed(() => {
      if (newMapObject.value) {
        return 'creating';
      }

      if (selectedMapObjectId.value) {
        return 'editing';
      }

      return 'viewing';
    });

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
    }

    async function saveNewMapObject(): Promise<void> {
      if (newMapObject.value) {
        await feathers.service('mapObjects').create(newMapObject.value);
        newMapObject.value = null;
      }
    }

    function positionNewMapObject(event: MouseEvent) {
      // skip if we are not currently in creating mode
      if (mode.value !== 'creating') {
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

    async function selectMapObject(mapObject: Model.MapObject | null) {
      // only allow selection of a mapObject if currently not in creating mode
      if (mode.value === 'creating') {
        return;
      }

      const params = mapObject ? { selectedMapObjectId: mapObject._id } : undefined;

      if (!route.name) {
        throw new Error('Can not detect current route');
      }

      await router.replace({ name: route.name, params });
    }

    async function removeSelectedMapObject(): Promise<void> {
      if (!selectedMapObjectId.value) {
        return;
      }

      await feathers.service('mapObjects').remove(selectedMapObjectId.value);
      await selectMapObject(null);
    }

    return {
      t,
      mode,
      floorPlan,
      mapObjects,
      addMapObject,
      newMapObject,
      positionNewMapObject,
      saveNewMapObject,
      selectMapObject,
      removeSelectedMapObject,
    };
  },
});
</script>

<style scoped>
.map-object:hover path {
  stroke: #f59e0b;
}
</style>
