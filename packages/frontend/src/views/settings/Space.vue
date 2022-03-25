<template>
  <SettingsHeader :title="t('map_editor')">
    <template v-if="changed" #actions>
      <SaveAbort @save="save" @abort="abort" />
    </template>
  </SettingsHeader>

  <router-view
    v-slot="{ Component }"
    :selected-map-object-id="selectedMapObjectId"
    :abort-trigger="abortTrigger"
    :save-trigger="saveTrigger"
    @change-happened="handleChange"
  >
    <component :is="Component">
      <template #toggleBar>
        <ToggleBar
          v-if="!changed"
          start-icon="table"
          end-icon="floor-plan"
          :selected="$route.name === 'settings-space-map-objects' ? 'start' : 'end'"
          @selected-start="$router.replace({ name: 'settings-space-map-objects' })"
          @selected-end="$router.replace({ name: 'settings-space-floor-plan' })"
        />
      </template>
    </component>
  </router-view>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ToggleBar from '~/components/buttons/ToggleBar.vue';
import SettingsHeader from '~/components/headers/SettingsHeader.vue';
import SaveAbort from '~/components/space/SaveAbort.vue';

export default defineComponent({
  name: 'Space',

  components: {
    SaveAbort,
    SettingsHeader,
    ToggleBar,
  },

  props: {
    selectedMapObjectId: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
  },

  setup() {
    const { t } = useI18n();

    // const selectedMapObjectId = toRef(props, 'selectedMapObjectId');

    const changed = ref(false);

    const abortTrigger = ref(false);
    const saveTrigger = ref(false);

    function save() {
      saveTrigger.value = !saveTrigger.value;
    }

    function abort() {
      abortTrigger.value = !abortTrigger.value;
    }

    function handleChange(value: boolean) {
      changed.value = value;
    }

    return {
      t,
      changed,
      save,
      abort,
      abortTrigger,
      saveTrigger,
      handleChange,
    };
  },
});
</script>
