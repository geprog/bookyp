<template>
  <div class="flex my-2">
    <Icon data-test="input-field-icon" :name="iconName" class="mr-4" />
    <div class="flex flex-col w-full border-b-1 py-2">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { ExtractedComponentProp } from '~/vue-helpers';

import Icon from './Icon.vue';

export default defineComponent({
  name: 'InputField',

  components: { Icon },

  props: {
    iconName: {
      type: String as ExtractedComponentProp<typeof Icon, 'name'>,
      required: true,
    },
  },
});
</script>
