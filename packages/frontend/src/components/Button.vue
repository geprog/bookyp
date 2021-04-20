<template>
  <button
    type="button"
    class="cursor-pointer focus:outline-transparent hover:shadow-md rounded-full h-9 w-9 flex items-center justify-center"
  >
    <Icon v-if="iconName" data-test="button-icon" :name="iconName" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Icon from './Icon.vue';

export default defineComponent({
  name: 'Button',

  components: { Icon },

  props: {
    iconName: {
      type: String,
      required: true,
    },
  },
});
</script>
