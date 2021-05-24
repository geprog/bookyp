<template>
  <div class="flex mx-3 my-2 p-3 rounded-lg shadow-full bg-white">
    <div :class="statusColor" class="w-2 rounded flex-shrink-0" />
    <div class="flex flex-col ml-3 overflow-hidden min-w-0 flex-grow">
      <slot>
        <span v-if="label" data-test="label" class="mt-1 mb-2 text-base truncate">{{ label }}</span>
        <span v-if="description" data-test="description" class="w-full text-gray-700 text-sm truncate">{{
          description
        }}</span>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ListItem',

  components: {},

  props: {
    label: {
      type: String,
      default: '',
    },

    statusColor: {
      type: String,
      default: 'bg-primary-normal',
    },

    description: {
      type: String,
      default: '',
    },
  },
});
</script>
