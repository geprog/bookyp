<template>
  <div class="flex my-2 gap-4">
    <Icon class="my-2" :name="iconName" data-test="input-field-icon" />
    <div class="flex flex-col w-full py-2" :class="{ 'border-b-1': readonly === false }">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Icon from '~/components/Icon.vue';
import { ExtractedComponentProp } from '~/vue-helpers';

export default defineComponent({
  name: 'LabelField',

  components: { Icon },

  props: {
    iconName: {
      type: String as ExtractedComponentProp<typeof Icon, 'name'>,
      required: true,
    },

    readonly: {
      type: Boolean,
    },
  },
});
</script>
