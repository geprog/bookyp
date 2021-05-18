<template>
  <button
    type="button"
    class="p-2 w-full flex items-center justify-center focus:outline-none border-primary-normal"
    :class="{
      'border-b-4': active,
      'text-primary-normal': active,
    }"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TabButton',

  props: {
    active: {
      type: Boolean,
    },
  },
});
</script>
