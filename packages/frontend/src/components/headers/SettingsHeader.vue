<template>
  <Header :title="title" has-back>
    <slot name="actions">
      <div class="flex gap-x-2">
        <IconButton
          icon="map"
          :icon-color="
            $route.name === 'settings-space-map-objects' || $route.name === 'settings-space-floor-plan'
              ? 'text-primary-normal'
              : undefined
          "
          :aria-label="t('map_editor')"
          data-test="button-map-objects"
          @click="$router.replace({ name: 'settings-space-map-objects' })"
        />
        <IconButton
          icon="apps-list"
          :icon-color="$route.name === 'settings-bookables' ? 'text-primary-normal' : undefined"
          :aria-label="t('bookables')"
          data-test="button-bookables"
          @click="$router.replace({ name: 'settings-bookables' })"
        />
        <IconButton
          icon="people"
          :icon-color="$route.name === 'settings-space-members' ? 'text-primary-normal' : undefined"
          :aria-label="t('members')"
          data-test="button-space-members"
          @click="$router.replace({ name: 'settings-space-members' })"
        />
        <IconButton
          icon="info"
          :icon-color="$route.name === 'settings-space-edit' ? 'text-primary-normal' : undefined"
          :aria-label="t('space_information')"
          data-test="button-space-information"
          @click="$router.replace({ name: 'settings-space-edit' })"
        />
      </div>
    </slot>
  </Header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

import IconButton from '~/components/buttons/IconButton.vue';
import Header from '~/components/headers/Header.vue';
import { ExtractedComponentProp } from '~/vue-helpers';

export default defineComponent({
  name: 'SettingsHeader',

  components: { Header, IconButton },

  props: {
    title: {
      type: String as ExtractedComponentProp<typeof Header, 'title'>,
      required: true,
    },
  },

  setup() {
    const { t } = useI18n();

    return { t };
  },
});
</script>
