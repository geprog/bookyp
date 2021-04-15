<template>
  <button type="button" class="rounded-full h-12 w-12 flex items-center justify-center bg-primary-normal shadow-lg">
    <Icon data-test="floating-button-icon" :name="iconName" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Icon from './Icon.vue';

export default defineComponent({
  name: 'FloatingButton',

  components: { Icon },

  props: {
    iconName: {
      type: String,
      required: true,
    },
  },
});
</script>
